"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  User,
  Building,
  CreditCard,
  Shield,
  LogOut,
  Key,
  Bell,
  Save,
  ArrowLeft,
  AlertCircle,
  Check,
} from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface UserData {
  user: {
    id: string
    username: string
    email: string
    first_name: string
    phone: string
  }
  business: {
    id: string
    business_name: string
    business_type: string
    description: string
    address: string
    instagram_handle: string
    logo_url: string | null
    slug: string
    opening_time: string
    closing_time: string
    timezone: string
    is_active: boolean
    created_at: string
    updated_at: string
  }
  subscription: {
    id: string
    plan_type: string
    status: string
    monthly_fee: number | null
    transaction_percentage: string
    current_period_start: string
    current_period_end: string
    is_trial: boolean
    trial_ends_at: string | null
    created_at: string
    updated_at: string
  }
}

export default function SettingsPage() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      console.log("Settings - checking token:", token ? "Token exists" : "No token found")

      if (!token) {
        console.log("No auth token found, redirecting to login")
        window.location.href = "/auth/login"
        return
      }

      const response = await fetch("http://127.0.0.1:8000/api/business/account/me/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data: UserData = await response.json()
        setUserData(data)
      } else if (response.status === 401) {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user_info")
        localStorage.removeItem("business_info")
        window.location.href = "/auth/login"
      } else {
        setError("Failed to load user information. Please try again.")
      }
    } catch (err) {
      console.error("Error loading user data:", err)
      setError("Error loading your information. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      if (token) {
        // Call logout API
        await fetch("http://127.0.0.1:8000/api/business/logout/", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
      }
    } catch (err) {
      console.error("Logout error:", err)
    } finally {
      // Clear local storage and redirect
      localStorage.removeItem("auth_token")
      localStorage.removeItem("user_info")
      localStorage.removeItem("business_info")
      window.location.href = "/auth/login"
    }
  }

  const handleForgotPassword = () => {
    window.location.href = "/auth/forgot-password"
  }

  const saveBusinessInfo = async () => {
    if (!userData) return

    setIsSaving(true)
    setMessage({ type: "", text: "" })

    try {
      const token = localStorage.getItem("auth_token")
      if (!token) return

      const response = await fetch("http://127.0.0.1:8000/api/business/profile/", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          business_name: userData.business.business_name,
          description: userData.business.description,
          address: userData.business.address,
          instagram_handle: userData.business.instagram_handle,
        }),
      })

      if (response.ok) {
        setMessage({ type: "success", text: "Business information updated successfully!" })
      } else {
        setMessage({ type: "error", text: "Failed to update business information." })
      }
    } catch (err) {
      setMessage({ type: "error", text: "Network error. Please try again." })
    } finally {
      setIsSaving(false)
    }
  }

  const updateBusinessField = (field: string, value: string) => {
    if (!userData) return
    setUserData({
      ...userData,
      business: {
        ...userData.business,
        [field]: value,
      },
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600">Manage your account and business settings</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-4xl mx-auto">
        {/* Message */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
              message.type === "success" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
            }`}
          >
            {message.type === "success" ? (
              <Check className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            <span className={message.type === "success" ? "text-green-700" : "text-red-700"}>{message.text}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-lg flex items-center space-x-2 bg-red-50 border border-red-200">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardHeader className="text-center">
              <Avatar className="h-20 w-20 mx-auto mb-4">
                <AvatarImage src={userData?.business?.logo_url || "/placeholder.svg?height=80&width=80"} />
                <AvatarFallback className="text-lg">
                  {userData?.business?.business_name?.charAt(0) || "B"}
                </AvatarFallback>
              </Avatar>
              <CardTitle>{userData?.business?.business_name}</CardTitle>
              <CardDescription>{userData?.user?.email}</CardDescription>
              <Badge variant="outline" className="w-fit mx-auto">
                {userData?.subscription?.plan_type === "monthly" ? "Monthly Plan" : "Transaction Plan"}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">Public Booking URL:</p>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded block">
                  bookeasy.ng/{userData?.business?.slug}
                </code>
              </div>
              <div className="space-y-2">
                <Button variant="outline" className="w-full bg-transparent" onClick={handleForgotPassword}>
                  <Key className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
                <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full text-red-600 hover:text-red-700 bg-transparent">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Sign Out</DialogTitle>
                      <DialogDescription>Are you sure you want to sign out of your account?</DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleLogout}>
                        Sign Out
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Settings Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Business Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Business Information
                </CardTitle>
                <CardDescription>Update your business details and public information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={userData?.business?.business_name || ""}
                    onChange={(e) => updateBusinessField("business_name", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={userData?.business?.description || ""}
                    onChange={(e) => updateBusinessField("description", e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={userData?.business?.address || ""}
                    onChange={(e) => updateBusinessField("address", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram Handle</Label>
                  <Input
                    id="instagram"
                    value={userData?.business?.instagram_handle || ""}
                    onChange={(e) => updateBusinessField("instagram_handle", e.target.value)}
                    placeholder="@yourbusiness"
                  />
                </div>

                <Button onClick={saveBusinessInfo} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Account Information
                </CardTitle>
                <CardDescription>Your personal account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={userData?.user?.first_name || ""} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={userData?.user?.email || ""} disabled />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={userData?.user?.phone || ""} disabled />
                </div>
                <p className="text-sm text-gray-500">To update your personal information, please contact support.</p>
              </CardContent>
            </Card>

            {/* Subscription Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Subscription
                </CardTitle>
                <CardDescription>Your current plan and billing information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">
                      {userData?.subscription?.plan_type === "monthly" ? "Monthly Plan" : "Pay Per Transaction"}
                    </div>
                    <div className="text-sm text-gray-600">
                      {userData?.subscription?.plan_type === "monthly"
                        ? `₦${userData?.subscription?.monthly_fee}/month`
                        : `${userData?.subscription?.transaction_percentage}% per booking`}
                    </div>
                  </div>
                  <Badge variant={userData?.subscription?.status === "active" ? "default" : "secondary"}>
                    {userData?.subscription?.status}
                  </Badge>
                </div>

                {userData?.subscription?.plan_type === "monthly" && (
                  <div className="text-sm text-gray-600">
                    <p>
                      Current period: {userData?.subscription?.current_period_start} to{" "}
                      {userData?.subscription?.current_period_end}
                    </p>
                  </div>
                )}

                <Button variant="outline">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Manage Subscription
                </Button>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notifications
                </CardTitle>
                <CardDescription>Manage your notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Email Notifications</div>
                    <div className="text-sm text-gray-600">Receive booking confirmations and updates</div>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">SMS Notifications</div>
                    <div className="text-sm text-gray-600">Get text messages for urgent updates</div>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Marketing Emails</div>
                    <div className="text-sm text-gray-600">Tips and updates about BookEasy</div>
                  </div>
                  <input type="checkbox" className="rounded" />
                </div>
              </CardContent>
            </Card>

            {/* Privacy & Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Privacy & Security
                </CardTitle>
                <CardDescription>Manage your privacy and security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Public Profile</div>
                    <div className="text-sm text-gray-600">Allow your business to be found in search</div>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Two-Factor Authentication</div>
                    <div className="text-sm text-gray-600">Add an extra layer of security</div>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable
                  </Button>
                </div>
                <div className="pt-4 border-t">
                  <Button variant="outline" className="text-red-600 hover:text-red-700 bg-transparent">
                    Delete Account
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">Permanently delete your account and all associated data.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
