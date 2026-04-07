/**
 * TransactionItem
 *
 * Renders a single transaction row matching the original layout:
 * date pill | name + notes | category | amount
 */

import { format } from "date-fns"
import { parseLocalDate } from "./types"
import type { CsvRecord } from "./types"

interface TransactionItemProps {
  record: CsvRecord
}

export default function TransactionItem({ record }: TransactionItemProps) {
  const d = parseLocalDate(record.date)
  const date = new Date(d.year, d.month - 1, 1)
  const shortMonth = format(date, "MMM")
  const dayNum = d.day

  return (
    <div className="hover:bg-muted cursor-pointer rounded-lg py-2 pr-2 transition-colors">
      <div className="flex shrink-0 items-center gap-2">
        {/* Date pill */}
        <div className="flex w-[49.5%] shrink-0 items-center gap-2">
          <div className="bg-secondary text-secondary-foreground flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg">
            <span className="text-xs font-semibold uppercase">{shortMonth}</span>
            <span className="text-lg font-bold">{dayNum}</span>
          </div>

          {/* Name + notes */}
          <div className="w-[65%] shrink-0 text-left">
            <h3 className="text-primary truncate font-medium">{record.name}</h3>
            <p className="text-muted-foreground truncate text-sm">{record.notes}</p>
          </div>
        </div>

        {/* Category */}
        <div className="w-[29%] shrink-0 text-left">
          <h3 className="text-primary truncate font-medium">{record.category}</h3>
        </div>

        {/* Amount */}
        <div className="w-[19%] shrink-0 text-right">
          <span className="text-muted-foreground font-medium">
            ${Math.abs(parseFloat(record.amount) || 0).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  )
}
