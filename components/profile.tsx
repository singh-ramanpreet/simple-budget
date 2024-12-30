"use client"

import { useState, useEffect } from "react"
import { authClient } from "@/lib/auth/client"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"

export default function Profile() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")

  async function fetchSession() {
    const { data } = await authClient.getSession()
    setEmail(data?.user?.email || "")
    setName(data?.user?.name || "")
  }
  useEffect(() => {
    fetchSession()
  }, [])

  return (
    <>
      <div className="flex items-center space-x-4">
        <Label>Name: {name}</Label>
      </div>
      <div className="flex items-center space-x-4">
        <Label>Email: {email}</Label>
      </div>
      <div>
        <Button
          variant="destructive"
          onClick={() =>
            authClient.signOut({
              fetchOptions: {
                onSuccess: () => {
                  redirect("/sign-in")
                },
              },
            })
          }
          className="w-full"
        >
          Logout
        </Button>
      </div>
    </>
  )
}
