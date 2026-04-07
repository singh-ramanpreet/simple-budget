import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router"

import appCss from "@/globals.css?url"
import { FileHandleProvider } from "@/components/providers/file-handle-provider"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { NavBar } from "@/components/layout/nav-bar"

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Simple Budget" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { name: "theme-color", content: "#0a0a0a" },
      { rel: "icon", href: "/favicon.ico" },
      { rel: "apple-touch-icon", href: "/apple-icon.png" },
    ],
  }),
  component: RootLayout,
})

function RootLayout() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider defaultTheme="system" storageKey="simple-budget-theme">
          <FileHandleProvider>
            <div className="mx-auto max-w-2xl p-2 pb-32">
              <Outlet />
            </div>
            <NavBar />
          </FileHandleProvider>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}
