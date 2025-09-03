"use client"

import type React from "react"

import { useAuth } from "./auth-context"
import { hasPermission, type Role } from "@/lib/auth/permissions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock } from "lucide-react"

interface RoleGuardProps {
  children: React.ReactNode
  resource: string
  action?: "create" | "read" | "update" | "delete" | "manage"
  fallback?: React.ReactNode
  showError?: boolean
}

export function RoleGuard({ children, resource, action = "read", fallback = null, showError = false }: RoleGuardProps) {
  const { user } = useAuth()

  if (!user) {
    return showError ? (
      <Alert variant="destructive">
        <Lock className="h-4 w-4" />
        <AlertDescription>يجب تسجيل الدخول للوصول إلى هذا المحتوى</AlertDescription>
      </Alert>
    ) : (
      fallback
    )
  }

  const hasAccess = hasPermission(user.role as Role, resource, action)

  if (!hasAccess) {
    return showError ? (
      <Alert variant="destructive">
        <Lock className="h-4 w-4" />
        <AlertDescription>ليس لديك صلاحية للوصول إلى هذا المحتوى</AlertDescription>
      </Alert>
    ) : (
      fallback
    )
  }

  return <>{children}</>
}

interface PermissionCheckProps {
  userRole: Role
  resource: string
  action: "create" | "read" | "update" | "delete" | "manage"
  children: React.ReactNode
}

export function PermissionCheck({ userRole, resource, action, children }: PermissionCheckProps) {
  const hasAccess = hasPermission(userRole, resource, action)

  if (!hasAccess) {
    return null
  }

  return <>{children}</>
}
