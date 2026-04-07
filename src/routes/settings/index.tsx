import { createFileRoute } from "@tanstack/react-router"
import {
  AlertCircleIcon,
  CheckmarkCircle01Icon,
  Database02Icon,
  FileCodeIcon,
  FolderOpenIcon,
  Refresh03Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useFileHandle } from "@/components/providers/file-handle-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const Route = createFileRoute("/settings/")({
  component: SettingsPage,
})

function SettingsPage() {
  const { fileHandle, hasPermission, pickFile, requestAccess, clearHandle, syncWithFile } = useFileHandle()

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
          {!fileHandle ? (
            <div className="border-primary/20 bg-primary/5 group hover:border-primary/40 hover:bg-primary/10 flex flex-col items-center justify-center space-y-4 rounded-xl border-2 border-dashed p-8 text-center transition-all">
              <div className="bg-primary/10 text-primary rounded-full p-3 transition-transform group-hover:scale-110">
                <HugeiconsIcon icon={FolderOpenIcon} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">No CSV Connected</h3>
                <p className="text-muted-foreground max-w-[200px] text-xs">
                  Select a CSV file to store your budget data.
                </p>
              </div>
              <Button
                onClick={pickFile}
                size="sm"
                className="hover:shadow-primary/20 bg-primary hover:bg-primary/90 px-6 shadow-md"
              >
                <HugeiconsIcon icon={FileCodeIcon} /> Pick CSV
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-secondary/50 border-border/60 flex flex-col items-center gap-4 rounded-lg border p-3">
                <div className="flex w-full items-center gap-3">
                  <div className="bg-background text-primary rounded-lg border p-2 shadow-sm">
                    <HugeiconsIcon icon={FileCodeIcon} />
                  </div>
                  <div className="overflow-hidden">
                    <div className="max-w-[140px] truncate text-sm font-medium">{fileHandle.name}</div>
                    <div className="text-muted-foreground mt-0.5 flex items-center gap-1 text-[10px]">
                      {hasPermission ? (
                        <div className="flex items-center gap-1 text-center text-xs font-medium text-emerald-500">
                          <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} />
                          <span>Connected</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-center text-xs font-medium text-amber-500">
                          <HugeiconsIcon icon={AlertCircleIcon} size={16} />
                          <span>Permission Needed</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex w-full flex-row gap-2">
                  <Button variant="outline" onClick={requestAccess} className="flex-1">
                    Grant
                  </Button>
                  <Button variant="outline" onClick={clearHandle} className="flex-1">
                    Reset
                  </Button>
                </div>
              </div>

              {hasPermission && (
                <div className="space-y-3">
                  <div className="bg-primary/5 border-primary/20 flex items-center gap-2 rounded-lg border p-3 text-center text-xs font-medium text-emerald-500">
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} />
                    <p>
                      Saving changes directly to: <span className="font-mono">{fileHandle.name}</span>
                    </p>
                  </div>
                  <Button variant="outline" size="lg" onClick={syncWithFile} className="w-full">
                    <HugeiconsIcon icon={Refresh03Icon} /> Sync from File
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
