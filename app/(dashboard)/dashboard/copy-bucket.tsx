"use client"

import { useState, useEffect } from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { authClient } from "@/lib/auth/client"
import { Bucket, fetchBuckets, addBucket } from "@/lib/db/buckets"
import { Loader2 } from "lucide-react"

export const columns: ColumnDef<Bucket>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => <div>{row.getValue("category")}</div>,
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount")).toFixed(2)
      return <div className="text-right font-medium">${amount}</div>
    },
  },
  {
    accessorKey: "month",
    header: () => <div className="text-right">Month</div>,
    cell: ({ row }) => (
      <div className="text-right">
        {new Date(2000, row.original.month - 1).toLocaleString("default", { month: "short" })}
      </div>
    ),
  },
  {
    accessorKey: "year",
    header: () => <div className="text-right">Year</div>,
    cell: ({ row }) => <div className="text-right">{row.original.year}</div>,
  },
]

export default function CopyBucket({ onClose, onCopy }: { onClose?: () => void; onCopy?: () => void }) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})
  const [targetMonth, setTargetMonth] = useState<number | undefined>(new Date().getMonth() + 1)
  const [targetYear, setTargetYear] = useState<number | undefined>(new Date().getFullYear())

  const [loggedUserId, setLoggedUserId] = useState("")
  const [bucket, setBucket] = useState<Bucket[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    async function initialize() {
      const { data: session } = await authClient.getSession()
      const userId = session?.user?.id || ""
      setLoggedUserId(userId)
      const result = await fetchBuckets(userId, targetMonth, undefined, true) // inverted filter
      // sort by year and month descending
      result.sort((a, b) => {
        if (a.year === b.year) {
          return b.month - a.month
        }
        return b.year - a.year
      })
      setBucket(result)
    }
    initialize()
  }, [targetMonth])

  const table = useReactTable({
    data: bucket,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      pagination: {
        pageSize: 5,
        pageIndex: 0,
      },
    },
  })

  const isValidYear = (year: number) => {
    return year >= 2000 && year <= 2100
  }

  const handleCopyBuckets = async () => {
    if (!targetMonth || !targetYear || !table.getFilteredSelectedRowModel().rows.length) {
      return
    }

    if (!isValidYear(targetYear)) {
      setError("Please enter a valid year between 2000 and 2100")
      return
    }

    setError("")
    setIsLoading(true)

    try {
      const selectedBuckets = table.getFilteredSelectedRowModel().rows.map((row) => row.original)
      await Promise.all(
        selectedBuckets.map((bucket) =>
          addBucket({
            userId: loggedUserId,
            category: bucket.category,
            amount: bucket.amount,
            month: targetMonth,
            year: targetYear,
          })
        )
      )
      table.resetRowSelection()
      onCopy?.()
      onClose?.()
    } catch (error) {
      setError("Failed to copy buckets. Please try again.")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCanel() {
    table.resetRowSelection()
    onClose?.()
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter category..."
          autoComplete="off"
          name="category"
          autoFocus={false}
          value={(table.getColumn("category")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("category")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
          selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-end gap-4 py-4">
        <div>
          <span className="text-muted-foreground">Copy selected buckets to:</span>
        </div>
        <Select value={targetMonth?.toString()} onValueChange={(value) => setTargetMonth(parseInt(value))}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <SelectItem key={month} value={month.toString()}>
                {new Date(2000, month - 1).toLocaleString("default", { month: "long" })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="number"
          placeholder="Enter year"
          autoComplete="off"
          name="year"
          value={targetYear}
          onChange={(e) => setTargetYear(parseInt(e.target.value))}
          className="w-24"
        />
      </div>
      {error && <div className="mt-2 text-sm text-red-500">{error}</div>}
      <div className="flex justify-end gap-4 py-4">
        <Button
          onClick={handleCopyBuckets}
          disabled={!targetMonth || !targetYear || !table.getFilteredSelectedRowModel().rows.length || isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Copy
        </Button>
        <Button variant="outline" onClick={handleCanel} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
