import { getUserId, parseSearchParams } from "@/lib/actions"
import BucketEdit from "@/components/bucket-edit"

export default async function BucketEditImpl({
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

  return <BucketEdit month={month} year={year} userId={loggedUserId} bucketId={parseInt(id) || undefined} />
}
