"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
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
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useDebt, type Supplier, type DebtRecord, type PaymentRecord } from "@/components/debt-context"
import { Search, Plus, Edit, Trash2, Printer, RefreshCw, Eye, Building2, Calendar, Phone, MapPin } from "lucide-react"
import { RoleGuard } from "@/components/role-guard"
import { useAuth } from "@/components/auth-context"

export default function SuppliersPage() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, addSupplierDebt, addSupplierPayment } = useDebt()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isRecordDialogOpen, setIsRecordDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  })
  const [debtForm, setDebtForm] = useState({
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  })
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  })

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.phone.includes(searchTerm) ||
      supplier.address.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.phone) return

    addSupplier({
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      dateAdded: new Date().toISOString().split("T")[0],
    })

    setFormData({ name: "", phone: "", address: "" })
    setIsAddDialogOpen(false)
  }

  const handleEditSupplier = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSupplier || !formData.name || !formData.phone) return

    updateSupplier(selectedSupplier.id, {
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
    })

    setFormData({ name: "", phone: "", address: "" })
    setSelectedSupplier(null)
    setIsEditDialogOpen(false)
  }

  const handleDeleteSupplier = (supplier: Supplier) => {
    deleteSupplier(supplier.id)
  }

  const openEditDialog = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setFormData({
      name: supplier.name,
      phone: supplier.phone,
      address: supplier.address,
    })
    setIsEditDialogOpen(true)
  }

  const openRecordDialog = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setIsRecordDialogOpen(true)
  }

  const handleRowClick = (supplier: Supplier) => {
    setSelectedSupplierId(supplier.id)
    setSelectedSupplier(supplier)
  }

  const handlePrintSelected = () => {
    if (!selectedSupplier) return

    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const getTotalDebts = (debts: DebtRecord[]) => debts.reduce((sum, debt) => sum + debt.amount, 0)
    const getTotalPayments = (payments: PaymentRecord[]) => payments.reduce((sum, payment) => sum + payment.amount, 0)

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>سجل التاجر - ${selectedSupplier.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; direction: rtl; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .company-name { font-size: 24px; font-weight: bold; color: #0891b2; margin-bottom: 10px; }
          .info-section { margin-bottom: 20px; }
          .info-title { font-weight: bold; font-size: 18px; margin-bottom: 10px; color: #333; }
          .info-item { margin: 5px 0; }
          .summary { display: flex; justify-content: space-around; margin: 20px 0; }
          .summary-item { text-align: center; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
          .debt-list, .payment-list { margin-top: 20px; }
          .record-item { border: 1px solid #ddd; padding: 10px; margin: 5px 0; border-radius: 5px; }
          .amount { font-weight: bold; color: #0891b2; }
          .date { color: #666; font-size: 12px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">نظام Debt-IQ لإدارة الديون</div>
          <div>تقرير مفصل لسجل التاجر</div>
          <div>تاريخ الطباعة: ${new Date().toLocaleDateString("ar-IQ")}</div>
        </div>
        
        <div class="info-section">
          <div class="info-title">معلومات التاجر:</div>
          <div class="info-item"><strong>الاسم:</strong> ${selectedSupplier.name}</div>
          <div class="info-item"><strong>رقم الموبايل:</strong> ${selectedSupplier.phone}</div>
          <div class="info-item"><strong>العنوان:</strong> ${selectedSupplier.address || "غير محدد"}</div>
          <div class="info-item"><strong>تاريخ الإضافة:</strong> ${new Date(selectedSupplier.dateAdded).toLocaleDateString("ar-IQ")}</div>
        </div>

        <div class="summary">
          <div class="summary-item">
            <div><strong>إجمالي الديون</strong></div>
            <div class="amount">${getTotalDebts(selectedSupplier.debts).toLocaleString("ar-IQ")} د.ع</div>
          </div>
          <div class="summary-item">
            <div><strong>إجمالي المدفوع</strong></div>
            <div class="amount">${getTotalPayments(selectedSupplier.payments).toLocaleString("ar-IQ")} د.ع</div>
          </div>
          <div class="summary-item">
            <div><strong>المبلغ المتبقي</strong></div>
            <div class="amount">${selectedSupplier.totalDebt.toLocaleString("ar-IQ")} د.ع</div>
          </div>
        </div>

        <div class="debt-list">
          <div class="info-title">سجل الديون:</div>
          ${selectedSupplier.debts
            .map(
              (debt) => `
            <div class="record-item">
              <div class="amount">${debt.amount.toLocaleString("ar-IQ")} د.ع</div>
              <div>${debt.description}</div>
              <div class="date">${new Date(debt.date).toLocaleDateString("ar-IQ")}</div>
            </div>
          `,
            )
            .join("")}
          ${selectedSupplier.debts.length === 0 ? "<div>لا توجد ديون مسجلة</div>" : ""}
        </div>

        <div class="payment-list">
          <div class="info-title">سجل المدفوعات:</div>
          ${selectedSupplier.payments
            .map(
              (payment) => `
            <div class="record-item">
              <div class="amount">${payment.amount.toLocaleString("ar-IQ")} د.ع</div>
              <div>${payment.description}</div>
              <div class="date">${new Date(payment.date).toLocaleDateString("ar-IQ")}</div>
            </div>
          `,
            )
            .join("")}
          ${selectedSupplier.payments.length === 0 ? "<div>لا توجد مدفوعات مسجلة</div>" : ""}
        </div>
      </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.print()
  }

  const handleAddDebt = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSupplier || !debtForm.amount || !debtForm.description) return

    addSupplierDebt(selectedSupplier.id, {
      amount: Number.parseFloat(debtForm.amount),
      description: debtForm.description,
      date: debtForm.date,
    })

    setDebtForm({
      amount: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    })
  }

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSupplier || !paymentForm.amount || !paymentForm.description) return

    const paymentAmount = Number.parseFloat(paymentForm.amount)
    const remainingDebt = selectedSupplier.totalDebt

    if (paymentAmount > remainingDebt) {
      alert(
        `مبلغ التسديد (${paymentAmount.toLocaleString("ar-IQ")} د.ع) أكثر من الدين المطلوب (${remainingDebt.toLocaleString("ar-IQ")} د.ع)`,
      )
      return
    }

    addSupplierPayment(selectedSupplier.id, {
      amount: paymentAmount,
      description: paymentForm.description,
      date: paymentForm.date,
    })

    setPaymentForm({
      amount: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    })
  }

  const handlePrint = () => {
    window.print()
  }

  const getTotalDebts = (debts: DebtRecord[]) => debts.reduce((sum, debt) => sum + debt.amount, 0)
  const getTotalPayments = (payments: PaymentRecord[]) => payments.reduce((sum, payment) => sum + payment.amount, 0)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-right">
        <h1 className="text-3xl font-bold text-foreground">سجل التجار</h1>
        <p className="text-muted-foreground mt-2">إدارة الموردين والتجار وديونهم</p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="البحث في التجار (الاسم، الهاتف، العنوان)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 text-right"
            />
          </div>
        </CardContent>
      </Card>

      {/* Suppliers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-right flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            قائمة التجار ({filteredSuppliers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">اسم التاجر</TableHead>
                  <TableHead className="text-right">رقم الموبايل</TableHead>
                  <TableHead className="text-right">العنوان</TableHead>
                  <TableHead className="text-right">تاريخ الإضافة</TableHead>
                  <TableHead className="text-right">الديون</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.map((supplier) => (
                  <TableRow
                    key={supplier.id}
                    className={`cursor-pointer hover:bg-muted/50 ${selectedSupplierId === supplier.id ? "bg-muted" : ""}`}
                    onClick={() => handleRowClick(supplier)}
                  >
                    <TableCell className="text-right font-medium">{supplier.name}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {supplier.phone}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {supplier.address || "غير محدد"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(supplier.dateAdded).toLocaleDateString("ar-IQ")}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={supplier.totalDebt > 0 ? "destructive" : "secondary"}>
                        {supplier.totalDebt.toLocaleString("ar-IQ")} د.ع
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredSuppliers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      لا توجد نتائج للبحث
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2 justify-center">
            <RoleGuard resource="suppliers" action="create">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    إضافة
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-right">إضافة تاجر جديد</DialogTitle>
                    <DialogDescription className="text-right">أدخل بيانات التاجر الجديد</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddSupplier} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-right">
                        اسم التاجر *
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="text-right"
                        placeholder="أدخل اسم التاجر"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-right">
                        رقم الموبايل *
                      </Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="text-right"
                        placeholder="أدخل رقم الموبايل"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-right">
                        العنوان
                      </Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="text-right"
                        placeholder="أدخل العنوان"
                      />
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
            </RoleGuard>

            <RoleGuard resource="suppliers" action="update">
              <Button
                variant="outline"
                className="gap-2 bg-transparent"
                disabled={!selectedSupplier}
                onClick={() => selectedSupplier && openEditDialog(selectedSupplier)}
              >
                <Edit className="h-4 w-4" />
                تعديل
              </Button>
            </RoleGuard>

            <RoleGuard resource="suppliers" action="delete">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2" disabled={!selectedSupplier}>
                    <Trash2 className="h-4 w-4" />
                    حذف
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-right">تأكيد الحذف</AlertDialogTitle>
                    <AlertDialogDescription className="text-right">
                      هل أنت متأكد من حذف هذا التاجر؟ لا يمكن التراجع عن هذا الإجراء.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => selectedSupplier && handleDeleteSupplier(selectedSupplier)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      حذف
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </RoleGuard>

            <Button
              variant="outline"
              className="gap-2 bg-transparent"
              onClick={handlePrintSelected}
              disabled={!selectedSupplier}
            >
              <Printer className="h-4 w-4" />
              طباعة
            </Button>

            <Button variant="outline" className="gap-2 bg-transparent" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4" />
              تحديث
            </Button>

            <Button
              variant="outline"
              className="gap-2 bg-transparent"
              disabled={!selectedSupplier}
              onClick={() => selectedSupplier && openRecordDialog(selectedSupplier)}
            >
              <Eye className="h-4 w-4" />
              عرض السجل
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-right">تعديل بيانات التاجر</DialogTitle>
            <DialogDescription className="text-right">تعديل بيانات التاجر المحدد</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSupplier} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-right">
                اسم التاجر *
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="text-right"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone" className="text-right">
                رقم الموبايل *
              </Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="text-right"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address" className="text-right">
                العنوان
              </Label>
              <Textarea
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="text-right"
              />
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

      {/* Record Dialog */}
      <Dialog open={isRecordDialogOpen} onOpenChange={setIsRecordDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-right">سجل التاجر: {selectedSupplier?.name}</DialogTitle>
            <DialogDescription className="text-right">عرض وإدارة ديون ومدفوعات التاجر</DialogDescription>
          </DialogHeader>

          {selectedSupplier && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-destructive">
                      {getTotalDebts(selectedSupplier.debts).toLocaleString("ar-IQ")} د.ع
                    </div>
                    <p className="text-sm text-muted-foreground">إجمالي الديون</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">
                      {getTotalPayments(selectedSupplier.payments).toLocaleString("ar-IQ")} د.ع
                    </div>
                    <p className="text-sm text-muted-foreground">إجمالي المدفوع</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-secondary">
                      {selectedSupplier.totalDebt.toLocaleString("ar-IQ")} د.ع
                    </div>
                    <p className="text-sm text-muted-foreground">المبلغ المتبقي</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Debts Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-right">الديون</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <RoleGuard resource="transactions" action="create">
                      <form onSubmit={handleAddDebt} className="space-y-3">
                        <Input
                          type="number"
                          placeholder="المبلغ"
                          value={debtForm.amount}
                          onChange={(e) => setDebtForm({ ...debtForm, amount: e.target.value })}
                          className="text-right"
                        />
                        <Input
                          placeholder="الوصف"
                          value={debtForm.description}
                          onChange={(e) => setDebtForm({ ...debtForm, description: e.target.value })}
                          className="text-right"
                        />
                        <Input
                          type="date"
                          value={debtForm.date}
                          onChange={(e) => setDebtForm({ ...debtForm, date: e.target.value })}
                          className="text-right"
                        />
                        <Button type="submit" className="w-full">
                          إضافة دين
                        </Button>
                      </form>
                    </RoleGuard>

                    <Separator />

                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {selectedSupplier.debts.map((debt) => (
                        <div key={debt.id} className="flex justify-between items-center p-2 border rounded">
                          <div className="text-right">
                            <div className="font-medium">{debt.amount.toLocaleString("ar-IQ")} د.ع</div>
                            <div className="text-sm text-muted-foreground">{debt.description}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(debt.date).toLocaleDateString("ar-IQ")}
                            </div>
                          </div>
                        </div>
                      ))}
                      {selectedSupplier.debts.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">لا توجد ديون</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Payments Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-right">التسديد</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <RoleGuard resource="transactions" action="create">
                      <form onSubmit={handleAddPayment} className="space-y-3">
                        <Input
                          type="number"
                          placeholder="المبلغ"
                          value={paymentForm.amount}
                          onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                          className="text-right"
                        />
                        <Input
                          placeholder="الوصف"
                          value={paymentForm.description}
                          onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                          className="text-right"
                        />
                        <Input
                          type="date"
                          value={paymentForm.date}
                          onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                          className="text-right"
                        />
                        <Button type="submit" className="w-full">
                          إضافة دفعة
                        </Button>
                      </form>
                    </RoleGuard>

                    <Separator />

                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {selectedSupplier.payments.map((payment) => (
                        <div key={payment.id} className="flex justify-between items-center p-2 border rounded">
                          <div className="text-right">
                            <div className="font-medium">{payment.amount.toLocaleString("ar-IQ")} د.ع</div>
                            <div className="text-sm text-muted-foreground">{payment.description}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(payment.date).toLocaleDateString("ar-IQ")}
                            </div>
                          </div>
                        </div>
                      ))}
                      {selectedSupplier.payments.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">لا توجد مدفوعات</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
