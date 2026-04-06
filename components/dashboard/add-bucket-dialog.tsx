"use client"

/**
 * AddBucketDialog
 *
 * A dialog for creating/updating a category budget limit for a specific month.
 * Writes a special "limit" record to the CSV:
 *   date: YYYY-MM-01, name: "", amount: "0", category: NAME, category_limit: LIMIT, notes: ""
 *
 * If a limit record for (category, month) already exists, it is replaced.
 */

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { PlusCircle } from "lucide-react"
import { useFileHandle } from "@/components/providers/file-handle-provider"
import { toRecord, parseLocalDate } from "@/components/dashboard/types"

/** Available months for the picker */
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

export default function AddBucketDialog() {
  const { data, setData } = useFileHandle()
  const [open, setOpen] = useState(false)

  const now = new Date()
  const [month, setMonth] = useState(String(now.getMonth() + 1))
  const [year, setYear] = useState(String(now.getFullYear()))
  const [category, setCategory] = useState("")
  const [limit, setLimit] = useState("")

  const resetForm = () => {
    const n = new Date()
    setMonth(String(n.getMonth() + 1))
    setYear(String(n.getFullYear()))
    setCategory("")
    setLimit("")
  }

  /** Submit: upsert a category limit record for the chosen month */
  const handleSave = async () => {
    if (!category.trim() || !limit.trim()) return

    const m = parseInt(month)
    const y = parseInt(year)
    // Limit records use the 1st of the month as their date
    const dateStr = `${y}-${String(m).padStart(2, "0")}-01`

    // Build the new limit record
    const limitRecord: Record<string, unknown> = {
      date: dateStr,
      name: "",
      amount: "0",
      category: category.trim(),
      category_limit: limit.trim(),
      notes: "",
    }

    // Remove any existing limit record for this (category, month, year)
    const updatedData = data.filter((r) => {
      const rec = toRecord(r)
      // Keep the record unless it's a limit record for the same category & month
      const isLimitRecord = rec.name === "" && parseFloat(rec.category_limit) > 0
      if (!isLimitRecord) return true
      const { month: rMonth, year: rYear } = parseLocalDate(rec.date)
      return !(rec.category === category.trim() && rMonth === m && rYear === y)
    })

    await setData([...updatedData, limitRecord])
    resetForm()
    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) resetForm()
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="h-5 w-5 opacity-50" />
          New Budget
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Budget Category</DialogTitle>
          <DialogDescription>Create a new budget category and set its spending limit for this month.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Month / Year */}
          <div className="flex gap-3">
            <div className="flex-1 space-y-2">
              <Label>Month</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((name, i) => (
                    <SelectItem key={i} value={String(i + 1)}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-24 space-y-2">
              <Label htmlFor="bucket-year">Year</Label>
              <Input
                id="bucket-year"
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="bucket-category">Category Name *</Label>
            <Input
              id="bucket-category"
              placeholder="e.g. Food"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          {/* Limit */}
          <div className="space-y-2">
            <Label htmlFor="bucket-limit">Spending Limit *</Label>
            <Input
              id="bucket-limit"
              type="number"
              step="0.01"
              placeholder="500.00"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!category.trim() || !limit.trim()}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
