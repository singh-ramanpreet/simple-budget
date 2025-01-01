import * as z from "zod"

export const TransactionSchema = z.object({
  date: z.date(),
  name: z.string().min(1, "Name must be at least 1 character"),
  amount: z.string().min(1, "Amount is required"),
  category_id: z.string().min(1, "Category is required"),
  notes: z.string().optional(),
  transactionId: z.string().optional(),
})

export type TTransactionSchema = z.infer<typeof TransactionSchema>
