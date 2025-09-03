import { NextResponse } from "next/server"
import { createBackupAction } from "@/app/actions/backup"

export async function GET() {
  try {
    const result = await createBackupAction()

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    if (!result.data || !result.filename) {
      return NextResponse.json({ error: "فشل في إنشاء النسخة الاحتياطية" }, { status: 500 })
    }

    const response = new NextResponse(result.data)
    response.headers.set("Content-Type", "application/json")
    response.headers.set("Content-Disposition", `attachment; filename="${result.filename}"`)

    return response
  } catch (error) {
    console.error("Backup download error:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء تحميل النسخة الاحتياطية" }, { status: 500 })
  }
}
