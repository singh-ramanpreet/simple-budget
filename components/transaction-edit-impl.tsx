import { getUserId, parseSearchParams } from "@/lib/actions"
import TransactionEdit from "@/components/transaction-edit"

export default async function TransactionEditImpl({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const { id } = await params
  const query = await searchParams

  const loggedUserId = await getUserId()
  const { month, year } = await parseSearchParams(query)

  return <TransactionEdit month={month} year={year} userId={loggedUserId} transactionId={parseInt(id) || undefined} />
}
