"use server"

import { revalidatePath } from "next/cache"
import { BucketFormSchema, TransactionSchema } from "./schema"
import {
  addTransaction,
  TransactionInsert,
  checkMatchingMonthYear,
  deleteTransaction,
  updateTransaction,
} from "@/lib/db/transactions"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { DASHBOARD_PATH } from "@/lib/constants"
import { addBucket, BucketInsert, deleteBucket, updateBucket } from "./db/buckets"
import { getNewDate } from "./utils"

type SaveTransactionState = {
  message: string
  success: boolean
}

export async function getUserId() {
  const session = await auth.api.getSession({
    headers: await headers(),
    query: { disableCookieCache: true },
  })
  return session?.session?.userId
}

export async function parseSearchParams(query: { [key: string]: string | undefined }, loggedUserId?: string) {
  const currentDate = await getNewDate(loggedUserId!)
  // get month, default to current month
  const month = query?.month ? parseInt(query.month) : currentDate.getMonth() + 1
  // get year, default to current year
  const year = query?.year ? parseInt(query.year) : currentDate.getFullYear()
  // get category id, default to undefined
  const categoryId = query?.categoryId ? parseInt(query.categoryId) : undefined
  // get current page, default to 1
  const page = query?.page ? parseInt(query.page) : 1
  // items per page, default to 10
  const pageSize = query?.pageSize ? parseInt(query.pageSize) : 10

  return { month, year, categoryId, page, pageSize }
}

export async function handleSaveTransaction(prevState: SaveTransactionState, formData: FormData) {
  const data = Object.fromEntries(formData.entries())
  const dt = new Date(data.date.toString())
  const parse = TransactionSchema.safeParse({
    ...data,
    date: dt,
    amount: parseFloat(data.amount.toString()).toFixed(2),
  })
  if (!parse.success) {
    return { message: "Validation Failed", success: false }
  }

  const parsedData = parse.data

  const loggedUserId = await getUserId()

  const trx: TransactionInsert = {
    date: data.date.toString(),
    userId: loggedUserId!,
    category_id: parseInt(parsedData.category_id),
    amount: parseFloat(parsedData.amount),
    name: parsedData.name,
    notes: parsedData.notes,
    ...(parsedData.transactionId ? { id: parseInt(parsedData.transactionId) } : {}),
  }

  // check if category id has same month and year of the transaction being added/updated
  const check = await checkMatchingMonthYear(loggedUserId!, trx.category_id, dt)
  if (!check) {
    return { message: "Category does not match the month and year of the transaction", success: false }
  }

  // add transaction
  try {
    const trxId = parseInt(parsedData.transactionId as string)
    if (isNaN(trxId)) {
      await addTransaction(trx)
    } else {
      await updateTransaction(loggedUserId!, trxId, trx)
    }
    revalidatePath(DASHBOARD_PATH, "page")
    return { message: "Saved", success: true }
  } catch {
    return { message: "Unable to save", success: false }
  }
}

type DeleteTransactionState = {
  message: string
  success: boolean
}

export async function handleDeleteTransaction(prevState: DeleteTransactionState, formData: FormData) {
  const data = Object.fromEntries(formData.entries())
  const session = await auth.api.getSession({
    headers: await headers(),
    query: { disableCookieCache: false },
  })
  const loggedUserId = session?.session?.userId

  try {
    await deleteTransaction(loggedUserId!, parseInt(data.transactionId.toString()))
    revalidatePath(DASHBOARD_PATH, "page")
    return { message: "Deleted", success: true }
  } catch {
    return { message: "Unable to delete", success: false }
  }
}

type SaveBucketState = {
  message: string
  success: boolean
}

export async function handleSaveBucket(prevState: SaveBucketState, formData: FormData) {
  const data = Object.fromEntries(formData.entries())
  const loggedUserId = await getUserId()
  const parse = BucketFormSchema.safeParse({
    month: parseInt(data.month.toString()),
    year: parseInt(data.year.toString()),
    amount: parseFloat(parseFloat(data.amount.toString()).toFixed(2)),
    category: data.category.toString(),
    category_id: data.category_id.toString(),
  })
  if (!parse.success) {
    console.log(parse.error)
    return { message: "Validation Failed", success: false }
  }

  const parsedData = parse.data
  const bucket: BucketInsert = {
    month: parsedData.month,
    year: parsedData.year,
    amount: parsedData.amount,
    category: parsedData.category,
    userId: loggedUserId!,
    ...(parsedData.category_id ? { id: parseInt(parsedData.category_id) } : {}),
  }

  // add transaction
  try {
    const bucketId = parseInt(parsedData.category_id as string)
    if (isNaN(bucketId)) {
      await addBucket(bucket)
    } else {
      await updateBucket(loggedUserId!, bucketId, bucket)
    }
    revalidatePath(DASHBOARD_PATH, "page")
    return { message: "Saved", success: true }
  } catch {
    return { message: "Unable to save", success: false }
  }
}

type DeleteBucketState = {
  message: string
  success: boolean
}

export async function handleDeleteBucket(prevState: DeleteBucketState, formData: FormData) {
  const data = Object.fromEntries(formData.entries())
  const loggedUserId = await getUserId()

  try {
    await deleteBucket(loggedUserId!, parseInt(data.category_id.toString()))
    revalidatePath(DASHBOARD_PATH, "page")
    return { message: "Deleted", success: true }
  } catch {
    return { message: "Unable to delete", success: false }
  }
}
