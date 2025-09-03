export type Role = "admin" | "employee"

export interface Permission {
  create: boolean
  read: boolean
  update: boolean
  delete: boolean
  manage: boolean // For admin-only operations
}

export const rolePermissions: Record<Role, Record<string, Permission>> = {
  admin: {
    suppliers: { create: true, read: true, update: true, delete: true, manage: true },
    customers: { create: true, read: true, update: true, delete: true, manage: true },
    users: { create: true, read: true, update: true, delete: true, manage: true },
    settings: { create: true, read: true, update: true, delete: true, manage: true },
    reports: { create: true, read: true, update: true, delete: true, manage: true },
    transactions: { create: true, read: true, update: true, delete: true, manage: true },
    backup: { create: true, read: true, update: true, delete: true, manage: true },
  },
  employee: {
    suppliers: { create: true, read: true, update: true, delete: false, manage: false },
    customers: { create: true, read: true, update: true, delete: false, manage: false },
    users: { create: false, read: false, update: false, delete: false, manage: false },
    settings: { create: false, read: true, update: false, delete: false, manage: false },
    reports: { create: false, read: true, update: false, delete: false, manage: false },
    transactions: { create: true, read: true, update: false, delete: false, manage: false },
    backup: { create: false, read: false, update: false, delete: false, manage: false },
  },
}

export function hasPermission(userRole: Role, resource: string, action: keyof Permission): boolean {
  const permissions = rolePermissions[userRole]?.[resource]
  return permissions?.[action] || false
}

export function canAccess(userRole: Role, resource: string): boolean {
  return hasPermission(userRole, resource, "read")
}

export function canManage(userRole: Role, resource: string): boolean {
  return hasPermission(userRole, resource, "manage")
}
