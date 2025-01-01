"use client"

import {
  DialogHeader,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { FilterX, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Bucket } from "@/lib/db/buckets"
import { format } from "date-fns"
import { useSearchParams, usePathname, useRouter } from "next/navigation"

export default function TransactionFilter({ buckets }: { buckets: Bucket[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)
  const [selected, setSelected] = useState<number | undefined>(undefined)

  const sortedBuckets = buckets.sort((a, b) => {
    if (a.year === b.year) {
      return b.month - a.month
    }
    return b.year - a.year
  })

  const handleFilterDialog = () => {
    setIsFilterDialogOpen(!isFilterDialogOpen)
  }

  const handleReset = () => {
    const newParams = new URLSearchParams(searchParams)
    newParams.delete("categoryId")
    router.push(`${pathname}?${newParams.toString()}`)
    handleFilterDialog()
    setSelected(undefined)
  }

  const handleSaved = () => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set("categoryId", selected?.toString() || "")
    newParams.set("month", sortedBuckets.find((b) => b.id === selected)?.month.toString() || "")
    newParams.set("year", sortedBuckets.find((b) => b.id === selected)?.year.toString() || "")
    router.push(`${pathname}?${newParams.toString()}`)
    handleFilterDialog()
  }

  return (
    <Dialog open={isFilterDialogOpen} onOpenChange={handleFilterDialog}>
      <DialogTrigger asChild>
        <Button variant={selected ? "secondary" : "outline"}>
          {selected ? <FilterX className="h-5 w-5" /> : <Filter className="h-5 w-5" />}
        </Button>
      </DialogTrigger>
      <DialogContent onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-center">Category Filter</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <Select onValueChange={(value) => setSelected(parseInt(value))} value={selected?.toString()}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent className="max-h-60 overflow-y-auto">
            {sortedBuckets.map((b) => (
              <SelectItem key={b.id} value={b.id.toString()}>
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex w-32 text-primary">{b.category}</div>
                  <div className="flex justify-end text-muted-foreground">
                    {format(new Date(b.year + "-" + b.month + "-15"), "MMMM yyyy")}
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex justify-end space-x-4">
          <Button onClick={handleSaved} variant="default" type="button">
            Save
          </Button>
          <Button onClick={handleFilterDialog} variant="secondary" type="button">
            Cancel
          </Button>
          <Button onClick={handleReset} variant="outline" type="button">
            Reset
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
