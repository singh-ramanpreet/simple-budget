"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Loader2, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"

const bucketFormSchema = z.object({
  category: z.string().min(1, "Category is required"),
  amount: z.number().min(0, "Budget amount is required"),
  month: z.number().int().min(1, "Month is required"),
  year: z.number().int().min(4, "Year is required"),
})

export type BucketFormValues = z.infer<typeof bucketFormSchema>

interface BucketFormProps {
  defaultValues?: BucketFormValues
  onSubmit: (data: BucketFormValues) => Promise<void>
  onDelete?: () => Promise<void>
  onCancel: () => void
  isLoading: boolean
}

export default function BucketForm({ defaultValues, onSubmit, onDelete, onCancel, isLoading }: BucketFormProps) {
  const [error, setError] = useState<string>("")
  const form = useForm<BucketFormValues>({
    resolver: zodResolver(bucketFormSchema),
    defaultValues: defaultValues ?? {
      category: "",
      amount: 0,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    },
  })

  // Reset form when defaultValues change
  useEffect(() => {
    form.reset(defaultValues)
  }, [defaultValues, form])

  const listMonths = [
    { id: 1, name: "January" },
    { id: 2, name: "February" },
    { id: 3, name: "March" },
    { id: 4, name: "April" },
    { id: 5, name: "May" },
    { id: 6, name: "June" },
    { id: 7, name: "July" },
    { id: 8, name: "August" },
    { id: 9, name: "September" },
    { id: 10, name: "October" },
    { id: 11, name: "November" },
    { id: 12, name: "December   " },
  ]

  async function handleFormSubmit(data: BucketFormValues) {
    setError("")
    try {
      await onSubmit(data)
    } catch (error) {
      setError(
        "Failed to save bucket. Please try again. Error: " + (error instanceof Error ? error.message : "Unknown error")
      )
      console.error(error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* category */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-end space-x-2">
                <FormLabel className="text-right">Category</FormLabel>
                <FormControl className="w-2/3">
                  <Input placeholder="Enter category" {...field} />
                </FormControl>
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
                <FormLabel className="text-right">Budget Amount</FormLabel>
                <FormControl className="w-2/3">
                  <Input
                    type="number"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => {
                      //remove leading zeros
                      e.target.value = e.target.value.replace(/^0+(?=\d)/, "")
                      field.onChange(+e.target.value)
                    }}
                  />
                </FormControl>
              </div>
              <FormMessage className="ml-[35%]" />
            </FormItem>
          )}
        />
        {/* month */}
        <div className="flex justify-end gap-4">
          <div className="w-2/5">
            <FormField
              control={form.control}
              name="month"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-end space-x-2">
                    <FormLabel>Month</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        form.setValue("month", listMonths.find((month) => month.name === value)?.id || 0)
                      }}
                      value={listMonths.find((month) => month.id === field.value)?.name || ""}
                      name={field.name}
                    >
                      <FormControl className="w-2/3">
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Month" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {listMonths.map((month) => (
                          <SelectItem key={month.id} value={month.name}>
                            {month.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="ml-[35%]" />
                  </div>
                </FormItem>
              )}
            />
          </div>
          {/* year */}
          <div className="w-2/5">
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center space-x-2">
                    <FormLabel>Year</FormLabel>
                    <FormControl className="w-full">
                      <Input
                        type="number"
                        placeholder="Enter Year"
                        {...field}
                        onChange={(e) => field.onChange(+e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        {error && <div className="mt-2 text-sm text-red-500">{error}</div>}

        <div className="flex justify-end space-x-4 pt-2">
          {onDelete && (
            <div className="flex w-1/3 justify-start">
              <Button
                type="button"
                variant="destructive"
                onClick={onDelete}
                disabled={isLoading}
                className="flex-shrink-0"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          )}
          <Button type="submit" disabled={isLoading} className="w-1/3">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel} className="w-1/3" disabled={isLoading}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
