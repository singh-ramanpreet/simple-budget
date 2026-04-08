import { Calendar01Icon, Chart01Icon, FilterIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { createFileRoute } from "@tanstack/react-router"
import { BarController, BarElement, CategoryScale, Chart, Legend, LinearScale, Title, Tooltip } from "chart.js"
import { useEffect, useMemo, useRef, useState } from "react"

import { useFileHandle } from "@/components/providers/file-handle-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { isLimitRecord, toRecord } from "@/components/dashboard/types"

// Register Chart.js components
Chart.register(BarController, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export const Route = createFileRoute("/charts")({
  component: ChartsPage,
})

function ChartsPage() {
  const { data, fileHandle, hasPermission } = useFileHandle()
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  const [viewType, setViewType] = useState<"total" | "category">("total")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [timeRange, setTimeRange] = useState<"3" | "6" | "12">("6")

  const records = useMemo(() => data.map(toRecord), [data])

  const categories = useMemo(() => {
    const cats = new Set<string>()
    records.forEach((r) => {
      if (r.category) cats.add(r.category)
    })
    return Array.from(cats).sort()
  }, [records])

  // Set default category if none selected
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0])
    }
  }, [categories, selectedCategory])

  const chartData = useMemo(() => {
    const now = new Date()
    const monthsToShow = parseInt(timeRange)
    const labels: Array<string> = []
    const spentData: Array<number> = []

    // Map of YYYY-MM to spent amount
    const monthlySpent: Record<string, number> = {}

    // Generate last N months labels
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const label = d.toLocaleString("default", { month: "short", year: "2-digit" })
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      labels.push(label)
      monthlySpent[key] = 0
    }

    // Process records
    records.forEach((r) => {
      if (isLimitRecord(r)) return
      const amount = parseFloat(r.amount)
      if (isNaN(amount) || amount <= 0) return

      // Basic validation for date YYYY-MM-DD
      const dateParts = r.date.split("-")
      if (dateParts.length < 2) return

      const yearMonth = `${dateParts[0]}-${dateParts[1]}`
      if (yearMonth in monthlySpent) {
        if (viewType === "total" || r.category === selectedCategory) {
          monthlySpent[yearMonth] += amount
        }
      }
    })

    // Populate data array in label order
    Object.keys(monthlySpent)
      .sort()
      .forEach((key) => {
        spentData.push(monthlySpent[key])
      })

    return {
      labels,
      datasets: [
        {
          label: viewType === "total" ? "Total Spent" : `Spent on ${selectedCategory}`,
          data: spentData,
          backgroundColor: "rgba(59, 130, 246, 0.6)", // blue-500
          borderColor: "rgb(59, 130, 246)",
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    }
  }, [records, viewType, selectedCategory, timeRange])

  useEffect(() => {
    if (!chartRef.current) return

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                let label = context.dataset.label || ""
                if (label) label += ": "
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(context.parsed.y)
                }
                return label
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => {
                return new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumSignificantDigits: 3,
                }).format(value as number)
              },
            },
          },
        },
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [chartData])

  const viewTypeItems = [
    { label: "Total Spent", value: "total" },
    { label: "By Category", value: "category" },
  ]

  const categoryItems = useMemo(() => categories.map((cat) => ({ label: cat, value: cat })), [categories])

  const timeRangeItems = [
    { label: "Last 3 Months", value: "3" },
    { label: "Last 6 Months", value: "6" },
    { label: "Last 12 Months", value: "12" },
  ]

  if (!fileHandle || !hasPermission) {
    return (
      <div className="flex flex-col space-y-4 py-4">
        <Card>
          <CardContent className="text-muted-foreground pt-6 text-center italic">
            Please connect a file on the Home or Settings page to view charts.
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-4 py-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Filter Selection */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <HugeiconsIcon icon={FilterIcon} size={20} className="text-muted-foreground" />
            <span className="text-muted-foreground text-sm font-medium tracking-wider">View Options</span>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 pt-2">
            <div className="space-y-2">
              <label className="text-muted-foreground/70 text-xs font-semibold tracking-tight">Display Mode</label>
              <Select items={viewTypeItems} value={viewType} onValueChange={(v) => v && setViewType(v as any)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select view type" />
                </SelectTrigger>
                <SelectContent>
                  {viewTypeItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {viewType === "category" && (
              <div className="space-y-2">
                <label className="text-muted-foreground/70 text-xs font-semibold tracking-tight">Category</label>
                <Select
                  items={categoryItems}
                  value={selectedCategory}
                  onValueChange={(v) => v && setSelectedCategory(v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Time Selection */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <HugeiconsIcon icon={Calendar01Icon} size={20} className="text-muted-foreground" />
            <span className="text-muted-foreground text-sm font-medium tracking-wider">Time Range</span>
          </CardHeader>
          <CardContent className="space-y-2 pt-2">
            <label className="text-muted-foreground/70 text-xs font-semibold tracking-tight">Period</label>
            <Select items={timeRangeItems} value={timeRange} onValueChange={(v) => v && setTimeRange(v as any)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                {timeRangeItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <HugeiconsIcon icon={Chart01Icon} size={24} />
          <CardTitle>Spending Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-[400px] w-full pt-4">
            <canvas ref={chartRef} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
