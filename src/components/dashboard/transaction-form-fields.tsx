import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
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
          <CalendarIcon className="h-4 w-4 opacity-50" />
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
      <Input id="txn-name" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />

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

      {/* Category */}
      <Label htmlFor="txn-category" className="text-right font-medium">
        Category *
      </Label>
      <Select value={category} onValueChange={(value) => setCategory(value || "")}>
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
            <div className="text-muted-foreground p-2 text-sm">No categories found</div>
          )}
        </SelectContent>
      </Select>

      {/* Notes */}
      <Label htmlFor="txn-notes" className="text-right font-medium">
        Notes
      </Label>
      <Input id="txn-notes" placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
    </div>
  )
}
