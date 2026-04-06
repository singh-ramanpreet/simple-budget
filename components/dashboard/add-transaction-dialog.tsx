"use client"

/**
 * AddTransactionDialog
 *
 * A dialog for creating a new transaction record.
 * Displays fields in a grid layout.
 * Category must be selected from existing categories.
 */

import { useState, useMemo } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PlusCircle } from "lucide-react"

import { useFileHandle } from "@/components/providers/file-handle-provider"
import { toRecord, CsvRecord } from "@/components/dashboard/types"
import { TransactionFormFields } from "./transaction-form-fields"

export default function AddTransactionDialog() {
  const { data, setData } = useFileHandle()
  const [open, setOpen] = useState(false)

  // Form state
  const [date, setDate] = useState<Date>(new Date())
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [notes, setNotes] = useState("")

  /** Existing categories for the dropdown (from all records) */
  const existingCategories = useMemo(() => {
    const records = data.map(toRecord)
    return [...new Set(records.map((r) => r.category).filter(Boolean))].sort()
  }, [data])

  /** Reset form to defaults */
  const resetForm = () => {
    setDate(new Date())
    setName("")
    setAmount("")
    setCategory("")
    setNotes("")
  }

  /** Submit handler — appends a transaction record (category_limit = 0) */
  const handleSave = async () => {
    if (!name.trim() || !amount.trim()) return

    const newRecord: Record<string, unknown> = {
      date: format(date, "yyyy-MM-dd"),
      name: name.trim(),
      amount: amount.trim(),
      category: category.trim(),
      category_limit: "0",
      notes: notes.trim(),
    }

    await setData([...data, newRecord])
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
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="border-zinc-800 bg-[#0f0f0f] p-6 text-zinc-100">
        <DialogTitle className="block w-full rounded-lg border border-zinc-800 bg-[#1a1a1a] py-3 text-center text-sm font-semibold tracking-wide">
          New Transaction
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

        {/* Actions - Save on left, Cancel on right as per user image */}
        <div className="mt-6 flex w-full gap-3">
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
      </DialogContent>
    </Dialog>
  )
}
