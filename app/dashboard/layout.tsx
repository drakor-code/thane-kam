"use client"

import type React from "react"
import { useAuth } from "@/components/auth-context"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { RealTimeProvider } from "@/components/real-time-provider"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  return (
    <RealTimeProvider>
      <div className="flex h-screen bg-background" dir="rtl">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto p-6 bg-muted/30">{children}</main>
        </div>
      </div>
    </RealTimeProvider>
  )
}
