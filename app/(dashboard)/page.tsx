import { redirect } from "next/navigation"

// redirect to dashboard
export default function Page() {
  redirect("/dashboard")
}
