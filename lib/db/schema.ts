import { pgTable, text, timestamp, decimal, boolean, jsonb } from "drizzle-orm/pg-core"
import { createId } from "@paralleldrive/cuid2"

// Users/Employees table
export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  password: text("password").notNull(), // Will be hashed
  role: text("role").notNull().default("employee"), // 'admin' or 'employee'
  phone: text("phone"),
  address: text("address"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// Suppliers table
export const suppliers = pgTable("suppliers", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  phone: text("phone"),
  address: text("address"),
  email: text("email"),
  totalDebt: decimal("total_debt", { precision: 12, scale: 2 }).notNull().default("0"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  createdBy: text("created_by").references(() => users.id),
})

// Customers table
export const customers = pgTable("customers", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  phone: text("phone"),
  address: text("address"),
  email: text("email"),
  totalDebt: decimal("total_debt", { precision: 12, scale: 2 }).notNull().default("0"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  createdBy: text("created_by").references(() => users.id),
})

// Debt transactions table (for both suppliers and customers)
export const debtTransactions = pgTable("debt_transactions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  type: text("type").notNull(), // 'supplier' or 'customer'
  entityId: text("entity_id").notNull(), // supplier or customer ID
  transactionType: text("transaction_type").notNull(), // 'debt' or 'payment'
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  createdBy: text("created_by").references(() => users.id),
})

// Company settings table
export const companySettings = pgTable("company_settings", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull().default("شركة إدارة الديون"),
  description: text("description"),
  logo: text("logo"), // Base64 or URL
  currency: text("currency").notNull().default("IQD"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// Audit log table for tracking changes
export const auditLog = pgTable("audit_log", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id").references(() => users.id),
  action: text("action").notNull(), // 'create', 'update', 'delete'
  tableName: text("table_name").notNull(),
  recordId: text("record_id").notNull(),
  oldData: jsonb("old_data"),
  newData: jsonb("new_data"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

// Sessions table for authentication
export const sessions = pgTable("sessions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})
