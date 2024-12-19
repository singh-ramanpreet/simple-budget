"use client"

import { useState, useEffect } from "react"
import { authClient } from "@/lib/auth/client"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export default function ChangeName() {
  const { toast } = useToast()

  const [name, setName] = useState("")
  const [newName, setNewName] = useState("")
  const [loading, setLoading] = useState(false)

  async function fetchSession() {
    const { data } = await authClient.getSession()
    setName(data?.user?.name || "")
  }

  useEffect(() => {
    fetchSession()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    await authClient.updateUser(
      { name: newName },
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
          fetchSession()
          setNewName("")
          setLoading(false)
        },
      }
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Label>Current Name: {name}</Label>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="newName">New Name:</Label>
          <Input id="newName" type="text" value={newName} onChange={(e) => setNewName(e.target.value)} required />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Name"}
        </Button>
      </form>
    </div>
  )
}
