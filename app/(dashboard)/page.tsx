"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Dashboard() {
  return (
    <div className="flex justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>On Budget</CardTitle>
        </CardHeader>
        <CardContent>Hello, welcome to your dashboard. You are on budget!</CardContent>
      </Card>
    </div>
  )
}
