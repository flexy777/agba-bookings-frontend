"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  ArrowLeft,
  ExternalLink,
  Check,
  Clock,
  DollarSign,
  Calendar,
  Globe,
  Sparkles,
  Loader2,
  CreditCard,
} from "lucide-react"

interface ReviewStepProps {
  formData: any
  onPrevious: () => void
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

export default function ReviewStep({ formData, onPrevious }: ReviewStepProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("auth_token")
        if (!token) return

        const response = await fetch("https://api.legitbills.com/api/business/account/me/", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const data: UserData = await response.json()
          setUserData(data)
        }
      } catch (err) {
        console.error("Error fetching user data:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const handleMonthlyPayment = async () => {
    setIsProcessing(true)
    setError(null)

    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        setError("No authentication token found. Please sign in again.")
        setIsProcessing(false)
        return
      }

      const response = await fetch("https://api.legitbills.com/subscription/subscription/start/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (response.ok) {
        if (data.checkout_url || data.authorization_url || data.payment_url) {
          const checkoutUrl = data.checkout_url || data.authorization_url || data.payment_url
          localStorage.setItem("payment_in_progress", "true")
          localStorage.setItem("redirect_after_payment", "dashboard")
          window.location.href = checkoutUrl
        } else {
          // Payment successful immediately
          window.location.href = "/dashboard"
        }
      } else {
        setError("Failed to process payment. Please try again.")
        setIsProcessing(false)
      }
    } catch (err) {
      setError("Network error. Please try again.")
      setIsProcessing(false)
    }
  }

  const handleTransactionSetup = async () => {
    setIsProcessing(true)
    setError(null)

    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        setError("No authentication token found. Please sign in again.")
        setIsProcessing(false)
        return
      }

      const response = await fetch("https://api.legitbills.com/payment/create-subaccount/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          business_name: userData?.business.business_name || formData.businessInfo?.businessName,
          account_number: formData.payment?.paystackDetails?.accountNumber,
          bank_code: formData.payment?.paystackDetails?.bankCode,
        }),
      })

      if (response.ok) {
        // Redirect to dashboard
        window.location.href = "/dashboard"
      } else {
        const data = await response.json()
        setError(data.message || "Failed to create subaccount. Please try again.")
        setIsProcessing(false)
      }
    } catch (err) {
      setError("Network error. Please try again.")
      setIsProcessing(false)
    }
  }

  const handleLaunch = () => {
    const planType = formData.businessInfo?.planType || userData?.subscription.plan_type

    if (planType === "monthly") {
      handleMonthlyPayment()
    } else {
      handleTransactionSetup()
    }
  }

  const businessInfo = userData?.business || formData.businessInfo || {}
  const services = formData.services || []
  const schedule = formData.schedule?.schedule || {}
  const payment = formData.payment || {}
  const planType = formData.businessInfo?.planType || userData?.subscription.plan_type

  const getBookingUrl = () => {
    if (userData?.business?.slug) {
      return `bookeasy.ng/${userData.business.slug}`
    }
    const businessName = businessInfo.business_name || businessInfo.businessName || "your-business"
    return `bookeasy.ng/${businessName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`
  }

  const getEnabledDays = () => {
    return Object.entries(schedule).filter(([_, day]: [string, any]) => day?.enabled).length
  }

  const getPlanDisplay = () => {
    if (userData?.subscription) {
      return userData.subscription.plan_type === "transaction"
        ? `${userData.subscription.transaction_percentage}% per booking`
        : `₦${userData.subscription.monthly_fee}/month`
    }
    return planType === "transaction" ? "5% per booking" : "₦3,500/month"
  }

  const getActionButtonText = () => {
    return planType === "monthly" ? "Complete Payment & Launch" : "Save & Continue to Dashboard"
  }

  const getActionButtonIcon = () => {
    return planType === "monthly" ? <CreditCard className="h-4 w-4 mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sparkles className="h-5 w-5 text-purple-600 mr-2" />
          Ready to Launch!
        </CardTitle>
        <CardDescription>
          Review your setup and {planType === "monthly" ? "complete payment" : "launch your booking page"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Business Preview */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Your Business Profile</h3>
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-start space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={businessInfo.logo_url || "/placeholder.svg?height=64&width=64"} />
                <AvatarFallback className="text-lg">
                  {(businessInfo.business_name || businessInfo.businessName || "B").charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900">
                  {businessInfo.business_name || businessInfo.businessName || "Your Business"}
                </h4>
                <p className="text-gray-600 mb-2">{businessInfo.description || "Professional service provider"}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <Badge variant="outline">
                    {businessInfo.business_type || businessInfo.businessType || "Service"}
                  </Badge>
                  {businessInfo.address && <span>{businessInfo.address}</span>}
                  {businessInfo.instagram_handle && <span>{businessInfo.instagram_handle}</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services Summary */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Services ({services.length})</h3>
          {services.length > 0 ? (
            <div className="space-y-2">
              {services.slice(0, 3).map((service: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{service.name}</div>
                    <div className="text-sm text-gray-600 flex items-center space-x-3">
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {service.duration_minutes}min
                      </span>
                      <span className="flex items-center">
                        <DollarSign className="h-3 w-3 mr-1" />₦{service.price}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {services.length > 3 && (
                <div className="text-sm text-gray-500 text-center py-2">+{services.length - 3} more services</div>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-500 p-3 border rounded-lg text-center">
              No services added yet. You can add them later in your dashboard.
            </div>
          )}
        </div>

        {/* Schedule Summary */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Availability</h3>
          <div className="p-3 border rounded-lg">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1 text-green-600" />
                <span>{getEnabledDays() > 0 ? `${getEnabledDays()} days per week` : "Schedule to be configured"}</span>
              </div>
              {userData?.business && (
                <div>
                  {userData.business.opening_time} - {userData.business.closing_time}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Payment Plan</h3>
          <div className="p-3 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{planType === "transaction" ? "Pay Per Transaction" : "Monthly Plan"}</span>
              <Badge variant="outline">{getPlanDisplay()}</Badge>
            </div>
            <div className="text-sm text-gray-600">
              {planType === "transaction"
                ? "You'll earn money with each booking and pay 5% commission"
                : "Fixed monthly subscription - complete payment to activate"}
            </div>
          </div>
        </div>

        {/* Booking URL */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Your Booking Page</h3>
          <div className="p-4 border rounded-lg bg-purple-50">
            <div className="flex items-center space-x-2 mb-2">
              <Globe className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-purple-900">Public Booking URL</span>
            </div>
            <div className="flex items-center justify-between">
              <code className="text-sm bg-white px-2 py-1 rounded border">{getBookingUrl()}</code>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-1" />
                Preview
              </Button>
            </div>
          </div>
        </div>

        {/* Launch Checklist */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Setup Checklist</h3>
          <div className="space-y-2">
            {[
              {
                item: "Business information added",
                completed: !!(businessInfo.business_name || businessInfo.businessName),
              },
              { item: "Services configured", completed: services.length > 0 },
              { item: "Schedule set up", completed: getEnabledDays() > 0 || !!userData?.business },
              { item: "Payment method selected", completed: !!(userData?.subscription || planType) },
            ].map((check, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    check.completed ? "bg-green-100" : "bg-gray-100"
                  }`}
                >
                  {check.completed && <Check className="h-3 w-3 text-green-600" />}
                </div>
                <span className={`text-sm ${check.completed ? "text-gray-900" : "text-gray-500"}`}>{check.item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Plan-specific information */}
        {planType === "monthly" && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">Complete Payment</span>
            </div>
            <p className="text-sm text-blue-800">
              You'll be redirected to Paystack to complete your monthly subscription payment. After successful payment,
              you'll be taken to your dashboard.
            </p>
          </div>
        )}

        {planType === "transaction" && (
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Check className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-900">Ready to Launch</span>
            </div>
            <p className="text-sm text-green-800">
              Your payment settings have been configured. Click below to create your Paystack subaccount and launch your
              booking page.
            </p>
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrevious} disabled={isProcessing}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button
            onClick={handleLaunch}
            disabled={isProcessing}
            size="lg"
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {planType === "monthly" ? "Processing Payment..." : "Setting up..."}
              </>
            ) : (
              <>
                {getActionButtonIcon()}
                {getActionButtonText()}
              </>
            )}
          </Button>
        </div>

        {isProcessing && (
          <div className="text-center space-y-2">
            <div className="text-sm text-gray-600">
              {planType === "monthly" ? "Redirecting to payment..." : "Creating your subaccount..."}
            </div>
            <div className="text-xs text-gray-500">This may take a few moments</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
