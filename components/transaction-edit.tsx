import {
  fetchTransaction,
  fetchTransactionNames,
  fetchTransactionNotes,
  fetchTransactions,
} from "@/lib/db/transactions"
import { fetchBuckets } from "@/lib/db/buckets"
import { TTransactionSchema } from "@/lib/schema"
import TransactionForm from "./transaction-form"

interface TransactionEditProps {
  userId?: string
  transactionId?: number
  month?: number
  year?: number
}

export default async function TransactionEdit({
  userId,
  transactionId = undefined,
  month,
  year,
}: TransactionEditProps) {
  const loggedUserId = userId

  // get the latest transaction, and figure out the timezone offset
  const recentTransaction = await fetchTransactions(loggedUserId!, undefined, undefined, undefined, 1, 0)
  const hours = new Date(recentTransaction[0].date).getHours()
  const currentDate = new Date(new Date().setHours(hours, 0, 0, 0))

  // get month and year
  const currentMonth = month ?? currentDate.getMonth() + 1
  const currentYear = year ?? currentDate.getFullYear()

  // Fetch buckets
  const buckets = await fetchBuckets(loggedUserId!, currentMonth, currentYear)
  // Fetch transaction
  const transaction = transactionId ? await fetchTransaction(loggedUserId!, transactionId) : undefined
  // Fetch existing names and notes
  const names = await fetchTransactionNames(loggedUserId!)
  const notes = await fetchTransactionNotes(loggedUserId!)

  const defaultValues: TTransactionSchema = {
    date: transaction ? new Date(transaction?.date) : currentDate,
    name: transaction?.name ?? "",
    amount: transaction?.amount.toString() ?? "",
    category_id: transaction?.category_id.toString() ?? "",
    notes: transaction?.notes ?? "",
    transactionId: transaction?.id.toString() ?? "",
  }

  return <TransactionForm defaultValues={defaultValues} existingNames={names} existingNotes={notes} buckets={buckets} />
}
