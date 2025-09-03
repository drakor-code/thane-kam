"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, TrendingUp, Youtube, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDebt } from "@/components/debt-context"
import { Badge } from "@/components/ui/badge"

export default function DashboardPage() {
  const { getTotalSuppliersDebt, getTotalCustomersDebt, suppliers, customers } = useDebt()

  const suppliersDebt = getTotalSuppliersDebt()
  const customersDebt = getTotalCustomersDebt()
  const netPosition = customersDebt - suppliersDebt

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-right">
        <h1 className="text-3xl font-bold text-foreground">لوحة التحكم الرئيسية</h1>
        <p className="text-muted-foreground mt-2">نظرة عامة على الوضع المالي للديون</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Suppliers Debt Card */}
        <Card className="border-l-4 border-l-destructive hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-right">ديون التجار</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {suppliers.length} تاجر
              </Badge>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-right text-destructive flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5" />
              {suppliersDebt.toLocaleString("ar-IQ")} د.ع
            </div>
            <p className="text-xs text-muted-foreground text-right mt-1">المبلغ الإجمالي المستحق للموردين</p>
            <div className="mt-2 text-right">
              <span className="text-xs text-muted-foreground">آخر تحديث: الآن</span>
            </div>
          </CardContent>
        </Card>

        {/* Customers Debt Card */}
        <Card className="border-l-4 border-l-primary hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-right">ديون العملاء</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {customers.length} عميل
              </Badge>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-right text-primary flex items-center gap-2">
              <ArrowDownRight className="h-5 w-5" />
              {customersDebt.toLocaleString("ar-IQ")} د.ع
            </div>
            <p className="text-xs text-muted-foreground text-right mt-1">المبلغ الإجمالي المستحق من العملاء</p>
            <div className="mt-2 text-right">
              <span className="text-xs text-muted-foreground">آخر تحديث: الآن</span>
            </div>
          </CardContent>
        </Card>

        {/* Net Position Card */}
        <Card className="border-l-4 border-l-secondary hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-right">صافي الموقف</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold text-right flex items-center gap-2 ${
                netPosition >= 0 ? "text-primary" : "text-destructive"
              }`}
            >
              {netPosition >= 0 ? (
                <ArrowUpRight className="h-5 w-5 text-primary" />
              ) : (
                <ArrowDownRight className="h-5 w-5 text-destructive" />
              )}
              {Math.abs(netPosition).toLocaleString("ar-IQ")} د.ع
            </div>
            <p className="text-xs text-muted-foreground text-right mt-1">{netPosition >= 0 ? "لصالحك" : "عليك"}</p>
            <div className="mt-2 text-right">
              <Badge variant={netPosition >= 0 ? "default" : "destructive"} className="text-xs">
                {netPosition >= 0 ? "موقف إيجابي" : "موقف سلبي"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Row */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{suppliers.length}</div>
            <p className="text-sm text-muted-foreground">إجمالي التجار</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{customers.length}</div>
            <p className="text-sm text-muted-foreground">إجمالي العملاء</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-secondary">
              {suppliers.reduce((total, s) => total + s.debts.length, 0)}
            </div>
            <p className="text-sm text-muted-foreground">فواتير التجار</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-secondary">
              {customers.reduce((total, c) => total + c.debts.length, 0)}
            </div>
            <p className="text-sm text-muted-foreground">فواتير العملاء</p>
          </CardContent>
        </Card>
      </div>

      {/* Tutorial Section */}
      <Card>
        <CardHeader className="text-right">
          <CardTitle className="flex items-center gap-2 justify-end">
            <Youtube className="h-5 w-5 text-red-500" />
            دروس تعليمية لاستخدام البرنامج
          </CardTitle>
          <CardDescription>تعلم كيفية استخدام جميع ميزات نظام إدارة الديون</CardDescription>
        </CardHeader>
        <CardContent className="text-right">
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto">
                <Youtube className="w-10 h-10 text-white" />
              </div>
              <p className="text-muted-foreground">شاهد الدروس التعليمية لتتعلم كيفية استخدام البرنامج بكفاءة</p>
              <Button
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={() => window.open("https://youtube.com", "_blank")}
              >
                مشاهدة الدروس التعليمية
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
