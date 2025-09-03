import DOMPurify from "isomorphic-dompurify"

export function sanitizeString(input: string): string {
  if (typeof input !== "string") return ""

  // Remove HTML tags and potentially dangerous content
  const cleaned = DOMPurify.sanitize(input, { ALLOWED_TAGS: [] })

  // Trim whitespace
  return cleaned.trim()
}

export function sanitizeFormData(formData: FormData): FormData {
  const sanitized = new FormData()

  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") {
      sanitized.append(key, sanitizeString(value))
    } else {
      sanitized.append(key, value)
    }
  }

  return sanitized
}

export function sanitizeObject(obj: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {}

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeString(value)
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value)
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
}
