import { revalidatePath } from "next/cache"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import TransactionsList from "@/components/transactions-list"
import TransactionFilter from "@/components/transaction-filter"
import BucketsList from "@/components/buckets-list"
import BucketCopyDialog from "@/components/bucket-copy-dialog"
import { PlusCircle, ListOrdered, PaintBucket, RotateCw } from "lucide-react"
import Link from "next/link"
import { getUserId, parseSearchParams } from "@/lib/actions"
import { fetchBuckets } from "@/lib/db/buckets"
import { DASHBOARD_PATH } from "@/lib/constants"

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const query = await searchParams
  const loggedUserId = await getUserId()
  const { month, year, categoryId, page, pageSize } = await parseSearchParams(query, loggedUserId)

  const trxFilterList = await fetchBuckets(loggedUserId!)

  const refreshAction = async () => {
    "use server"
    revalidatePath(DASHBOARD_PATH)
  }

  return (
    <div className="flex flex-col items-center space-y-4 py-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center space-y-4 p-4">
          <Button asChild>
            <Link href={`${DASHBOARD_PATH}/new`}>
              <PlusCircle className="h-5 w-5 opacity-50" />
              Add Transaction
            </Link>
          </Button>
        </CardContent>
      </Card>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ListOrdered className="h-5 w-5 text-muted-foreground" />
              <span>Transactions</span>
            </div>
            <div className="flex items-center gap-2">
              <TransactionFilter buckets={trxFilterList} />
              <form>
                <Button type="submit" formAction={refreshAction} className="ml-2" variant="outline">
                  <RotateCw className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionsList
            userId={loggedUserId!}
            month={month}
            year={year}
            categoryId={categoryId}
            page={page}
            pageSize={pageSize}
          />
        </CardContent>
      </Card>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <PaintBucket className="h-5 w-5 text-muted-foreground" />
              <span>Buckets</span>
            </div>
            <form>
              <Button type="submit" formAction={refreshAction} className="ml-2" variant="outline">
                <RotateCw className="h-5 w-5" />
              </Button>
            </form>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BucketsList month={month} year={year} />
        </CardContent>
      </Card>
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center space-y-4 p-4">
          <div className="flex gap-8">
            <div>
              <Button asChild>
                <Link href={`${DASHBOARD_PATH}/b/new`}>
                  <PlusCircle className="h-5 w-5 opacity-50" />
                  Add Bucket
                </Link>
              </Button>
            </div>
            <div>
              <BucketCopyDialog />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
