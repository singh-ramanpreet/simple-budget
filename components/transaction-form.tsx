"use client"

import { TransactionSchema, TTransactionSchema } from "@/lib/schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { CalendarIcon, Loader2, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { useState, useEffect, useActionState } from "react"
import { handleSaveTransaction, handleDeleteTransaction } from "@/lib/actions"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

interface TransactionFormProps {
  defaultValues?: TTransactionSchema
  existingNames: string[]
  existingNotes: string[]
  buckets: { id: number; category: string }[]
}

export default function TransactionForm({
  defaultValues,
  existingNames,
  existingNotes,
  buckets,
}: TransactionFormProps) {
  // navigation
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // copy and delete buttons
  const [copyButton, setCopyButton] = useState(defaultValues?.transactionId ? true : false)
  const [deleteButton, setDeleteButton] = useState(defaultValues?.transactionId ? true : false)
  // calendar state
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  // form action and state
  const [saveState, saveAction, isSavePending] = useActionState(handleSaveTransaction, { message: "", success: false })
  const [deleteState, deleteAction, isDeletePending] = useActionState(handleDeleteTransaction, {
    message: "",
    success: false,
  })

  useEffect(() => {
    if (saveState.success) {
      router.back()
    }
  }, [saveState.success, router])

  useEffect(() => {
    if (deleteState.success) {
      router.back()
    }
  }, [deleteState.success, router])

  // check if there is a pending action
  const isPending = isSavePending || isDeletePending

  // create form
  const form = useForm<TTransactionSchema>({
    resolver: zodResolver(TransactionSchema),
    mode: "all",
    defaultValues: {
      ...defaultValues,
      date: defaultValues?.date || format(new Date(), "yyyy-MM-dd"), // client side
    },
  })

  /**
   * handles copy,
   * sets date to current date and clears transaction ID
   */
  async function handleCopy() {
    form.setValue("date", format(new Date(), "yyyy-MM-dd"))
    onDateChange(new Date())
    form.setValue("transactionId", "")
    setCopyButton(false)
    setDeleteButton(false)
  }

  /**
   * Creates a new Date object from a string date in 'YYYY-MM-DD' format
   * @param date - String date in 'YYYY-MM-DD' format (e.g. '2023-12-25')
   * @returns A new Date object representing the input date
   * @remarks The month value is adjusted by -1 since JavaScript Date months are 0-based (0-11)
   */
  function newDate(date: string) {
    return new Date(parseInt(date.substring(0, 4)), parseInt(date.substring(5, 7)) - 1, parseInt(date.substring(8, 10)))
  }

  async function onDateChange(date: Date) {
    const newParams = new URLSearchParams(searchParams)
    newParams.set("month", (date.getMonth() + 1).toString())
    newParams.set("year", date.getFullYear().toString())
    router.replace(`${pathname}?${newParams.toString()}`)
  }

  async function onCancel() {
    router.back()
  }

  return (
    <div className="w-full">
      <Form {...form}>
        <div className="item-center mb-4 flex justify-center rounded-xl bg-primary-foreground p-2 text-lg font-medium">
          {defaultValues?.transactionId ? "Edit" : "New"} Transaction
        </div>
        <form className="space-y-2" action={saveAction}>
          {/* Transaction ID */}
          {/* Hidden field to store transaction ID */}
          <FormField
            control={form.control}
            name="transactionId"
            render={({ field }) => <input type="hidden" {...field} />}
          />
          {/* Date */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <input type="hidden" name={field.name} value={field.value} />
                <div className="flex items-center justify-end space-x-2">
                  <FormLabel className="text-right">Date</FormLabel>
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <FormControl className="w-2/3">
                        <Button type="button" variant="outline" className="pl-3 text-left">
                          {field.value ? format(newDate(field.value), "PPP") : "Select a date"}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={newDate(field.value)}
                        onSelect={(date) => {
                          if (date) {
                            field.onChange(format(date, "yyyy-MM-dd"))
                            onDateChange(date)
                            setIsCalendarOpen(false)
                          }
                        }}
                        defaultMonth={newDate(field.value)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <FormMessage className="ml-[35%]" />
              </FormItem>
            )}
          />
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-end space-x-2">
                  <FormLabel className="text-right">Name</FormLabel>
                  <FormControl className="w-2/3">
                    <Input placeholder="Transaction name" {...field} list="transaction-names" autoComplete="off" />
                  </FormControl>
                  <datalist id="transaction-names">
                    {existingNames.map((name) => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>
                </div>
                <FormMessage className="ml-[35%]" />
              </FormItem>
            )}
          />
          {/* Amount */}
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-end space-x-2">
                  <FormLabel className="text-right">Amount</FormLabel>
                  <FormControl className="w-2/3">
                    <Input type="number" placeholder="0" step="0.01" {...field} />
                  </FormControl>
                </div>
                <FormMessage className="ml-[35%]" />
              </FormItem>
            )}
          />
          {/* Category */}
          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-end space-x-2">
                  <FormLabel className="text-right">Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} name={field.name}>
                    <FormControl className="w-2/3">
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {buckets.map((bucket) => (
                        <SelectItem key={bucket.id} value={bucket.id.toString()}>
                          {bucket.category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <FormMessage className="ml-[35%]" />
              </FormItem>
            )}
          />
          {/* Notes */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-end space-x-2">
                  <FormLabel className="text-right">Notes</FormLabel>
                  <FormControl className="w-2/3">
                    <Input placeholder="Notes" {...field} list="transaction-notes" />
                  </FormControl>
                  <datalist id="transaction-notes">
                    {existingNotes.map((note) => (
                      <option key={note} value={note} />
                    ))}
                  </datalist>
                </div>
                <FormMessage className="ml-[35%]" />
              </FormItem>
            )}
          />

          {saveState.message && <div className="mt-2 text-sm text-red-500">{saveState.message}</div>}
          {deleteState.message && <div className="mt-2 text-sm text-red-500">{deleteState.message}</div>}

          <div className="flex justify-end space-x-4 pt-2">
            {/* first button should be the default submit button */}
            {/* duplicating and hiding the button to make it the default submit button */}
            <Button
              type="submit"
              className="hidden"
              disabled={isPending || !form.formState.isValid}
              variant="ghost"
            ></Button>
            {deleteButton && (
              <div className="flex w-1/4 justify-start">
                <Button
                  type="submit"
                  variant="destructive"
                  formAction={deleteAction}
                  className="flex-shrink-0"
                  disabled={isPending}
                >
                  {isDeletePending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                </Button>
              </div>
            )}
            {copyButton && (
              <div className="w-1/4">
                <Button type="button" onClick={handleCopy} variant="outline" className="w-full" disabled={isPending}>
                  Copy
                </Button>
              </div>
            )}
            <Button type="submit" className="w-1/4" disabled={isPending || !form.formState.isValid}>
              {isSavePending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save"}
            </Button>

            <Button type="button" variant="secondary" onClick={onCancel} className="w-1/4" disabled={isPending}>
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
