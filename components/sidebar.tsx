"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LayoutDashboard,
  Users,
  UserCheck,
  FileText,
  Settings,
  HelpCircle,
  Building2,
  Lock,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "./auth-context"

const navigationItems = [
  {
    title: "الرئيسية",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "employee"],
  },
  {
    title: "سجل التجار",
    href: "/dashboard/suppliers",
    icon: Building2,
    roles: ["admin", "employee"],
  },
  {
    title: "سجل العملاء",
    href: "/dashboard/customers",
    icon: UserCheck,
    roles: ["admin", "employee"],
  },
  {
    title: "التقارير",
    href: "/dashboard/reports",
    icon: FileText,
    roles: ["admin", "employee"],
  },
  {
    title: "الموظفين",
    href: "/dashboard/users",
    icon: Users,
    roles: ["admin"],
  },
  {
    title: "الإعدادات",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ["admin"],
  },
  {
    title: "الدعم الفني",
    href: "/dashboard/support",
    icon: HelpCircle,
    roles: ["admin", "employee"],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const filteredItems = navigationItems.filter((item) => user?.role && item.roles.includes(user.role))

  return (
    <div className="w-64 bg-sidebar border-l border-sidebar-border flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Lock className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="text-right">
            <h1 className="text-xl font-bold text-sidebar-foreground">Debt-IQ</h1>
            <p className="text-sm text-sidebar-foreground/70">نظام إدارة الديون</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {filteredItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start text-right h-12 px-4",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icon className="ml-3 h-5 w-5" />
                  {item.title}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* User Info Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="text-right mb-3">
          <p className="text-sm font-medium text-sidebar-foreground">{user?.name}</p>
          <p className="text-xs text-sidebar-foreground/70">الصلاحية: {user?.role === "admin" ? "مدير" : "موظف"}</p>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start text-right h-10 px-4 border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive bg-transparent"
          onClick={logout}
        >
          <LogOut className="ml-3 h-4 w-4" />
          تسجيل الخروج
        </Button>
      </div>
    </div>
  )
}
