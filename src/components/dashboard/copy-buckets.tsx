import { useMemo, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon } from "@hugeicons/core-free-icons"
import { TransactionFooter } from "./transaction-footer"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useFileHandle } from "@/components/providers/file-handle-provider"
import { isLimitRecord, parseLocalDate, toRecord } from "@/components/dashboard/types"

interface CopyBucketsProps {
  month: number
  year: number
}

export default function CopyBuckets({ month, year }: CopyBucketsProps) {
  const { data, setData } = useFileHandle()
  const [open, setOpen] = useState(false)

  // Calculate previous month names for the UI
  const currentMonthName = new Date(year, month - 1).toLocaleString("default", { month: "long" })
  let prevMonth = month - 1
  let prevYear = year
  if (prevMonth === 0) {
    prevMonth = 12
    prevYear -= 1
  }
  const prevMonthName = new Date(prevYear, prevMonth - 1).toLocaleString("default", { month: "long" })

  const categoriesToCopy = useMemo(() => {
    const records = data.map(toRecord)

    // 1. Find buckets in previous month
    const prevBuckets = records.filter((r) => {
      if (!isLimitRecord(r)) return false
      const d = parseLocalDate(r.date)
      return d.month === prevMonth && d.year === prevYear
    })

    if (prevBuckets.length === 0) return []

    // 2. Find buckets already in current month (to avoid duplicates)
    const currentCategories = new Set(
      records
        .filter((r) => {
          if (!isLimitRecord(r)) return false
          const d = parseLocalDate(r.date)
          return d.month === month && d.year === year
        })
        .map((r) => r.category)
    )

    // 3. Return categories that are in prev but NOT in current
    return prevBuckets.filter((pb) => !currentCategories.has(pb.category))
  }, [data, prevMonth, prevYear, month, year])

  const handleCopy = async () => {
    if (categoriesToCopy.length === 0) return

    const newRecords = categoriesToCopy.map((pb) => ({
      ...pb,
      date: `${year}-${String(month).padStart(2, "0")}-01`,
    }))

    await setData([...data, ...newRecords])
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="w-full">
        <Button variant="outline" size="lg" className="w-full">
          <HugeiconsIcon icon={Copy01Icon} />
          Copy Buckets
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Copy Buckets</DialogTitle>
          <DialogDescription>
            This will copy budget categories and limits from{" "}
            <strong>
              {prevMonthName} {prevYear}
            </strong>{" "}
            into{" "}
            <strong>
              {currentMonthName} {year}
            </strong>
            .
          </DialogDescription>
        </DialogHeader>

        <div className="my-4">
          {categoriesToCopy.length > 0 ? (
            <>
              <p className="mb-2 text-sm font-semibold text-zinc-400">The following buckets will be added:</p>
              <div className="max-h-40 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
                <ul className="flex flex-col gap-2 text-sm">
                  {categoriesToCopy.map((bucket) => (
                    <li key={bucket.category} className="flex items-center justify-between gap-2 text-zinc-300">
                      <span className="truncate">{bucket.category}</span>
                      <span className="font-mono text-zinc-500">${parseFloat(bucket.category_limit).toFixed(0)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 text-center">
              <p className="text-sm text-zinc-400 italic">No new buckets to copy from {prevMonthName}.</p>
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleCopy()
          }}
        >
          <TransactionFooter
            saveLabel="Continue"
            onCancel={() => setOpen(false)}
            isSaveDisabled={categoriesToCopy.length === 0}
          />
        </form>
      </DialogContent>
    </Dialog>
  )
}
