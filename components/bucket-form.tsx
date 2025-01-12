"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Loader2, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState, useActionState } from "react"
import { BucketFormSchema, TBucketFormSchema } from "@/lib/schema"
import { handleSaveBucket, handleDeleteBucket } from "@/lib/actions"
import { useRouter } from "next/navigation"

type BucketFormProps = {
  defaultValues?: TBucketFormSchema
}

export default function BucketForm({ defaultValues }: BucketFormProps) {
  // navigation
  const router = useRouter()

  const [saveState, saveFormAction, isSavePending] = useActionState(handleSaveBucket, { message: "", success: false })
  const [deleteState, deleteFormAction, isDeletePending] = useActionState(handleDeleteBucket, {
    message: "",
    success: false,
  })

  const isPending = isSavePending || isDeletePending

  const [deleteButton] = useState<boolean>(defaultValues?.category_id ? true : false)

  const form = useForm<TBucketFormSchema>({
    resolver: zodResolver(BucketFormSchema),
    defaultValues,
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
    { id: 12, name: "December" },
  ]

  async function handleCancel() {
    router.back()
  }

  return (
    <Form {...form}>
      <form className="space-y-4" action={saveFormAction}>
        <div className="item-center mb-4 flex justify-center rounded-xl bg-primary-foreground p-2 text-lg font-medium">
          {defaultValues?.category_id ? "Edit Budget Bucket" : "Add Budget Bucket"}
        </div>
        {/* category_id */}
        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => <input type="hidden" {...field} />}
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
                    <input type="hidden" {...field} />
                    <FormLabel>Month</FormLabel>
                    <Select value={field.value.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                      <FormControl className="w-2/3">
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Month" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {listMonths.map((month) => (
                          <SelectItem key={month.id} value={month.id.toString()}>
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

        {saveState.message && <div className="mt-2 text-sm text-red-500">{saveState.message}</div>}
        {deleteState.message && <div className="mt-2 text-sm text-red-500">{deleteState.message}</div>}

        <Button type="submit" disabled={isPending} className="hidden">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save
        </Button>

        <div className="flex justify-end space-x-4 pt-2">
          {deleteButton && (
            <div className="flex w-1/3 justify-start">
              <Button
                type="submit"
                variant="destructive"
                formAction={deleteFormAction}
                disabled={isPending}
                className="flex-shrink-0"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          )}
          <Button type="submit" disabled={isPending} className="w-1/3">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
          <Button type="button" variant="secondary" onClick={handleCancel} className="w-1/3" disabled={isPending}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
