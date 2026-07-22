import { Outlet, createRootRoute } from "@tanstack/react-router"

import { FileHandleProvider } from "@/components/providers/file-handle-provider"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { NavBar } from "@/components/layout/nav-bar"

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="simple-budget-theme">
      <FileHandleProvider>
        <div className="mx-auto max-w-2xl p-2 pb-32">
          <Outlet />
        </div>
        <NavBar />
      </FileHandleProvider>
    </ThemeProvider>
  )
}
