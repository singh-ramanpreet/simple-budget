import { redirect } from "next/navigation"
import { DASHBOARD_PATH } from "@/lib/constants"

// redirect to dashboard
export default function Page() {
  redirect(DASHBOARD_PATH)
}
