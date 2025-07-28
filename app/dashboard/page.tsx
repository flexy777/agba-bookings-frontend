"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, DollarSign, Clock, Plus, Settings, ExternalLink, Copy } from "lucide-react"
import Link from "next/link"

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

export default function Dashboard() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copySuccess, setCopySuccess] = useState(false)

  useEffect(() => {
    // Check if user just completed payment
    const paymentInProgress = localStorage.getItem("payment_in_progress")
    if (paymentInProgress) {
      // Clear the flag
      localStorage.removeItem("payment_in_progress")
      localStorage.removeItem("redirect_after_payment")

      // Show welcome message or payment success notification
      console.log("Payment completed, user redirected to dashboard")
    }

    // Load user data
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      console.log("Dashboard - checking token:", token ? "Token exists" : "No token found")

      if (!token) {
        console.log("No auth token found, redirecting to login")
        window.location.href = "/auth/login"
        return
      }

      console.log("Making API request with token...")
      const response = await fetch("http://127.0.0.1:8000/api/business/account/me/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("API response status:", response.status)

      if (response.ok) {
        const data: UserData = await response.json()
        console.log("User data loaded successfully:", data)
        setUserData(data)
      } else if (response.status === 401) {
        console.log("Token invalid (401), clearing storage and redirecting")
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user_info")
        localStorage.removeItem("business_info")
        window.location.href = "/auth/login"
      } else {
        console.error("API error:", response.status)
        // Don't redirect on other errors, just log them
      }
    } catch (err) {
      console.error("Error loading user data:", err)
      // Don't redirect on network errors, just log them
    } finally {
      setIsLoading(false)
    }
  }

  const getPublicBookingUrl = () => {
    if (userData?.business?.slug) {
      return `${window.location.origin}/book/${userData.business.slug}`
    }
    return `${window.location.origin}/book/your-business`
  }

  const copyBookingUrl = async () => {
    try {
      await navigator.clipboard.writeText(getPublicBookingUrl())
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error("Failed to copy URL:", err)
    }
  }

  const stats = [
    { title: "Total Bookings", value: "127", change: "+12%", icon: Calendar },
    { title: "Revenue", value: "₦45,600", change: "+8%", icon: DollarSign },
    { title: "Active Clients", value: "89", change: "+5%", icon: Users },
    { title: "Avg. Session", value: "45min", change: "+2min", icon: Clock },
  ]

  const recentBookings = [
    {
      id: 1,
      client: "Sarah Johnson",
      service: "Hair Cut & Style",
      time: "2:00 PM",
      status: "confirmed",
      amount: "₦3,500",
    },
    { id: 2, client: "Mike Chen", service: "Beard Trim", time: "3:30 PM", status: "pending", amount: "₦1,500" },
    { id: 3, client: "Emma Davis", service: "Full Service", time: "4:00 PM", status: "confirmed", amount: "₦5,000" },
    { id: 4, client: "John Smith", service: "Quick Wash", time: "5:15 PM", status: "completed", amount: "₦2,000" },
  ]

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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">
                Welcome back, {userData?.business?.business_name || userData?.user?.first_name || "there"}!
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href={getPublicBookingUrl()} target="_blank">
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Public Page
                </Button>
              </Link>
              <Link href="/dashboard/settings">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Booking URL Card */}
        <Card className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Your Booking Page</h3>
                <p className="text-sm text-gray-600 mb-3">Share this link with your customers to accept bookings</p>
                <code className="text-sm bg-white px-3 py-2 rounded border text-purple-700">
                  {getPublicBookingUrl()}
                </code>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={copyBookingUrl}>
                  <Copy className="h-4 w-4 mr-1" />
                  {copySuccess ? "Copied!" : "Copy"}
                </Button>
                <Link href={getPublicBookingUrl()} target="_blank">
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-green-600">{stat.change} from last month</p>
                    </div>
                    <Icon className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Bookings */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Recent Bookings</CardTitle>
                  <CardDescription>Your latest appointments and their status</CardDescription>
                </div>
                <Link href="/dashboard/bookings">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="font-medium text-gray-900">{booking.client}</p>
                          <p className="text-sm text-gray-600">{booking.service}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{booking.time}</p>
                        <p className="text-sm text-gray-600">{booking.amount}</p>
                      </div>
                      <Badge
                        variant={
                          booking.status === "confirmed"
                            ? "default"
                            : booking.status === "pending"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your business efficiently</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/dashboard/services">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Service
                </Button>
              </Link>
              <Link href="/dashboard/calendar">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Calendar
                </Button>
              </Link>
              <Link href="/dashboard/clients">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Clients
                </Button>
              </Link>
              <Link href="/dashboard/analytics">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <DollarSign className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Today's Schedule */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>Your appointments for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg bg-blue-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-600">10:00 AM</span>
                  <Badge variant="outline">30min</Badge>
                </div>
                <p className="font-medium">Sarah Johnson</p>
                <p className="text-sm text-gray-600">Hair Cut & Style</p>
              </div>
              <div className="p-4 border rounded-lg bg-green-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-600">2:00 PM</span>
                  <Badge variant="outline">45min</Badge>
                </div>
                <p className="font-medium">Mike Chen</p>
                <p className="text-sm text-gray-600">Full Service</p>
              </div>
              <div className="p-4 border rounded-lg bg-purple-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-purple-600">4:30 PM</span>
                  <Badge variant="outline">20min</Badge>
                </div>
                <p className="font-medium">Emma Davis</p>
                <p className="text-sm text-gray-600">Quick Trim</p>
              </div>
              <div className="p-4 border rounded-lg border-dashed">
                <div className="text-center text-gray-500">
                  <Plus className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Add Appointment</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
