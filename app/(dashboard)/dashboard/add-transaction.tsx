"use client"

import { authClient } from "@/lib/auth/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { addTransaction, fetchTransactionNames, fetchTransactionNotes } from "@/lib/db/transactions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { useState, useEffect } from "react"
import { fetchBuckets, Bucket } from "@/lib/db/buckets"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  amount: z.string().min(1, { message: "Amount is required" }),
  category: z.string().min(1, { message: "Category is required" }),
  date: z.date(),
  notes: z.string().optional(),
})

interface AddTransactionProps {
  onAddTransaction: (() => void)[]
}

export default function AddTransaction({ onAddTransaction }: AddTransactionProps) {
  const [loggedUserId, setLoggedUserId] = useState("")
  const [buckets, setBuckets] = useState<Bucket[]>([])
  const [existingNames, setExistingNames] = useState<string[]>([])
  const [existingNotes, setExistingNotes] = useState<string[]>([])
  const [selectedMonth, setSelectedMonth] = useState<number>(0)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: undefined,
      name: "",
      amount: "",
      category: "",
      notes: "",
    },
  })

  async function fetchUser() {
    const { data: session } = await authClient.getSession()
    const userId = session?.user?.id || ""
    setLoggedUserId(userId)
  }

  useEffect(() => {
    async function fetchExistingNames() {
      const result = await fetchTransactionNames(loggedUserId)
      setExistingNames(result)
    }
    async function fetchExistingNotes() {
      const result = await fetchTransactionNotes(loggedUserId)
      setExistingNotes(result)
    }
    fetchExistingNames()
    fetchExistingNotes()
  }, [loggedUserId])

  useEffect(() => {
    async function fetchCategories() {
      const result = await fetchBuckets(loggedUserId, selectedMonth)
      setBuckets(result)
    }

    if (selectedMonth === 0) setSelectedMonth(new Date().getMonth() + 1)
    if (form.getValues("date") === undefined) form.setValue("date", new Date())
    console.log("form", format(form.getValues("date"), "yyyy-MM-dd"))
    fetchUser()
    fetchCategories()
  }, [loggedUserId, selectedMonth, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const userId = loggedUserId
    await addTransaction({
      ...values,
      userId,
      amount: parseFloat(values.amount),
      date: format(values.date, "yyyy-MM-dd"),
      category_id: buckets.find((bucket) => bucket.category === values.category)?.id || 0,
    })
    form.reset()
    onAddTransaction.forEach((callback) => callback())
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
                          setSelectedMonth(date.getMonth() + 1)
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
        <div className="flex justify-end pt-2">
          <Button type="submit"> Add Transaction</Button>
        </div>
      </form>
    </Form>
  )
}
