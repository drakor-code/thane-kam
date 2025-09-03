"use client"

import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, Loader2 } from "lucide-react"
import { useRealTime } from "./real-time-provider"

export function ConnectionStatus() {
  const { connectionStatus, isConnected } = useRealTime()

  const getStatusConfig = () => {
    switch (connectionStatus) {
      case "connected":
        return {
          icon: <Wifi className="h-3 w-3" />,
          text: "متصل",
          variant: "default" as const,
        }
      case "connecting":
        return {
          icon: <Loader2 className="h-3 w-3 animate-spin" />,
          text: "جاري الاتصال",
          variant: "secondary" as const,
        }
      case "error":
        return {
          icon: <WifiOff className="h-3 w-3" />,
          text: "خطأ في الاتصال",
          variant: "destructive" as const,
        }
      default:
        return {
          icon: <WifiOff className="h-3 w-3" />,
          text: "غير متصل",
          variant: "outline" as const,
        }
    }
  }

  const config = getStatusConfig()

  return (
    <Badge variant={config.variant} className="gap-1 text-xs">
      {config.icon}
      {config.text}
    </Badge>
  )
}
