"use client"

import { useCallback, useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { authClient } from "@/lib/auth/client"
import { Bucket, fetchBuckets, fetchBucketTransactionsSum } from "@/lib/db/buckets"
import BucketItem from "./bucket"
import { Progress } from "@/components/ui/progress"

interface ListBucketsProps {
  refresh: boolean
  month?: number
  year?: number
  OnEditBucket: (() => void)[]
}

export interface BucketWithSum extends Bucket {
  transactions_sum: number | undefined
}

export function percentage(spent: number | undefined, total: number) {
  return ((spent ?? 0) / total) * 100
}

function buckets_total_amount(buckets: BucketWithSum[]) {
  return buckets.reduce((acc, b) => acc + b.amount, 0)
}

function buckets_total_transactions_sum(buckets: BucketWithSum[]) {
  return buckets.reduce((acc, b) => acc + (b.transactions_sum ?? 0), 0)
}

export default function ListBuckets({ refresh, month, year, OnEditBucket }: ListBucketsProps) {
  const [buckets, setBuckets] = useState<BucketWithSum[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [filterMonth, setFilterMonth] = useState<number | undefined>(month)
  const [filterYear, setFilterYear] = useState<number | undefined>(year)

  const refreshBuckets = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data: session } = await authClient.getSession()
      const userId = session?.user?.id || ""
      if (!userId) {
        return
      }
      const result = await fetchBuckets(userId, filterMonth, filterYear)
      const result2 = await fetchBucketTransactionsSum(userId, filterMonth, filterYear)
      setBuckets(
        result.map((bucket) => {
          const data = result2.find((b) => b.id === bucket.id)
          return {
            ...bucket,
            transactions_sum: data?.sum,
          }
        })
      )
    } finally {
      setIsLoading(false)
    }
  }, [filterMonth, filterYear])

  useEffect(() => {
    refreshBuckets()
  }, [refresh, refreshBuckets])

  const navigateMonth = (delta: number) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() + delta)
      setFilterMonth(newDate.getMonth() + 1)
      setFilterYear(newDate.getFullYear())
      return newDate
    })
  }

  if (!filterMonth || !filterYear) {
    navigateMonth(0) // Set the filter to the current month
    currentDate.setDate(15) // Set the date to the middle of the month
  }

  if (isLoading) {
    return <div>Loading buckets...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => navigateMonth(-1)} className="rounded-full p-2 hover:bg-muted">
          <ChevronLeft className="h-5 w-5 text-muted-foreground" />
        </button>

        <h2 className="text-lg font-medium">
          {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
        </h2>

        <button onClick={() => navigateMonth(1)} className="rounded-full p-2 hover:bg-muted">
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      <ul>
        <li className="group flex items-center justify-between rounded-lg px-4 py-3">
          <div className="flex h-12 w-full items-center justify-between gap-2">
            <div className="h-full w-20 align-top">
              <h3 className="truncate text-primary">Total</h3>
            </div>
            <div className="h-full flex-1">
              <Progress
                value={percentage(buckets_total_transactions_sum(buckets), buckets_total_amount(buckets))}
                max={1}
                className="h-4"
              />
              <div className="mt-1 flex justify-between text-sm text-muted-foreground">
                <span>
                  {percentage(buckets_total_transactions_sum(buckets), buckets_total_amount(buckets)).toFixed(1)}%
                </span>
                <span>${buckets_total_amount(buckets).toFixed(1)}</span>
              </div>
            </div>
            <div className="h-full w-20 text-right align-top">
              <span className="text-muted-foreground">
                ${Math.abs(buckets_total_transactions_sum(buckets)).toFixed(2)}
              </span>
            </div>
          </div>
        </li>
        {buckets.map((bucket) => (
          <BucketItem key={bucket.id} bucket={bucket} OnEditBucket={OnEditBucket} />
        ))}
      </ul>
    </div>
  )
}
