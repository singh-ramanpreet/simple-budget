import { Card, CardContent } from "@/components/ui/card"
import BucketEditImpl from "@/components/bucket-edit-impl"

export default async function BucketPage({
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
          <BucketEditImpl params={params} searchParams={searchParams} />
        </CardContent>
      </Card>
    </div>
  )
}
