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
  Transaction,
} from "@/lib/db/transactions"
import { formatISO } from "date-fns"
import { useState, useEffect } from "react"
import { fetchBuckets, Bucket } from "@/lib/db/buckets"
import { transactionSchema } from "./transaction-form"
import TransactionForm, { TransactionFormValues } from "./transaction-form"

interface TransactionEditProps {
  onTransactionEdit: (() => void)[]
  onCanceled: () => void
  onCopy?: () => void
  isEditing?: boolean
  transactionId?: number
}

export default function TransactionEdit({
  onTransactionEdit,
  onCanceled,
  onCopy,
  isEditing = false,
  transactionId = undefined,
}: TransactionEditProps) {
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()

  const [isLoading, setIsLoading] = useState(false)
  const [loggedUserId, setLoggedUserId] = useState(undefined as string | undefined)
  const [buckets, setBuckets] = useState<Bucket[]>([])
  const [trxId, setTrxId] = useState(transactionId)
  const [trxData, setTrxData] = useState<Transaction>()
  const [defaultValues, setDefaultValues] = useState<TransactionFormValues>()
  const [existingNames, setExistingNames] = useState<string[]>([])
  const [existingNotes, setExistingNotes] = useState<string[]>([])
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(isEditing ? undefined : currentMonth)
  const [selectedYear, setSelectedYear] = useState<number | undefined>(isEditing ? undefined : currentYear)

  // set loggedUserId
  useEffect(() => {
    async function fetchUserId() {
      const { data: session } = await authClient.getSession()
      const userId = session?.user?.id || ""
      setLoggedUserId(userId)
    }
    fetchUserId()
  }, [])

  // Reset the buckets when the month or year changes
  useEffect(() => {
    async function fetch() {
      // return if undefined
      if (!loggedUserId || !selectedMonth || !selectedYear) return
      // Fetch buckets
      const bucketData = await fetchBuckets(loggedUserId, selectedMonth, selectedYear)
      setBuckets(bucketData)
    }
    fetch()
  }, [selectedMonth, selectedYear, loggedUserId])

  // Fetch transaction data if trxId is provided
  // and set the default values when the trxId changes
  useEffect(() => {
    async function initializeTransactionValues() {
      if (!loggedUserId || !trxId) return

      // Fetch transaction data
      if (trxData?.id !== trxId) {
        const transaction = await fetchTransaction(loggedUserId, trxId)
        if (!transaction) return

        setTrxData(transaction)
        // get date and set the month and year
        const date = new Date(transaction.date)
        await handleDateChange(date)
      }

      // Return if buckets are not fetched yet
      if (buckets.length === 0) return

      // Return if transaction data is not fetched
      if (!trxData) return

      // Set default values
      setDefaultValues({
        date: new Date(trxData.date),
        name: trxData.name,
        amount: trxData.amount.toString(),
        category: trxData.category ?? "",
        notes: trxData.notes,
      })
    }
    initializeTransactionValues()
  }, [trxId, loggedUserId, trxData, buckets.length])

  // Fetch existing names/notes for autocomplete
  useEffect(() => {
    async function getAutoCompleteData() {
      if (!loggedUserId) return
      // fetch after buckets are fetched
      if (buckets.length === 0) return
      const names = await fetchTransactionNames(loggedUserId)
      const notes = await fetchTransactionNotes(loggedUserId)
      setExistingNames(names)
      setExistingNotes(notes)
    }
    getAutoCompleteData()
  }, [loggedUserId, buckets.length])

  async function handleFormSubmit(values: z.infer<typeof transactionSchema>) {
    if (!loggedUserId) return
    setIsLoading(true)
    try {
      const transactionData = {
        ...values,
        id: trxId,
        userId: loggedUserId,
        amount: Number(parseFloat(values.amount).toFixed(2)),
        date: formatISO(values.date),
        category_id: buckets.find((b) => b.category === values.category)?.id || 0,
      }
      const check = await checkMatchingMonthYear(loggedUserId, transactionData.category_id, values.date)
      if (!check) {
        throw new Error("Category does not match the month and year of the transaction")
      }
      if (trxId) {
        await updateTransaction(loggedUserId, trxId, transactionData)
      } else {
        await addTransaction(transactionData)
      }
      onTransactionEdit.forEach((cb) => cb())
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDateChange(date: Date) {
    setSelectedMonth(date.getMonth() + 1)
    setSelectedYear(date.getFullYear())
  }

  async function handleDelete() {
    if (!loggedUserId) return
    if (!trxId) return
    setIsLoading(true)
    try {
      await deleteTransaction(loggedUserId, trxId)
      onCanceled()
      onTransactionEdit.forEach((cb) => cb())
    } finally {
      setIsLoading(false)
      setTrxId(undefined)
    }
  }

  async function handleCopy() {
    setTrxId(undefined)
    setSelectedMonth(currentMonth)
    setSelectedYear(currentYear)
    onCopy?.()
  }

  async function handleCancel() {
    setTrxId(undefined)
    onCanceled?.()
  }

  return (
    <TransactionForm
      defaultValues={defaultValues}
      existingNames={existingNames}
      existingNotes={existingNotes}
      buckets={buckets}
      onDateChange={handleDateChange}
      onSubmit={handleFormSubmit}
      onCancel={handleCancel}
      onCopy={isEditing ? handleCopy : undefined}
      onDelete={isEditing ? handleDelete : undefined}
      isLoading={isLoading}
    />
  )
}
