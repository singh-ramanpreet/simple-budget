import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Bucket, BucketWithSum } from "./db/buckets"
import { fetchTransactions } from "./db/transactions"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function percentage(value: number | undefined, total: number) {
  return ((value ?? 0) / total) * 100
}

export function buckets_total_amount(buckets: BucketWithSum[] | Bucket[]) {
  return buckets.reduce((acc, b) => acc + b.amount, 0)
}

export function buckets_total_transactions_sum(buckets: BucketWithSum[]) {
  return buckets.reduce((acc, b) => acc + (b.transactions_sum ?? 0), 0)
}

export function stringToColor(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const color = Math.floor(Math.abs(Math.sin(hash) * 16777215))
  return `#${color.toString(16).padStart(6, "0")}`
}

// new date with same timezone as the last transaction
export async function getNewDate(loggedUserId: string) {
  const recentTransaction = await fetchTransactions(loggedUserId!, undefined, undefined, undefined, 1, 0)
  const hours = recentTransaction.length ? new Date(recentTransaction[0].date).getHours() : 0
  const minutes = recentTransaction.length ? new Date(recentTransaction[0].date).getMinutes() : 0
  return new Date(new Date().setHours(hours, minutes, 0, 0))
}
