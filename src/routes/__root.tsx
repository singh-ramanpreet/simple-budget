import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router"

import appCss from "./globals.css?url"
import { FileHandleProvider } from "@/components/providers/file-handle-provider"

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode
// }>) {
//   return (
//     <html lang="en">
//       <body className={`${geistSans.variable} ${geistMono.variable} dark antialiased`}>
//         <FileHandleProvider>{children}</FileHandleProvider>
//       </body>
//     </html>
//   )
// }

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Simple Budget" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
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
        <FileHandleProvider>
          <Outlet />
        </FileHandleProvider>
        <Scripts />
      </body>
    </html>
  )
}
