import { useState } from "react"
import { BucketFormFields } from "./bucket-form-fields"
import { TransactionFooter } from "./transaction-footer"
import type { BucketView } from "@/components/dashboard/types"
import { parseLocalDate, toRecord } from "@/components/dashboard/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useFileHandle } from "@/components/providers/file-handle-provider"

interface EditBucketDialogProps {
  bucket: BucketView
  children: React.ReactNode
}

export default function EditBucketDialog({ bucket, children }: EditBucketDialogProps) {
  const { data, setData } = useFileHandle()
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState(bucket.category)
  const [limit, setLimit] = useState(String(bucket.limit || ""))

  // Load the up-to-date values from the bucket prop into local state every time the dialog opens
  const handleOpenChange = (v: boolean) => {
    setOpen(v)
    if (v) {
      setCategory(bucket.category)
      setLimit(String(bucket.limit || ""))
    }
  }

  const handleSave = async () => {
    if (!category.trim()) return

    const m = bucket.month
    const y = bucket.year
    // Limit records use the 1st of the month as their date
    const dateStr = `${y}-${String(m).padStart(2, "0")}-01`

    // Update all records for this month/year if they match the old category
    // This includes both the limit record and transaction records
    const updatedData = data.map((r) => {
      const rec = toRecord(r)
      const { month: rMonth, year: rYear } = parseLocalDate(rec.date)

      // If it's a record for the same month/year and same original category
      if (rec.category === bucket.category && rMonth === m && rYear === y) {
        return {
          ...rec,
          category: category.trim(),
        }
      }
      return r
    })

    const numLimit = parseFloat(limit)

    // Check if we already have a limit record in the updated set (we just renamed it if it existed)
    // Actually, it's safer to just handle the limit separately to ensure it's exact
    const finalData = updatedData.filter((r) => {
      const rec = toRecord(r)
      const isLimitRecord = rec.name === "" && parseFloat(rec.category_limit) > 0
      if (!isLimitRecord) return true
      const { month: rMonth, year: rYear } = parseLocalDate(rec.date)
      // Remove any existing limit for the NEW category name in this month as well (to prevent duplicates)
      return !(rec.category === category.trim() && rMonth === m && rYear === y)
    })

    // If new limit is > 0, append the new limit record
    if (!isNaN(numLimit) && numLimit > 0) {
      const limitRecord: Record<string, unknown> = {
        date: dateStr,
        name: "",
        amount: "0",
        category: category.trim(),
        category_limit: limit.trim(),
        notes: "",
      }
      await setData([...finalData, limitRecord])
    } else {
      // Limit deleted or 0, just save the filtered data
      await setData(finalData)
    }

    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Budget Bucket</DialogTitle>
          <DialogDescription>
            Update the limit or name for {bucket.category} in{" "}
            {new Date(bucket.year, bucket.month - 1).toLocaleString("default", { month: "long" })} {bucket.year}.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSave()
          }}
        >
          <BucketFormFields
            category={category}
            setCategory={setCategory}
            limit={limit}
            setLimit={setLimit}
            hideMonthYear
          />

          <TransactionFooter
            onCancel={() => setOpen(false)}
            onDelete={async () => {
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
            isSaveDisabled={!category.trim() || !limit.trim()}
          />
        </form>
      </DialogContent>
    </Dialog>
  )
}
