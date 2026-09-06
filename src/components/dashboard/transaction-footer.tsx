import { HugeiconsIcon } from "@hugeicons/react"
import { Delete02Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TransactionFooterProps {
  onCancel: () => void
  onDelete?: () => void
  onCopy?: () => void
  isSaveDisabled?: boolean
  /** True while a save or delete is running: every action is disabled and the submit button shows `pendingLabel` */
  isPending?: boolean
  deleteLabel?: string
  saveLabel?: string
  pendingLabel?: string
}

export function TransactionFooter({
  onCancel,
  onDelete,
  onCopy,
  isSaveDisabled,
  isPending = false,
  deleteLabel,
  saveLabel = "Save",
  pendingLabel = "Saving…",
}: TransactionFooterProps) {
  return (
    <div className="mt-6 flex items-center justify-between gap-3 border-t pt-6">
      {onDelete ? (
        <Button
          variant="destructive"
          size={deleteLabel ? "default" : "icon"}
          onClick={onDelete}
          disabled={isPending}
          className="shrink-0"
        >
          <HugeiconsIcon icon={Delete02Icon} className={cn("h-5 w-5", deleteLabel && "mr-2")} />
          {deleteLabel}
        </Button>
      ) : (
        <div />
      )}

      <div className="flex items-center gap-3">
        {onCopy && (
          <Button variant="outline" onClick={onCopy} disabled={isPending}>
            Copy
          </Button>
        )}
        <Button type="submit" disabled={isSaveDisabled || isPending} aria-busy={isPending}>
          {isPending ? pendingLabel : saveLabel}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
