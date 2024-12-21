import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core"

// table to budget transactions
export const budget_transactions = sqliteTable("budget_transactions", {
  id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  date: text("date").notNull(),
  name: text("name").default("").notNull(),
  amount: real("amount").default(0).notNull(),
  category: text("category").default("").notNull(),
  notes: text("notes").default("").notNull(),
})

// table for budget buckets
export const budget_buckets = sqliteTable("budget_buckets", {
  id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  month: integer("month").notNull(),
  category: text("category").default("").notNull(),
})

// better-auth generated schema
// ----- start of schema -----

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "boolean" }).notNull(),
  image: text("image"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
})

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
})

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: integer("accessTokenExpiresAt", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refreshTokenExpiresAt", { mode: "timestamp" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
})

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }),
  updatedAt: integer("updatedAt", { mode: "timestamp" }),
})

// better-auth generated schema
// ----- end of schema -----
