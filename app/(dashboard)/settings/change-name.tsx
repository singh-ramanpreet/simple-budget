"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { authClient } from "@/lib/auth/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const formSchema = z.object({
  newName: z.string().min(1, "Name is required"),
})

export default function ChangeName() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newName: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)

    await authClient.updateUser(
      { name: values.newName },
      {
        onError: (ctx) => {
          toast({
            variant: "destructive",
            title: ctx.error.message,
          })
          setLoading(false)
        },
        onSuccess: () => {
          toast({
            title: "Name updated successfully",
          })
          form.reset()
          setLoading(false)
        },
      }
    )
  }

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="newName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Name</FormLabel>
                <FormControl>
                  <Input {...field} className="border-4" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Name"}
          </Button>
        </form>
      </Form>
    </div>
  )
}
