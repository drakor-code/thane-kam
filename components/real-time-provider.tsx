"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useAuth } from "./auth-context"
import { toast } from "@/hooks/use-toast"

interface RealTimeEvent {
  type: string
  data?: any
  userId?: string
  timestamp: string
}

interface RealTimeContextType {
  isConnected: boolean
  lastEvent: RealTimeEvent | null
  connectionStatus: "connecting" | "connected" | "disconnected" | "error"
}

const RealTimeContext = createContext<RealTimeContextType | undefined>(undefined)

export function RealTimeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [isConnected, setIsConnected] = useState(false)
  const [lastEvent, setLastEvent] = useState<RealTimeEvent | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected" | "error">(
    "disconnected",
  )

  useEffect(() => {
    if (!user) {
      setConnectionStatus("disconnected")
      setIsConnected(false)
      return
    }

    let eventSource: EventSource | null = null
    let reconnectTimeout: NodeJS.Timeout | null = null

    const connect = () => {
      setConnectionStatus("connecting")

      eventSource = new EventSource("/api/events")

      eventSource.onopen = () => {
        setConnectionStatus("connected")
        setIsConnected(true)
        console.log("[v0] Real-time connection established")
      }

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as RealTimeEvent
          setLastEvent(data)

          // Handle different event types
          switch (data.type) {
            case "connected":
              console.log("[v0] Real-time connection confirmed")
              break
            case "heartbeat":
              // Keep connection alive
              break
            case "supplier_created":
            case "customer_created":
            case "user_created":
              if (data.userId !== user.id) {
                toast({
                  title: "تحديث جديد",
                  description: "تم إضافة عنصر جديد بواسطة مستخدم آخر",
                })
              }
              break
            case "supplier_updated":
            case "customer_updated":
            case "user_updated":
              if (data.userId !== user.id) {
                toast({
                  title: "تحديث",
                  description: "تم تعديل عنصر بواسطة مستخدم آخر",
                })
              }
              break
            case "supplier_deleted":
            case "customer_deleted":
            case "user_deleted":
              if (data.userId !== user.id) {
                toast({
                  title: "حذف",
                  description: "تم حذف عنصر بواسطة مستخدم آخر",
                  variant: "destructive",
                })
              }
              break
            case "debt_added":
            case "payment_added":
              if (data.userId !== user.id) {
                toast({
                  title: "معاملة جديدة",
                  description: "تم إضافة معاملة مالية جديدة",
                })
              }
              break
            case "settings_updated":
              if (data.userId !== user.id) {
                toast({
                  title: "تحديث الإعدادات",
                  description: "تم تحديث إعدادات النظام",
                })
              }
              break
          }
        } catch (error) {
          console.error("[v0] Error parsing real-time event:", error)
        }
      }

      eventSource.onerror = (error) => {
        console.error("[v0] Real-time connection error:", error)
        setConnectionStatus("error")
        setIsConnected(false)

        eventSource?.close()

        // Attempt to reconnect after 5 seconds
        reconnectTimeout = setTimeout(() => {
          console.log("[v0] Attempting to reconnect...")
          connect()
        }, 5000)
      }
    }

    connect()

    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
      }
      if (eventSource) {
        eventSource.close()
      }
      setConnectionStatus("disconnected")
      setIsConnected(false)
    }
  }, [user])

  return (
    <RealTimeContext.Provider value={{ isConnected, lastEvent, connectionStatus }}>{children}</RealTimeContext.Provider>
  )
}

export function useRealTime() {
  const context = useContext(RealTimeContext)
  if (context === undefined) {
    throw new Error("useRealTime must be used within a RealTimeProvider")
  }
  return context
}
