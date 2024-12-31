"use client"

import { format } from "date-fns"
import dynamic from "next/dynamic"

function ClientDateFormat({ date, fmt }: { date: string | Date; fmt: string }) {
  return <span>{format(new Date(date), fmt)}</span>
}

export default dynamic(() => Promise.resolve(ClientDateFormat), { ssr: false })
