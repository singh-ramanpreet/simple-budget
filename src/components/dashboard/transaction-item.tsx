/**
 * TransactionItem
 *
 * Renders a single transaction row matching the original layout:
 * date pill | name + notes | category | amount
 */

import { CsvRecord } from "./types"
import EditTransactionDialog from "./edit-transaction-dialog"

interface TransactionItemProps {
  record: CsvRecord
}

export default function TransactionItem({ record }: TransactionItemProps) {
  const d = new Date(record.date)
  const shortMonth = d.toLocaleString("default", { month: "short" })
  const dayNum = d.getDate()

  return (
    <EditTransactionDialog record={record}>
      <li className="group hover:bg-muted flex cursor-pointer items-center justify-between rounded-lg p-2 transition-colors">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {/* Date pill */}
          <div className="bg-secondary text-secondary-foreground flex h-12 w-12 flex-shrink-0 flex-col items-center justify-center rounded-lg">
            <span className="text-xs font-semibold uppercase">{shortMonth}</span>
            <span className="text-lg font-bold">{dayNum}</span>
          </div>

          {/* Name + notes */}
          <div className="min-w-0 flex-1">
            <h3 className="text-primary truncate font-medium">{record.name}</h3>
            <p className="text-muted-foreground truncate text-sm">{record.notes}</p>
          </div>

          {/* Category */}
          <div className="w-[25%] flex-shrink-0">
            <h3 className="text-primary truncate font-medium">{record.category}</h3>
          </div>

          {/* Amount */}
          <div className="w-[20%] flex-shrink-0 text-right">
            <span className="text-muted-foreground font-medium">
              ${Math.abs(parseFloat(record.amount) || 0).toFixed(2)}
            </span>
          </div>
        </div>
      </li>
    </EditTransactionDialog>
  )
}
