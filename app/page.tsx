"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Lock, Mail, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { loginAction } from "@/app/actions/auth"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (formData: FormData) => {
    setIsLoading(true)
    setError("")

    try {
      const result = await loginAction(formData)

      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        router.push("/dashboard")
        router.refresh()
      }
    } catch (error) {
      setError("حدث خطأ أثناء تسجيل الدخول")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-card/95 backdrop-blur">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold text-primary">Debt-IQ</CardTitle>
            <CardDescription className="text-muted-foreground">نظام إدارة الديون المتقدم</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form action={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-right flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  البريد الإلكتروني
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="text-right"
                  placeholder="أدخل البريد الإلكتروني"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-right flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  كلمة المرور
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="text-right pr-10"
                    placeholder="أدخل كلمة المرور"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription className="text-right">{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                </Button>
                <Button type="button" variant="outline" className="flex-1 bg-transparent" disabled={isLoading}>
                  <X className="w-4 h-4 ml-2" />
                  إغلاق النافذة
                </Button>
              </div>
            </form>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">للحصول على حساب، تواصل مع مدير النظام</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
