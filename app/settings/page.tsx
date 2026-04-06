"use client"

import { useFileHandle } from "@/components/providers/file-handle-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileCode, FolderOpen, Database, HardDrive, CheckCircle2, AlertCircle, RefreshCcw } from "lucide-react"

export default function SettingsPage() {
  const { fileHandle, hasPermission, pickFile, requestAccess, clearHandle, syncWithFile } = useFileHandle()

  return (
    <div className="flex flex-col items-center space-y-4 py-4 animate-in fade-in duration-500">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight">Settings</CardTitle>
          <CardDescription>
            Manage your application preferences and data storage.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="w-full max-w-md border-primary/20 shadow-lg shadow-primary/5 bg-gradient-to-br from-background to-secondary/20 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <Database size={120} />
        </div>
        
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <HardDrive className="text-primary h-5 w-5" />
            <Badge variant="outline" className="text-[10px] font-mono tracking-widest uppercase">Storage</Badge>
          </div>
          <CardTitle className="text-xl">Local CSV Handling</CardTitle>
          <CardDescription>
            Data is stored in a local CSV file on your computer.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!fileHandle ? (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl border-primary/20 bg-primary/5 space-y-4 text-center group transition-all hover:border-primary/40 hover:bg-primary/10">
              <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                <FolderOpen size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">No CSV Connected</h3>
                <p className="text-xs text-muted-foreground max-w-[200px]">
                  Select a CSV file to store your budget data.
                </p>
              </div>
              <Button 
                onClick={pickFile} 
                size="sm" 
                className="px-6 shadow-md hover:shadow-primary/20 bg-primary hover:bg-primary/90"
              >
                <FileCode className="mr-2 h-4 w-4" /> Pick CSV
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border/60">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-background border shadow-sm text-primary">
                    <FileCode size={20} />
                  </div>
                  <div className="overflow-hidden">
                    <div className="font-medium text-sm truncate max-w-[140px]">{fileHandle.name}</div>
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      {hasPermission ? (
                        <span className="flex items-center text-emerald-500 font-medium">
                          <CheckCircle2 size={10} className="mr-1" /> Connected
                        </span>
                      ) : (
                        <span className="flex items-center text-amber-500 font-medium">
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
                  <Button variant="ghost" size="sm" onClick={clearHandle} className="h-8 px-3 text-muted-foreground hover:text-destructive text-[10px]">
                    Reset
                  </Button>
                </div>
              </div>

              {hasPermission && (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-emerald-500 text-[11px] flex gap-2">
                    <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                    <p>Saving changes directly to <span className="font-mono">{fileHandle.name}</span></p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={syncWithFile} 
                    className="w-full h-8 text-[10px]"
                  >
                    <RefreshCcw className="mr-2 h-3 w-3" /> Sync from File
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="pt-4 border-t border-dashed">
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Benefits</h4>
            <div className="grid gap-3 text-[11px] text-muted-foreground">
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
