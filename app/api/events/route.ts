import type { NextRequest } from "next/server"
import { debtEventEmitter } from "@/lib/events/event-emitter"
import { getSession } from "@/lib/auth/session"

export async function GET(request: NextRequest) {
  // Verify authentication
  const user = await getSession()
  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const encoder = new TextEncoder()

  const customReadable = new ReadableStream({
    start(controller) {
      const sendEvent = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      // Send initial connection event
      sendEvent({ type: "connected", timestamp: new Date().toISOString() })

      // Listen for debt events
      const eventHandler = (event: any) => {
        sendEvent(event)
      }

      debtEventEmitter.onDebtUpdate(eventHandler)

      // Cleanup on close
      request.signal.addEventListener("abort", () => {
        debtEventEmitter.offDebtUpdate(eventHandler)
        controller.close()
      })

      // Keep connection alive with heartbeat
      const heartbeat = setInterval(() => {
        sendEvent({ type: "heartbeat", timestamp: new Date().toISOString() })
      }, 30000)

      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat)
      })
    },
  })

  return new Response(customReadable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  })
}
