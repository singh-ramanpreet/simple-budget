import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { FileHandleProvider } from "@/components/providers/file-handle-provider"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Simple Budget",
  description: "Simple Budget is a simple budgeting app",
  manifest: "/manifest.webmanifest",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} dark antialiased`}>
        <FileHandleProvider>{children}</FileHandleProvider>
      </body>
    </html>
  )
}
