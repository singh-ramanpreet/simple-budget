"use client"

import { Transaction } from "@/lib/db/transactions"

interface TransactionProps {
  transaction: Transaction
  filterMonth?: number
  filterYear?: number
  filterCategory?: string
}

export default function TransactionItem({ transaction, filterMonth, filterYear, filterCategory }: TransactionProps) {
  const date = new Date(transaction.date)
  const month = date.toLocaleString("default", { month: "short", timeZone: "UTC" })
  const day = date.getUTCDate()

  // Skip rendering if filters don't match
  if (filterYear !== undefined && date.getUTCFullYear() !== filterYear) {
    return null
  }

  if (filterMonth !== undefined && date.getUTCMonth() !== filterMonth) {
    return null
  }

  if (filterCategory && transaction.category !== filterCategory) {
    return null
  }

  return (
    <li className="group flex items-center justify-between rounded-lg p-4 transition-colors hover:bg-muted">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
          <span className="text-xs font-semibold uppercase">{month}</span>
          <span className="text-lg font-bold">{day}</span>
        </div>
        <div>
          <h3 className="font-medium text-primary">{transaction.name}</h3>
          <p className="text-sm text-muted-foreground">{transaction.category}</p>
        </div>
      </div>
      <span className="font-medium text-muted-foreground">${Math.abs(transaction.amount).toFixed(2)}</span>
    </li>
  )
}
