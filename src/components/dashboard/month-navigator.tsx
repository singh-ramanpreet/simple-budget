/**
 * MonthNavigator
 *
 * Reusable month navigation control with chevron buttons and a label.
 * Used in both the Transactions and Buckets cards.
 */

import { HugeiconsIcon } from "@hugeicons/react"
import { CircleArrowLeft02Icon, CircleArrowRight02Icon } from "@hugeicons/core-free-icons"

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
      <HugeiconsIcon icon={CircleArrowLeft02Icon} size={32} onClick={() => onNavigate(-1)} />
      <h2 className="text-lg font-medium">{label}</h2>
      <HugeiconsIcon icon={CircleArrowRight02Icon} size={32} onClick={() => onNavigate(1)} />
    </div>
  )
}
