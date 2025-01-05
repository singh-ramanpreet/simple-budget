import { Transaction } from "@/lib/db/transactions"
import Link from "next/link"
import { DASHBOARD_PATH } from "@/lib/constants"

type TransactionItemProps = {
  transaction: Transaction
}

export default function TransactionItem({ transaction }: TransactionItemProps) {
  const date = new Date(transaction.date)
  const month = date.toLocaleString("default", { month: "short" })
  const day = date.getDate()

  return (
    <Link
      href={`${DASHBOARD_PATH}/t/${transaction.id}?month=${date.getMonth() + 1}&year=${date.getFullYear()}`}
      prefetch={false}
    >
      <li className="group flex cursor-pointer items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="flex h-12 w-12 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
            <span className="text-xs font-semibold uppercase">{month}</span>
            <span className="text-lg font-bold">{day}</span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-medium text-primary">{transaction.name}</h3>
            <p className="truncate text-sm text-muted-foreground">{transaction.notes}</p>
          </div>
          <div className="w-[25%] flex-shrink-0">
            <h3 className="truncate font-medium text-primary">{transaction.category}</h3>
          </div>
          <div className="w-[20%] flex-shrink-0 text-right">
            <span className="font-medium text-muted-foreground">${Math.abs(transaction.amount).toFixed(2)}</span>
          </div>
        </div>
      </li>
    </Link>
  )
}
