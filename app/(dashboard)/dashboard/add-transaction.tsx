"use client"

import { authClient } from "@/lib/auth/client"
import * as z from "zod"
import { addTransaction, deleteTransaction, fetchTransactionNames, fetchTransactionNotes } from "@/lib/db/transactions"
import { format } from "date-fns"
import { useState, useEffect } from "react"
import { fetchBuckets, Bucket } from "@/lib/db/buckets"
import { transactionSchema } from "./transaction-form"
import TransactionForm from "./transaction-form"

interface AddTransactionProps {
  onAddTransaction: (() => void)[]
  onCanceled: () => void
  deleteButton?: boolean
  transactionId?: number
}

export default function AddTransaction({
  onAddTransaction,
  onCanceled,
  deleteButton = false,
  transactionId = 0,
}: AddTransactionProps) {
  const [loggedUserId, setLoggedUserId] = useState("")
  const [buckets, setBuckets] = useState<Bucket[]>([])
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
    }
    initializeData()
  }, [selectedMonth, selectedYear])

  const defaultValues = {
    date: new Date(),
    name: "",
    amount: "",
    category: "",
    notes: "",
  }

  async function handleFormSubmit(values: z.infer<typeof transactionSchema>) {
    await addTransaction({
      ...values,
      id: transactionId,
      userId: loggedUserId,
      amount: parseFloat(values.amount),
      date: format(values.date, "yyyy-MM-dd"),
      category_id: buckets.find((b) => b.category === values.category)?.id || 0,
    })
    onAddTransaction.forEach((cb) => cb())
  }

  async function handleDateChange(date: Date) {
    setSelectedMonth(date.getUTCMonth() + 1)
    setSelectedYear(date.getUTCFullYear())
  }

  async function handleDelete() {
    await deleteTransaction(transactionId, loggedUserId)
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
      onDelete={deleteButton ? handleDelete : undefined}
    />
  )
}
