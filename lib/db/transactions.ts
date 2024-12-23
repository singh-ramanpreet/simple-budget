"use server"

import { eq, and, sql } from "drizzle-orm"
import { db } from "./drizzle"
import { budget_transactions, budget_buckets } from "./schema"

export type Transaction = typeof budget_transactions.$inferSelect & { category: string }

// Function to add a transaction to the budget table
export async function addTransaction(transaction: typeof budget_transactions.$inferInsert) {
  await db.insert(budget_transactions).values(transaction).run()
}

// Function to delete a transaction from the budget table
export async function deleteTransaction(id: number, userId: string) {
  await db
    .delete(budget_transactions)
    .where(and(eq(budget_transactions.id, id), eq(budget_transactions.userId, userId)))
    .run()
}

// Function to update a transaction in the budget table
export async function updateTransaction(
  id: number,
  userId: string,
  transaction: typeof budget_transactions.$inferInsert
) {
  await db
    .update(budget_transactions)
    .set(transaction)
    .where(and(eq(budget_transactions.id, id), eq(budget_transactions.userId, userId)))
    .run()
}

// Function to fetch a transaction from the budget table
export async function fetchTransaction(userId: string, id: number) {
  return await db
    .select()
    .from(budget_transactions)
    .leftJoin(budget_buckets, eq(budget_transactions.category_id, budget_buckets.id))
    .where(and(eq(budget_transactions.id, id), eq(budget_transactions.userId, userId)))
    .get()
}

// Function to fetch all transactions from the budget table
export async function fetchTransactions(
  userId: string,
  filterMonth?: number,
  filterYear?: number,
  filterCategoryId?: number
) {
  const conditions = [eq(budget_transactions.userId, userId)]

  if (filterMonth)
    conditions.push(eq(sql`strftime('%m', ${budget_transactions.date})`, filterMonth.toString().padStart(2, "0")))
  if (filterYear) conditions.push(eq(sql`strftime('%Y', ${budget_transactions.date})`, filterYear.toString()))
  if (filterCategoryId) conditions.push(eq(budget_transactions.category_id, filterCategoryId))

  return await db
    .select()
    .from(budget_transactions)
    .leftJoin(budget_buckets, eq(budget_transactions.category_id, budget_buckets.id))
    .where(and(...conditions))
    .all()
}

// Function to fetch names list of all transactions
// create unqiue list of transaction names
export async function fetchTransactionNames(userId: string) {
  const result = await db
    .select({ name: budget_transactions.name })
    .from(budget_transactions)
    .where(eq(budget_transactions.userId, userId))
    .all()
  const uniqueNames = new Set(result.map((t) => t.name))
  return Array.from(uniqueNames)
}

// Function to fetch notes list of all transactions
export async function fetchTransactionNotes(userId: string) {
  const result = await db
    .select({ notes: budget_transactions.notes })
    .from(budget_transactions)
    .where(eq(budget_transactions.userId, userId))
    .all()
  const uniqueNotes = new Set(result.map((t) => t.notes))
  return Array.from(uniqueNotes)
}
