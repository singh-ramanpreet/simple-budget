"use client"

import { useState, useEffect } from "react"
import { authClient } from "@/lib/auth/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Session } from "better-auth/types"

export default function ManageSessions() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [activeSession, setActiveSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSessions()
    fetchActiveSession()
  }, [])

  const fetchActiveSession = async () => {
    try {
      const { data } = await authClient.getSession()
      if (data) {
        setActiveSession(data.session)
      }
    } catch (error) {
      console.error("Failed to load active session:", error)
      setError("Failed to load active session")
    }
  }

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
      {sessions.map((session) => (
        <div key={session.id}>
          <Card className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">{session.userAgent || "Unknown Device"}</p>
              <p className="text-sm">Last Updated: {new Date(session.updatedAt).toLocaleString()}</p>
              <p className="text-sm">IP Address: {session.ipAddress}</p>
            </div>
            <Button
              variant="destructive"
              onClick={() => handleRevoke(session.token)}
              size="sm"
              disabled={session.id === activeSession?.id}
            >
              {session.id === activeSession?.id ? "Active" : "Revoke"}
            </Button>
          </Card>
        </div>
      ))}
      {sessions.length === 0 && <p className="text-muted-foreground">No active sessions found.</p>}
    </div>
  )
}
