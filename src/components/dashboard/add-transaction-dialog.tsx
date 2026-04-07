"use client"

/**
 * AddTransactionDialog
 *
 * A dialog for creating a new transaction record.
 * Displays fields in a grid layout.
 * Category must be selected from existing categories.
 */

import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { PlusSignCircleFreeIcons } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { TransactionFormFields } from "./transaction-form-fields"
import { TransactionFooter } from "./transaction-footer"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

import { useFileHandle } from "@/components/providers/file-handle-provider"
import { parseLocalDate, toRecord } from "@/components/dashboard/types"

export default function AddTransactionDialog() {
  const { data, setData } = useFileHandle()
  const [open, setOpen] = useState(false)

  // Form state
  const [date, setDate] = useState<Date>(new Date())
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    const handleCopy = (e: CustomEvent) => {
      const { detail } = e
      setName(detail.name || "")
      setAmount(detail.amount || "")
      setCategory(detail.category || "")
      setNotes(detail.notes || "")
      setDate(detail.date || new Date())
      setOpen(true)
    }
    window.addEventListener("copy-transaction" as any, handleCopy as any)
    return () => window.removeEventListener("copy-transaction" as any, handleCopy as any)
  }, [])

  /** Existing categories for the dropdown (filtered by selected month/year) */
  const existingCategories = useMemo(() => {
    const targetMonth = date.getMonth() + 1
    const targetYear = date.getFullYear()

    const records = data.map(toRecord).filter((r) => {
      const { month: rMonth, year: rYear } = parseLocalDate(r.date)
      return rMonth === targetMonth && rYear === targetYear
    })

    return [...new Set(records.map((r) => r.category).filter(Boolean))].sort()
  }, [data, date])

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
      <DialogTrigger className="w-full">
        <Button variant="default" size="lg" className="w-full">
          <HugeiconsIcon icon={PlusSignCircleFreeIcons} />
          New Transaction
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogTitle className="py-3 text-center">New Transaction</DialogTitle>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSave()
          }}
        >
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

          <TransactionFooter
            onCancel={() => setOpen(false)}
            isSaveDisabled={!name.trim() || !amount.trim() || !category.trim()}
          />
        </form>
      </DialogContent>
    </Dialog>
  )
}
