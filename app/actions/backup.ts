"use server"

import { db, users, suppliers, customers, debtTransactions, companySettings, auditLog } from "@/lib/db"
import { requireAdmin } from "@/lib/auth/session"
import { debtEventEmitter } from "@/lib/events/event-emitter"

interface BackupData {
  version: string
  timestamp: string
  data: {
    users: any[]
    suppliers: any[]
    customers: any[]
    debtTransactions: any[]
    companySettings: any[]
    auditLog: any[]
  }
}

export async function createBackupAction() {
  try {
    const admin = await requireAdmin()

    // Get all data from database
    const [usersData, suppliersData, customersData, transactionsData, settingsData, auditData] = await Promise.all([
      db.select().from(users),
      db.select().from(suppliers),
      db.select().from(customers),
      db.select().from(debtTransactions),
      db.select().from(companySettings),
      db.select().from(auditLog),
    ])

    // Remove sensitive data from users
    const sanitizedUsers = usersData.map((user) => ({
      ...user,
      password: "[ENCRYPTED]", // Don't export actual passwords
    }))

    const backupData: BackupData = {
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      data: {
        users: sanitizedUsers,
        suppliers: suppliersData,
        customers: customersData,
        debtTransactions: transactionsData,
        companySettings: settingsData,
        auditLog: auditData,
      },
    }

    // Log backup creation
    await db.insert(auditLog).values({
      userId: admin.id,
      action: "create",
      tableName: "backup",
      recordId: "backup_" + Date.now(),
      newData: { action: "backup_created", timestamp: new Date().toISOString() },
    })

    return {
      success: true,
      data: JSON.stringify(backupData, null, 2),
      filename: `debt-iq-backup-${new Date().toISOString().split("T")[0]}.json`,
    }
  } catch (error) {
    console.error("Backup creation error:", error)
    return { error: "حدث خطأ أثناء إنشاء النسخة الاحتياطية" }
  }
}

export async function restoreBackupAction(backupData: string) {
  try {
    const admin = await requireAdmin()

    let parsedData: BackupData
    try {
      parsedData = JSON.parse(backupData)
    } catch (parseError) {
      return { error: "ملف النسخة الاحتياطية غير صالح" }
    }

    // Validate backup structure
    if (!parsedData.data || !parsedData.version) {
      return { error: "بنية ملف النسخة الاحتياطية غير صحيحة" }
    }

    // Begin transaction-like operations
    try {
      // Clear existing data (except current admin user)
      await db.delete(auditLog)
      await db.delete(debtTransactions)
      await db.delete(customers)
      await db.delete(suppliers)
      await db.delete(companySettings)

      // Don't delete users to preserve current admin session
      // await db.delete(users).where(ne(users.id, admin.id))

      // Restore data
      if (parsedData.data.companySettings?.length > 0) {
        await db.insert(companySettings).values(parsedData.data.companySettings)
      }

      if (parsedData.data.suppliers?.length > 0) {
        await db.insert(suppliers).values(parsedData.data.suppliers)
      }

      if (parsedData.data.customers?.length > 0) {
        await db.insert(customers).values(parsedData.data.customers)
      }

      if (parsedData.data.debtTransactions?.length > 0) {
        await db.insert(debtTransactions).values(parsedData.data.debtTransactions)
      }

      // Restore audit log (excluding password-related entries)
      if (parsedData.data.auditLog?.length > 0) {
        const filteredAuditLog = parsedData.data.auditLog.filter(
          (entry: any) => !entry.newData?.password && !entry.oldData?.password,
        )
        if (filteredAuditLog.length > 0) {
          await db.insert(auditLog).values(filteredAuditLog)
        }
      }

      // Log restore operation
      await db.insert(auditLog).values({
        userId: admin.id,
        action: "create",
        tableName: "restore",
        recordId: "restore_" + Date.now(),
        newData: {
          action: "backup_restored",
          timestamp: new Date().toISOString(),
          backupTimestamp: parsedData.timestamp,
        },
      })

      // Emit real-time event
      debtEventEmitter.emitDebtEvent({
        type: "settings_updated",
        data: { action: "backup_restored" },
        userId: admin.id,
        timestamp: new Date(),
      })

      return { success: true }
    } catch (dbError) {
      console.error("Database restore error:", dbError)
      return { error: "حدث خطأ أثناء استعادة البيانات في قاعدة البيانات" }
    }
  } catch (error) {
    console.error("Restore backup error:", error)
    return { error: "حدث خطأ أثناء استعادة النسخة الاحتياطية" }
  }
}
