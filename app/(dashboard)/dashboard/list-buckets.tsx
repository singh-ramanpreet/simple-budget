"use client"

import { useCallback, useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { authClient } from "@/lib/auth/client"
import { Bucket, fetchBuckets } from "@/lib/db/buckets"
import BucketItem from "./bucket"

interface ListBucketsProps {
  refresh: boolean
  month?: number
  year?: number
  OnEditBucket: (() => void)[]
}

export default function ListBuckets({ refresh, month, year, OnEditBucket }: ListBucketsProps) {
  const [buckets, setBuckets] = useState<Bucket[]>([])
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
      setBuckets(result)
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
        {buckets.map((bucket) => (
          <BucketItem key={bucket.id} bucket={bucket} OnEditBucket={OnEditBucket} />
        ))}
      </ul>
    </div>
  )
}
