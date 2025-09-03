"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Upload, Download, AlertTriangle, Save, Building2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { AdminOnly } from "@/components/admin-only"
import { restoreBackupAction } from "@/app/actions/backup"

export default function SettingsPage() {
  const [companyName, setCompanyName] = useState("")
  const [companyDescription, setCompanyDescription] = useState("")
  const [companyLogo, setCompanyLogo] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [isBackupLoading, setIsBackupLoading] = useState(false)
  const [isRestoreLoading, setIsRestoreLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const savedSettings = localStorage.getItem("companySettings")
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setCompanyName(settings.companyName || "")
      setCompanyDescription(settings.companyDescription || "")
      setLogoPreview(settings.logoPreview || null)
    }
  }, [])

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setCompanyLogo(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveSettings = () => {
    const settings = {
      companyName,
      companyDescription,
      logoPreview,
    }
    localStorage.setItem("companySettings", JSON.stringify(settings))

    toast({
      title: "تم حفظ الإعدادات",
      description: "تم حفظ إعدادات الشركة بنجاح",
    })
  }

  const handleBackup = async () => {
    setIsBackupLoading(true)
    try {
      const response = await fetch("/api/backup/download")

      if (!response.ok) {
        throw new Error("فشل في إنشاء النسخة الاحتياطية")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `debt-iq-backup-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "تم إنشاء النسخة الاحتياطية",
        description: "تم تصدير البيانات وتحميلها بنجاح",
      })
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء النسخة الاحتياطية",
        variant: "destructive",
      })
    } finally {
      setIsBackupLoading(false)
    }
  }

  const handleRestore = async () => {
    if (!fileInputRef.current?.files?.[0]) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار ملف النسخة الاحتياطية أولاً",
        variant: "destructive",
      })
      return
    }

    setIsRestoreLoading(true)
    try {
      const file = fileInputRef.current.files[0]
      const fileContent = await file.text()

      const result = await restoreBackupAction(fileContent)

      if (result.error) {
        toast({
          title: "خطأ",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "تم استعادة النسخة الاحتياطية",
          description: "تم استيراد البيانات بنجاح. سيتم إعادة تحميل الصفحة.",
        })

        // Reload page after 2 seconds to reflect changes
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء قراءة ملف النسخة الاحتياطية",
        variant: "destructive",
      })
    } finally {
      setIsRestoreLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">الإعدادات</h1>
        <p className="text-muted-foreground">إدارة إعدادات النظام والشركة</p>
      </div>

      {/* القسم العلوي: الإعدادات العامة */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            الإعدادات العامة
          </CardTitle>
          <CardDescription>معلومات الشركة التي ستظهر في التقارير المطبوعة</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* اسم الشركة */}
          <div className="space-y-2">
            <Label htmlFor="companyName">اسم الشركة</Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="أدخل اسم الشركة أو المحل التجاري"
              className="text-right"
            />
          </div>

          {/* وصف الشركة */}
          <div className="space-y-2">
            <Label htmlFor="companyDescription">وصف الشركة</Label>
            <Textarea
              id="companyDescription"
              value={companyDescription}
              onChange={(e) => setCompanyDescription(e.target.value)}
              placeholder="أدخل وصفاً موجزاً عن نشاط الشركة"
              className="text-right min-h-[100px]"
            />
          </div>

          {/* شعار الشركة */}
          <div className="space-y-2">
            <Label htmlFor="companyLogo">شعار الشركة</Label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  id="companyLogo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="cursor-pointer"
                />
              </div>
              {logoPreview ? (
                <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                  <img
                    src={logoPreview || "/placeholder.svg"}
                    alt="معاينة الشعار"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <div className="text-center text-xs text-muted-foreground">لا توجد صورة</div>
                </div>
              )}
            </div>
          </div>

          {/* زر حفظ الإعدادات */}
          <Button onClick={handleSaveSettings} className="w-full">
            <Save className="h-4 w-4 ml-2" />
            حفظ الإعدادات
          </Button>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      {/* القسم السفلي: عمليات قاعدة البيانات */}
      <AdminOnly showError>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              عمليات قاعدة البيانات
            </CardTitle>
            <CardDescription>النسخ الاحتياطي واستعادة البيانات</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* تنبيه */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                هذه العمليات متاحة للمديرين فقط. تأكد من إنشاء نسخة احتياطية قبل استعادة البيانات.
              </AlertDescription>
            </Alert>

            {/* أزرار العمليات */}
            <div className="space-y-4">
              {/* زر النسخ الاحتياطي */}
              <Button
                onClick={handleBackup}
                variant="outline"
                className="w-full bg-transparent"
                disabled={isBackupLoading}
              >
                <Download className="h-4 w-4 ml-2" />
                {isBackupLoading ? "جاري إنشاء النسخة الاحتياطية..." : "تحميل نسخة احتياطية"}
              </Button>

              {/* اختيار ملف الاستعادة */}
              <div className="space-y-2">
                <Label htmlFor="backupFile">اختر ملف النسخة الاحتياطية للاستعادة</Label>
                <Input id="backupFile" type="file" accept=".json" ref={fileInputRef} className="cursor-pointer" />
              </div>

              {/* زر استعادة النسخة الاحتياطية */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full" disabled={isRestoreLoading}>
                    <Upload className="h-4 w-4 ml-2" />
                    {isRestoreLoading ? "جاري الاستعادة..." : "استعادة نسخة احتياطية"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                    <AlertDialogDescription className="text-right">
                      سيتم حذف جميع البيانات الحالية (الموردين، العملاء، المعاملات) واستبدالها بالبيانات الموجودة في ملف
                      النسخة الاحتياطية. هذا الإجراء لا يمكن التراجع عنه. تأكد من اختيار الملف الصحيح.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleRestore}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      تأكيد الاستعادة
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </AdminOnly>
    </div>
  )
}
