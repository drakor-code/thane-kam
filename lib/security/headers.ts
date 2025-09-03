import { headers } from "next/headers"

export function getClientIP(): string {
  const headersList = headers()

  // Check various headers for client IP
  const forwardedFor = headersList.get("x-forwarded-for")
  const realIP = headersList.get("x-real-ip")
  const clientIP = headersList.get("x-client-ip")

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim()
  }

  if (realIP) {
    return realIP
  }

  if (clientIP) {
    return clientIP
  }

  return "unknown"
}

export function getUserAgent(): string {
  const headersList = headers()
  return headersList.get("user-agent") || "unknown"
}

export function validateOrigin(): boolean {
  const headersList = headers()
  const origin = headersList.get("origin")
  const referer = headersList.get("referer")

  // In development, allow localhost
  if (process.env.NODE_ENV === "development") {
    return true
  }

  // Check if origin matches expected domain
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  ].filter(Boolean)

  if (origin && allowedOrigins.some((allowed) => origin === allowed)) {
    return true
  }

  if (referer && allowedOrigins.some((allowed) => referer.startsWith(allowed + "/"))) {
    return true
  }

  return false
}
