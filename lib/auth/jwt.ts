const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"
const JWT_EXPIRES_IN = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

export interface JWTPayload {
  userId: string
  email: string
  role: string
  exp?: number
  iat?: number
}

// Simple base64url encoding/decoding
function base64urlEncode(str: string): string {
  return Buffer.from(str).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

function base64urlDecode(str: string): string {
  str += "=".repeat((4 - (str.length % 4)) % 4)
  return Buffer.from(str.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString()
}

// Simple HMAC-SHA256 signature
async function sign(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ])

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data))
  return base64urlEncode(String.fromCharCode(...new Uint8Array(signature)))
}

async function verify(data: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "verify",
  ])

  const signatureBuffer = new Uint8Array(
    Array.from(base64urlDecode(signature + "=".repeat((4 - (signature.length % 4)) % 4)), (c) => c.charCodeAt(0)),
  )

  return await crypto.subtle.verify("HMAC", key, signatureBuffer, encoder.encode(data))
}

export async function signToken(payload: Omit<JWTPayload, "exp" | "iat">): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const fullPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + Math.floor(JWT_EXPIRES_IN / 1000),
  }

  const header = { alg: "HS256", typ: "JWT" }
  const encodedHeader = base64urlEncode(JSON.stringify(header))
  const encodedPayload = base64urlEncode(JSON.stringify(fullPayload))

  const data = `${encodedHeader}.${encodedPayload}`
  const signature = await sign(data, JWT_SECRET)

  return `${data}.${signature}`
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null

    const [encodedHeader, encodedPayload, signature] = parts
    const data = `${encodedHeader}.${encodedPayload}`

    const isValid = await verify(data, signature, JWT_SECRET)
    if (!isValid) return null

    const payload = JSON.parse(base64urlDecode(encodedPayload)) as JWTPayload

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return payload
  } catch (error) {
    return null
  }
}
