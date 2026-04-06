"use client"

/**
 * TransactionsCard
 *
 * Displays the transactions list for a given month, grouped by day.
 * Includes the category filter dialog and a refresh button.
 */

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ListOrdered, RotateCw, Filter, FilterX } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import MonthNavigator from "./month-navigator"
import TransactionItem from "./transaction-item"
import { CsvRecord, parseLocalDate } from "./types"

interface TransactionsCardProps {
  records: CsvRecord[]
  month: number
  year: number
  onNavigate: (delta: number) => void
  onRefresh: () => void
}

export default function TransactionsCard({ records, month, year, onNavigate, onRefresh }: TransactionsCardProps) {
  const [filterCategory, setFilterCategory] = useState<string | undefined>(undefined)
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<string | undefined>(undefined)

  /** Unique categories across all records */
  const allCategories = useMemo(() => {
    return [...new Set(records.map((r) => r.category).filter(Boolean))].sort()
  }, [records])

  /** Transactions for the active month (excluding limit records) */
  const monthTransactions = useMemo(() => {
    return records.filter((r) => {
      // Skip limit records (they belong to buckets, not transactions)
      if (r.name === "" && parseFloat(r.category_limit) > 0) return false

      const { month: rMonth, year: rYear } = parseLocalDate(r.date)
      const matchMonth = rMonth === month && rYear === year
      const matchCategory = filterCategory ? r.category === filterCategory : true
      return matchMonth && matchCategory
    })
  }, [records, month, year, filterCategory])

  /** Group transactions by day (same visual as original) */
  const groupedByDay = useMemo(() => {
    const groups: Record<string, CsvRecord[]> = {}
    monthTransactions.forEach((t) => {
      const d = new Date(t.date)
      const label = d.toLocaleDateString("default", { day: "numeric", month: "long", year: "numeric" })
      if (!groups[label]) groups[label] = []
      groups[label].push(t)
    })
    return groups
  }, [monthTransactions])

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ListOrdered className="h-5 w-5 text-muted-foreground" />
            <span>Transactions</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Category filter dialog */}
            <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
              <DialogTrigger asChild>
                <Button variant={filterCategory ? "secondary" : "outline"}>
                  {filterCategory ? <FilterX className="h-5 w-5" /> : <Filter className="h-5 w-5" />}
                </Button>
              </DialogTrigger>
              <DialogContent onPointerDownOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                  <DialogTitle className="text-center">Category Filter</DialogTitle>
                  <DialogDescription></DialogDescription>
                </DialogHeader>
                <Select onValueChange={setSelectedFilter} value={selectedFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {allCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex justify-end space-x-4">
                  <Button
                    variant="default"
                    onClick={() => {
                      setFilterCategory(selectedFilter)
                      setFilterDialogOpen(false)
                    }}
                  >
                    Save
                  </Button>
                  <Button variant="secondary" onClick={() => setFilterDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFilterCategory(undefined)
                      setSelectedFilter(undefined)
                      setFilterDialogOpen(false)
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Refresh from file */}
            <Button variant="outline" className="ml-2" onClick={onRefresh}>
              <RotateCw className="h-5 w-5" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <MonthNavigator month={month} year={year} onNavigate={onNavigate} />

          {/* Grouped transactions list */}
          <div className="space-y-2">
            {Object.keys(groupedByDay).length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground italic">No transactions this month.</p>
            )}
            {Object.entries(groupedByDay).map(([day, txns]) => (
              <div key={day} className="space-y-2">
                <h3 className="text-sm text-muted-foreground">
                  {new Date(day).toLocaleDateString("default", { weekday: "long" })}
                </h3>
                <ul className="space-y-1">
                  {txns.map((t, idx) => (
                    <TransactionItem key={idx} record={t} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
