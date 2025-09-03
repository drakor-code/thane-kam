import { z } from "zod"

// User validation schemas
export const createUserSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون على الأقل حرفين").max(100, "الاسم طويل جداً"),
  email: z.string().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون على الأقل 6 أحرف").max(100, "كلمة المرور طويلة جداً"),
  role: z.enum(["admin", "employee"], { errorMap: () => ({ message: "الدور يجب أن يكون مدير أو موظف" }) }),
  phone: z.string().optional(),
  address: z.string().optional(),
})

export const updateUserSchema = createUserSchema.omit({ password: true }).extend({
  id: z.string().min(1, "معرف المستخدم مطلوب"),
  isActive: z.boolean().optional(),
})

export const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
})

// Supplier validation schemas
export const createSupplierSchema = z.object({
  name: z.string().min(2, "اسم المورد يجب أن يكون على الأقل حرفين").max(100, "الاسم طويل جداً"),
  phone: z.string().min(10, "رقم الهاتف يجب أن يكون على الأقل 10 أرقام").max(15, "رقم الهاتف طويل جداً").optional(),
  address: z.string().max(500, "العنوان طويل جداً").optional(),
  email: z.string().email("البريد الإلكتروني غير صالح").optional().or(z.literal("")),
  notes: z.string().max(1000, "الملاحظات طويلة جداً").optional(),
})

export const updateSupplierSchema = createSupplierSchema.extend({
  id: z.string().min(1, "معرف المورد مطلوب"),
})

// Customer validation schemas
export const createCustomerSchema = z.object({
  name: z.string().min(2, "اسم العميل يجب أن يكون على الأقل حرفين").max(100, "الاسم طويل جداً"),
  phone: z.string().min(10, "رقم الهاتف يجب أن يكون على الأقل 10 أرقام").max(15, "رقم الهاتف طويل جداً").optional(),
  address: z.string().max(500, "العنوان طويل جداً").optional(),
  email: z.string().email("البريد الإلكتروني غير صالح").optional().or(z.literal("")),
  notes: z.string().max(1000, "الملاحظات طويلة جداً").optional(),
})

export const updateCustomerSchema = createCustomerSchema.extend({
  id: z.string().min(1, "معرف العميل مطلوب"),
})

// Transaction validation schemas
export const debtTransactionSchema = z.object({
  entityId: z.string().min(1, "معرف الكيان مطلوب"),
  amount: z.number().positive("المبلغ يجب أن يكون أكبر من صفر").max(999999999, "المبلغ كبير جداً"),
  description: z.string().min(1, "الوصف مطلوب").max(500, "الوصف طويل جداً"),
  notes: z.string().max(1000, "الملاحظات طويلة جداً").optional(),
})

// Company settings validation schema
export const companySettingsSchema = z.object({
  name: z.string().min(2, "اسم الشركة يجب أن يكون على الأقل حرفين").max(200, "اسم الشركة طويل جداً"),
  description: z.string().max(1000, "وصف الشركة طويل جداً").optional(),
  logo: z.string().optional(),
})

// Validation helper function
export function validateFormData<T>(
  schema: z.ZodSchema<T>,
  formData: FormData,
): { success: true; data: T } | { success: false; error: string } {
  try {
    const data = Object.fromEntries(formData.entries())

    // Convert string numbers to actual numbers for numeric fields
    if ("amount" in data && typeof data.amount === "string") {
      data.amount = Number.parseFloat(data.amount as string)
    }
    if ("isActive" in data && typeof data.isActive === "string") {
      data.isActive = data.isActive === "true"
    }

    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return { success: false, error: firstError.message }
    }
    return { success: false, error: "خطأ في التحقق من صحة البيانات" }
  }
}
