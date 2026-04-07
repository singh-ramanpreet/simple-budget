"use client"

/**
 * BucketsCard
 *
 * Displays category budget progress bars for a given month.
 * Aggregates spending per category from the flat CSV records and
 * shows a total summary row + individual bucket rows with progress bars.
 */

import { useMemo } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Folder02Icon, Refresh01Icon } from "@hugeicons/core-free-icons"
import MonthNavigator from "./month-navigator"
import { parseLocalDate, pct } from "./types"
import EditBucketDialog from "./edit-bucket-dialog"
import AddBucketDialog from "./add-bucket-dialog"
import CopyBuckets from "./copy-buckets"
import type { BucketView, CsvRecord } from "./types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface BucketsCardProps {
  records: Array<CsvRecord>
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={Folder02Icon} />
            <span>Buckets</span>
          </div>
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={Refresh01Icon} onClick={onRefresh} className="cursor-pointer active:animate-spin" />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="size-1" />
          <MonthNavigator month={month} year={year} onNavigate={onNavigate} />

          <ul className="flex flex-col space-y-1">
            {/* ── Total row ────────────────────────────────────────────────── */}
            <li className="flex items-center rounded-lg py-2 pr-4 pl-2">
              <div className="flex w-full shrink-0 items-center gap-2">
                <div className="w-[20%] shrink-0 text-left">
                  <h3 className="text-primary truncate font-medium">Total</h3>
                </div>
                <div className="w-[59.5%] shrink-0">
                  <Progress value={pct(totalSpent, totalLimit) / 100} max={1} className="h-2" />
                  <div className="text-muted-foreground mt-1 flex justify-between tabular-nums">
                    <span>{pct(totalSpent, totalLimit).toFixed(0)}%</span>
                    <span>${totalLimit.toFixed(0)}</span>
                  </div>
                </div>
                <div className="w-[19%] shrink-0 text-right">
                  <span className="text-muted-foreground font-medium">${Math.abs(totalSpent).toFixed(2)}</span>
                </div>
              </div>
            </li>

            {/* ── Individual category buckets ───────────────────────────────── */}
            {monthBuckets.map((bucket) => (
              <EditBucketDialog key={bucket.category} bucket={bucket}>
                <li className="hover:bg-muted/50 cursor-pointer rounded-lg py-2 pr-4 pl-2 transition-colors">
                  <div className="flex w-full shrink-0 items-center gap-2">
                    <div className="w-[20%] shrink-0 text-left">
                      <h3 className="text-primary truncate font-medium">{bucket.category}</h3>
                    </div>
                    <div className="w-[59.5%] shrink-0">
                      <Progress value={pct(bucket.spent, bucket.limit) / 100} max={1} className="h-2" />
                      <div className="text-muted-foreground mt-1 flex justify-between tabular-nums">
                        <span>{pct(bucket.spent, bucket.limit).toFixed(0)}%</span>
                        <span>${bucket.limit.toFixed(0)}</span>
                      </div>
                    </div>
                    <div className="w-[19%] shrink-0 text-right">
                      <span
                        className={cn("text-muted-foreground font-medium", {
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
              <li className="text-muted-foreground py-8 text-center text-sm italic">No buckets this month.</li>
            )}
          </ul>
        </div>
        <div className="size-4" />
        <div className="flex w-full flex-col items-center gap-4">
          <CopyBuckets month={month} year={year} />
          <AddBucketDialog initialMonth={month} initialYear={year} />
        </div>
      </CardContent>
    </Card>
  )
}
