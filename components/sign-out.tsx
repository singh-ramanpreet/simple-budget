"use client"

import { redirect } from "next/navigation"
import { authClient } from "@/lib/auth/client"

export default async function signOut() {
  await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        redirect("/sign-in")
      },
    },
  })
}
