import { createFileRoute } from "@tanstack/react-router"
import { useFileHandle } from "@/components/providers/file-handle-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileCode, FolderOpen, Database, HardDrive, CheckCircle2, AlertCircle, RefreshCcw } from "lucide-react"

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

      <Card className="border-primary/20 shadow-primary/5 from-background to-secondary/20 relative w-full max-w-md overflow-hidden bg-gradient-to-br shadow-lg">
        <div className="pointer-events-none absolute top-0 right-0 p-8 opacity-[0.03]">
          <Database size={120} />
        </div>

        <CardHeader>
          <div className="mb-2 flex items-center gap-2">
            <HardDrive className="text-primary h-5 w-5" />
            <Badge variant="outline" className="font-mono text-[10px] tracking-widest uppercase">
              Storage
            </Badge>
          </div>
          <CardTitle className="text-xl">Local CSV Handling</CardTitle>
          <CardDescription>Data is stored in a local CSV file on your computer.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {!fileHandle ? (
            <div className="border-primary/20 bg-primary/5 group hover:border-primary/40 hover:bg-primary/10 flex flex-col items-center justify-center space-y-4 rounded-xl border-2 border-dashed p-8 text-center transition-all">
              <div className="bg-primary/10 text-primary rounded-full p-3 transition-transform group-hover:scale-110">
                <FolderOpen size={32} />
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
                <FileCode className="mr-2 h-4 w-4" /> Pick CSV
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-secondary/50 border-border/60 flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <div className="bg-background text-primary rounded-lg border p-2 shadow-sm">
                    <FileCode size={20} />
                  </div>
                  <div className="overflow-hidden">
                    <div className="max-w-[140px] truncate text-sm font-medium">{fileHandle.name}</div>
                    <div className="text-muted-foreground mt-0.5 flex items-center gap-1 text-[10px]">
                      {hasPermission ? (
                        <span className="flex items-center font-medium text-emerald-500">
                          <CheckCircle2 size={10} className="mr-1" /> Connected
                        </span>
                      ) : (
                        <span className="flex items-center font-medium text-amber-500">
                          <AlertCircle size={10} className="mr-1" /> Permission Needed
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!hasPermission && (
                    <Button variant="outline" size="sm" onClick={requestAccess} className="h-8 px-3 text-[10px]">
                      Grant
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearHandle}
                    className="text-muted-foreground hover:text-destructive h-8 px-3 text-[10px]"
                  >
                    Reset
                  </Button>
                </div>
              </div>

              {hasPermission && (
                <div className="space-y-3">
                  <div className="flex gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-[11px] text-emerald-500">
                    <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                    <p>
                      Saving changes directly to <span className="font-mono">{fileHandle.name}</span>
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={syncWithFile} className="h-8 w-full text-[10px]">
                    <RefreshCcw className="mr-2 h-3 w-3" /> Sync from File
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="border-t border-dashed pt-4">
            <h4 className="text-muted-foreground mb-3 text-[10px] font-semibold tracking-wider uppercase">Benefits</h4>
            <div className="text-muted-foreground grid gap-3 text-[11px]">
              <div className="space-y-0.5">
                <p className="text-foreground font-medium">Privacy First</p>
                <p>Financial data stays on your machine.</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-foreground font-medium">Excel Compatible</p>
                <p>Open your budget in Excel or Google Sheets anytime.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
