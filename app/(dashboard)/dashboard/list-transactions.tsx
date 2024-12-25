"use client"

import { useCallback, useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { authClient } from "@/lib/auth/client"
import { Transaction, fetchTransactions } from "@/lib/db/transactions"
import TransactionItem from "./transaction"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationEllipsis,
  PaginationNext,
} from "@/components/ui/pagination"

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
  const [filterMonth, setFilterMonth] = useState<number | undefined>()
  const [filterYear, setFilterYear] = useState<number | undefined>()
  const filterCategoryId = categoryId
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 10

  const refreshTransactions = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data: session } = await authClient.getSession()
      const userId = session?.user?.id || ""
      if (!userId) {
        return
      }
      const result = await fetchTransactions(
        userId,
        filterMonth,
        filterYear,
        filterCategoryId,
        itemsPerPage,
        (currentPage - 1) * itemsPerPage
      )
      setTransactions(result)
      console.log(result)
      setTotalPages(Math.ceil(result.length > 0 ? result[0].total_count / itemsPerPage : 0))
    } finally {
      setIsLoading(false)
    }
  }, [filterMonth, filterYear, filterCategoryId, currentPage])

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

  if (month && year) {
    if (month !== filterMonth || year !== filterYear) {
      const delta = (year - filterYear!) * 12 + (month - filterMonth!)
      navigateMonth(delta)
    }
  }

  if (isLoading) {
    return <div>Loading transactions...</div>
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const generatePagination = () => {
    if (totalPages <= 7) {
      // Show all pages if total is 7 or less
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    if (currentPage <= 3) {
      // Near the start
      return [1, 2, 3, 4, "ellipsis", totalPages]
    }

    if (currentPage >= totalPages - 2) {
      // Near the end
      return [1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    }

    // In the middle
    return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages]
  }

  const groupTransactionsByDay = (transactions: Transaction[]) => {
    return transactions.reduce(
      (groups, transaction) => {
        const date = new Date(transaction.date)
        const dayOfWeek = date.toLocaleString("default", { weekday: "long" })
        if (!groups[dayOfWeek]) {
          groups[dayOfWeek] = []
        }
        groups[dayOfWeek].push(transaction)
        return groups
      },
      {} as Record<string, Transaction[]>
    )
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

      <div className="space-y-2">
        {Object.entries(groupTransactionsByDay(transactions)).map(([dayOfWeek, dayTransactions]) => (
          <div key={dayOfWeek} className="space-y-2">
            <h3 className="text-sm text-muted-foreground">{dayOfWeek}</h3>
            <ul className="space-y-1">
              {dayTransactions.map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} OnEditTransaction={OnEditTransaction} />
              ))}
            </ul>
          </div>
        ))}
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              className={`cursor-pointer ${currentPage === 1 ? "pointer-events-none opacity-50" : ""}`}
            />
          </PaginationItem>

          {generatePagination().map((page, i) => (
            <PaginationItem key={i}>
              {page === "ellipsis" ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  onClick={() => handlePageChange(page as number)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              className={`cursor-pointer ${currentPage === totalPages ? "pointer-events-none opacity-50" : ""}`}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
