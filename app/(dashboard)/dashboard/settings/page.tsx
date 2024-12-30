"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Profile from "@/components/profile"
import ChangeName from "@/components/change-name"
import ChangePassword from "@/components/change-password"
import ManageSessions from "@/components/manage-sessions"

export default function Settings() {
  return (
    <>
      <div className="flex justify-center pb-4 pt-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Profile />
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-center py-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Change Name</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ChangeName />
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-center py-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Manage Sessions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ManageSessions />
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-center py-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ChangePassword />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
