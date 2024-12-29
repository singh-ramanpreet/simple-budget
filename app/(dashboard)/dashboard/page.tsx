"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, ListOrdered, PaintBucket, Import, RotateCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import TransactionsList from "@/components/transactions-list"
import TransactionEdit from "@/components/transaction-edit"
import TransactionFilter from "@/components/transaction-filter"
import BucketsList from "@/components/buckets-list"
import BucketEdit from "@/components/bucket-edit"
import BucketCopy from "@/components/bucket-copy"

export default function Dashboard() {
  const [refreshTransactions, setRefreshTransactions] = useState(false)
  const [refreshBuckets, setRefreshBuckets] = useState(false)
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false)
  const [isBucketDialogOpen, setIsBucketDialogOpen] = useState(false)
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false)
  const [transactionCategoryIdFilter, setTransactionCategoryIdFilter] = useState<number | undefined>(undefined)
  const [transactionCategoryMonthFilter, setTransactionCategoryMonthFilter] = useState<number | undefined>(undefined)
  const [transactionCategoryYearFilter, setTransactionCategoryYearFilter] = useState<number | undefined>(undefined)

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

  const handleFilterTransaction = (category: number, year: number | undefined, month: number | undefined) => {
    setTransactionCategoryIdFilter(category)
    setTransactionCategoryYearFilter(year)
    setTransactionCategoryMonthFilter(month)
  }

  const handleResetTransactionFilter = () => {
    setTransactionCategoryIdFilter(undefined)
    setTransactionCategoryYearFilter(undefined)
    setTransactionCategoryMonthFilter(undefined)
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
              <TransactionEdit
                onTransactionEdit={[handleTransactionsRefresh, handleTransactionDialog]}
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
            <div className="flex items-center gap-2">
              <TransactionFilter onSave={handleFilterTransaction} onReset={handleResetTransactionFilter} />
              <Button onClick={handleTransactionsRefresh} className="ml-2" variant="outline">
                <RotateCw className="h-5 w-5" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionsList
            refresh={refreshTransactions}
            OnEditTransaction={[handleTransactionsRefresh]}
            month={transactionCategoryMonthFilter}
            year={transactionCategoryYearFilter}
            categoryId={transactionCategoryIdFilter}
          />
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
          <BucketsList refresh={refreshBuckets} OnEditBucket={[handleBucketsRefresh]} />
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
                  <BucketEdit
                    onBucketEdit={[handleBucketsRefresh, handleBucketDialog]}
                    onCanceled={handleBucketDialog}
                  />
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
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
