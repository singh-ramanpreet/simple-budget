"use client"

import { useState, useEffect } from "react"
import { authClient } from "@/lib/auth/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Session } from "better-auth/types"

export default function ManageSessions() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await authClient.listSessions()
      if (data) {
        setSessions(data)
      }
    } catch (error) {
      console.error("Failed to load sessions:", error)
      setError("Failed to load sessions")
    } finally {
      setLoading(false)
    }
  }

  const handleRevoke = async (sessionToken: string) => {
    try {
      await authClient.revokeSession({ token: sessionToken })
      // Refresh sessions after revocation
      await loadSessions()
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) {
    return <div>Loading sessions...</div>
  }

  if (error) {
    return (
      <div className="text-red-500">
        {error}
        <Button className="ml-4" variant="outline" onClick={() => loadSessions()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2>Other Active Sessions</h2>
      {sessions.map((session) => (
        <Card key={session.id} className="flex items-center justify-between p-4">
          <div>
            <p className="text-sm">{session.userAgent || "Unknown Device"}</p>
            <p className="text-sm text-muted-foreground">Last active: {new Date(session.updatedAt).toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">IP Address: {session.ipAddress}</p>
          </div>
          <Button variant="destructive" onClick={() => handleRevoke(session.token)} size="sm">
            Revoke
          </Button>
        </Card>
      ))}
      {sessions.length === 0 && <p className="text-muted-foreground">No active sessions found.</p>}
    </div>
  )
}
