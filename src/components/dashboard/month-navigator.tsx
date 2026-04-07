/**
 * MonthNavigator
 *
 * Reusable month navigation control with chevron buttons and a label.
 * Used in both the Transactions and Buckets cards.
 */

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface MonthNavigatorProps {
  month: number
  year: number
  onNavigate: (delta: number) => void
}

export default function MonthNavigator({ month, year, onNavigate }: MonthNavigatorProps) {
  const label = new Date(year, month - 1, 15).toLocaleString("default", {
    month: "long",
    year: "numeric",
  })

  return (
    <div className="flex items-center justify-between">
      <Button variant="link" className="hover:bg-muted rounded-full" onClick={() => onNavigate(-1)}>
        <ChevronLeft className="text-muted-foreground" />
      </Button>
      <h2 className="text-lg font-medium">{label}</h2>
      <Button variant="link" className="hover:bg-muted rounded-full" onClick={() => onNavigate(1)}>
        <ChevronRight className="text-muted-foreground" />
      </Button>
    </div>
  )
}
