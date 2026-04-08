import { createFileRoute } from "@tanstack/react-router"
import { ComputerIcon, Database02Icon, Moon01Icon, Sun01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileHandleManager } from "@/components/file-handle-manager"
import { useTheme } from "@/components/providers/theme-provider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
})

function SettingsPage() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="animate-in fade-in flex flex-col items-center space-y-4 py-4 duration-500">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight">Settings</CardTitle>
          <CardDescription>Manage your application preferences and data storage.</CardDescription>
        </CardHeader>
      </Card>

      {/* Appearance */}
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={Sun01Icon} />
            <span className="font-semibold">Appearance</span>
          </div>
          <CardDescription>Customize how Simple Budget looks on your device.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div className="bg-muted flex flex-1 items-center gap-1 rounded-lg border p-1">
              <Button
                variant={theme === "light" ? "default" : "ghost"}
                size="sm"
                onClick={() => setTheme("light")}
                className={cn("flex-1 px-2", theme === "light" && "shadow-sm")}
              >
                <HugeiconsIcon icon={Sun01Icon} size={16} />
                <span className="ml-2">Light</span>
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "ghost"}
                size="sm"
                onClick={() => setTheme("dark")}
                className={cn("flex-1 px-2", theme === "dark" && "shadow-sm")}
              >
                <HugeiconsIcon icon={Moon01Icon} size={16} />
                <span className="ml-2">Dark</span>
              </Button>
              <Button
                variant={theme === "system" ? "default" : "ghost"}
                size="sm"
                onClick={() => setTheme("system")}
                className={cn("flex-1 px-2", theme === "system" && "shadow-sm")}
              >
                <HugeiconsIcon icon={ComputerIcon} size={16} />
                <span className="ml-2">System</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Storage */}
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={Database02Icon} />
            <span className="font-semibold">Data Storage</span>
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
