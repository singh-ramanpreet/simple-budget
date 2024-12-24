"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, ListOrdered, PaintBucket, Import, RotateCw } from "lucide-react"
import ListTransactions from "./dashboard/list-transactions"
import AddTransaction from "./dashboard/add-transaction"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import ListBuckets from "./dashboard/list-buckets"
import AddBucket from "./dashboard/add-bucket"

export default function Dashboard() {
  const [refreshTransactions, setRefreshTransactions] = useState(false)
  const [refreshBuckets, setRefreshBuckets] = useState(false)
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false)
  const [isBucketDialogOpen, setIsBucketDialogOpen] = useState(false)
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false)

  const handleTransactionDialog = () => {
    setIsTransactionDialogOpen(!isTransactionDialogOpen)
  }

  async function handleBucketDialog() {
    setIsBucketDialogOpen(!isBucketDialogOpen)
  }

  async function handleCopyDialog() {
    setIsCopyDialogOpen(!isCopyDialogOpen)
  }

  const handleTransactionsRefresh = () => {
    setRefreshTransactions(!refreshTransactions)
  }

  const handleBucketsRefresh = () => {
    setRefreshBuckets(!refreshBuckets)
  }

  return (
    <div className="flex flex-col items-center space-y-4 py-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center space-y-4 p-4">
          <Dialog open={isTransactionDialogOpen} onOpenChange={handleTransactionDialog}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="h-5 w-5 opacity-50" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent
              onPointerDownOutside={(e) => {
                e.preventDefault()
              }}
            >
              <DialogHeader>
                <DialogTitle className="text-center">New Transaction</DialogTitle>
                <DialogDescription></DialogDescription>
              </DialogHeader>
              <AddTransaction
                onAddTransaction={[handleTransactionsRefresh, handleTransactionDialog]}
                onCanceled={handleTransactionDialog}
              />
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ListOrdered className="h-5 w-5 text-muted-foreground" />
              <span>Transactions</span>
            </div>
            <Button onClick={handleTransactionsRefresh} className="ml-2" variant="outline">
              <RotateCw className="h-5 w-5" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ListTransactions refresh={refreshTransactions} OnEditTransaction={[handleTransactionsRefresh]} />
        </CardContent>
      </Card>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <PaintBucket className="h-5 w-5 text-muted-foreground" />
              <span>Buckets</span>
            </div>
            <Button onClick={handleBucketsRefresh} className="ml-2" variant="outline">
              <RotateCw className="h-5 w-5" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ListBuckets refresh={refreshBuckets} OnEditBucket={[handleBucketsRefresh]} />
        </CardContent>
      </Card>
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center space-y-4 p-4">
          <div className="flex gap-8">
            <div>
              <Dialog open={isBucketDialogOpen} onOpenChange={handleBucketDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="h-5 w-5 opacity-50" />
                    Add Bucket
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
                    <DialogTitle className="text-center">New Bucket</DialogTitle>
                    <DialogDescription className="text-center">
                      Create a new bucket to categorize your transactions.
                    </DialogDescription>
                  </DialogHeader>
                  <AddBucket onAddBucket={[handleBucketsRefresh, handleBucketDialog]} onCanceled={handleBucketDialog} />
                </DialogContent>
              </Dialog>
            </div>
            <div>
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
                >
                  <DialogHeader>
                    <DialogTitle className="text-center">Copy Buckets</DialogTitle>
                    <DialogDescription className="text-center">
                      Copy buckets from the previous month to the current month.
                    </DialogDescription>
                  </DialogHeader>
                  {/* <AddBucket onAddBucket={[handleRefresh, handleDialog]} onCanceled={handleDialog} /> */}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
