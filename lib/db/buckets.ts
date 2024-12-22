"use server"

import { eq, and } from "drizzle-orm"
import { db } from "./drizzle"
import { budget_buckets } from "./schema"

// type of bucket
export type Bucket = typeof budget_buckets.$inferSelect

// Function to add a bucket
export async function addBucket(bucket: typeof budget_buckets.$inferInsert) {
  await db.insert(budget_buckets).values(bucket).run()
}

// Function to delete a bucket
export async function deleteBucket(id: number, userId: string) {
  await db
    .delete(budget_buckets)
    .where(and(eq(budget_buckets.id, id), eq(budget_buckets.userId, userId)))
    .run()
}

// Function to update a bucket
export async function updateBucket(id: number, userId: string, bucket: typeof budget_buckets.$inferInsert) {
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
export async function fetchBuckets(userId: string, filterMonth?: number) {
  const conditions = [eq(budget_buckets.userId, userId)]
  if (filterMonth) conditions.push(eq(budget_buckets.month, filterMonth))
  return await db
    .select()
    .from(budget_buckets)
    .where(and(...conditions))
    .all()
}
