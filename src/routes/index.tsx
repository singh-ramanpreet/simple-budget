import { createFileRoute } from "@tanstack/react-router"

import { useMemo, useState } from "react"
import { useFileHandle } from "@/components/providers/file-handle-provider"
import EmptyState from "@/components/dashboard/empty-state"
import TransactionsCard from "@/components/dashboard/transactions-card"
import BucketsCard from "@/components/dashboard/buckets-card"
import { toRecord } from "@/components/dashboard/types"

export const Route = createFileRoute("/")({
  component: HomePage,
})

function HomePage() {
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
      <div className="text-muted-foreground flex min-h-[400px] animate-pulse flex-col items-center justify-center italic">
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
    </div>
  )
}
