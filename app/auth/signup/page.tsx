"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, ArrowRight, Eye, EyeOff, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isClient, setIsClient] = useState(false)
  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    businessType: "",
    description: "",
    email: "",
    phone: "",
    password: "",
    address: "",
    instagramHandle: "",
    openingTime: "09:00",
    closingTime: "18:00",
    planType: "monthly", // Change from "transaction" to "monthly"
  })

  // Ensure we're on the client side before accessing localStorage
  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("") // Clear error when user starts typing
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("https://api.legitbills.com/agba/api/business/signup/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.email,
          business_name: formData.businessName,
          name: formData.ownerName,
          business_type: formData.businessType,
          description: formData.description,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          address: formData.address,
          instagram_handle: formData.instagramHandle,
          opening_time: formData.openingTime,
          closing_time: formData.closingTime,
          plan_type: formData.planType,
        }),
      })

      const data = await response.json()
      console.log("Signup response:", data) // Debug log

      if (response.ok) {
        // Only access localStorage on client side
        if (isClient && typeof window !== "undefined") {
          // Store auth token if provided
          const token = data.access_token || data.token || data.access || data.auth_token
          if (token) {
            localStorage.setItem("auth_token", token)
            console.log("Token stored:", token)
          }

          // Store user info if available
          if (data.user) {
            localStorage.setItem("user_info", JSON.stringify(data.user))
          }

          // Store business info if available
          if (data.business) {
            localStorage.setItem("business_info", JSON.stringify(data.business))
          }

          // Add a small delay to ensure localStorage writes complete
          setTimeout(() => {
            window.location.href = "/onboarding"
          }, 100)
        } else {
          // Fallback for SSR
          window.location.href = "/onboarding"
        }
      } else {
        // Handle API errors
        setError(data.message || data.detail || data.error || "Signup failed. Please try again.")
      }
    } catch (err) {
      console.error("Signup error:", err)
      setError("Network error. Please check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Don't render form until we're on client side to avoid hydration issues
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Calendar className="h-8 w-8 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900">BookEasy</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Business Profile</h1>
            <p className="text-gray-600">Get started with your automated booking system in minutes</p>
          </div>
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Calendar className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">BookEasy</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Business Profile</h1>
          <p className="text-gray-600">Get started with your automated booking system in minutes</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>Tell us about your service business</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Details */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="business-name">Business Name *</Label>
                  <Input
                    id="business-name"
                    placeholder="e.g., Alex's Barber Shop"
                    value={formData.businessName}
                    onChange={(e) => handleInputChange("businessName", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="owner-name">Your Name *</Label>
                  <Input
                    id="owner-name"
                    placeholder="e.g., Alex Johnson"
                    value={formData.ownerName}
                    onChange={(e) => handleInputChange("ownerName", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="business-type">Business Type *</Label>

                <Select
                  value={formData.businessType}
                  onValueChange={(value) => handleInputChange("businessType", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your business type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salon">Hair Salon</SelectItem>
                    <SelectItem value="barber">Barber Shop</SelectItem>
                    <SelectItem value="spa">Spa & Wellness</SelectItem>
                    <SelectItem value="laundry">Laundry Service</SelectItem>
                    <SelectItem value="home-service">Home Service</SelectItem>
                    <SelectItem value="fitness">Fitness & Training</SelectItem>
                    <SelectItem value="beauty">Beauty Services</SelectItem>
                    <SelectItem value="automotive">Automotive</SelectItem>
                    <SelectItem value="cleaning">Cleaning Service</SelectItem>
                    <SelectItem value="catering">Catering</SelectItem>
                    <SelectItem value="photography">Photography</SelectItem>
                    <SelectItem value="event-planning">Event Planning</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                    <SelectItem value="education">Education & Tutoring</SelectItem>
                    <SelectItem value="construction">Construction & Renovation</SelectItem>
                    <SelectItem value="legal">Legal Services</SelectItem>
                    <SelectItem value="accounting">Accounting & Finance</SelectItem>
                    <SelectItem value="real-estate">Real Estate</SelectItem>
                    <SelectItem value="healthcare">Healthcare & Wellness</SelectItem>
                    <SelectItem value="pet-care">Pet Care</SelectItem>
                    <SelectItem value="transportation">Transportation & Logistics</SelectItem>
                    <SelectItem value="retail">Retail & E-commerce</SelectItem>
                    <SelectItem value="hospitality">Hospitality & Tourism</SelectItem>
                    <SelectItem value="non-profit">Non-Profit & Charity</SelectItem>
                    <SelectItem value="technology">Technology & IT Services</SelectItem>
                    <SelectItem value="media">Media & Entertainment</SelectItem>
                    <SelectItem value="marketing">Marketing & Advertising</SelectItem>
                    <SelectItem value="design">Design & Creative Services</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Business Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of your services and what makes you special"
                  className="min-h-[100px]"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                />
              </div>

              {/* Contact Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    placeholder="+234 801 234 5678"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Business Address</Label>
                <Input
                  id="address"
                  placeholder="Street address, City, State"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                />
              </div>

              {/* Social Media */}
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram Handle (Optional)</Label>
                <Input
                  id="instagram"
                  placeholder="@yourbusiness"
                  value={formData.instagramHandle}
                  onChange={(e) => handleInputChange("instagramHandle", e.target.value)}
                />
              </div>

              {/* Operating Hours */}
              <div className="space-y-4">
                <Label>Operating Hours</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="open-time">Opening Time</Label>
                    <Input
                      id="open-time"
                      type="time"
                      value={formData.openingTime}
                      onChange={(e) => handleInputChange("openingTime", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="close-time">Closing Time</Label>
                    <Input
                      id="close-time"
                      type="time"
                      value={formData.closingTime}
                      onChange={(e) => handleInputChange("closingTime", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Pricing Plan */}
              <div className="space-y-4">
                <Label>Choose Your Plan</Label>
                <div className="grid md:grid-cols-2 gap-4">
                  <Card
                    className={`border-2 cursor-pointer hover:border-purple-200 ${formData.planType === "monthly" ? "border-purple-500 bg-purple-50" : ""}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <input
                          type="radio"
                          name="plan"
                          value="monthly"
                          className="text-purple-600"
                          checked={formData.planType === "monthly"}
                          onChange={(e) => handleInputChange("planType", e.target.value)}
                        />
                        <span className="font-medium">Monthly Plan</span>
                      </div>
                      <div className="text-2xl font-bold mb-1">
                        ₦3,500<span className="text-sm font-normal">/month</span>
                      </div>
                      <p className="text-sm text-gray-600">Fixed monthly fee, unlimited bookings</p>
                    </CardContent>
                  </Card>
                  <Card
                    className={`border-2 cursor-pointer hover:border-purple-200 ${formData.planType === "transaction" ? "border-purple-500 bg-purple-50" : ""}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <input
                          type="radio"
                          name="plan"
                          value="transaction"
                          className="text-purple-600"
                          checked={formData.planType === "transaction"}
                          onChange={(e) => handleInputChange("planType", e.target.value)}
                        />
                        <span className="font-medium">Pay Per Transaction</span>
                      </div>
                      <div className="text-2xl font-bold mb-1">
                        5%<span className="text-sm font-normal"> per booking</span>
                      </div>
                      <p className="text-sm text-gray-600">Only pay when you earn</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="terms" className="rounded" required />
                <Label htmlFor="terms" className="text-sm">
                  I agree to the{" "}
                  <Link href="/terms" className="text-purple-600 hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-purple-600 hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Your Business Profile...
                  </>
                ) : (
                  <>
                    Create My Booking Page
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-purple-600 hover:underline">
                  Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
