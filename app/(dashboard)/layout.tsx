"use client"
import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, LayoutDashboard } from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const pathname = usePathname()

  const currentTab = pathname.includes("/settings")
    ? "settings"
    : pathname.includes("/profile")
      ? "profile"
      : "dashboard"

  return (
    <div className="flex flex-col items-center pt-0">
      <Tabs value={currentTab} className="w-full max-w-md overflow-hidden">
        <TabsList className="grid h-full grid-cols-2 rounded-t-none">
          <TabsTrigger value="dashboard" asChild>
            <Link href="/">
              <LayoutDashboard className="h-6 w-6" />
            </Link>
          </TabsTrigger>
          <TabsTrigger value="settings" asChild>
            <Link href="/settings">
              <Settings size={24} />
            </Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <main className="w-full">{children}</main>
    </div>
  )
}

export default DashboardLayout
