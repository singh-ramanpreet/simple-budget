"use client"
import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
    <div className="flex flex-col items-center p-2">
      <header className="flex w-full max-w-md justify-center p-1">
        <h1 className="font-bold">Simple Budget</h1>
      </header>
      <Tabs value={currentTab} className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard" asChild>
            <Link href="/">Dashboard</Link>
          </TabsTrigger>
          <TabsTrigger value="settings" asChild>
            <Link href="/settings">Settings</Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <main className="w-full">{children}</main>
    </div>
  )
}

export default DashboardLayout
