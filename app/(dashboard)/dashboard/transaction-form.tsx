"use client"

import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { CalendarIcon, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { useState } from "react"

export const transactionSchema = z.object({
  date: z.date(),
  name: z.string().min(1),
  amount: z.string().min(1),
  category: z.string().min(1),
  notes: z.string().optional(),
})

type TransactionFormValues = z.infer<typeof transactionSchema>

interface TransactionFormProps {
  defaultValues: TransactionFormValues
  existingNames: string[]
  existingNotes: string[]
  buckets: { id: number; category: string }[]
  onDateChange: (date: Date) => void
  onSubmit: (values: TransactionFormValues) => Promise<void>
  onCancel?: () => void
  onDelete?: () => void
}

export default function TransactionForm({
  defaultValues,
  existingNames,
  existingNotes,
  buckets,
  onDateChange,
  onSubmit,
  onCancel,
  onDelete,
}: TransactionFormProps) {
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues,
  })

  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  async function handleSubmit(values: TransactionFormValues) {
    await onSubmit(values)
    form.reset()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-2">
        {/* Date */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center space-x-2">
                <FormLabel className="w-1/3 text-right">Date</FormLabel>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <FormControl className="w-2/3">
                      <Button variant="outline" className="pl-3 text-left">
                        {field.value ? format(field.value, "PPP") : "Select a date"}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        field.onChange(date)
                        if (date) {
                          onDateChange(date)
                        }
                        setIsCalendarOpen(false)
                      }}
                      initialFocus
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
              <div className="flex items-center space-x-2">
                <FormLabel className="w-1/3 text-right">Name</FormLabel>
                <FormControl className="w-2/3">
                  <Input placeholder="Transaction name" {...field} list="transaction-names" />
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
              <div className="flex items-center space-x-2">
                <FormLabel className="w-1/3 text-right">Amount</FormLabel>
                <FormControl className="w-2/3">
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
              </div>
              <FormMessage className="ml-[35%]" />
            </FormItem>
          )}
        />
        {/* Category */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center space-x-2">
                <FormLabel className="w-1/3 text-right">Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} name={field.name}>
                  <FormControl className="w-2/3">
                    <SelectTrigger className="w-2/3">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {buckets.map((bucket) => (
                      <SelectItem key={bucket.id} value={bucket.category}>
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
              <div className="flex items-center space-x-2">
                <FormLabel className="w-1/3 text-right">Notes</FormLabel>
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
        <div className="flex justify-end space-x-4 pt-2">
          {onDelete && (
            <div className="flex w-1/3 justify-start">
              <Button type="button" variant="destructive" onClick={onDelete} className="flex-shrink-0">
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          )}
          <Button type="submit" className="w-1/3">
            Save
          </Button>
          {onCancel && (
            <Button type="button" variant="secondary" onClick={onCancel} className="w-1/3">
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}
