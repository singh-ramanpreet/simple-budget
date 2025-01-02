import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import dynamic from "next/dynamic"

const BudgetPieChart = dynamic(() => import("@/components/budget-pie-chart"))

export default async function ChartsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
    query: {
      disableCookieCache: false,
    },
  })
  const loggedUserId = session?.session.userId || ""

  return (
    <div className="flex flex-col items-center space-y-4 py-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex items-center justify-between gap-2">
          <CardTitle>Buckets Distribution</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4 p-4">
          <BudgetPieChart userId={loggedUserId} />
        </CardContent>
      </Card>
    </div>
  )
}
