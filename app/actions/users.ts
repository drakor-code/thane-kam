"use server"

import { revalidatePath } from "next/cache"
import { db, users, auditLog } from "@/lib/db"
import { eq } from "drizzle-orm"
import { requireAdmin } from "@/lib/auth/session"
import { hashPassword } from "@/lib/auth/password"

export async function createUserAction(formData: FormData) {
  try {
    const admin = await requireAdmin()

    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const role = formData.get("role") as string
    const phone = formData.get("phone") as string
    const address = formData.get("address") as string

    if (!name || !email || !password || !role) {
      return { error: "جميع الحقول المطلوبة يجب ملؤها" }
    }

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1)

    if (existingUser[0]) {
      return { error: "المستخدم موجود بالفعل بهذا البريد الإلكتروني" }
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const newUser = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        role: role as "admin" | "employee",
        phone,
        address,
      })
      .returning()

    // Log audit
    await db.insert(auditLog).values({
      userId: admin.id,
      action: "create",
      tableName: "users",
      recordId: newUser[0].id,
      newData: { ...newUser[0], password: "[HIDDEN]" },
    })

    revalidatePath("/dashboard/users")
    return { success: true, user: { ...newUser[0], password: undefined } }
  } catch (error) {
    console.error("Create user error:", error)
    return { error: "حدث خطأ أثناء إنشاء المستخدم" }
  }
}

export async function updateUserAction(formData: FormData) {
  try {
    const admin = await requireAdmin()

    const id = formData.get("id") as string
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const role = formData.get("role") as string
    const phone = formData.get("phone") as string
    const address = formData.get("address") as string
    const isActive = formData.get("isActive") === "true"

    if (!id || !name || !email || !role) {
      return { error: "جميع الحقول المطلوبة يجب ملؤها" }
    }

    // Get old data for audit
    const oldUser = await db.select().from(users).where(eq(users.id, id)).limit(1)

    const updatedUser = await db
      .update(users)
      .set({
        name,
        email,
        role: role as "admin" | "employee",
        phone,
        address,
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning()

    // Log audit
    await db.insert(auditLog).values({
      userId: admin.id,
      action: "update",
      tableName: "users",
      recordId: id,
      oldData: { ...oldUser[0], password: "[HIDDEN]" },
      newData: { ...updatedUser[0], password: "[HIDDEN]" },
    })

    revalidatePath("/dashboard/users")
    return { success: true, user: { ...updatedUser[0], password: undefined } }
  } catch (error) {
    console.error("Update user error:", error)
    return { error: "حدث خطأ أثناء تحديث المستخدم" }
  }
}

export async function deleteUserAction(id: string) {
  try {
    const admin = await requireAdmin()

    // Get user data for audit
    const user = await db.select().from(users).where(eq(users.id, id)).limit(1)

    if (!user[0]) {
      return { error: "المستخدم غير موجود" }
    }

    // Prevent deleting the last admin
    if (user[0].role === "admin") {
      const adminCount = await db.select().from(users).where(eq(users.role, "admin"))

      if (adminCount.length <= 1) {
        return { error: "لا يمكن حذف آخر مدير في النظام" }
      }
    }

    // Delete user
    await db.delete(users).where(eq(users.id, id))

    // Log audit
    await db.insert(auditLog).values({
      userId: admin.id,
      action: "delete",
      tableName: "users",
      recordId: id,
      oldData: { ...user[0], password: "[HIDDEN]" },
    })

    revalidatePath("/dashboard/users")
    return { success: true }
  } catch (error) {
    console.error("Delete user error:", error)
    return { error: "حدث خطأ أثناء حذف المستخدم" }
  }
}

export async function resetUserPasswordAction(formData: FormData) {
  try {
    const admin = await requireAdmin()

    const id = formData.get("id") as string
    const newPassword = formData.get("newPassword") as string

    if (!id || !newPassword) {
      return { error: "معرف المستخدم وكلمة المرور الجديدة مطلوبان" }
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword)

    // Update password
    await db
      .update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))

    // Log audit
    await db.insert(auditLog).values({
      userId: admin.id,
      action: "update",
      tableName: "users",
      recordId: id,
      newData: { action: "password_reset" },
    })

    revalidatePath("/dashboard/users")
    return { success: true }
  } catch (error) {
    console.error("Reset password error:", error)
    return { error: "حدث خطأ أثناء إعادة تعيين كلمة المرور" }
  }
}
