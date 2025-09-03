"use server"

import { revalidatePath } from "next/cache"
import { db, companySettings, auditLog } from "@/lib/db"
import { eq } from "drizzle-orm"
import { requireAdmin } from "@/lib/auth/session"

export async function updateCompanySettingsAction(formData: FormData) {
  try {
    const admin = await requireAdmin()

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const logo = formData.get("logo") as string

    if (!name) {
      return { error: "اسم الشركة مطلوب" }
    }

    // Get existing settings
    const existingSettings = await db.select().from(companySettings).limit(1)

    let result
    if (existingSettings[0]) {
      // Update existing settings
      result = await db
        .update(companySettings)
        .set({
          name,
          description,
          logo,
          updatedAt: new Date(),
        })
        .where(eq(companySettings.id, existingSettings[0].id))
        .returning()
    } else {
      // Create new settings
      result = await db
        .insert(companySettings)
        .values({
          name,
          description,
          logo,
        })
        .returning()
    }

    // Log audit
    await db.insert(auditLog).values({
      userId: admin.id,
      action: existingSettings[0] ? "update" : "create",
      tableName: "company_settings",
      recordId: result[0].id,
      oldData: existingSettings[0] || null,
      newData: result[0],
    })

    revalidatePath("/dashboard/settings")
    return { success: true, settings: result[0] }
  } catch (error) {
    console.error("Update settings error:", error)
    return { error: "حدث خطأ أثناء حفظ الإعدادات" }
  }
}

export async function getCompanySettingsAction() {
  try {
    const settings = await db.select().from(companySettings).limit(1)

    return { success: true, settings: settings[0] || null }
  } catch (error) {
    console.error("Get settings error:", error)
    return { error: "حدث خطأ أثناء جلب الإعدادات" }
  }
}
