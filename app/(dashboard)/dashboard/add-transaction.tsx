"use client"

import { authClient } from "@/lib/auth/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { addTransaction } from "@/lib/db/transactions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { useState } from "react"

const formSchema = z.object({
  date: z.string().min(1, { message: "Date is required" }),
  name: z.string().min(1, { message: "Name is required" }),
  amount: z.string().min(1, { message: "Amount is required" }),
  category: z.string().optional(),
  notes: z.string().optional(),
})

interface AddTransactionProps {
  onAddTransaction: () => void
}

export default function AddTransaction({ onAddTransaction }: AddTransactionProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  function formatDate(date: Date, formatOption: string) {
    const dt = new Date(date)
    const tzoffset = dt.getTimezoneOffset() * 60000
    return format(new Date(dt.valueOf() + tzoffset), formatOption)
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: formatDate(new Date(), "yyyy-MM-dd"),
      name: "",
      amount: "",
      category: "",
      notes: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { data: session } = await authClient.getSession()
    const userId = session?.user?.id || ""
    if (!userId) {
      form.setError("root", { message: "Not Logged In" })
      return
    }
    await addTransaction({
      ...values,
      userId,
      amount: parseFloat(values.amount),
      date: values.date,
    })
    form.reset()
    onAddTransaction()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1">
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
                      <Button variant={"outline"} className="pl-3 text-left">
                        {formatDate(new Date(field.value), "PPP")}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={new Date(field.value)}
                      onSelect={(date) => {
                        field.onChange(date ? formatDate(new Date(date), "yyyy-MM-dd") : "")
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
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center space-x-2">
                <FormLabel className="w-1/3 text-right">Name</FormLabel>
                <FormControl className="w-2/3">
                  <Input placeholder="Transaction name" {...field} />
                </FormControl>
              </div>
              <FormMessage className="ml-[35%]" />
            </FormItem>
          )}
        />
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
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center space-x-2">
                <FormLabel className="w-1/3 text-right">Category</FormLabel>
                <FormControl className="w-2/3">
                  <Input placeholder="Category" {...field} />
                </FormControl>
              </div>
              <FormMessage className="ml-[35%]" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center space-x-2">
                <FormLabel className="w-1/3 text-right">Notes</FormLabel>
                <FormControl className="w-2/3">
                  <Input placeholder="Notes" {...field} />
                </FormControl>
              </div>
              <FormMessage className="ml-[35%]" />
            </FormItem>
          )}
        />
        <div className="flex justify-end pt-2">
          <Button type="submit"> Add Transaction</Button>
        </div>
      </form>
    </Form>
  )
}
