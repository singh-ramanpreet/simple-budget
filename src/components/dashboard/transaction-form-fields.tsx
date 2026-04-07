import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

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
  existingCategories: string[]
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
  return (
    <div className="mt-4 grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-4">
      {/* Date Picker */}
      <Label className="text-right font-medium">Date</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-between border-zinc-800 bg-transparent text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            {date ? format(date, "PPP") : "Pick a date"}
            <CalendarIcon className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus />
        </PopoverContent>
      </Popover>

      {/* Name */}
      <Label htmlFor="txn-name" className="text-right font-medium">
        Name
      </Label>
      <Input
        id="txn-name"
        placeholder="Transaction name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border-zinc-800 bg-transparent focus-visible:ring-zinc-700"
      />

      {/* Amount */}
      <Label htmlFor="txn-amount" className="text-right font-medium">
        Amount
      </Label>
      <Input
        id="txn-amount"
        type="number"
        step="0.01"
        placeholder="0"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="border-zinc-800 bg-transparent focus-visible:ring-zinc-700"
      />

      {/* Category */}
      <Label className="text-right font-medium">Category</Label>
      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger className="w-full border-zinc-800 bg-transparent focus:ring-zinc-700">
          <SelectValue placeholder="Select a category" />
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
      <Input
        id="txn-notes"
        placeholder="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="border-zinc-800 bg-transparent focus-visible:ring-zinc-700"
      />
    </div>
  )
}
