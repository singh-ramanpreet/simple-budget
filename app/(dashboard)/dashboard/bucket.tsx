"use client"

import { Bucket } from "@/lib/db/buckets"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useState } from "react"
import AddBucket from "./add-bucket"

interface BucketProps {
  bucket: Bucket
  OnEditBucket: (() => void)[]
}

export default function BucketItem({ bucket, OnEditBucket }: BucketProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <li
          onClick={() => setDialogOpen(true)}
          className="group flex cursor-pointer items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted"
        >
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-medium text-primary">{bucket.category}</h3>
            </div>
            <div className="w-[20%] flex-shrink-0 text-right">
              <span className="font-medium text-muted-foreground">${Math.abs(bucket.amount).toFixed(2)}</span>
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
