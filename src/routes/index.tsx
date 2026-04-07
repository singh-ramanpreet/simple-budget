import { createFileRoute } from "@tanstack/react-router"

import { useMemo, useState } from "react"
import { useFileHandle } from "@/components/providers/file-handle-provider"
import { FileHandleManager } from "@/components/file-handle-manager"
import TransactionsCard from "@/components/dashboard/transactions-card"
import BucketsCard from "@/components/dashboard/buckets-card"
import { toRecord } from "@/components/dashboard/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const Route = createFileRoute("/")({
  component: HomePage,
})

function HomePage() {
  const { data, fileHandle, hasPermission, isLoading } = useFileHandle()

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

  if (isLoading) {
    return (
      <div className="text-muted-foreground flex min-h-[400px] animate-pulse flex-col items-center justify-center italic">
        Loading budget data...
      </div>
    )
  }

  if (!fileHandle || !hasPermission) {
    return (
      <div className="flex flex-col items-center space-y-4 pt-5">
        <Card className="border-primary/20 shadow-primary/5 from-background to-secondary/20 relative w-full max-w-md overflow-hidden bg-linear-to-br shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <span>Welcome to Simple Budget</span>
            </div>
            <CardDescription>
              Data is locally stored in a CSV file format on your device. Select an existing CSV file or create a new
              one to store your data.
              <br />
              <br />
              The access to file is usually lost on browser refresh or tabs close. Please grant access again to
              continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileHandleManager />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center space-y-4 py-4">
      {/* Transactions */}
      <TransactionsCard
        records={records}
        month={filterMonth}
        year={filterYear}
        onNavigate={navigateMonth}
      />

      {/* Buckets */}
      <BucketsCard
        records={records}
        month={filterMonth}
        year={filterYear}
        onNavigate={navigateMonth}
      />
    </div>
  )
}
