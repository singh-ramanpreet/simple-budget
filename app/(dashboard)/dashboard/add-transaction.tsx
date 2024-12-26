"use client"

import { authClient } from "@/lib/auth/client"
import * as z from "zod"
import {
  addTransaction,
  checkMatchingMonthYear,
  deleteTransaction,
  fetchTransaction,
  fetchTransactionNames,
  fetchTransactionNotes,
  updateTransaction,
} from "@/lib/db/transactions"
import { formatISO } from "date-fns"
import { useState, useEffect } from "react"
import { fetchBuckets, Bucket } from "@/lib/db/buckets"
import { transactionSchema } from "./transaction-form"
import TransactionForm, { TransactionFormValues } from "./transaction-form"

interface AddTransactionProps {
  onAddTransaction: (() => void)[]
  onCanceled: () => void
  onCopy?: () => void
  deleteButton?: boolean
  transactionId?: number
}

export default function AddTransaction({
  onAddTransaction,
  onCanceled,
  onCopy,
  deleteButton = false,
  transactionId = undefined,
}: AddTransactionProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [loggedUserId, setLoggedUserId] = useState("")
  const [buckets, setBuckets] = useState<Bucket[]>([])
  const [defaultValues, setDefaultValues] = useState<TransactionFormValues>()
  const [existingNames, setExistingNames] = useState<string[]>([])
  const [existingNotes, setExistingNotes] = useState<string[]>([])
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear())

  // Fetch existing names/notes when the component is mounted
  useEffect(() => {
    async function initializeData() {
      const { data: session } = await authClient.getSession()
      const userId = session?.user?.id || ""
      setLoggedUserId(userId)

      if (userId) {
        const names = await fetchTransactionNames(userId)
        const notes = await fetchTransactionNotes(userId)
        setExistingNames(names)
        setExistingNotes(notes)
      }
    }
    initializeData()
  }, [])

  // Reset the buckets when the month or year changes
  useEffect(() => {
    async function fetchNewBuckets() {
      if (!loggedUserId) return
      const bucketData = await fetchBuckets(loggedUserId, selectedMonth, selectedYear)
      setBuckets(bucketData)
    }
    fetchNewBuckets()
  }, [selectedMonth, selectedYear, loggedUserId])

  // Fetch transaction data if transactionId is provided
  // and set the default values when the component is mounted
  // and when the transactionId changes
  useEffect(() => {
    async function initializeTransactionValues() {
      if (transactionId) {
        const transaction = await fetchTransaction(loggedUserId, transactionId)
        if (transaction) {
          const date = new Date(transaction.date)
          const bucketData = await fetchBuckets(loggedUserId, date.getMonth() + 1, date.getFullYear())
          setBuckets(bucketData)
          setDefaultValues({
            date: date,
            name: transaction.name,
            amount: transaction.amount.toString(),
            category: transaction.category ?? "",
            notes: transaction.notes,
          })
        }
      }
    }
    initializeTransactionValues()
  }, [transactionId, loggedUserId])

  async function handleFormSubmit(values: z.infer<typeof transactionSchema>) {
    setIsLoading(true)
    try {
      const transactionData = {
        ...values,
        id: transactionId,
        userId: loggedUserId,
        amount: Number(parseFloat(values.amount).toFixed(2)),
        date: formatISO(values.date),
        category_id: buckets.find((b) => b.category === values.category)?.id || 0,
      }
      if (await checkMatchingMonthYear(loggedUserId, transactionData.category_id, values.date)) {
        throw new Error("Category does not match the month and year of the transaction")
      }
      if (transactionId) {
        await updateTransaction(loggedUserId, transactionId, transactionData)
      } else {
        await addTransaction(transactionData)
      }
      onAddTransaction.forEach((cb) => cb())
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDateChange(date: Date) {
    setSelectedMonth(date.getMonth() + 1)
    setSelectedYear(date.getFullYear())
  }

  async function handleDelete() {
    if (!transactionId) return
    setIsLoading(true)
    try {
      await deleteTransaction(loggedUserId, transactionId)
      onCanceled()
      onAddTransaction.forEach((cb) => cb())
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <TransactionForm
      defaultValues={defaultValues}
      existingNames={existingNames}
      existingNotes={existingNotes}
      buckets={buckets}
      onDateChange={handleDateChange}
      onSubmit={handleFormSubmit}
      onCancel={onCanceled}
      onCopy={onCopy}
      onDelete={deleteButton ? handleDelete : undefined}
      isLoading={isLoading}
    />
  )
}
