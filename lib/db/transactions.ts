"use server"

import { eq, and, sql, desc } from "drizzle-orm"
import { db } from "./drizzle"
import { budget_transactions, budget_buckets } from "./schema"

export type Transaction = typeof budget_transactions.$inferSelect & { category: string | null }

const transaction_columns = {
  id: budget_transactions.id,
  userId: budget_transactions.userId,
  date: budget_transactions.date,
  name: budget_transactions.name,
  amount: budget_transactions.amount,
  category_id: budget_transactions.category_id,
  notes: budget_transactions.notes,
}

// check if category id has same month and year of the transaction being added/updated
export async function checkMatchingMonthYear(userId: string, categoryId: number, date: Date) {
  const result = await db
    .select({ id: budget_buckets.id })
    .from(budget_buckets)
    .where(
      and(
        eq(budget_buckets.userId, userId),
        eq(budget_buckets.id, categoryId),
        eq(budget_buckets.month, date.getMonth() + 1),
        eq(budget_buckets.year, date.getFullYear())
      )
    )
    .get()
  return result !== undefined
}

// Function to add a transaction to the budget table
export async function addTransaction(transaction: typeof budget_transactions.$inferInsert) {
  // trim whitespace from name and notes
  transaction.name = transaction.name?.trim()
  transaction.notes = transaction.notes?.trim()
  await db.insert(budget_transactions).values(transaction).run()
}

// Function to delete a transaction from the budget table
export async function deleteTransaction(userId: string, id: number) {
  await db
    .delete(budget_transactions)
    .where(and(eq(budget_transactions.id, id), eq(budget_transactions.userId, userId)))
    .run()
}

// Function to update a transaction in the budget table
export async function updateTransaction(
  userId: string,
  id: number,
  transaction: typeof budget_transactions.$inferInsert
) {
  // trim whitespace from name and notes
  transaction.name = transaction.name?.trim()
  transaction.notes = transaction.notes?.trim()
  await db
    .update(budget_transactions)
    .set(transaction)
    .where(and(eq(budget_transactions.id, id), eq(budget_transactions.userId, userId)))
    .run()
}

// Function to fetch a transaction from the budget table
export async function fetchTransaction(userId: string, id: number) {
  return await db
    .select({
      ...transaction_columns,
      category: budget_buckets.category,
    })
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
  filterCategoryId?: number,
  limitForPagination?: number,
  offsetForPagination?: number
) {
  const conditions = [eq(budget_transactions.userId, userId)]

  if (filterMonth)
    conditions.push(eq(sql`strftime('%m', ${budget_transactions.date})`, filterMonth.toString().padStart(2, "0")))
  if (filterYear) conditions.push(eq(sql`strftime('%Y', ${budget_transactions.date})`, filterYear.toString()))
  if (filterCategoryId) conditions.push(eq(budget_transactions.category_id, filterCategoryId))

  return await db
    .select({
      ...transaction_columns,
      category: budget_buckets.category,
      total_count: sql<number>`count(*) over()`,
    })
    .from(budget_transactions)
    .leftJoin(budget_buckets, eq(budget_transactions.category_id, budget_buckets.id))
    .where(and(...conditions))
    .orderBy(desc(budget_transactions.date))
    .limit(limitForPagination ?? -1)
    .offset(offsetForPagination ?? 0)
    .all()
}

// Function to fetch names list of all transactions
// create unqiue list of transaction names
export async function fetchTransactionNames(userId: string) {
  const result = await db
    .selectDistinct({ name: budget_transactions.name })
    .from(budget_transactions)
    .where(eq(budget_transactions.userId, userId))
    .all()
  return result.map((t) => t.name)
}

// Function to fetch notes list of all transactions
export async function fetchTransactionNotes(userId: string) {
  const result = await db
    .selectDistinct({ notes: budget_transactions.notes })
    .from(budget_transactions)
    .where(eq(budget_transactions.userId, userId))
    .all()
  return result.map((t) => t.notes)
}
