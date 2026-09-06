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
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignCircleFreeIcons } from "@hugeicons/core-free-icons"
import { BucketFormFields } from "./bucket-form-fields"
import { TransactionFooter } from "./transaction-footer"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useFileHandle } from "@/components/providers/file-handle-provider"
import { parseLocalDate, toRecord } from "@/components/dashboard/types"
import { usePendingAction } from "@/hooks/use-pending-action"

export default function AddBucketDialog({
  initialMonth,
  initialYear,
}: {
  initialMonth?: number
  initialYear?: number
}) {
  const { data, setData } = useFileHandle()
  const [open, setOpen] = useState(false)
  const { isPending: isSaving, run } = usePendingAction()

  const now = new Date()
  const [month, setMonth] = useState(String(initialMonth ?? now.getMonth() + 1))
  const [year, setYear] = useState(String(initialYear ?? now.getFullYear()))
  const [category, setCategory] = useState("")
  const [limit, setLimit] = useState("")

  const resetForm = () => {
    const n = new Date()
    setMonth(String(initialMonth ?? n.getMonth() + 1))
    setYear(String(initialYear ?? n.getFullYear()))
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
      <DialogTrigger className="w-full">
        <Button variant="default" size="lg" className="w-full" onClick={() => resetForm()}>
          <HugeiconsIcon icon={PlusSignCircleFreeIcons} />
          New Bucket
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>New Bucket</DialogTitle>
          <DialogDescription>Create a new bucket and set its spending limit for this month.</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            run(handleSave)
          }}
        >
          <BucketFormFields
            month={month}
            setMonth={setMonth}
            year={year}
            setYear={setYear}
            category={category}
            setCategory={setCategory}
            limit={limit}
            setLimit={setLimit}
          />

          <TransactionFooter
            onCancel={() => setOpen(false)}
            isPending={isSaving}
            isSaveDisabled={!category.trim() || !limit.trim() || !month.trim() || !year.trim()}
          />
        </form>
      </DialogContent>
    </Dialog>
  )
}
