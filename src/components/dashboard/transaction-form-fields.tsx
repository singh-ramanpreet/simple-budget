import { useState } from "react"
import { format } from "date-fns"
import { CalendarFreeIcons } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface TransactionFormFieldsProps {
  date: Date
  setDate: (d: Date) => void
  name: string
  setName: (v: string) => void
  amount: string
  setAmount: (v: string) => void
  category: string
  setCategory: (v: string) => void
  notes: string
  setNotes: (v: string) => void
  existingCategories: Array<string>
  existingNames: Array<string>
  existingNotes: Array<string>
}

export function TransactionFormFields({
  date,
  setDate,
  name,
  setName,
  amount,
  setAmount,
  category,
  setCategory,
  notes,
  setNotes,
  existingCategories,
  existingNames,
  existingNotes,
}: TransactionFormFieldsProps) {
  const [calendarOpen, setCalendarOpen] = useState(false)

  return (
    <div className="mt-4 grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-4">
      {/* Date Picker */}
      <Label htmlFor="txn-date" className="text-right font-medium">
        Date *
      </Label>
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger render={<Button variant="outline" className="w-full justify-between text-left font-normal" />}>
          {format(date, "PPP")}
          <HugeiconsIcon icon={CalendarFreeIcons} />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => {
              if (d) {
                setDate(d)
                setCalendarOpen(false)
              }
            }}
            autoFocus
          />
        </PopoverContent>
      </Popover>

      {/* Name */}
      <Label htmlFor="txn-name" className="text-right font-medium">
        Name *
      </Label>
      <div className="relative">
        <Input
          id="txn-name"
          placeholder="Name"
          value={name}
          list="existing-names"
          onChange={(e) => setName(e.target.value)}
          autoComplete="off"
        />
        <datalist id="existing-names">
          {existingNames.map((n) => (
            <option key={n} value={n} />
          ))}
        </datalist>
      </div>

      {/* Amount */}
      <Label htmlFor="txn-amount" className="text-right font-medium">
        Amount *
      </Label>
      <Input
        id="txn-amount"
        type="number"
        step="0.01"
        placeholder="0.00"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      {/* Category * */}
      <Label htmlFor="txn-category" className="text-right font-medium">
        Category *
      </Label>
      <Select
        items={existingCategories.map((cat) => ({ label: cat, value: cat }))}
        value={category}
        onValueChange={(value) => setCategory(value || "")}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          {existingCategories.length > 0 ? (
            existingCategories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))
          ) : (
            <div className="text-muted-foreground p-2 text-sm">
              No categories this month. <br /> Create a bucket first in this month.
            </div>
          )}
        </SelectContent>
      </Select>

      {/* Notes */}
      <Label htmlFor="txn-notes" className="text-right font-medium">
        Notes
      </Label>
      <div className="relative">
        <Input
          id="txn-notes"
          placeholder="Notes"
          value={notes}
          list="existing-notes"
          onChange={(e) => setNotes(e.target.value)}
          autoComplete="off"
        />
        <datalist id="existing-notes">
          {existingNotes.map((n) => (
            <option key={n} value={n} />
          ))}
        </datalist>
      </div>
    </div>
  )
}
