"use client"

import type React from "react"

import { useAuth } from "./auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield } from "lucide-react"

interface AdminOnlyProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  showError?: boolean
}

export function AdminOnly({ children, fallback = null, showError = false }: AdminOnlyProps) {
  const { user } = useAuth()

  if (!user || user.role !== "admin") {
    return showError ? (
      <Alert variant="destructive">
        <Shield className="h-4 w-4" />
        <AlertDescription>هذه الميزة متاحة للمديرين فقط</AlertDescription>
      </Alert>
    ) : (
      fallback
    )
  }

  return <>{children}</>
}
