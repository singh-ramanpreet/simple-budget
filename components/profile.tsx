import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import signOut from "@/components/sign-out"

export default async function Profile() {
  const session = await auth.api.getSession({ headers: await headers(), query: { disableCookieCache: false } })
  const name = session?.user?.name || ""
  const email = session?.user?.email || ""

  return (
    <>
      <div className="flex items-center space-x-4">
        <Label>Name: {name}</Label>
      </div>
      <div className="flex items-center space-x-4">
        <Label>Email: {email}</Label>
      </div>
      <div>
        <Button variant="destructive" className="w-full" type="button" onClick={signOut}>
          Logout
        </Button>
      </div>
    </>
  )
}
