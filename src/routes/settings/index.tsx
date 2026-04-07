import { createFileRoute } from "@tanstack/react-router"
import { Database02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileHandleManager } from "@/components/file-handle-manager"

export const Route = createFileRoute("/settings/")({
  component: SettingsPage,
})

function SettingsPage() {
  return (
    <div className="animate-in fade-in flex flex-col items-center space-y-4 py-4 duration-500">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight">Settings</CardTitle>
          <CardDescription>Manage your application preferences and data storage.</CardDescription>
        </CardHeader>
      </Card>

      <Card className="border-primary/20 shadow-primary/5 from-background to-secondary/20 relative w-full max-w-md overflow-hidden bg-linear-to-br shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={Database02Icon} />
            <span>Data Storage</span>
          </div>
          <CardDescription>
            Data is locally stored in a CSV file format on your device. Select an existing CSV file or create a new one
            to store your data.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <FileHandleManager />
        </CardContent>
      </Card>
    </div>
  )
}
