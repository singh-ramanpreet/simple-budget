"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Home, ChartColumnBig } from "lucide-react"

const tabs = [
  { value: "dashboard", icon: Home, href: "/dashboard" },
  { value: "charts", icon: ChartColumnBig, href: "/dashboard/charts" },
  { value: "settings", icon: Settings, href: "/dashboard/settings" },
]

export default function Navigation() {
  const pathname = usePathname()
  const currentTab = tabs.find((tab) => tab.href === pathname)?.value || "dashboard"

  return (
    <div className="fixed bottom-0 z-10 h-14 w-full max-w-md">
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
    </div>
  )
}
