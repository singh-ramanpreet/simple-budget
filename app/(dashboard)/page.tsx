"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, ListOrdered } from "lucide-react"
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

export default function Dashboard() {
  const [refreshTransactions, setRefreshTransactions] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleDialog = () => {
    setIsDialogOpen(!isDialogOpen)
  }

  const handleRefresh = () => {
    setRefreshTransactions(!refreshTransactions)
  }

  return (
    <div className="flex flex-col items-center space-y-4 py-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center space-y-4 p-4">
          <Dialog open={isDialogOpen} onOpenChange={handleDialog}>
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
              <AddTransaction onAddTransaction={[handleRefresh, handleDialog]} onCanceled={handleDialog} />
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListOrdered className="h-5 w-5 text-muted-foreground" />
            <span>Transactions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ListTransactions refresh={refreshTransactions} OnEditTransaction={[handleRefresh]} />
        </CardContent>
      </Card>
    </div>
  )
}
