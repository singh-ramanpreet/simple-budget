"use client"

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
import { useFileHandle } from "@/components/providers/file-handle-provider"
import { BucketView, toRecord, parseLocalDate } from "@/components/dashboard/types"

interface EditBucketDialogProps {
  bucket: BucketView
  children: React.ReactNode
}

export default function EditBucketDialog({ bucket, children }: EditBucketDialogProps) {
  const { data, setData } = useFileHandle()
  const [open, setOpen] = useState(false)
  const [limit, setLimit] = useState(String(bucket.limit || ""))

  // Load the up-to-date limit from the bucket prop into local state every time the dialog opens
  const handleOpenChange = (v: boolean) => {
    setOpen(v)
    if (v) {
      setLimit(String(bucket.limit || ""))
    }
  }

  const handleSave = async () => {
    const m = bucket.month
    const y = bucket.year
    // Limit records use the 1st of the month as their date
    const dateStr = `${y}-${String(m).padStart(2, "0")}-01`

    // Remove any existing limit record for this (category, month, year)
    const updatedData = data.filter((r) => {
      const rec = toRecord(r)
      const isLimitRecord = rec.name === "" && parseFloat(rec.category_limit) > 0
      if (!isLimitRecord) return true
      const { month: rMonth, year: rYear } = parseLocalDate(rec.date)
      return !(rec.category === bucket.category && rMonth === m && rYear === y)
    })

    const numLimit = parseFloat(limit)

    // If new limit is > 0, append the new limit record
    if (!isNaN(numLimit) && numLimit > 0) {
      const limitRecord: Record<string, unknown> = {
        date: dateStr,
        name: "",
        amount: "0",
        category: bucket.category,
        category_limit: limit.trim(),
        notes: "",
      }
      await setData([...updatedData, limitRecord])
    } else {
      // Limit deleted or 0, just save the filtered data
      await setData(updatedData)
    }

    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Budget Bucket</DialogTitle>
          <DialogDescription>
            Update the limit for {bucket.category} in{" "}
            {new Date(bucket.year, bucket.month - 1).toLocaleString("default", { month: "long" })} {bucket.year}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="edit-limit">Spending Limit *</Label>
            <Input
              id="edit-limit"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <div className="flex justify-between pt-2">
          <Button
            variant="destructive"
            onClick={async () => {
              setLimit("0")
              // Simulate a save with 0 limit to delete
              const m = bucket.month
              const y = bucket.year
              const updatedData = data.filter((r) => {
                const rec = toRecord(r)
                const isLimitRecord = rec.name === "" && parseFloat(rec.category_limit) > 0
                if (!isLimitRecord) return true
                const { month: rMonth, year: rYear } = parseLocalDate(rec.date)
                return !(rec.category === bucket.category && rMonth === m && rYear === y)
              })
              await setData(updatedData)
              setOpen(false)
            }}
          >
            Remove Limit
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!limit.trim()}>
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
