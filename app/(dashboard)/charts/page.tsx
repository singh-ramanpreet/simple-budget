"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Pie, PieChart, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// import { ChartConfig, ChartContainer } from "@/components/ui/chart"
import { authClient } from "@/lib/auth/client"
import { fetchBuckets, Bucket } from "@/lib/db/buckets"
import { percentage, buckets_total_amount } from "../dashboard/list-buckets"

// Remove the static COLORS array and add this function
function stringToColor(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const color = Math.floor(Math.abs(Math.sin(hash) * 16777215))
  return `#${color.toString(16).padStart(6, "0")}`
}

export default function Component() {
  const today = new Date()
  const [buckets, setBuckets] = useState<Bucket[]>([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [currentDate, setCurrentDate] = useState(today)
  const [filterMonth, setFilterMonth] = useState(today.getMonth() + 1)
  const [filterYear, setFilterYear] = useState(today.getFullYear())

  useEffect(() => {
    async function initializeData() {
      try {
        const { data: session } = await authClient.getSession()
        const userId = session?.user?.id || ""
        if (!userId) {
          return
        }
        const result = await fetchBuckets(userId, filterMonth, filterYear)
        setBuckets(result)
        setTotalAmount(buckets_total_amount(result))
      } catch (error) {
        console.error(error)
      }
    }
    initializeData()
  }, [filterMonth, filterYear])

  const navigateMonth = (delta: number) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() + delta)
      setFilterMonth(newDate.getMonth() + 1)
      setFilterYear(newDate.getFullYear())
      return newDate
    })
  }

  // Add this function to maintain consistent colors
  const getCategoryColor = (category: string) => {
    return stringToColor(category)
  }

  return (
    <div className="flex flex-col items-center space-y-4 py-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex items-center justify-between gap-2">
          <CardTitle>Buckets Distribution</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4 p-4">
          <div className="flex h-[300px] w-full flex-col items-center">
            <div className="mb-4 flex w-full items-center justify-between">
              <button onClick={() => navigateMonth(-1)} className="rounded-full p-2 hover:bg-muted">
                <ChevronLeft className="h-5 w-5 text-muted-foreground" />
              </button>
              <h2 className="text-lg font-medium">
                {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
              </h2>
              <button onClick={() => navigateMonth(1)} className="rounded-full p-2 hover:bg-muted">
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            {buckets.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={buckets}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ category, amount }) => `${category} - ${percentage(amount, totalAmount).toFixed(1)}%`}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="amount"
                    nameKey="category"
                  >
                    {buckets.map((bucket) => (
                      <Cell key={`cell-${bucket.category}`} fill={getCategoryColor(bucket.category)} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `$${Number(value).toFixed(2)}`}
                    labelFormatter={(category) => `${category}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground">No data available for this period</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
