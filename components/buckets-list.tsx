import { ChevronLeft, ChevronRight } from "lucide-react"
import { getUserId } from "@/lib/actions"
import { BucketWithSum, fetchBuckets, fetchBucketTransactionsSum } from "@/lib/db/buckets"
import { percentage, buckets_total_amount, buckets_total_transactions_sum } from "@/lib/utils"
import BucketItem from "./bucket-item"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import Link from "next/link"

type BucketsListProps = {
  month?: number
  year?: number
}

export default async function BucketsList({ month, year }: BucketsListProps) {
  const loggedUserId = await getUserId()
  const buckets = await fetchBuckets(loggedUserId!, month, year)
  const bucketsSum = await fetchBucketTransactionsSum(loggedUserId!, month, year)
  const bucketsWithSum: BucketWithSum[] = buckets.map((bucket) => {
    const sum = bucketsSum.find((b) => b.id === bucket.id)?.sum
    return {
      ...bucket,
      transactions_sum: sum,
    }
  })

  // navigate month
  const navigateMonth = (delta: number) => {
    let href = `?`
    const newDate = new Date(year!, month! - 1 + delta, 15)
    const newMonth = newDate.getMonth() + 1
    const newYear = newDate.getFullYear()
    href += `month=${newMonth}&year=${newYear}`
    href += `&page=${1}`
    return href
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button asChild variant="link" className="rounded-full hover:bg-muted">
          <Link href={navigateMonth(-1)} scroll={false}>
            <ChevronLeft className="text-muted-foreground" />
          </Link>
        </Button>

        <h2 className="text-lg font-medium">
          {new Date(year!, month! - 1, 15).toLocaleString("default", { month: "long", year: "numeric" })}
        </h2>

        <Button asChild variant="link" className="rounded-full hover:bg-muted">
          <Link href={navigateMonth(1)} scroll={false}>
            <ChevronRight className="text-muted-foreground" />
          </Link>
        </Button>
      </div>

      <ul>
        <li className="group flex items-center justify-between rounded-lg px-4 py-3">
          <div className="flex h-12 w-full items-center justify-between gap-2">
            <div className="h-full w-20 align-top">
              <h3 className="truncate text-primary">Total</h3>
            </div>
            <div className="h-full flex-1">
              <Progress
                value={percentage(buckets_total_transactions_sum(bucketsWithSum), buckets_total_amount(bucketsWithSum))}
                max={1}
                className="h-4"
              />
              <div className="mt-1 flex justify-between text-sm text-muted-foreground">
                <span>
                  {percentage(
                    buckets_total_transactions_sum(bucketsWithSum),
                    buckets_total_amount(bucketsWithSum)
                  ).toFixed(1)}
                  %
                </span>
                <span>${buckets_total_amount(bucketsWithSum).toFixed(1)}</span>
              </div>
            </div>
            <div className="h-full w-20 text-right align-top">
              <span className="text-muted-foreground">
                ${Math.abs(buckets_total_transactions_sum(bucketsWithSum)).toFixed(2)}
              </span>
            </div>
          </div>
        </li>
        {bucketsWithSum.map((bucket) => (
          <BucketItem key={bucket.id} bucket={bucket} />
        ))}
      </ul>
    </div>
  )
}
