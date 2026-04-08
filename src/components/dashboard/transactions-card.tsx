/**
 * TransactionsCard
 *
 * Displays the transactions list for a given month, grouped by day.
 * Includes the category filter dialog and a refresh button.
 */

import { useEffect, useMemo, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { FilterIcon, FilterRemoveIcon, ReceiptTextIcon } from "@hugeicons/core-free-icons"
import MonthNavigator from "./month-navigator"
import TransactionItem from "./transaction-item"
import { parseLocalDate } from "./types"
import AddTransactionDialog from "./add-transaction-dialog"
import EditTransactionDialog from "./edit-transaction-dialog"
import type { CsvRecord } from "./types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TransactionsCardProps {
  records: Array<CsvRecord>
  month: number
  year: number
  onNavigate: (delta: number) => void
  onJump: (month: number, year: number) => void
}

export default function TransactionsCard({ records, month, year, onNavigate, onJump }: TransactionsCardProps) {
  const [filterCategory, setFilterCategory] = useState<string | undefined>(undefined)
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<string | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Reset pagination when month, year, or filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [month, year, filterCategory])

  /** Unique categories for the active month/year */
  const allCategories = useMemo(() => {
    return [
      ...new Set(
        records
          .filter((r) => {
            const { month: rMonth, year: rYear } = parseLocalDate(r.date)
            return rMonth === month && rYear === year
          })
          .map((r) => r.category)
          .filter(Boolean)
      ),
    ].sort()
  }, [records, month, year])

  /** Transactions for the active month (excluding limit records) */
  const monthTransactions = useMemo(() => {
    return records
      .filter((r) => {
        const { month: rMonth, year: rYear } = parseLocalDate(r.date)
        const isNormalTransaction = r.name !== "" || parseFloat(r.category_limit) === 0
        return rMonth === month && rYear === year && isNormalTransaction
      })
      .filter((r: CsvRecord) => (filterCategory ? r.category === filterCategory : true))
      .slice()
      .reverse()
      .sort((a: CsvRecord, b: CsvRecord) => b.date.localeCompare(a.date))
  }, [records, month, year, filterCategory])

  const totalPages = Math.ceil(monthTransactions.length / pageSize)
  const paginatedTransactions = monthTransactions.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Array<CsvRecord> | undefined> = {}
    paginatedTransactions.forEach((r: CsvRecord) => {
      if (groups[r.date] === undefined) {
        groups[r.date] = []
      }
      groups[r.date]!.push(r)
    })
    return Object.entries(groups).sort((a: [string, any], b: [string, any]) => b[0].localeCompare(a[0])) as Array<
      [string, Array<CsvRecord>]
    >
  }, [paginatedTransactions])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={ReceiptTextIcon} />
            <span>Transactions</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Category Filter */}
            <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
              <DialogTrigger>
                <HugeiconsIcon
                  icon={filterCategory ? FilterRemoveIcon : FilterIcon}
                  className="cursor-pointer active:animate-bounce"
                />
              </DialogTrigger>
              <DialogContent showCloseButton={false}>
                <DialogHeader>
                  <DialogTitle className="text-center">Category Filter</DialogTitle>
                  <DialogDescription></DialogDescription>
                </DialogHeader>

                <Select
                  items={allCategories.map((cat) => ({ label: cat, value: cat }))}
                  onValueChange={(value) => setSelectedFilter(value!)}
                  value={selectedFilter}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {allCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setSelectedFilter(undefined)
                      setFilterCategory(undefined)
                      setFilterDialogOpen(false)
                    }}
                  >
                    Clear
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => {
                      if (selectedFilter) {
                        setFilterCategory(selectedFilter)
                        setFilterDialogOpen(false)
                      }
                    }}
                  >
                    Apply
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="size-1" />
          <MonthNavigator month={month} year={year} onNavigate={onNavigate} onJump={onJump} />

          {/* Grouped transactions list */}
          <div className="flex flex-col space-y-6">
            {groupedTransactions.length === 0 && (
              <p className="text-muted-foreground py-8 text-center text-sm italic">No transactions this month.</p>
            )}
            {groupedTransactions.map(([date, items]) => (
              <div key={date}>
                <h3 className="mb-2 text-xs font-semibold tracking-wider uppercase">
                  {(() => {
                    const { year: y, month: m, day: d } = parseLocalDate(date)
                    return new Date(y, m - 1, d).toLocaleDateString("default", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })
                  })()}
                </h3>
                <div className="flex flex-col space-y-1">
                  {items.map((item, idx) => (
                    <EditTransactionDialog key={`${item.date}-${item.name}-${idx}`} record={item}>
                      <TransactionItem record={item} />
                    </EditTransactionDialog>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Prev
              </Button>

              <div className="flex items-center gap-1">
                {(() => {
                  const pages: Array<number | string> = []
                  const range = 1 // Number of siblings to show on each side of current page

                  for (let i = 1; i <= totalPages; i++) {
                    if (
                      i === 1 || // Always show first
                      i === totalPages || // Always show last
                      (i >= currentPage - range && i <= currentPage + range) // Show current and siblings
                    ) {
                      pages.push(i)
                    } else if (pages[pages.length - 1] !== "...") {
                      pages.push("...")
                    }
                  }

                  return pages.map((page, idx) => {
                    if (page === "...") {
                      return (
                        <span key={`ellipsis-${idx}`} className="px-2">
                          ...
                        </span>
                      )
                    }
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "ghost"}
                        className={cn("h-8 w-8 p-0", {
                          "pointer-events-none": currentPage === page,
                        })}
                        onClick={() => setCurrentPage(page as number)}
                      >
                        {page}
                      </Button>
                    )
                  })
                })()}
              </div>

              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
        <div className="size-4" />
        <AddTransactionDialog />
      </CardContent>
    </Card>
  )
}
