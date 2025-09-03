"use server"

import { revalidatePath } from "next/cache"
import { db, customers, debtTransactions, auditLog } from "@/lib/db"
import { eq, desc } from "drizzle-orm"
import { requireAuth } from "@/lib/auth/session"

export async function createCustomerAction(formData: FormData) {
  try {
    const user = await requireAuth()

    const name = formData.get("name") as string
    const phone = formData.get("phone") as string
    const address = formData.get("address") as string
    const email = formData.get("email") as string
    const notes = formData.get("notes") as string

    if (!name) {
      return { error: "اسم العميل مطلوب" }
    }

    const newCustomer = await db
      .insert(customers)
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
      tableName: "customers",
      recordId: newCustomer[0].id,
      newData: newCustomer[0],
    })

    revalidatePath("/dashboard/customers")
    return { success: true, customer: newCustomer[0] }
  } catch (error) {
    console.error("Create customer error:", error)
    return { error: "حدث خطأ أثناء إضافة العميل" }
  }
}

export async function updateCustomerAction(formData: FormData) {
  try {
    const user = await requireAuth()

    const id = formData.get("id") as string
    const name = formData.get("name") as string
    const phone = formData.get("phone") as string
    const address = formData.get("address") as string
    const email = formData.get("email") as string
    const notes = formData.get("notes") as string

    if (!id || !name) {
      return { error: "معرف العميل والاسم مطلوبان" }
    }

    // Get old data for audit
    const oldCustomer = await db.select().from(customers).where(eq(customers.id, id)).limit(1)

    const updatedCustomer = await db
      .update(customers)
      .set({
        name,
        phone,
        address,
        email,
        notes,
        updatedAt: new Date(),
      })
      .where(eq(customers.id, id))
      .returning()

    // Log audit
    await db.insert(auditLog).values({
      userId: user.id,
      action: "update",
      tableName: "customers",
      recordId: id,
      oldData: oldCustomer[0],
      newData: updatedCustomer[0],
    })

    revalidatePath("/dashboard/customers")
    return { success: true, customer: updatedCustomer[0] }
  } catch (error) {
    console.error("Update customer error:", error)
    return { error: "حدث خطأ أثناء تحديث العميل" }
  }
}

export async function deleteCustomerAction(id: string) {
  try {
    const user = await requireAuth()

    // Get customer data for audit
    const customer = await db.select().from(customers).where(eq(customers.id, id)).limit(1)

    if (!customer[0]) {
      return { error: "العميل غير موجود" }
    }

    // Delete related transactions first
    await db.delete(debtTransactions).where(eq(debtTransactions.entityId, id))

    // Delete customer
    await db.delete(customers).where(eq(customers.id, id))

    // Log audit
    await db.insert(auditLog).values({
      userId: user.id,
      action: "delete",
      tableName: "customers",
      recordId: id,
      oldData: customer[0],
    })

    revalidatePath("/dashboard/customers")
    return { success: true }
  } catch (error) {
    console.error("Delete customer error:", error)
    return { error: "حدث خطأ أثناء حذف العميل" }
  }
}

export async function addCustomerDebtAction(formData: FormData) {
  try {
    const user = await requireAuth()

    const customerId = formData.get("customerId") as string
    const amount = Number.parseFloat(formData.get("amount") as string)
    const description = formData.get("description") as string
    const notes = formData.get("notes") as string

    if (!customerId || !amount || amount <= 0) {
      return { error: "معرف العميل والمبلغ مطلوبان" }
    }

    // Add debt transaction
    await db.insert(debtTransactions).values({
      type: "customer",
      entityId: customerId,
      transactionType: "debt",
      amount: amount.toString(),
      description,
      notes,
      createdBy: user.id,
    })

    // Update customer total debt
    await db
      .update(customers)
      .set({
        totalDebt: db.raw(`total_debt + ${amount}`),
        updatedAt: new Date(),
      })
      .where(eq(customers.id, customerId))

    revalidatePath("/dashboard/customers")
    return { success: true }
  } catch (error) {
    console.error("Add customer debt error:", error)
    return { error: "حدث خطأ أثناء إضافة الدين" }
  }
}

export async function payCustomerDebtAction(formData: FormData) {
  try {
    const user = await requireAuth()

    const customerId = formData.get("customerId") as string
    const amount = Number.parseFloat(formData.get("amount") as string)
    const description = formData.get("description") as string
    const notes = formData.get("notes") as string

    if (!customerId || !amount || amount <= 0) {
      return { error: "معرف العميل والمبلغ مطلوبان" }
    }

    // Get current debt
    const customer = await db.select().from(customers).where(eq(customers.id, customerId)).limit(1)

    if (!customer[0]) {
      return { error: "العميل غير موجود" }
    }

    const currentDebt = Number.parseFloat(customer[0].totalDebt)
    if (amount > currentDebt) {
      return { error: "مبلغ التسديد أكثر من الدين المطلوب" }
    }

    // Add payment transaction
    await db.insert(debtTransactions).values({
      type: "customer",
      entityId: customerId,
      transactionType: "payment",
      amount: amount.toString(),
      description,
      notes,
      createdBy: user.id,
    })

    // Update customer total debt
    await db
      .update(customers)
      .set({
        totalDebt: (currentDebt - amount).toString(),
        updatedAt: new Date(),
      })
      .where(eq(customers.id, customerId))

    revalidatePath("/dashboard/customers")
    return { success: true }
  } catch (error) {
    console.error("Pay customer debt error:", error)
    return { error: "حدث خطأ أثناء تسديد الدين" }
  }
}

export async function getCustomerTransactionsAction(customerId: string) {
  try {
    const transactions = await db
      .select()
      .from(debtTransactions)
      .where(eq(debtTransactions.entityId, customerId))
      .orderBy(desc(debtTransactions.createdAt))

    return { success: true, transactions }
  } catch (error) {
    console.error("Get customer transactions error:", error)
    return { error: "حدث خطأ أثناء جلب المعاملات" }
  }
}
