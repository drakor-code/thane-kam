"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useUsers, type User } from "@/components/user-context"
import { useAuth } from "@/components/auth-context"
import { Users, Plus, Edit, Trash2, RefreshCw, Shield, UserIcon, Calendar, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"

export default function UsersPage() {
  const { user: currentUser } = useAuth()
  const { users, addUser, updateUser, deleteUser } = useUsers()
  const router = useRouter()
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({})
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    role: "employee" as "admin" | "employee",
  })

  useEffect(() => {
    if (currentUser && currentUser.role !== "admin") {
      router.push("/dashboard")
    }
  }, [currentUser, router])

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert className="max-w-md">
          <Shield className="h-4 w-4" />
          <AlertDescription className="text-right">
            هذه الصفحة متاحة للمديرين فقط. ليس لديك صلاحية للوصول إلى إدارة الموظفين.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.fullName || !formData.username || !formData.email || !formData.password) return

    addUser({
      fullName: formData.fullName,
      username: formData.username,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    })

    setFormData({ fullName: "", username: "", email: "", password: "", role: "employee" })
    setIsAddDialogOpen(false)
  }

  const handleEditUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser || !formData.fullName || !formData.username || !formData.email) return

    updateUser(selectedUser.id, {
      fullName: formData.fullName,
      username: formData.username,
      email: formData.email,
      password: formData.password || selectedUser.password,
      role: formData.role,
    })

    setFormData({ fullName: "", username: "", email: "", password: "", role: "employee" })
    setSelectedUser(null)
    setIsEditDialogOpen(false)
  }

  const handleDeleteUser = (user: User) => {
    if (user.id === currentUser.id) {
      alert("لا يمكنك حذف حسابك الخاص")
      return
    }
    deleteUser(user.id)
    setSelectedUserId(null)
  }

  const openEditDialog = (user: User) => {
    setSelectedUser(user)
    setFormData({
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      password: "",
      role: user.role,
    })
    setIsEditDialogOpen(true)
  }

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }))
  }

  const maskPassword = (password: string) => "•".repeat(password.length)

  const handleRowClick = (userId: string) => {
    setSelectedUserId(selectedUserId === userId ? null : userId)
  }

  const getSelectedUser = () => {
    return selectedUserId ? users.find((user) => user.id === selectedUserId) : null
  }

  return (
    <div className="space-y-6">
      <div className="text-right">
        <h1 className="text-3xl font-bold text-foreground">إدارة الموظفين</h1>
        <p className="text-muted-foreground mt-2">إدارة حسابات موظفي النظام (خاصة بالمدير فقط)</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-right flex items-center gap-2">
            <Users className="h-5 w-5" />
            قائمة الموظفين ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الاسم الكامل</TableHead>
                  <TableHead className="text-right">اسم المستخدم</TableHead>
                  <TableHead className="text-right">كلمة المرور</TableHead>
                  <TableHead className="text-right">دور الموظف</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow
                    key={user.id}
                    className={`cursor-pointer transition-colors ${
                      selectedUserId === user.id ? "bg-muted/50 hover:bg-muted/70" : "hover:bg-muted/30"
                    }`}
                    onClick={() => handleRowClick(user.id)}
                  >
                    <TableCell className="text-right font-medium">
                      <div>
                        <div>{user.fullName}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(user.dateCreated).toLocaleDateString("ar-IQ")}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                        {user.username}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="font-mono">
                          {showPasswords[user.id] ? user.password : maskPassword(user.password)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            togglePasswordVisibility(user.id)
                          }}
                        >
                          {showPasswords[user.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                        {user.role === "admin" ? "مدير" : "موظف"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2 justify-center">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  إضافة
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-right">إضافة موظف جديد</DialogTitle>
                  <DialogDescription className="text-right">أدخل بيانات الموظف الجديد</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddUser} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-right">
                      الاسم الكامل *
                    </Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="text-right"
                      placeholder="أدخل الاسم الكامل"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-right">
                      اسم المستخدم *
                    </Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="text-right"
                      placeholder="أدخل اسم المستخدم"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-right">
                      البريد الإلكتروني *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="text-right"
                      placeholder="أدخل البريد الإلكتروني"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-right">
                      كلمة المرور *
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="text-right"
                      placeholder="أدخل كلمة المرور"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-right">
                      دور الموظف *
                    </Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value: "admin" | "employee") => setFormData({ ...formData, role: value })}
                    >
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="اختر دور الموظف" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">مدير</SelectItem>
                        <SelectItem value="employee">موظف</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      إضافة
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      إلغاء
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              className="gap-2 bg-transparent"
              disabled={!selectedUserId}
              onClick={() => {
                const user = getSelectedUser()
                if (user) openEditDialog(user)
              }}
            >
              <Edit className="h-4 w-4" />
              تعديل
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2" disabled={!selectedUserId}>
                  <Trash2 className="h-4 w-4" />
                  حذف
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-right">تأكيد الحذف</AlertDialogTitle>
                  <AlertDialogDescription className="text-right">
                    هل أنت متأكد من حذف هذا الموظف؟ لا يمكن التراجع عن هذا الإجراء.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      const user = getSelectedUser()
                      if (user) handleDeleteUser(user)
                    }}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    حذف
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button variant="outline" className="gap-2 bg-transparent" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4" />
              تحديث
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-right">تعديل بيانات الموظف</DialogTitle>
            <DialogDescription className="text-right">تعديل بيانات الموظف المحدد</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-fullName" className="text-right">
                الاسم الكامل *
              </Label>
              <Input
                id="edit-fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="text-right"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-username" className="text-right">
                اسم المستخدم *
              </Label>
              <Input
                id="edit-username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="text-right"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email" className="text-right">
                البريد الإلكتروني *
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="text-right"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password" className="text-right">
                كلمة المرور (اتركها فارغة للاحتفاظ بالحالية)
              </Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="text-right"
                placeholder="أدخل كلمة مرور جديدة أو اتركها فارغة"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role" className="text-right">
                دور الموظف *
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value: "admin" | "employee") => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger className="text-right">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">مدير</SelectItem>
                  <SelectItem value="employee">موظف</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                حفظ التغييرات
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => setIsEditDialogOpen(false)}
              >
                إلغاء
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
