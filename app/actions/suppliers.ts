"use server"

import { revalidatePath } from "next/cache"
import { db, suppliers, debtTransactions, auditLog } from "@/lib/db"
import { eq, desc } from "drizzle-orm"
import { requireAuth } from "@/lib/auth/session"
import { debtEventEmitter } from "@/lib/events/event-emitter"

export async function createSupplierAction(formData: FormData) {
  try {
    const user = await requireAuth()

    const name = formData.get("name") as string
    const phone = formData.get("phone") as string
    const address = formData.get("address") as string
    const email = formData.get("email") as string
    const notes = formData.get("notes") as string

    if (!name) {
      return { error: "اسم المورد مطلوب" }
    }

    const newSupplier = await db
      .insert(suppliers)
      .values({
        name,
        phone,
        address,
        email,
        notes,
        createdBy: user.id,
      })
      .returning()

    // Log audit
    await db.insert(auditLog).values({
      userId: user.id,
      action: "create",
      tableName: "suppliers",
      recordId: newSupplier[0].id,
      newData: newSupplier[0],
    })

    debtEventEmitter.emitDebtEvent({
      type: "supplier_created",
      data: newSupplier[0],
      userId: user.id,
      timestamp: new Date(),
    })

    revalidatePath("/dashboard/suppliers")
    return { success: true, supplier: newSupplier[0] }
  } catch (error) {
    console.error("Create supplier error:", error)
    return { error: "حدث خطأ أثناء إضافة المورد" }
  }
}

export async function updateSupplierAction(formData: FormData) {
  try {
    const user = await requireAuth()

    const id = formData.get("id") as string
    const name = formData.get("name") as string
    const phone = formData.get("phone") as string
    const address = formData.get("address") as string
    const email = formData.get("email") as string
    const notes = formData.get("notes") as string

    if (!id || !name) {
      return { error: "معرف المورد والاسم مطلوبان" }
    }

    // Get old data for audit
    const oldSupplier = await db.select().from(suppliers).where(eq(suppliers.id, id)).limit(1)

    const updatedSupplier = await db
      .update(suppliers)
      .set({
        name,
        phone,
        address,
        email,
        notes,
        updatedAt: new Date(),
      })
      .where(eq(suppliers.id, id))
      .returning()

    // Log audit
    await db.insert(auditLog).values({
      userId: user.id,
      action: "update",
      tableName: "suppliers",
      recordId: id,
      oldData: oldSupplier[0],
      newData: updatedSupplier[0],
    })

    debtEventEmitter.emitDebtEvent({
      type: "supplier_updated",
      data: updatedSupplier[0],
      userId: user.id,
      timestamp: new Date(),
    })

    revalidatePath("/dashboard/suppliers")
    return { success: true, supplier: updatedSupplier[0] }
  } catch (error) {
    console.error("Update supplier error:", error)
    return { error: "حدث خطأ أثناء تحديث المورد" }
  }
}

export async function deleteSupplierAction(id: string) {
  try {
    const user = await requireAuth()

    // Get supplier data for audit
    const supplier = await db.select().from(suppliers).where(eq(suppliers.id, id)).limit(1)

    if (!supplier[0]) {
      return { error: "المورد غير موجود" }
    }

    // Delete related transactions first
    await db.delete(debtTransactions).where(eq(debtTransactions.entityId, id))

    // Delete supplier
    await db.delete(suppliers).where(eq(suppliers.id, id))

    // Log audit
    await db.insert(auditLog).values({
      userId: user.id,
      action: "delete",
      tableName: "suppliers",
      recordId: id,
      oldData: supplier[0],
    })

    debtEventEmitter.emitDebtEvent({
      type: "supplier_deleted",
      data: { id, name: supplier[0].name },
      userId: user.id,
      timestamp: new Date(),
    })

    revalidatePath("/dashboard/suppliers")
    return { success: true }
  } catch (error) {
    console.error("Delete supplier error:", error)
    return { error: "حدث خطأ أثناء حذف المورد" }
  }
}

export async function addSupplierDebtAction(formData: FormData) {
  try {
    const user = await requireAuth()

    const supplierId = formData.get("supplierId") as string
    const amount = Number.parseFloat(formData.get("amount") as string)
    const description = formData.get("description") as string
    const notes = formData.get("notes") as string

    if (!supplierId || !amount || amount <= 0) {
      return { error: "معرف المورد والمبلغ مطلوبان" }
    }

    // Add debt transaction
    const newTransaction = await db
      .insert(debtTransactions)
      .values({
        type: "supplier",
        entityId: supplierId,
        transactionType: "debt",
        amount: amount.toString(),
        description,
        notes,
        createdBy: user.id,
      })
      .returning()

    // Update supplier total debt
    await db
      .update(suppliers)
      .set({
        totalDebt: db.raw(`total_debt + ${amount}`),
        updatedAt: new Date(),
      })
      .where(eq(suppliers.id, supplierId))

    debtEventEmitter.emitDebtEvent({
      type: "debt_added",
      data: { supplierId, amount, description, transaction: newTransaction[0] },
      userId: user.id,
      timestamp: new Date(),
    })

    revalidatePath("/dashboard/suppliers")
    return { success: true }
  } catch (error) {
    console.error("Add supplier debt error:", error)
    return { error: "حدث خطأ أثناء إضافة الدين" }
  }
}

export async function paySupplierDebtAction(formData: FormData) {
  try {
    const user = await requireAuth()

    const supplierId = formData.get("supplierId") as string
    const amount = Number.parseFloat(formData.get("amount") as string)
    const description = formData.get("description") as string
    const notes = formData.get("notes") as string

    if (!supplierId || !amount || amount <= 0) {
      return { error: "معرف المورد والمبلغ مطلوبان" }
    }

    // Get current debt
    const supplier = await db.select().from(suppliers).where(eq(suppliers.id, supplierId)).limit(1)

    if (!supplier[0]) {
      return { error: "المورد غير موجود" }
    }

    const currentDebt = Number.parseFloat(supplier[0].totalDebt)
    if (amount > currentDebt) {
      return { error: "مبلغ التسديد أكثر من الدين المطلوب" }
    }

    // Add payment transaction
    const newPayment = await db
      .insert(debtTransactions)
      .values({
        type: "supplier",
        entityId: supplierId,
        transactionType: "payment",
        amount: amount.toString(),
        description,
        notes,
        createdBy: user.id,
      })
      .returning()

    // Update supplier total debt
    await db
      .update(suppliers)
      .set({
        totalDebt: (currentDebt - amount).toString(),
        updatedAt: new Date(),
      })
      .where(eq(suppliers.id, supplierId))

    debtEventEmitter.emitDebtEvent({
      type: "payment_added",
      data: { supplierId, amount, description, payment: newPayment[0] },
      userId: user.id,
      timestamp: new Date(),
    })

    revalidatePath("/dashboard/suppliers")
    return { success: true }
  } catch (error) {
    console.error("Pay supplier debt error:", error)
    return { error: "حدث خطأ أثناء تسديد الدين" }
  }
}

export async function getSupplierTransactionsAction(supplierId: string) {
  try {
    const transactions = await db
      .select()
      .from(debtTransactions)
      .where(eq(debtTransactions.entityId, supplierId))
      .orderBy(desc(debtTransactions.createdAt))

    return { success: true, transactions }
  } catch (error) {
    console.error("Get supplier transactions error:", error)
    return { error: "حدث خطأ أثناء جلب المعاملات" }
  }
}
