import { Transaction, fetchTransactions } from "@/lib/db/transactions"
import TransactionItem from "./transaction-item"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationEllipsis,
  PaginationNext,
} from "@/components/ui/pagination"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

type TransactionsListProps = {
  userId: string
  month?: number
  year?: number
  categoryId?: number
  page?: number
  pageSize?: number
}

export default async function TransactionsList({
  userId,
  month,
  year,
  categoryId,
  page,
  pageSize,
}: TransactionsListProps) {
  // get logged in user id
  const loggedUserId = userId

  // get the latest transaction, and figure out the timezone offset
  const recentTransaction = await fetchTransactions(loggedUserId!, undefined, undefined, undefined, 1, 0)
  const hoursDiff = new Date(recentTransaction[0].date).getHours()
  const nowServer = new Date()
  const currentDate = new Date(new Date().setHours(nowServer.getHours() - hoursDiff, 0, 0, 0))

  // get month, default to current month
  const filterMonth = month ?? currentDate.getMonth() + 1
  // get year, default to current year
  const filterYear = year ?? currentDate.getFullYear()
  // get category id, default to undefined
  const filterCategoryId = categoryId ?? undefined
  // get current page, default to 1
  const currentPage = page ?? 1
  // items per page, default to 10
  const itemsPerPage = pageSize ?? 10

  // fetch transactions
  const transactions = await fetchTransactions(
    loggedUserId!,
    filterMonth,
    filterYear,
    filterCategoryId,
    itemsPerPage,
    (currentPage - 1) * itemsPerPage
  )
  // total pages
  const totalPages = Math.ceil(transactions.length > 0 ? transactions[0].total_count / itemsPerPage : 0)

  // navigate month
  const navigateMonth = (delta: number) => {
    let href = `?`
    const newDate = new Date(filterYear, filterMonth - 1 + delta, 15)
    const newMonth = newDate.getMonth() + 1
    const newYear = newDate.getFullYear()
    href += `month=${newMonth}&year=${newYear}`
    href += `&page=${1}`
    return href
  }

  // pagination href
  const paginationHref = (page: string | number) => {
    let href = `?month=${filterMonth}&year=${filterYear}`
    if (filterCategoryId) {
      href += `&categoryId=${filterCategoryId}`
    }
    href += `&page=${page}`
    return href
  }

  // generate pagination
  const generatePagination = () => {
    if (totalPages <= 5) {
      // Show all pages if total is 5 or less
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    if (currentPage <= 3) {
      // Near the start
      return [1, 2, 3, "ellipsis", totalPages]
    }
    if (currentPage >= totalPages - 2) {
      // Near the end
      return [1, "ellipsis", totalPages - 2, totalPages - 1, totalPages]
    }
    // In the middle
    return [1, "ellipsis", currentPage, "ellipsis", totalPages]
  }

  const groupTransactionsByDay = (transactions: Transaction[]) => {
    return transactions.reduce(
      (groups, transaction) => {
        const date = new Date(transaction.date)
        const day = date.toLocaleDateString("default", { day: "numeric", month: "long", year: "numeric" })
        if (!groups[day]) {
          groups[day] = []
        }
        groups[day].push(transaction)
        return groups
      },
      {} as Record<string, Transaction[]>
    )
  }
  const getDayOfWeek = (date: Date) => {
    const dt = new Date(date)
    return dt.toLocaleDateString("default", { weekday: "long" })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button asChild variant="link" className="rounded-full hover:bg-muted">
          <Link href={navigateMonth(-1)} scroll={false}>
            <ChevronLeft className="text-muted-foreground" />
          </Link>
        </Button>

        <h2 className="text-lg font-medium">
          {new Date(filterYear!, filterMonth! - 1, 15).toLocaleString("default", { month: "long", year: "numeric" })}
        </h2>

        <Button asChild variant="link" className="rounded-full hover:bg-muted">
          <Link href={navigateMonth(1)} scroll={false}>
            <ChevronRight className="text-muted-foreground" />
          </Link>
        </Button>
      </div>

      <div className="space-y-2">
        {Object.entries(groupTransactionsByDay(transactions)).map(([day, dayTransactions]) => (
          <div key={day} className="space-y-2">
            <h3 className="text-sm text-muted-foreground">{getDayOfWeek(new Date(day))}</h3>
            <ul className="space-y-1">
              {dayTransactions.map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))}
            </ul>
          </div>
        ))}
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={paginationHref(currentPage - 1)}
              className={`cursor-pointer ${currentPage === 1 ? "pointer-events-none opacity-50" : ""}`}
            />
          </PaginationItem>

          {generatePagination().map((page, i) => (
            <PaginationItem key={i}>
              {page === "ellipsis" ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink href={paginationHref(page)} isActive={currentPage === page} className="cursor-pointer">
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              href={paginationHref(currentPage + 1)}
              className={`cursor-pointer ${currentPage === totalPages ? "pointer-events-none opacity-50" : ""}`}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
