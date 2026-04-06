"use client"

/**
 * EmptyState
 *
 * Shown when no CSV file is connected. Directs the user to settings.
 */

import { Button } from "@/components/ui/button"
import { Database, Settings } from "lucide-react"
import Link from "next/link"

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 pt-20 max-w-md mx-auto text-center px-4">
      <div className="p-6 rounded-full bg-primary/5 text-primary border border-primary/10 shadow-inner">
        <Database size={48} />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">No Data Source Connected</h2>
        <p className="text-muted-foreground leading-relaxed">
          Connect a CSV file in settings to get started.
        </p>
      </div>
      <Button asChild className="px-8 shadow-lg shadow-primary/20 transition-all hover:scale-105">
        <Link href="/settings">
          <Settings className="mr-2 h-4 w-4" /> Go to Settings
        </Link>
      </Button>
    </div>
  )
}
