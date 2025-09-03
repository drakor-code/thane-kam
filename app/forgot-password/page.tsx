"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Lock, Mail, CheckCircle, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"email" | "verification" | "reset">("email")
  const [email, setEmail] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError("البريد الإلكتروني مطلوب")
      return
    }

    setLoading(true)
    setError("")

    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      setStep("verification")
    }, 1500)
  }

  const handleVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!verificationCode || verificationCode.length !== 6) {
      setError("يرجى إدخال رمز التحقق المكون من 6 أرقام")
      return
    }

    // Simulate verification
    if (verificationCode === "123456") {
      setError("")
      setStep("reset")
    } else {
      setError("رمز التحقق غير صحيح")
    }
  }

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPassword || !confirmPassword) {
      setError("جميع الحقول مطلوبة")
      return
    }

    if (newPassword.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("كلمات المرور غير متطابقة")
      return
    }

    setLoading(true)
    setError("")

    // Simulate password reset
    setTimeout(() => {
      setLoading(false)
      alert("تم تغيير كلمة المرور بنجاح!")
      router.push("/")
    }, 1500)
  }

  const renderEmailStep = () => (
    <Card className="shadow-2xl border-0 bg-card/95 backdrop-blur">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
          <Mail className="w-8 h-8 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl font-bold text-primary">استعادة كلمة المرور</CardTitle>
        <CardDescription className="text-muted-foreground">أدخل بريدك الإلكتروني لإرسال رمز التحقق</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-right flex items-center gap-2">
              <Mail className="w-4 h-4" />
              البريد الإلكتروني
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-right"
              placeholder="أدخل البريد الإلكتروني"
              disabled={loading}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription className="text-right">{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "جاري الإرسال..." : "إرسال رمز التحقق"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => router.push("/")}
              disabled={loading}
            >
              <ArrowRight className="w-4 h-4 ml-2" />
              العودة لتسجيل الدخول
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )

  const renderVerificationStep = () => (
    <Card className="shadow-2xl border-0 bg-card/95 backdrop-blur">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-secondary rounded-full flex items-center justify-center">
          <Lock className="w-8 h-8 text-secondary-foreground" />
        </div>
        <CardTitle className="text-2xl font-bold text-primary">رمز التحقق</CardTitle>
        <CardDescription className="text-muted-foreground">تم إرسال رمز التحقق إلى: {email}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleVerificationSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="verification" className="text-right">
              رمز التحقق (6 أرقام)
            </Label>
            <Input
              id="verification"
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="text-right text-center text-2xl tracking-widest font-mono"
              placeholder="000000"
              maxLength={6}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription className="text-right">{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              تأكيد الرمز
            </Button>
            <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={() => setStep("email")}>
              <ArrowRight className="w-4 h-4 ml-2" />
              رجوع
            </Button>
          </div>

          <div className="text-center">
            <Button variant="link" className="text-sm text-muted-foreground" onClick={() => setStep("email")}>
              لم يصلك الرمز؟ إرسال مرة أخرى
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )

  const renderResetStep = () => (
    <Card className="shadow-2xl border-0 bg-card/95 backdrop-blur">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-primary">إنشاء كلمة مرور جديدة</CardTitle>
        <CardDescription className="text-muted-foreground">أدخل كلمة المرور الجديدة لحسابك</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handlePasswordReset} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password" className="text-right flex items-center gap-2">
              <Lock className="w-4 h-4" />
              كلمة المرور الجديدة
            </Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="text-right pr-10"
                placeholder="أدخل كلمة المرور الجديدة"
                disabled={loading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-right flex items-center gap-2">
              <Lock className="w-4 h-4" />
              تأكيد كلمة المرور
            </Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="text-right pr-10"
                placeholder="أعد إدخال كلمة المرور"
                disabled={loading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription className="text-right">{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "جاري الحفظ..." : "إكمال"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => setStep("verification")}
              disabled={loading}
            >
              <ArrowRight className="w-4 h-4 ml-2" />
              رجوع
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {step === "email" && renderEmailStep()}
        {step === "verification" && renderVerificationStep()}
        {step === "reset" && renderResetStep()}
      </div>
    </div>
  )
}
