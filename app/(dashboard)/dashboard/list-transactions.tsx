"use client"

import { useCallback, useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { authClient } from "@/lib/auth/client"
import { Transaction, fetchTransactions } from "@/lib/db/transactions"
import TransactionItem from "./transaction"

interface ListTransactionsProps {
  refresh: boolean
  month?: number
  year?: number
  categoryId?: number
  OnEditTransaction: (() => void)[]
}

export default function ListTransactions({
  refresh,
  month,
  year,
  categoryId,
  OnEditTransaction,
}: ListTransactionsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [filterMonth, setFilterMonth] = useState<number | undefined>(month)
  const [filterYear, setFilterYear] = useState<number | undefined>(year)
  const filterCategoryId = categoryId

  const refreshTransactions = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data: session } = await authClient.getSession()
      const userId = session?.user?.id || ""
      if (!userId) {
        return
      }
      const result = await fetchTransactions(userId, filterMonth, filterYear, filterCategoryId)
      setTransactions(result)
    } finally {
      setIsLoading(false)
    }
  }, [filterMonth, filterYear, filterCategoryId])

  useEffect(() => {
    refreshTransactions()
  }, [refresh, refreshTransactions])

  const navigateMonth = (delta: number) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + delta)
      setFilterMonth(newDate.getMonth() + 1)
      setFilterYear(newDate.getFullYear())
      return newDate
    })
  }

  if (!filterMonth || !filterYear) {
    navigateMonth(0)
  }

  if (isLoading) {
    return <div>Loading transactions...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => navigateMonth(-1)} className="rounded-full p-2 hover:bg-muted">
          <ChevronLeft className="h-5 w-5 text-muted-foreground" />
        </button>

        <h2 className="text-lg font-medium">
          {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
        </h2>

        <button onClick={() => navigateMonth(1)} className="rounded-full p-2 hover:bg-muted">
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      <ul>
        {transactions.map((transaction) => (
          <TransactionItem key={transaction.id} transaction={transaction} OnEditTransaction={OnEditTransaction} />
        ))}
      </ul>
    </div>
  )
}
