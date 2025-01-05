import TransactionEditImpl from "@/components/transaction-edit-impl"
import { Card, CardContent } from "@/components/ui/card"

export default async function Dashboard({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  return (
    <div className="flex flex-col items-center space-y-4 py-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center space-y-4 p-4">
          <TransactionEditImpl params={params} searchParams={searchParams} />
        </CardContent>
      </Card>
    </div>
  )
}
