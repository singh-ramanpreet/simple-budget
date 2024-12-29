import { ReactNode } from "react"
import Navigation from "@/components/navigation"

interface DashboardLayoutProps {
  children: ReactNode
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex flex-col items-center pt-0">
      <Navigation />
      <main className="w-full pb-14">{children}</main>
    </div>
  )
}
