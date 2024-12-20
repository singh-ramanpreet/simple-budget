"use client"

import { useForm } from "react-hook-form"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth/client"
import { LoaderCircle } from "lucide-react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { LoginFormData, SignUpFormData, loginSchema, signUpSchema } from "./form"
import { useState } from "react"
import { redirect } from "next/navigation"

interface LoginFormProps {
  type: "login" | "register"
}

export function LoginForm({ type }: LoginFormProps) {
  const isLogin = type === "login"

  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(isLogin ? loginSchema : signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
    },
  })

  const onSubmit = async (data: SignUpFormData) => {
    // set loading state
    setIsLoading(true)

    if (isLogin) {
      const loginData: LoginFormData = {
        email: data.email,
        password: data.password,
      }
      await authClient.signIn.email(loginData, {
        onResponse: () => {
          setIsLoading(false)
        },
        onSuccess: () => {
          redirect("/")
        },
        onError: (ctx) => {
          form.setError("root", {
            message: ctx.error.message,
          })
        },
      })
    } else {
      const signUpData = {
        email: data.email,
        password: data.password,
        name: data.name,
      }
      await authClient.signUp.email(signUpData, {
        onResponse: () => {
          setIsLoading(false)
        },
        onSuccess: () => {
          redirect("/")
        },
        onError: (ctx) => {
          form.setError("root", {
            message: ctx.error.message,
          })
        },
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid w-full items-center gap-4">
        {!isLogin && (
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter your name" autoComplete="name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter your email" type="email" {...field} autoComplete="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your password"
                  type="password"
                  {...field}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {!isLogin && (
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input placeholder="Confirm your password" type="password" {...field} autoComplete="new-password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading ? <LoaderCircle className="mr-2 animate-spin" /> : isLogin ? "Sign in" : "Sign up"}
        </Button>
        <p className="text-center text-sm">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <Link href={isLogin ? "/sign-up" : "/sign-in"} className="text-blue-500 hover:underline">
            {isLogin ? "Sign up" : "Sign in"}
          </Link>
        </p>
        {form.formState.errors.root && (
          <p className="text-center text-sm text-red-500">{form.formState.errors.root.message}</p>
        )}
      </form>
    </Form>
  )
}
