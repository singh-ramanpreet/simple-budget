"use client"

import { useState, useMemo } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useFileHandle } from "@/components/providers/file-handle-provider"
import { toRecord, CsvRecord, parseLocalDate } from "@/components/dashboard/types"
import { TransactionFormFields } from "./transaction-form-fields"

interface EditTransactionDialogProps {
  record: CsvRecord
  children: React.ReactNode
}

export default function EditTransactionDialog({ record, children }: EditTransactionDialogProps) {
  const { data, setData } = useFileHandle()
  const [open, setOpen] = useState(false)

  const parseDate = (d: string) => {
    if (!d) return new Date()
    const { year, month, day } = parseLocalDate(d)
    return new Date(year, month - 1, day)
  }

  const [date, setDate] = useState<Date>(parseDate(record.date))
  const [name, setName] = useState(record.name)
  const [amount, setAmount] = useState(record.amount)
  const [category, setCategory] = useState(record.category)
  const [notes, setNotes] = useState(record.notes)

  const existingCategories = useMemo(() => {
    const records = data.map(toRecord)
    return [...new Set(records.map((r) => r.category).filter(Boolean))].sort()
  }, [data])

  const handleOpenChange = (v: boolean) => {
    setOpen(v)
    if (v) {
      setDate(parseDate(record.date))
      setName(record.name)
      setAmount(record.amount)
      setCategory(record.category)
      setNotes(record.notes)
    }
  }

  const handleDelete = async () => {
    let deleted = false
    const updatedData = data.filter((r) => {
      const parsed = toRecord(r)
      if (
        !deleted &&
        parsed.date === record.date &&
        parsed.name === record.name &&
        parsed.amount === record.amount &&
        parsed.category === record.category &&
        parsed.category_limit === record.category_limit &&
        parsed.notes === record.notes
      ) {
        deleted = true
        return false // Skip this one to delete it
      }
      return true
    })
    await setData(updatedData)
    setOpen(false)
  }

  const handleSave = async () => {
    if (!name.trim() || !amount.trim()) return

    const newRow = {
      date: format(date, "yyyy-MM-dd"),
      name: name.trim(),
      amount: amount.trim(),
      category: category.trim(),
      category_limit: record.category_limit,
      notes: notes.trim(),
    }

    let overwritten = false
    const updatedData = data.map((r) => {
      const parsed = toRecord(r)
      if (
        !overwritten &&
        parsed.date === record.date &&
        parsed.name === record.name &&
        parsed.amount === record.amount &&
        parsed.category === record.category &&
        parsed.category_limit === record.category_limit &&
        parsed.notes === record.notes
      ) {
        overwritten = true
        return newRow // Replace with updated
      }
      return r
    })

    await setData(updatedData)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="border-zinc-800 bg-[#0f0f0f] p-6 text-zinc-100">
        <DialogTitle className="block w-full rounded-lg border border-zinc-800 bg-[#1a1a1a] py-3 text-center text-sm font-semibold tracking-wide">
          Edit Transaction
        </DialogTitle>

        <TransactionFormFields
          date={date}
          setDate={setDate}
          name={name}
          setName={setName}
          amount={amount}
          setAmount={setAmount}
          category={category}
          setCategory={setCategory}
          notes={notes}
          setNotes={setNotes}
          existingCategories={existingCategories}
        />

        {/* Actions */}
        <div className="mt-4 flex justify-between gap-3 border-t border-zinc-800 pt-4">
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="w-1/3"
          >
            Delete
          </Button>
          <div className="flex w-2/3 gap-3">
            <Button
              onClick={handleSave}
              disabled={!name.trim() || !amount.trim()}
              className="flex-1 bg-white text-black hover:bg-zinc-200"
            >
              Save
            </Button>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 border-zinc-800 bg-[#1f1f1f] text-white hover:bg-[#2a2a2a] hover:text-white"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
