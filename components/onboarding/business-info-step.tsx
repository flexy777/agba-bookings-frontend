"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Upload, ArrowRight, Instagram, Loader2, AlertCircle } from "lucide-react"

interface BusinessInfoStepProps {
  onNext: () => void
  onDataChange: (data: any) => void
}

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

export default function BusinessInfoStep({ onNext, onDataChange }: BusinessInfoStepProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    description: "",
    address: "",
    instagram: "",
    logo: null as File | null,
    planType: "monthly", // Default to monthly
  })

  // Load business data from API
  useEffect(() => {
    const loadBusinessData = async () => {
      try {
        const token = localStorage.getItem("auth_token")
        if (!token) {
          setError("No authentication token found. Please sign in again.")
          setTimeout(() => {
            window.location.href = "/auth/login"
          }, 2000)
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
          console.log("API response data:", data) // Debug log

          // Pre-populate form with existing API data
          const newFormData = {
            businessName: data.business.business_name || "",
            businessType: data.business.business_type || "",
            description: data.business.description || "",
            address: data.business.address || "",
            instagram: data.business.instagram_handle || "",
            logo: null,
            planType: data.subscription.plan_type || "monthly",
          }

          setFormData(newFormData)
          onDataChange(newFormData)
          console.log("Form pre-populated with API data:", newFormData)
        } else if (response.status === 401) {
          // Token is invalid or expired
          localStorage.removeItem("auth_token")
          setError("Your session has expired. Please sign in again.")
          setTimeout(() => {
            window.location.href = "/auth/login"
          }, 2000)
        } else {
          setError("Failed to load business information. Please try again.")
        }
      } catch (err) {
        console.error("Error loading business data:", err)
        setError("Error loading your information. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    loadBusinessData()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    onDataChange(newData)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    const newData = { ...formData, logo: file }
    setFormData(newData)
    onDataChange(newData)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext()
  }

  const handleRetry = () => {
    window.location.reload()
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
            <span className="text-gray-600">Loading your business information...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 text-red-600">
              <AlertCircle className="h-6 w-6" />
              <span>{error}</span>
            </div>
            <div className="space-x-2">
              <Button onClick={handleRetry} variant="outline">
                Try Again
              </Button>
              <Button onClick={() => (window.location.href = "/auth/login")} className="bg-purple-600">
                Sign In Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Information</CardTitle>
        <CardDescription>Review and update your business details</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business Name */}
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name *</Label>
            <Input
              id="businessName"
              placeholder="e.g., Alex's Barber Shop"
              value={formData.businessName}
              onChange={(e) => handleInputChange("businessName", e.target.value)}
              required
            />
          </div>

          {/* Business Type */}
          <div className="space-y-2">
            <Label>Business Type *</Label>
            <Select value={formData.businessType} onValueChange={(value) => handleInputChange("businessType", value)}>
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

          {/* Plan Type Selection */}
          <div className="space-y-4">
            <Label>Choose Your Plan</Label>
            <RadioGroup
              value={formData.planType}
              onValueChange={(value) => handleInputChange("planType", value)}
              className="grid md:grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2">
                <Card
                  className={`border-2 cursor-pointer hover:border-purple-200 flex-1 ${formData.planType === "monthly" ? "border-purple-500 bg-purple-50" : ""}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <RadioGroupItem value="monthly" id="monthly" />
                      <Label htmlFor="monthly" className="font-medium cursor-pointer">
                        Monthly Plan
                      </Label>
                    </div>
                    <div className="text-2xl font-bold mb-1">
                      ₦3,500<span className="text-sm font-normal">/month</span>
                    </div>
                    <p className="text-sm text-gray-600">Fixed monthly fee, unlimited bookings</p>
                  </CardContent>
                </Card>
              </div>
              <div className="flex items-center space-x-2">
                <Card
                  className={`border-2 cursor-pointer hover:border-purple-200 flex-1 ${formData.planType === "transaction" ? "border-purple-500 bg-purple-50" : ""}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <RadioGroupItem value="transaction" id="transaction" />
                      <Label htmlFor="transaction" className="font-medium cursor-pointer">
                        Pay Per Transaction
                      </Label>
                    </div>
                    <div className="text-2xl font-bold mb-1">
                      5%<span className="text-sm font-normal"> per booking</span>
                    </div>
                    <p className="text-sm text-gray-600">Only pay when you earn</p>
                  </CardContent>
                </Card>
              </div>
            </RadioGroup>
          </div>

          {/* Logo Upload */}
          <div className="space-y-2">
            <Label>Business Logo (Optional)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="logo-upload" />
              <label htmlFor="logo-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Click to upload your logo or drag and drop</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
              </label>
              {formData.logo && <p className="text-sm text-green-600 mt-2">✓ {formData.logo.name} uploaded</p>}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Business Description</Label>
            <Textarea
              id="description"
              placeholder="Tell your customers what makes your business special..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="min-h-[100px]"
            />
            <p className="text-xs text-gray-500">This will appear on your public booking page</p>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Business Address</Label>
            <Input
              id="address"
              placeholder="Street address, City, State"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
            />
          </div>

          {/* Instagram */}
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram Handle (Optional)</Label>
            <div className="relative">
              <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="instagram"
                placeholder="yourbusiness"
                value={formData.instagram}
                onChange={(e) => handleInputChange("instagram", e.target.value)}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-gray-500">Link your Instagram for social proof</p>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={!formData.businessName || !formData.businessType}>
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
