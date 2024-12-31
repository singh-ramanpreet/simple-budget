import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Session } from "better-auth/types"
import { UAParser } from "ua-parser-js"
import ClientDateFormat from "@/components/client-date-format"

function ListSession({ session, current }: { session: Session; current?: boolean }) {
  const { browser, os } = UAParser(session.userAgent as string)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onRevoke = async (token: string, data: FormData) => {
    "use server"
    try {
      await auth.api.revokeSession({ headers: await headers(), body: { token } })
      revalidatePath("/settings")
    } catch (error) {
      console.error(error)
    }
  }

  const onRevokeAction = onRevoke.bind(null, session.token)
  return (
    <Card className="flex items-center justify-between p-4">
      <div>
        <p className="text-sm">
          {browser.name} on {os.name} ({session.ipAddress})
        </p>
        <p className="text-sm text-muted-foreground">
          Last Updated: <ClientDateFormat date={session.updatedAt} fmt="PPp" />
        </p>
      </div>
      <form action={onRevokeAction}>
        <Button variant="destructive" type="submit" size="sm" disabled={current}>
          {current ? "Active" : "Revoke"}
        </Button>
      </form>
    </Card>
  )
}

export default async function ManageSessions() {
  const sessions: Session[] = await auth.api.listSessions({ headers: await headers() })
  const data = await auth.api.getSession({ headers: await headers(), query: { disableCookieCache: false } })
  const activeSession = data?.session

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <ListSession key={session.token} session={session} current={activeSession?.token === session.token} />
      ))}
      {sessions.length === 0 && <p className="text-muted-foreground">No active sessions found.</p>}
    </div>
  )
}
