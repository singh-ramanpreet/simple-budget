"use client"

/**
 * Home Page (Client-Only SPA)
 *
 * The main dashboard. Reads entirely from the local CSV file via
 * FileHandleProvider. No server actions, no database calls.
 *
 * Components:
 * - EmptyState: shown when no file is connected
 * - TransactionsCard: transactions list with filter & month nav
 * - BucketsCard: category budget progress bars
 */

import { useState, useMemo } from "react"
import { useFileHandle } from "@/components/providers/file-handle-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Settings } from "lucide-react"
import Link from "next/link"
import EmptyState from "@/components/dashboard/empty-state"
import TransactionsCard from "@/components/dashboard/transactions-card"
import BucketsCard from "@/components/dashboard/buckets-card"
import AddTransactionDialog from "@/components/dashboard/add-transaction-dialog"
import AddBucketDialog from "@/components/dashboard/add-bucket-dialog"
import { toRecord } from "@/components/dashboard/types"

export default function HomePage() {
  const { data, fileHandle, isLoading, syncWithFile } = useFileHandle()

  const now = new Date()
  const [filterMonth, setFilterMonth] = useState(now.getMonth() + 1)
  const [filterYear, setFilterYear] = useState(now.getFullYear())

  /** Convert raw provider data into typed records */
  const records = useMemo(() => data.map(toRecord), [data])

  /** Navigate month (shared between both cards) */
  const navigateMonth = (delta: number) => {
    const d = new Date(filterYear, filterMonth - 1 + delta, 15)
    setFilterMonth(d.getMonth() + 1)
    setFilterYear(d.getFullYear())
  }

  // ── Render guards ─────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] animate-pulse text-muted-foreground italic">
        Loading budget data...
      </div>
    )
  }

  if (!fileHandle) {
    return <EmptyState />
  }

  // ── Main dashboard ────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col items-center space-y-4 py-4">
      {/* Quick Actions */}
      <Card className="w-full max-w-md">
        <CardContent className="flex items-center justify-center gap-4 p-4">
          <AddTransactionDialog />
          <AddBucketDialog />
        </CardContent>
      </Card>

      {/* Transactions */}
      <TransactionsCard
        records={records}
        month={filterMonth}
        year={filterYear}
        onNavigate={navigateMonth}
        onRefresh={() => syncWithFile()}
      />

      {/* Buckets */}
      <BucketsCard
        records={records}
        month={filterMonth}
        year={filterYear}
        onNavigate={navigateMonth}
        onRefresh={() => syncWithFile()}
      />

      {/* Bottom actions */}
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center space-y-4 p-4">
          <div className="flex gap-8">
            <Button asChild>
              <Link href="/settings">
                <Settings className="h-5 w-5 opacity-50" />
                Settings
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
