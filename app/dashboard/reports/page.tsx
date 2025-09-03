"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useDebt } from "@/components/debt-context"
import { FileText, Building2, Users, CreditCard, Receipt } from "lucide-react"

export default function ReportsPage() {
  const { suppliers, customers } = useDebt()

  const generateSuppliersDebtReport = () => {
    const reportContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>تقرير ديون الموردين والتجار</title>
        <style>
          body { font-family: Arial, sans-serif; direction: rtl; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .company-info { margin-bottom: 20px; }
          .supplier-section { margin-bottom: 40px; page-break-inside: avoid; }
          .supplier-header { background-color: #f5f5f5; padding: 10px; margin-bottom: 15px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
          th { background-color: #f9f9f9; }
          .total { font-weight: bold; background-color: #e8f4f8; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>تقرير ديون الموردين والتجار</h1>
          <div class="company-info">
            <h2>الأفنان لتكنولوجيا المعلومات</h2>
            <p>تاريخ التقرير: ${new Date().toLocaleDateString("ar-SA")}</p>
          </div>
        </div>
        
        ${suppliers
          .map(
            (supplier) => `
          <div class="supplier-section">
            <div class="supplier-header">
              <h3>التاجر: ${supplier.name}</h3>
              <p>الهاتف: ${supplier.phone} | العنوان: ${supplier.address || "غير محدد"}</p>
              <p>تاريخ الإضافة: ${new Date(supplier.dateAdded).toLocaleDateString("ar-SA")}</p>
            </div>
            
            <h4>جدول الديون:</h4>
            <table>
              <thead>
                <tr>
                  <th>التاريخ</th>
                  <th>الوصف</th>
                  <th>المبلغ (ر.س)</th>
                </tr>
              </thead>
              <tbody>
                ${supplier.debts
                  .map(
                    (debt) => `
                  <tr>
                    <td>${new Date(debt.date).toLocaleDateString("ar-SA")}</td>
                    <td>${debt.description}</td>
                    <td>${debt.amount.toLocaleString("ar-SA")}</td>
                  </tr>
                `,
                  )
                  .join("")}
                <tr class="total">
                  <td colspan="2">إجمالي الديون</td>
                  <td>${supplier.debts.reduce((sum, debt) => sum + debt.amount, 0).toLocaleString("ar-SA")}</td>
                </tr>
              </tbody>
            </table>
            
            <h4>جدول التسديدات:</h4>
            <table>
              <thead>
                <tr>
                  <th>التاريخ</th>
                  <th>الوصف</th>
                  <th>المبلغ (ر.س)</th>
                </tr>
              </thead>
              <tbody>
                ${supplier.payments
                  .map(
                    (payment) => `
                  <tr>
                    <td>${new Date(payment.date).toLocaleDateString("ar-SA")}</td>
                    <td>${payment.description}</td>
                    <td>${payment.amount.toLocaleString("ar-SA")}</td>
                  </tr>
                `,
                  )
                  .join("")}
                <tr class="total">
                  <td colspan="2">إجمالي المدفوع</td>
                  <td>${supplier.payments.reduce((sum, payment) => sum + payment.amount, 0).toLocaleString("ar-SA")}</td>
                </tr>
              </tbody>
            </table>
            
            <div class="total" style="padding: 10px; margin-top: 10px;">
              <strong>المبلغ المتبقي: ${supplier.totalDebt.toLocaleString("ar-SA")} ر.س</strong>
            </div>
          </div>
        `,
          )
          .join("")}
      </body>
      </html>
    `

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(reportContent)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => printWindow.print(), 500)
    }
  }

  const generateCustomersDebtReport = () => {
    const reportContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>تقرير ديون العملاء</title>
        <style>
          body { font-family: Arial, sans-serif; direction: rtl; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .company-info { margin-bottom: 20px; }
          .customer-section { margin-bottom: 40px; page-break-inside: avoid; }
          .customer-header { background-color: #f5f5f5; padding: 10px; margin-bottom: 15px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
          th { background-color: #f9f9f9; }
          .total { font-weight: bold; background-color: #e8f4f8; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>تقرير ديون العملاء</h1>
          <div class="company-info">
            <h2>الأفنان لتكنولوجيا المعلومات</h2>
            <p>تاريخ التقرير: ${new Date().toLocaleDateString("ar-SA")}</p>
          </div>
        </div>
        
        ${customers
          .map(
            (customer) => `
          <div class="customer-section">
            <div class="customer-header">
              <h3>العميل: ${customer.name}</h3>
              <p>الهاتف: ${customer.phone} | العنوان: ${customer.address || "غير محدد"}</p>
              <p>تاريخ الإضافة: ${new Date(customer.dateAdded).toLocaleDateString("ar-SA")}</p>
            </div>
            
            <h4>جدول الديون:</h4>
            <table>
              <thead>
                <tr>
                  <th>التاريخ</th>
                  <th>الوصف</th>
                  <th>المبلغ (ر.س)</th>
                </tr>
              </thead>
              <tbody>
                ${customer.debts
                  .map(
                    (debt) => `
                  <tr>
                    <td>${new Date(debt.date).toLocaleDateString("ar-SA")}</td>
                    <td>${debt.description}</td>
                    <td>${debt.amount.toLocaleString("ar-SA")}</td>
                  </tr>
                `,
                  )
                  .join("")}
                <tr class="total">
                  <td colspan="2">إجمالي الديون</td>
                  <td>${customer.debts.reduce((sum, debt) => sum + debt.amount, 0).toLocaleString("ar-SA")}</td>
                </tr>
              </tbody>
            </table>
            
            <h4>جدول التسديدات:</h4>
            <table>
              <thead>
                <tr>
                  <th>التاريخ</th>
                  <th>الوصف</th>
                  <th>المبلغ (ر.س)</th>
                </tr>
              </thead>
              <tbody>
                ${customer.payments
                  .map(
                    (payment) => `
                  <tr>
                    <td>${new Date(payment.date).toLocaleDateString("ar-SA")}</td>
                    <td>${payment.description}</td>
                    <td>${payment.amount.toLocaleString("ar-SA")}</td>
                  </tr>
                `,
                  )
                  .join("")}
                <tr class="total">
                  <td colspan="2">إجمالي المدفوع</td>
                  <td>${customer.payments.reduce((sum, payment) => sum + payment.amount, 0).toLocaleString("ar-SA")}</td>
                </tr>
              </tbody>
            </table>
            
            <div class="total" style="padding: 10px; margin-top: 10px;">
              <strong>المبلغ المتبقي: ${customer.totalDebt.toLocaleString("ar-SA")} ر.س</strong>
            </div>
          </div>
        `,
          )
          .join("")}
      </body>
      </html>
    `

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(reportContent)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => printWindow.print(), 500)
    }
  }

  const generateSuppliersPaymentReport = () => {
    const allPayments = suppliers.flatMap((supplier) =>
      supplier.payments.map((payment) => ({
        ...payment,
        supplierName: supplier.name,
      })),
    )

    allPayments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const reportContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>تقرير تسديد الموردين والتجار</title>
        <style>
          body { font-family: Arial, sans-serif; direction: rtl; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .company-info { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
          th { background-color: #f9f9f9; }
          .total { font-weight: bold; background-color: #e8f4f8; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>تقرير تسديد الموردين والتجار</h1>
          <div class="company-info">
            <h2>الأفنان لتكنولوجيا المعلومات</h2>
            <p>تاريخ التقرير: ${new Date().toLocaleDateString("ar-SA")}</p>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>اسم التاجر</th>
              <th>الوصف</th>
              <th>المبلغ (ر.س)</th>
            </tr>
          </thead>
          <tbody>
            ${allPayments
              .map(
                (payment) => `
              <tr>
                <td>${new Date(payment.date).toLocaleDateString("ar-SA")}</td>
                <td>${payment.supplierName}</td>
                <td>${payment.description}</td>
                <td>${payment.amount.toLocaleString("ar-SA")}</td>
              </tr>
            `,
              )
              .join("")}
            <tr class="total">
              <td colspan="3">إجمالي المدفوعات</td>
              <td>${allPayments.reduce((sum, payment) => sum + payment.amount, 0).toLocaleString("ar-SA")}</td>
            </tr>
          </tbody>
        </table>
      </body>
      </html>
    `

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(reportContent)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => printWindow.print(), 500)
    }
  }

  const generateCustomersPaymentReport = () => {
    const allPayments = customers.flatMap((customer) =>
      customer.payments.map((payment) => ({
        ...payment,
        customerName: customer.name,
      })),
    )

    allPayments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const reportContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>تقرير تسديد العملاء</title>
        <style>
          body { font-family: Arial, sans-serif; direction: rtl; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .company-info { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
          th { background-color: #f9f9f9; }
          .total { font-weight: bold; background-color: #e8f4f8; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>تقرير تسديد العملاء</h1>
          <div class="company-info">
            <h2>الأفنان لتكنولوجيا المعلومات</h2>
            <p>تاريخ التقرير: ${new Date().toLocaleDateString("ar-SA")}</p>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>اسم العميل</th>
              <th>الوصف</th>
              <th>المبلغ (ر.س)</th>
            </tr>
          </thead>
          <tbody>
            ${allPayments
              .map(
                (payment) => `
              <tr>
                <td>${new Date(payment.date).toLocaleDateString("ar-SA")}</td>
                <td>${payment.customerName}</td>
                <td>${payment.description}</td>
                <td>${payment.amount.toLocaleString("ar-SA")}</td>
              </tr>
            `,
              )
              .join("")}
            <tr class="total">
              <td colspan="3">إجمالي المدفوعات</td>
              <td>${allPayments.reduce((sum, payment) => sum + payment.amount, 0).toLocaleString("ar-SA")}</td>
            </tr>
          </tbody>
        </table>
      </body>
      </html>
    `

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(reportContent)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => printWindow.print(), 500)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-right">
        <h1 className="text-3xl font-bold text-foreground">التقارير</h1>
        <p className="text-muted-foreground mt-2">إنشاء وطباعة التقارير المالية المفصلة</p>
      </div>

      {/* Reports Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Suppliers Debt Report */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={generateSuppliersDebtReport}>
          <CardHeader className="text-right">
            <CardTitle className="flex items-center gap-3 justify-end">
              <Building2 className="h-6 w-6 text-primary" />
              تقرير ديون الموردين والتجار
            </CardTitle>
            <CardDescription>تقرير مفصل لكل تاجر على حدة يعرض معلوماته وجدول ديونه وتسديداته</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Button className="gap-2">
                <FileText className="h-4 w-4" />
                إنشاء التقرير
              </Button>
              <div className="text-sm text-muted-foreground">{suppliers.length} تاجر</div>
            </div>
          </CardContent>
        </Card>

        {/* Customers Debt Report */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={generateCustomersDebtReport}>
          <CardHeader className="text-right">
            <CardTitle className="flex items-center gap-3 justify-end">
              <Users className="h-6 w-6 text-primary" />
              تقرير ديون العملاء
            </CardTitle>
            <CardDescription>تقرير مفصل لكل عميل على حدة يعرض معلوماته وجدول ديونه وتسديداته</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Button className="gap-2">
                <FileText className="h-4 w-4" />
                إنشاء التقرير
              </Button>
              <div className="text-sm text-muted-foreground">{customers.length} عميل</div>
            </div>
          </CardContent>
        </Card>

        {/* Suppliers Payment Report */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={generateSuppliersPaymentReport}>
          <CardHeader className="text-right">
            <CardTitle className="flex items-center gap-3 justify-end">
              <CreditCard className="h-6 w-6 text-secondary" />
              تقرير تسديد الموردين والتجار
            </CardTitle>
            <CardDescription>تقرير واحد يجمع كل الدفعات للموردين مرتبة حسب التاريخ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Button variant="secondary" className="gap-2">
                <FileText className="h-4 w-4" />
                إنشاء التقرير
              </Button>
              <div className="text-sm text-muted-foreground">
                {suppliers.reduce((total, supplier) => total + supplier.payments.length, 0)} دفعة
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customers Payment Report */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={generateCustomersPaymentReport}>
          <CardHeader className="text-right">
            <CardTitle className="flex items-center gap-3 justify-end">
              <Receipt className="h-6 w-6 text-secondary" />
              تقرير تسديد العملاء
            </CardTitle>
            <CardDescription>تقرير واحد يجمع كل الدفعات من العملاء مرتبة حسب التاريخ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Button variant="secondary" className="gap-2">
                <FileText className="h-4 w-4" />
                إنشاء التقرير
              </Button>
              <div className="text-sm text-muted-foreground">
                {customers.reduce((total, customer) => total + customer.payments.length, 0)} دفعة
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader className="text-right">
          <CardTitle>تعليمات الطباعة</CardTitle>
        </CardHeader>
        <CardContent className="text-right space-y-2">
          <p className="text-muted-foreground">• اضغط على أي تقرير لإنشائه وعرضه في نافذة جديدة</p>
          <p className="text-muted-foreground">• استخدم خيار الطباعة في المتصفح لحفظ التقرير كملف PDF</p>
          <p className="text-muted-foreground">• يمكنك تخصيص معلومات الشركة من صفحة الإعدادات</p>
          <p className="text-muted-foreground">• جميع التقارير تحتوي على شعار الشركة وتاريخ الإنشاء</p>
        </CardContent>
      </Card>
    </div>
  )
}
