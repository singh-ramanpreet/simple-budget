"use client"

/**
 * EmptyState
 *
 * Shown when no CSV file is connected. Directs the user to settings.
 */

import { Button } from "@/components/ui/button"
import { Database, Settings } from "lucide-react"
import { Link } from "@tanstack/react-router"

export default function EmptyState() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center space-y-6 px-4 pt-20 text-center">
      <div className="bg-primary/5 text-primary border-primary/10 rounded-full border p-6 shadow-inner">
        <Database size={48} />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">No Data Source Connected</h2>
        <p className="text-muted-foreground leading-relaxed">Connect a CSV file in settings to get started.</p>
      </div>
      <Button asChild className="shadow-primary/20 px-8 shadow-lg transition-all hover:scale-105">
        <Link to="/settings">
          <Settings className="mr-2 h-4 w-4" /> Go to Settings
        </Link>
      </Button>
    </div>
  )
}
