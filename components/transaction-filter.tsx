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
import { useEffect, useState } from "react"
import { authClient } from "@/lib/auth/client"
import { Bucket, fetchBuckets } from "@/lib/db/buckets"
import { format } from "date-fns"

interface TransactionFilterProps {
  onSave?: (category: number, year: number | undefined, month: number | undefined) => void
  onReset?: () => void
}

export default function TransactionFilter({ onSave, onReset }: TransactionFilterProps) {
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [bucket, setBucket] = useState<Bucket[]>([])
  const [selected, setSelected] = useState<number | undefined>(undefined)

  const handleFilterDialog = () => {
    setIsFilterDialogOpen(!isFilterDialogOpen)
    if (!isFilterDialogOpen) {
      setLoading(true)
    }
  }

  const handleReset = () => {
    handleFilterDialog()
    setSelected(undefined)
    onReset?.()
  }

  const handleSaved = () => {
    handleFilterDialog()
    if (selected)
      onSave?.(selected, bucket.find((b) => b.id === selected)?.year, bucket.find((b) => b.id === selected)?.month)
  }

  useEffect(() => {
    async function initialize() {
      if (loading) {
        const { data: session } = await authClient.getSession()
        const userId = session?.user?.id || ""
        const result = await fetchBuckets(userId)
        // sort by year and month descending
        result.sort((a, b) => {
          if (a.year === b.year) {
            return b.month - a.month
          }
          return b.year - a.year
        })
        setBucket(result)
      }
      setLoading(false)
    }
    initialize()
  }, [loading])

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
            {bucket.map((b) => (
              <SelectItem key={b.id} value={b.id.toString()}>
                <div className="text-primary">{b.category}</div>
                <span className="text-muted-foreground">
                  {format(new Date(b.year + "-" + b.month + "-15"), "MMMM yyyy")}
                </span>
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
