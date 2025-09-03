interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>()
  private readonly windowMs: number
  private readonly maxRequests: number

  constructor(windowMs = 60000, maxRequests = 100) {
    this.windowMs = windowMs
    this.maxRequests = maxRequests

    // Clean up expired entries every minute
    setInterval(() => {
      const now = Date.now()
      for (const [key, entry] of this.store.entries()) {
        if (now > entry.resetTime) {
          this.store.delete(key)
        }
      }
    }, 60000)
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const entry = this.store.get(identifier)

    if (!entry || now > entry.resetTime) {
      // First request or window expired
      this.store.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      })
      return true
    }

    if (entry.count >= this.maxRequests) {
      return false
    }

    entry.count++
    return true
  }

  getRemainingRequests(identifier: string): number {
    const entry = this.store.get(identifier)
    if (!entry || Date.now() > entry.resetTime) {
      return this.maxRequests
    }
    return Math.max(0, this.maxRequests - entry.count)
  }

  getResetTime(identifier: string): number {
    const entry = this.store.get(identifier)
    if (!entry || Date.now() > entry.resetTime) {
      return Date.now() + this.windowMs
    }
    return entry.resetTime
  }
}

// Different rate limiters for different operations
export const authRateLimiter = new RateLimiter(15 * 60 * 1000, 5) // 5 attempts per 15 minutes
export const apiRateLimiter = new RateLimiter(60 * 1000, 60) // 60 requests per minute
export const backupRateLimiter = new RateLimiter(60 * 60 * 1000, 3) // 3 backups per hour
