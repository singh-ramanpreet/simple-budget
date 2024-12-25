"use client"
import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Home, ChartColumnBig } from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
}

const tabs = [
  { value: "dashboard", icon: Home, href: "/" },
  { value: "charts", icon: ChartColumnBig, href: "/charts" },
  { value: "settings", icon: Settings, href: "/settings" },
]

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const pathname = usePathname()

  const currentTab = tabs.find((tab) => pathname.startsWith(tab.href) && tab.href !== "/")?.value ?? "dashboard"

  return (
    <div className="flex flex-col items-center pt-0">
      <header className="fixed bottom-0 z-10 h-14 w-full max-w-md">
        <Tabs value={currentTab} className="h-full overflow-hidden">
          <TabsList className="flex h-full justify-between gap-2 rounded-none p-2 px-4">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="h-full" asChild>
                <Link href={tab.href}>
                  <tab.icon className="h-full" />
                </Link>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </header>
      <main className="w-full pb-14">{children}</main>
    </div>
  )
}

export default DashboardLayout
