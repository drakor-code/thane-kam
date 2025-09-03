import { cookies } from "next/headers"
import { db, users, sessions } from "@/lib/db"
import { eq, and, gt } from "drizzle-orm"
import { verifyToken } from "./jwt"

export async function getSession() {
  const cookieStore = cookies()
  const token = cookieStore.get("auth-token")?.value

  if (!token) {
    return null
  }

  const payload = await verifyToken(token)
  if (!payload) {
    return null
  }

  // Check if session exists in database and is not expired
  const session = await db
    .select({
      user: {
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        isActive: users.isActive,
      },
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date()), eq(users.isActive, true)))
    .limit(1)

  return session[0]?.user || null
}

export async function requireAuth() {
  const user = await getSession()
  if (!user) {
    throw new Error("Unauthorized")
  }
  return user
}

export async function requireAdmin() {
  const user = await requireAuth()
  if (user.role !== "admin") {
    throw new Error("Admin access required")
  }
  return user
}
