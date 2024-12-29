import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Bucket, BucketWithSum } from "./db/buckets"

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
