import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

export const signUpSchema = loginSchema
  .extend({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export const changePasswordSchema = z
  .object({
    currentPassword: loginSchema.shape.password,
    newPassword: loginSchema.shape.password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from the current password",
    path: ["newPassword"],
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type LoginFormData = z.infer<typeof loginSchema>
export type SignUpFormData = z.infer<typeof signUpSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
