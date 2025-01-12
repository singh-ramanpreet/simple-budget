import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import BucketEditImpl from "@/components/bucket-edit-impl"

export default async function BucketPage({
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
        <BucketEditImpl params={params} searchParams={searchParams} />
      </DialogContent>
    </Dialog>
  )
}
