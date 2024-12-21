"use server"

import { eq, and, sql } from "drizzle-orm"
import { db } from "./drizzle"
import { budget_transactions } from "./schema"

// type of transaction
export type Transaction = typeof budget_transactions.$inferSelect

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
    .where(and(eq(budget_transactions.id, id), eq(budget_transactions.userId, userId)))
    .get()
}

// Function to fetch all transactions from the budget table
export async function fetchTransactions(userId: string, filterMonth?: number, filterCategory?: string) {
  const conditions = [eq(budget_transactions.userId, userId)]

  if (filterMonth)
    conditions.push(eq(sql`strftime('%m', ${budget_transactions.date})`, filterMonth.toString().padStart(2, "0")))
  if (filterCategory) conditions.push(eq(budget_transactions.category, filterCategory))
  return await db
    .select()
    .from(budget_transactions)
    .where(and(...conditions))
    .all()
}
