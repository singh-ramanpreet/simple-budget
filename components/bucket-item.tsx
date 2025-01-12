import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { percentage } from "@/lib/utils"
import { BucketWithSum } from "@/lib/db/buckets"
import Link from "next/link"
import { DASHBOARD_PATH } from "@/lib/constants"

export default function BucketItem({ bucket }: { bucket: BucketWithSum }) {
  return (
    <Link
      href={`${DASHBOARD_PATH}/b/${bucket.id}?month=${bucket.month}&year=${bucket.year}`}
      prefetch={false}
      scroll={false}
    >
      <li className="group flex cursor-pointer items-center justify-between rounded-lg px-4 py-3 transition-colors hover:bg-muted/50">
        <div className="flex h-12 w-full items-center justify-between gap-2">
          <div className="h-full w-20 align-top">
            <h3 className="truncate text-primary">{bucket.category}</h3>
          </div>
          <div className="h-full flex-1">
            <Progress value={percentage(bucket.transactions_sum, bucket.amount)} max={1} className="h-4" />
            <div className="mt-1 flex justify-between text-sm text-muted-foreground">
              <span>{percentage(bucket.transactions_sum, bucket.amount).toFixed(1)}%</span>
              <span>${bucket.amount.toFixed(2)}</span>
            </div>
          </div>
          <div className="h-full w-20 text-right align-top">
            <span
              className={cn("text-muted-foreground", {
                "text-red-500": bucket.transactions_sum && bucket.transactions_sum > bucket.amount,
              })}
            >
              ${Math.abs(bucket.transactions_sum ?? 0).toFixed(2)}
            </span>
          </div>
        </div>
      </li>
    </Link>
  )
}
