import { NextResponse } from "next/server"
import { logoutAction } from "@/app/actions/auth"

export async function POST() {
  try {
    await logoutAction()
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
}
