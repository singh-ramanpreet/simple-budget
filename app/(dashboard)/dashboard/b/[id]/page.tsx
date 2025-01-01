import { Card, CardContent } from "@/components/ui/card"
import { getUserId, parseSearchParams } from "@/lib/actions"
import BucketEdit from "@/components/bucket-edit"

export default async function Dashboard({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const { id } = await params
  const query = await searchParams

  const loggedUserId = await getUserId()
  const { month, year } = await parseSearchParams(query, loggedUserId)

  return (
    <div className="flex flex-col items-center space-y-4 py-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center space-y-4 p-4">
          <BucketEdit month={month} year={year} userId={loggedUserId} bucketId={parseInt(id) || undefined} />
        </CardContent>
      </Card>
    </div>
  )
}
