"use server"

import { eq, and, sql, asc, not } from "drizzle-orm"
import { db } from "./drizzle"
import { budget_buckets, budget_transactions } from "./schema"

// type of bucket
export type Bucket = typeof budget_buckets.$inferSelect

export type BucketInsert = typeof budget_buckets.$inferInsert

export interface BucketWithSum extends Bucket {
  transactions_sum: number | undefined
}

// Function to add a bucket
export async function addBucket(bucket: typeof budget_buckets.$inferInsert) {
  // trim whitespace from category
  bucket.category = bucket.category?.trim()
  await db.insert(budget_buckets).values(bucket).run()
}

// Function to delete a bucket
export async function deleteBucket(userId: string, id: number) {
  await db
    .delete(budget_buckets)
    .where(and(eq(budget_buckets.id, id), eq(budget_buckets.userId, userId)))
    .run()
}

// Function to update a bucket
export async function updateBucket(userId: string, id: number, bucket: typeof budget_buckets.$inferInsert) {
  // trim whitespace from category
  bucket.category = bucket.category?.trim()
  await db
    .update(budget_buckets)
    .set(bucket)
    .where(and(eq(budget_buckets.id, id), eq(budget_buckets.userId, userId)))
    .run()
}

// Function to fetch a single bucket
export async function fetchBucket(userId: string, id: number) {
  return await db
    .select()
    .from(budget_buckets)
    .where(and(eq(budget_buckets.id, id), eq(budget_buckets.userId, userId)))
    .get()
}

// Function to fetch all buckets for a user
export async function fetchBuckets(userId: string, filterMonth?: number, filterYear?: number, invertedFilter = false) {
  const conditions = [eq(budget_buckets.userId, userId)]
  if (filterMonth)
    conditions.push(invertedFilter ? not(eq(budget_buckets.month, filterMonth)) : eq(budget_buckets.month, filterMonth))
  if (filterYear)
    conditions.push(invertedFilter ? not(eq(budget_buckets.year, filterYear)) : eq(budget_buckets.year, filterYear))
  return await db
    .select()
    .from(budget_buckets)
    .where(and(...conditions))
    .orderBy(asc(budget_buckets.amount))
    .all()
}

// Function to fetch all transactions sum for each bucket
export async function fetchBucketTransactionsSum(userId: string, filterMonth?: number, filterYear?: number) {
  const conditions = [eq(budget_buckets.userId, userId)]
  if (filterMonth) conditions.push(eq(budget_buckets.month, filterMonth))
  if (filterYear) conditions.push(eq(budget_buckets.year, filterYear))
  return await db
    .select({
      id: budget_buckets.id,
      sum: sql<number>`SUM(budget_transactions.amount)`,
    })
    .from(budget_buckets)
    .leftJoin(budget_transactions, eq(budget_buckets.id, budget_transactions.category_id))
    .where(and(...conditions))
    .groupBy(budget_buckets.id)
    .all()
}
