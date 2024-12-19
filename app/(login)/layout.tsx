import { ReactNode } from "react"
import Link from "next/link"

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen place-items-center">
      <div className="mx-auto w-full max-w-[350px] space-y-6">
        <div className="flex justify-center">
          <Link href="/">On Budget</Link>
        </div>
        {children}
      </div>
    </div>
  )
}
