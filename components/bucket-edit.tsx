import { fetchBucket } from "@/lib/db/buckets"
import { TBucketFormSchema } from "@/lib/schema"
import BucketForm from "@/components/bucket-form"

interface BucketEditProps {
  userId?: string
  month?: number
  year?: number
  bucketId?: number
}

export default async function BucketEdit({ userId, month, year, bucketId }: BucketEditProps) {
  const loggedUserId = userId
  const bucket = bucketId ? await fetchBucket(loggedUserId!, bucketId) : undefined

  const defaultValues: TBucketFormSchema = {
    category_id: bucket?.id.toString() ?? "",
    category: bucket?.category ?? "",
    amount: bucket?.amount ?? 0,
    month: bucket?.month ?? month ?? 0,
    year: bucket?.year ?? year ?? 0,
  }

  return <BucketForm defaultValues={defaultValues} />
}
