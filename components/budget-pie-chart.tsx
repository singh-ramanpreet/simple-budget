"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Pie, PieChart, Cell, Tooltip, ResponsiveContainer } from "recharts"

import { fetchBuckets, Bucket } from "@/lib/db/buckets"
import { percentage, buckets_total_amount, stringToColor } from "@/lib/utils"
import dynamic from "next/dynamic"

function CustomPieChart({ buckets, totalAmount }: { buckets: Bucket[]; totalAmount: number }) {
  return (
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
            <Cell key={`cell-${bucket.category}`} fill={stringToColor(bucket.category)} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} labelFormatter={(category) => `${category}`} />
      </PieChart>
    </ResponsiveContainer>
  )
}

const CustomPieChartDynamic = dynamic(() => Promise.resolve(CustomPieChart))

export default function BudgetPieChart({ userId }: { userId: string }) {
  const today = new Date()
  const [buckets, setBuckets] = useState<Bucket[]>([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [currentDate, setCurrentDate] = useState(today)
  const [filterMonth, setFilterMonth] = useState(today.getMonth() + 1)
  const [filterYear, setFilterYear] = useState(today.getFullYear())

  useEffect(() => {
    async function initializeData() {
      try {
        const result = await fetchBuckets(userId, filterMonth, filterYear)
        setBuckets(result)
        setTotalAmount(buckets_total_amount(result))
      } catch (error) {
        console.error(error)
      }
    }
    initializeData()
  }, [filterMonth, filterYear, userId])

  const navigateMonth = (delta: number) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() + delta)
      setFilterMonth(newDate.getMonth() + 1)
      setFilterYear(newDate.getFullYear())
      return newDate
    })
  }

  return (
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
        <CustomPieChartDynamic buckets={buckets} totalAmount={totalAmount} />
      ) : (
        <p className="text-muted-foreground">No data available for this period</p>
      )}
    </div>
  )
}
