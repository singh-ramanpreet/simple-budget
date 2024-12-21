"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, ListOrdered } from "lucide-react"
import ListTransactions from "./dashboard/list-transactions"
import AddTransaction from "./dashboard/add-transaction"

export default function Dashboard() {
  const [refreshTransactions, setRefreshTransactions] = useState(false)

  const handleRefresh = () => {
    setRefreshTransactions(!refreshTransactions)
  }

  return (
    <div className="flex flex-col items-center space-y-4 py-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-muted-foreground" />
            <span>New Transaction</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AddTransaction onAddTransaction={handleRefresh} />
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
          <ListTransactions refresh={refreshTransactions} />
        </CardContent>
      </Card>
    </div>
  )
}
