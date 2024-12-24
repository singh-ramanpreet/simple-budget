"use client"

import { BucketWithSum } from "./list-buckets"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { useState } from "react"
import AddBucket from "./add-bucket"

interface BucketProps {
  bucket: BucketWithSum
  OnEditBucket: (() => void)[]
}

export default function BucketItem({ bucket, OnEditBucket }: BucketProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  function percentage(spent: number | undefined, total: number) {
    return ((spent ?? 0) / total) * 100
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <li
          onClick={() => setDialogOpen(true)}
          className="group flex cursor-pointer items-center justify-between rounded-lg px-4 py-3 transition-colors hover:bg-muted/50"
        >
          <div className="flex h-12 w-full items-center justify-between gap-2">
            <div className="h-full w-20 align-top">
              <h3 className="truncate text-primary">{bucket.category}</h3>
            </div>
            <div className="h-full flex-1">
              <Progress
                value={percentage(bucket.transactions_sum, bucket.amount)}
                max={1}
                className="h-4 text-red-400"
              />
              <div className="mt-1 flex justify-between text-sm text-muted-foreground">
                <span>{percentage(bucket.transactions_sum, bucket.amount).toFixed(1)}%</span>
                <span>${bucket.amount.toFixed(2)}</span>
              </div>
            </div>
            <div className="h-full w-20 text-right align-top">
              <span className="text-muted-foreground">${Math.abs(bucket.transactions_sum ?? 0).toFixed(2)}</span>
            </div>
          </div>
        </li>
      </DialogTrigger>
      <DialogContent
        onOpenAutoFocus={(e) => {
          e.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-center">Edit Budget Bucket</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <AddBucket
          bucketId={bucket.id}
          onAddBucket={OnEditBucket}
          onCanceled={() => setDialogOpen(false)}
          deleteButton={true}
        />
      </DialogContent>
    </Dialog>
  )
}
