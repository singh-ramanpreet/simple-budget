"use client"

import { useState, useEffect } from "react"
import { authClient } from "@/lib/auth/client"
import { addBucket, deleteBucket, updateBucket, fetchBucket } from "@/lib/db/buckets"
import BucketForm, { BucketFormValues } from "./bucket-form"

interface AddBucketProps {
  bucketId?: number
  onAddBucket: (() => void)[]
  onCanceled: () => void
  deleteButton?: boolean
}

export default function AddBucket({ bucketId, onAddBucket, onCanceled, deleteButton }: AddBucketProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [loggedUserId, setLoggedUserId] = useState("")
  const [defaultValues, setDefaultValues] = useState<BucketFormValues>()

  useEffect(() => {
    const loadBucket = async () => {
      const { data: session } = await authClient.getSession()
      const userId = session?.user?.id || ""
      setLoggedUserId(userId)
      if (!userId) return

      if (!bucketId) return
      const bucket = await fetchBucket(userId, bucketId)
      if (bucket) {
        setDefaultValues({
          category: bucket.category,
          amount: bucket.amount,
          month: bucket.month,
          year: bucket.year,
        })
      }
    }
    loadBucket()
  }, [bucketId])

  async function onSubmit(values: BucketFormValues) {
    setIsLoading(true)
    try {
      const bucketData = {
        category: values.category,
        amount: Number(values.amount.toFixed(2)),
        month: values.month,
        year: values.year,
        userId: loggedUserId,
      }

      if (bucketId) {
        await updateBucket(loggedUserId, bucketId, bucketData)
      } else {
        await addBucket(bucketData)
      }

      onAddBucket.forEach((callback) => callback())
      onCanceled()
    } finally {
      setIsLoading(false)
    }
  }

  async function onDelete() {
    if (!bucketId) return
    setIsLoading(true)
    try {
      await deleteBucket(loggedUserId, bucketId)
      onAddBucket.forEach((callback) => callback())
      onCanceled()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <BucketForm
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      onDelete={deleteButton ? onDelete : undefined}
      onCancel={onCanceled}
      isLoading={isLoading}
    />
  )
}
