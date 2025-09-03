"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { db, users, sessions } from "@/lib/db"
import { eq, and } from "drizzle-orm"
import { hashPassword, verifyPassword } from "@/lib/auth/password"
import { signToken } from "@/lib/auth/jwt"
import { createId } from "@paralleldrive/cuid2"

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "البريد الإلكتروني وكلمة المرور مطلوبان" }
  }

  try {
    // Find user by email
    const user = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), eq(users.isActive, true)))
      .limit(1)

    if (!user[0]) {
      return { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" }
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user[0].password)
    if (!isValidPassword) {
      return { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" }
    }

    // Create session
    const sessionId = createId()
    const token = await signToken({
      userId: user[0].id,
      email: user[0].email,
      role: user[0].role,
    })

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

    await db.insert(sessions).values({
      id: sessionId,
      userId: user[0].id,
      token,
      expiresAt,
    })

    // Set cookie
    cookies().set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return { success: true, user: { id: user[0].id, email: user[0].email, name: user[0].name, role: user[0].role } }
  } catch (error) {
    console.error("Login error:", error)
    return { error: "حدث خطأ أثناء تسجيل الدخول" }
  }
}

export async function logoutAction() {
  const cookieStore = cookies()
  const token = cookieStore.get("auth-token")?.value

  if (token) {
    // Remove session from database
    await db.delete(sessions).where(eq(sessions.token, token))
  }

  // Clear cookie
  cookies().delete("auth-token")
  redirect("/")
}

export async function createUserAction(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const role = formData.get("role") as string
  const phone = formData.get("phone") as string
  const address = formData.get("address") as string

  if (!name || !email || !password || !role) {
    return { error: "جميع الحقول المطلوبة يجب ملؤها" }
  }

  try {
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

    return { success: true, user: newUser[0] }
  } catch (error) {
    console.error("Create user error:", error)
    return { error: "حدث خطأ أثناء إنشاء المستخدم" }
  }
}
