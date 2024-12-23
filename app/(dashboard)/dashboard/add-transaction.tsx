"use client"

import { authClient } from "@/lib/auth/client"
import * as z from "zod"
import {
  addTransaction,
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
  const [loggedUserId, setLoggedUserId] = useState("")
  const [buckets, setBuckets] = useState<Bucket[]>([])
  const [defaultValues, setDefaultValues] = useState<TransactionFormValues>()
  const [existingNames, setExistingNames] = useState<string[]>([])
  const [existingNotes, setExistingNotes] = useState<string[]>([])
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear())

  useEffect(() => {
    async function initializeData() {
      const { data: session } = await authClient.getSession()
      const userId = session?.user?.id || ""
      setLoggedUserId(userId)

      if (userId) {
        const [bucketData, names, notes] = await Promise.all([
          fetchBuckets(userId, selectedMonth, selectedYear),
          fetchTransactionNames(userId),
          fetchTransactionNotes(userId),
        ])
        setBuckets(bucketData)
        setExistingNames(names)
        setExistingNotes(notes)
      }
      if (transactionId) {
        const transaction = await fetchTransaction(userId, transactionId)
        if (transaction) {
          setDefaultValues({
            date: new Date(transaction.budget_transactions.date),
            name: transaction.budget_transactions.name,
            amount: transaction.budget_transactions.amount.toString(),
            category: transaction.budget_buckets?.category ?? "",
            notes: transaction.budget_transactions.notes,
          })
        }
      }
    }
    initializeData()
  }, [selectedMonth, selectedYear, transactionId])

  async function handleFormSubmit(values: z.infer<typeof transactionSchema>) {
    try {
      const transactionData = {
        ...values,
        id: transactionId,
        userId: loggedUserId,
        amount: parseFloat(values.amount),
        date: formatISO(values.date),
        category_id: buckets.find((b) => b.category === values.category)?.id || 0,
      }

      if (transactionId) {
        await updateTransaction(loggedUserId, transactionId, transactionData)
      } else {
        await addTransaction(transactionData)
      }
    } catch (error) {
      console.error("Error adding transaction", error)
    }
    onAddTransaction.forEach((cb) => cb())
  }

  async function handleDateChange(date: Date) {
    setSelectedMonth(date.getMonth() + 1)
    setSelectedYear(date.getFullYear())
  }

  async function handleDelete() {
    if (!transactionId) return
    await deleteTransaction(loggedUserId, transactionId)
    onCanceled()
    onAddTransaction.forEach((cb) => cb())
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
    />
  )
}
