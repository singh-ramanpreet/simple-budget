import { ReactNode } from "react"
import Link from "next/link"
import Image from "next/image"
import icon from "@/app/icon.svg"

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen place-items-center">
      <div className="mx-auto w-full max-w-[350px] space-y-6">
        <div className="flex justify-center">
          <div className="flex flex-col items-center space-y-2 text-center">
            <Image src={icon} alt="Simple Budget" width={48} height={48} />
            <Link href="/">Simple Budget</Link>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
