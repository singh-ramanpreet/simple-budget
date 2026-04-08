import { useEffect, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { CircleArrowLeft02Icon, CircleArrowRight02Icon } from "@hugeicons/core-free-icons"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

interface MonthNavigatorProps {
  month: number
  year: number
  onNavigate: (delta: number) => void
  onJump: (month: number, year: number) => void
}

const MONTHS = [
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

export default function MonthNavigator({ month, year, onNavigate, onJump }: MonthNavigatorProps) {
  const [yearInput, setYearInput] = useState(year.toString())

  // Sync internal state when external year changes
  useEffect(() => {
    setYearInput(year.toString())
  }, [year])

  const commitYear = () => {
    const parsed = parseInt(yearInput, 10)
    if (!isNaN(parsed) && parsed >= 1000 && parsed <= 9999) {
      onJump(month, parsed)
    } else {
      setYearInput(year.toString())
    }
  }

  return (
    <div className="flex items-center justify-between">
      <HugeiconsIcon
        icon={CircleArrowLeft02Icon}
        size={32}
        onClick={() => onNavigate(-1)}
        className="shrink-0 cursor-pointer"
      />

      <div className="flex items-center gap-2">
        <Select
          value={MONTHS[month - 1]}
          onValueChange={(v) => {
            const index = MONTHS.indexOf(v!)
            if (index !== -1) onJump(index + 1, year)
          }}
        >
          <SelectTrigger className="bg-input/30 hover:bg-input/50 border-none text-lg font-medium focus:ring-0 [&_svg]:hidden">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="w-16">
          <Input
            type="number"
            value={yearInput}
            onChange={(e) => setYearInput(e.target.value)}
            onBlur={commitYear}
            onKeyDown={(e) => e.key === "Enter" && commitYear()}
            className="hover:bg-accent bg-input/30 focus-visible:bg-accent w-full [appearance:textfield] border-none text-lg font-medium shadow-none focus-visible:ring-0 md:text-lg [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>
      </div>

      <HugeiconsIcon
        icon={CircleArrowRight02Icon}
        size={32}
        onClick={() => onNavigate(1)}
        className="shrink-0 cursor-pointer"
      />
    </div>
  )
}
