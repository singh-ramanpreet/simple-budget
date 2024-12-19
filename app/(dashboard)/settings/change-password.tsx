"use client"

import { useState } from "react"
import { authClient } from "@/lib/auth/client"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export default function ChangePassword() {
  const { toast } = useToast()

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    await authClient.changePassword(
      {
        newPassword: newPassword,
        currentPassword: currentPassword,
        revokeOtherSessions: true,
      },
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
            title: "Password updated successfully",
          })
          setCurrentPassword("")
          setNewPassword("")
          setLoading(false)
        },
      }
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current Password</Label>
        <Input
          id="currentPassword"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="newPassword">New Password</Label>
        <Input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Updating..." : "Update Password"}
      </Button>
    </form>
  )
}
