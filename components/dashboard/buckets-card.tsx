"use client"

/**
 * BucketsCard
 *
 * Displays category budget progress bars for a given month.
 * Aggregates spending per category from the flat CSV records and
 * shows a total summary row + individual bucket rows with progress bars.
 */

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { PaintBucket, RotateCw } from "lucide-react"
import MonthNavigator from "./month-navigator"
import { CsvRecord, BucketView, pct, parseLocalDate } from "./types"
import EditBucketDialog from "./edit-bucket-dialog"

interface BucketsCardProps {
  records: CsvRecord[]
  month: number
  year: number
  onNavigate: (delta: number) => void
  onRefresh: () => void
}

export default function BucketsCard({ records, month, year, onNavigate, onRefresh }: BucketsCardProps) {
  /**
   * Buckets for the active month.
   * Limits come from special "limit records" (name === "", category_limit > 0).
   * Spending is summed from real transactions (name !== "").
   */
  const monthBuckets = useMemo(() => {
    const map = new Map<string, BucketView>()

    records.forEach((r) => {
      const { month: rMonth, year: rYear } = parseLocalDate(r.date)
      if (rMonth !== month || rYear !== year) return
      if (!r.category) return

      const isLimitRecord = r.name === "" && parseFloat(r.category_limit) > 0

      const existing = map.get(r.category)

      if (isLimitRecord) {
        // This is a bucket definition row
        const limit = parseFloat(r.category_limit) || 0
        if (existing) {
          existing.limit = limit
        } else {
          map.set(r.category, { category: r.category, limit, spent: 0, month, year })
        }
      } else {
        // This is a real transaction
        const amount = Math.abs(parseFloat(r.amount) || 0)
        if (existing) {
          existing.spent += amount
        } else {
          map.set(r.category, { category: r.category, limit: 0, spent: amount, month, year })
        }
      }
    })

    return [...map.values()]
  }, [records, month, year])

  const totalLimit = monthBuckets.reduce((s, b) => s + b.limit, 0)
  const totalSpent = monthBuckets.reduce((s, b) => s + b.spent, 0)

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <PaintBucket className="h-5 w-5 text-muted-foreground" />
            <span>Buckets</span>
          </div>
          <Button variant="outline" className="ml-2" onClick={onRefresh}>
            <RotateCw className="h-5 w-5" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <MonthNavigator month={month} year={year} onNavigate={onNavigate} />

          <ul>
            {/* ── Total row ────────────────────────────────────────────────── */}
            <li className="group flex items-center justify-between rounded-lg px-4 py-3">
              <div className="flex h-12 w-full items-center justify-between gap-2">
                <div className="h-full w-20 align-top">
                  <h3 className="truncate text-primary">Total</h3>
                </div>
                <div className="h-full flex-1">
                  <Progress value={pct(totalSpent, totalLimit)} max={1} className="h-4" />
                  <div className="mt-1 flex justify-between text-sm text-muted-foreground">
                    <span>{pct(totalSpent, totalLimit).toFixed(1)}%</span>
                    <span>${totalLimit.toFixed(1)}</span>
                  </div>
                </div>
                <div className="h-full w-20 text-right align-top">
                  <span className="text-muted-foreground">${Math.abs(totalSpent).toFixed(2)}</span>
                </div>
              </div>
            </li>

            {/* ── Individual category buckets ───────────────────────────────── */}
            {monthBuckets.map((bucket) => (
              <EditBucketDialog key={bucket.category} bucket={bucket}>
                <li
                  className="group flex cursor-pointer items-center justify-between rounded-lg px-4 py-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex h-12 w-full items-center justify-between gap-2">
                    <div className="h-full w-20 align-top">
                      <h3 className="truncate text-primary">{bucket.category}</h3>
                    </div>
                    <div className="h-full flex-1">
                      <Progress value={pct(bucket.spent, bucket.limit)} max={1} className="h-4" />
                      <div className="mt-1 flex justify-between text-sm text-muted-foreground">
                        <span>{pct(bucket.spent, bucket.limit).toFixed(1)}%</span>
                        <span>${bucket.limit.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="h-full w-20 text-right align-top">
                      <span
                        className={cn("text-muted-foreground", {
                          "text-red-500": bucket.spent > bucket.limit,
                        })}
                      >
                        ${Math.abs(bucket.spent).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </li>
              </EditBucketDialog>
            ))}

            {monthBuckets.length === 0 && (
              <li className="py-8 text-center text-sm text-muted-foreground italic">No buckets this month.</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
