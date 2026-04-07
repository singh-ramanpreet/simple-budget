import { useMemo, useState } from "react"
import { format } from "date-fns"
import { TransactionFormFields } from "./transaction-form-fields"
import { TransactionFooter } from "./transaction-footer"
import type { CsvRecord } from "@/components/dashboard/types"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useFileHandle } from "@/components/providers/file-handle-provider"
import { parseLocalDate, toRecord } from "@/components/dashboard/types"

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
    const targetMonth = date.getMonth() + 1
    const targetYear = date.getFullYear()

    const records = data.map(toRecord).filter((r) => {
      const { month: rMonth, year: rYear } = parseLocalDate(r.date)
      return rMonth === targetMonth && rYear === targetYear
    })

    return [...new Set(records.map((r) => r.category).filter(Boolean))].sort()
  }, [data, date])

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

  const handleCopy = () => {
    const today = new Date()
    const isSameMonth =
      date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()

    const detail = {
      name: name.trim(),
      amount: amount.trim(),
      category: isSameMonth ? category.trim() : "",
      notes: notes.trim(),
      date: today,
    }
    window.dispatchEvent(new CustomEvent("copy-transaction", { detail }))
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogTitle className="py-3 text-center">Edit Transaction</DialogTitle>

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
            onDelete={handleDelete}
            onCopy={handleCopy}
            isSaveDisabled={!name.trim() || !amount.trim() || !category.trim()}
          />
        </form>
      </DialogContent>
    </Dialog>
  )
}
