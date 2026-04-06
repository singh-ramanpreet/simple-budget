"use client"

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
      <li className="group flex cursor-pointer items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {/* Date pill */}
          <div className="flex h-12 w-12 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
            <span className="text-xs font-semibold uppercase">{shortMonth}</span>
            <span className="text-lg font-bold">{dayNum}</span>
          </div>

          {/* Name + notes */}
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-medium text-primary">{record.name}</h3>
            <p className="truncate text-sm text-muted-foreground">{record.notes}</p>
          </div>

          {/* Category */}
          <div className="w-[25%] flex-shrink-0">
            <h3 className="truncate font-medium text-primary">{record.category}</h3>
          </div>

          {/* Amount */}
          <div className="w-[20%] flex-shrink-0 text-right">
            <span className="font-medium text-muted-foreground">
              ${Math.abs(parseFloat(record.amount) || 0).toFixed(2)}
            </span>
          </div>
        </div>
      </li>
    </EditTransactionDialog>
  )
}
