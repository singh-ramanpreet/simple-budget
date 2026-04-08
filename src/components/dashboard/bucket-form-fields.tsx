import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export interface BucketFormFieldsProps {
  month?: string
  setMonth?: (v: string) => void
  year?: string
  setYear?: (v: string) => void
  category: string
  setCategory: (v: string) => void
  limit: string
  setLimit: (v: string) => void
  disabled?: boolean
  hideMonthYear?: boolean
}

export function BucketFormFields({
  month,
  setMonth,
  year,
  setYear,
  category,
  setCategory,
  limit,
  setLimit,
  disabled = false,
  hideMonthYear = false,
}: BucketFormFieldsProps) {
  return (
    <div className="mt-4 grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-4">
      {/* Date fields */}
      {!hideMonthYear && month !== undefined && setMonth !== undefined && (
        <>
          <Label htmlFor="bucket-month" className="text-right font-medium">
            Month *
          </Label>
          <Select
            items={MONTHS.map((m) => ({ label: m, value: m }))}
            value={month ? MONTHS[parseInt(month, 10) - 1] : ""}
            onValueChange={(v) => {
              const index = MONTHS.indexOf(v!)
              if (index !== -1) setMonth(String(index + 1))
            }}
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      )}

      {!hideMonthYear && year !== undefined && setYear !== undefined && (
        <>
          <Label htmlFor="bucket-year" className="text-right font-medium">
            Year *
          </Label>
          <Input
            id="bucket-year"
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            disabled={disabled}
          />
        </>
      )}

      {/* Category */}
      <Label htmlFor="bucket-category" className="text-right font-medium">
        Category *
      </Label>
      <Input
        id="bucket-category"
        placeholder="e.g. Food"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        disabled={disabled}
      />

      {/* Limit */}
      <Label htmlFor="bucket-limit" className="text-right font-medium">
        Limit *
      </Label>
      <Input
        id="bucket-limit"
        type="number"
        step="0.01"
        placeholder="0.00"
        value={limit}
        onChange={(e) => setLimit(e.target.value)}
        disabled={disabled}
      />
    </div>
  )
}
