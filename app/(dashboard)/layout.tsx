"use client"
import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Home } from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const pathname = usePathname()

  const currentTab = pathname.includes("/settings") ? "settings" : "dashboard"

  return (
    <div className="flex flex-col items-center pt-0">
      <header className="fixed bottom-0 z-10 h-14 w-full max-w-md">
        <Tabs value={currentTab} className="h-full overflow-hidden">
          <TabsList className="flex h-full justify-between gap-2 rounded-none p-2 px-4">
            <TabsTrigger value="dashboard" className="h-full" asChild>
              <Link href="/">
                <Home className="h-full" />
              </Link>
            </TabsTrigger>
            <TabsTrigger value="settings" asChild>
              <Link href="/settings">
                <Settings size={24} />
              </Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </header>
      <main className="w-full pb-14">{children}</main>
    </div>
  )
}

export default DashboardLayout
