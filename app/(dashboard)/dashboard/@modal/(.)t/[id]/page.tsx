import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import TransactionEditImpl from "@/components/transaction-edit-impl"

export default async function TransactionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  return (
    <Dialog open={true}>
      <DialogTitle></DialogTitle>
      <DialogDescription></DialogDescription>
      <DialogContent className="[&>button]:hidden">
        <TransactionEditImpl params={params} searchParams={searchParams} />
      </DialogContent>
    </Dialog>
  )
}
