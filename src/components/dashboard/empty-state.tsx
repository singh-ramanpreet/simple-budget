/**
 * EmptyState
 *
 * Shown when no CSV file is connected. Directs the user to settings.
 */
import { Database02Icon, Settings01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"

export default function EmptyState() {
  return (
    <div className="mx-auto flex w-full flex-col items-center justify-center space-y-6 px-4 pt-20 text-center">
      <div className="bg-primary/5 text-primary border-primary/10 rounded-full border p-6 shadow-inner">
        <HugeiconsIcon icon={Database02Icon} />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">No Data Source Connected</h2>
        <p className="text-muted-foreground leading-relaxed">Connect a CSV file in settings to get started.</p>
      </div>
      <Button className="flex items-center gap-2">
        <HugeiconsIcon icon={Settings01Icon} />
        <Link to="/settings">Go to Settings</Link>
      </Button>
    </div>
  )
}
