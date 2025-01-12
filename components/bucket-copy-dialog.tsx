"use client"

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import BucketCopy from "./bucket-copy"
import { useState } from "react"
import { Import } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { DASHBOARD_PATH } from "@/lib/constants"

export default function BucketCopyDialog() {
  const [isCopyDialogOpen, setCopyDialogOpen] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleCopyDialog = () => {
    setCopyDialogOpen(!isCopyDialogOpen)
    router.replace(`${DASHBOARD_PATH}?${searchParams}`)
  }

  const handleBucketsRefresh = () => {
    setCopyDialogOpen(false)
    router.replace(`${DASHBOARD_PATH}?${searchParams}`)
  }

  return (
    <Dialog open={isCopyDialogOpen} onOpenChange={handleCopyDialog}>
      <DialogTrigger asChild>
        <Button>
          <Import className="h-5 w-5 text-muted-foreground" />
          Copy Buckets
        </Button>
      </DialogTrigger>
      <DialogContent
        onPointerDownOutside={(e) => {
          e.preventDefault()
        }}
        onOpenAutoFocus={(e) => {
          e.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-center">Copy Buckets</DialogTitle>
          <DialogDescription className="text-center">Copy buckets from the previous month.</DialogDescription>
        </DialogHeader>
        <BucketCopy onClose={handleCopyDialog} onCopy={handleBucketsRefresh} />
      </DialogContent>
    </Dialog>
  )
}
