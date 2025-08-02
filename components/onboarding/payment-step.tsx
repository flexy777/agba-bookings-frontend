"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  ArrowLeft,
  CreditCard,
  Smartphone,
  Building,
  Shield,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface PaymentStepProps {
  onNext: () => void
  onPrevious: () => void
  onDataChange: (data: any) => void
  formData: any
}

interface Bank {
  id: number
  name: string
  code: string
  slug: string
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

export default function PaymentStep({ onNext, onPrevious, onDataChange, formData }: PaymentStepProps) {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [banks, setBanks] = useState<Bank[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isResolvingAccount, setIsResolvingAccount] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [showAccountModal, setShowAccountModal] = useState(false)

  // Transaction plan states
  const [paymentMethods, setPaymentMethods] = useState({
    card: true,
    transfer: true,
    ussd: false,
  })
  const [paystackDetails, setPaystackDetails] = useState({
    businessName: "",
    accountNumber: "",
    accountName: "",
    bankCode: "",
    bvn: "",
  })

  // Load user data and banks on component mount
  useEffect(() => {
    loadUserData()
    loadBanks()
  }, [])

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        setError("No authentication token found. Please sign in again.")
        return
      }

      const response = await fetch("https://api.legitbills.com/api/business/account/me/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data: UserData = await response.json()
        setUserData(data)

        // Pre-populate business name
        setPaystackDetails((prev) => ({
          ...prev,
          businessName: data.business.business_name || "",
        }))

        console.log("User data loaded:", data)
      } else if (response.status === 401) {
        setError("Authentication failed. Please sign in again.")
        setTimeout(() => {
          window.location.href = "/auth/login"
        }, 2000)
      } else {
        setError("Failed to load user information. Please try again.")
      }
    } catch (err) {
      console.error("Error loading user data:", err)
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const loadBanks = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) return

      const response = await fetch("https://api.legitbills.com/payment/banks/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        // Handle different response formats
        const banksArray = Array.isArray(data) ? data : data.banks || data.data || []

        // Remove duplicates based on bank code
        const uniqueBanks = banksArray.filter(
          (bank: Bank, index: number, self: Bank[]) => index === self.findIndex((b) => b.code === bank.code),
        )

        setBanks(uniqueBanks)
        console.log("Banks loaded:", uniqueBanks)
      } else {
        console.error("Failed to load banks:", response.status)
        setBanks([]) // Set empty array as fallback
      }
    } catch (err) {
      console.error("Error loading banks:", err)
      setBanks([]) // Set empty array as fallback
    }
  }

  const resolveAccount = async () => {
    if (!paystackDetails.accountNumber || !paystackDetails.bankCode) {
      setError("Please enter account number and select a bank")
      return
    }

    setIsResolvingAccount(true)
    setError("")
    setSuccessMessage("")

    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        setError("No authentication token found")
        return
      }

      // Use GET request with query parameters
      const url = new URL("https://api.legitbills.com/payment/resolve-account/")
      url.searchParams.append("account_number", paystackDetails.accountNumber)
      url.searchParams.append("bank_code", paystackDetails.bankCode)

      console.log("Resolving account with URL:", url.toString())

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()
      console.log("Resolve account response:", data)

      if (response.ok && data.status && data.data?.account_name) {
        console.log("Account resolved successfully:", data.data.account_name)

        setPaystackDetails((prev) => {
          const updated = {
            ...prev,
            accountName: data.data.account_name,
          }
          console.log("Updated paystack details:", updated)
          return updated
        })

        setSuccessMessage("Account verified successfully!")

        // Force modal to show
        console.log("Setting modal to show")
        setShowAccountModal(true)

        // Also log the current state
        setTimeout(() => {
          console.log("Modal should be showing:", showAccountModal)
          console.log("Account name in state:", paystackDetails.accountName)
        }, 100)
      } else {
        console.error("Failed to resolve account:", data)
        setError(data.message || "Failed to resolve account. Please check your details.")
      }
    } catch (err) {
      console.error("Error resolving account:", err)
      setError("Network error. Please try again.")
    } finally {
      setIsResolvingAccount(false)
    }
  }

  const savePaymentSettings = async () => {
    setIsProcessing(true)
    setError("")

    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        setError("No authentication token found")
        return
      }

      const response = await fetch("https://api.legitbills.com/payment/settings/", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bank_name: banks.find((bank) => bank.code === paystackDetails.bankCode)?.name || "",
          account_number: paystackDetails.accountNumber,
          account_name: paystackDetails.accountName,
          bvn: paystackDetails.bvn,
          accepted_methods: paymentMethods,
          business: userData?.business.id,
        }),
      })

      if (response.ok) {
        setSuccessMessage("Payment settings saved successfully!")
        // Pass data to parent and continue
        onDataChange({
          planType: formData.businessInfo?.planType || userData?.subscription.plan_type,
          paymentMethods,
          paystackDetails,
        })
        setTimeout(() => {
          onNext()
        }, 1000)
      } else {
        const data = await response.json()
        setError(data.message || "Failed to save payment settings")
      }
    } catch (err) {
      console.error("Error saving payment settings:", err)
      setError("Network error. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePaymentMethodChange = (method: string, enabled: boolean) => {
    const newMethods = { ...paymentMethods, [method]: enabled }
    setPaymentMethods(newMethods)
  }

  const handlePaystackDetailsChange = (field: string, value: string) => {
    const newDetails = { ...paystackDetails, [field]: value }
    setPaystackDetails(newDetails)

    // Clear account name when account number or bank changes
    if (field === "accountNumber" || field === "bankCode") {
      newDetails.accountName = ""
      setSuccessMessage("")
    }
  }

  const handleNext = () => {
    const planType = formData.businessInfo?.planType || userData?.subscription.plan_type

    if (planType === "transaction") {
      // For transaction plan, save settings first
      savePaymentSettings()
    } else {
      // For monthly plan, just continue to review
      onDataChange({
        planType,
        paymentMethods,
        paystackDetails,
      })
      onNext()
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
            <span className="text-gray-600">Loading payment information...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error && !userData) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 text-red-600">
              <AlertCircle className="h-6 w-6" />
              <span>{error}</span>
            </div>
            <Button onClick={loadUserData} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const planType = formData.businessInfo?.planType || userData?.subscription.plan_type
  const isMonthlyPlan = planType === "monthly"
  const isTransactionPlan = planType === "transaction"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Setup</CardTitle>
        <CardDescription>
          {isMonthlyPlan
            ? "Review your monthly subscription details"
            : "Configure your payment processing settings for transaction-based payments"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Error/Success Messages */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
            <Check className="h-5 w-5 text-green-600" />
            <span className="text-green-700 text-sm">{successMessage}</span>
          </div>
        )}

        {/* Current Plan Display */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Your Selected Plan</h3>
          <Card className="border-2 border-purple-200 bg-purple-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{isMonthlyPlan ? "Monthly Plan" : "Pay Per Transaction"}</span>
                <Badge className="bg-purple-100 text-purple-800">Selected</Badge>
              </div>
              <div className="text-2xl font-bold mb-2">
                {isMonthlyPlan
                  ? `₦${userData?.subscription.monthly_fee || 3500}/month`
                  : `${userData?.subscription.transaction_percentage || "5"}% per booking`}
              </div>
              <p className="text-sm text-gray-600">
                {isMonthlyPlan ? "Fixed monthly fee, unlimited bookings" : "Only pay when you earn"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Plan - Info Only */}
        {isMonthlyPlan && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Monthly Subscription</h3>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <Shield className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Secure Payment with Paystack</span>
              </div>
              <p className="text-sm text-blue-800 mb-4">
                You'll complete your payment on the next step. After successful payment, you'll be redirected to your
                dashboard.
              </p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li className="flex items-center">
                  <Check className="h-3 w-3 text-blue-600 mr-2" />
                  Unlimited bookings
                </li>
                <li className="flex items-center">
                  <Check className="h-3 w-3 text-blue-600 mr-2" />
                  All premium features
                </li>
                <li className="flex items-center">
                  <Check className="h-3 w-3 text-blue-600 mr-2" />
                  Priority support
                </li>
                <li className="flex items-center">
                  <Check className="h-3 w-3 text-blue-600 mr-2" />
                  Cancel anytime
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Transaction Plan - Payment Methods & Bank Setup */}
        {isTransactionPlan && (
          <>
            {/* Payment Methods */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Payment Methods</h3>
              <p className="text-sm text-gray-600">Choose which payment methods to accept from your customers</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium">Card Payments</div>
                      <div className="text-sm text-gray-600">Visa, Mastercard, Verve</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={paymentMethods.card}
                    onChange={(e) => handlePaymentMethodChange("card", e.target.checked)}
                    className="rounded"
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Building className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium">Bank Transfer</div>
                      <div className="text-sm text-gray-600">Direct bank transfers</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={paymentMethods.transfer}
                    onChange={(e) => handlePaymentMethodChange("transfer", e.target.checked)}
                    className="rounded"
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="h-5 w-5 text-orange-600" />
                    <div>
                      <div className="font-medium">USSD Payments</div>
                      <div className="text-sm text-gray-600">*737# and other USSD codes</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={paymentMethods.ussd}
                    onChange={(e) => handlePaymentMethodChange("ussd", e.target.checked)}
                    className="rounded"
                  />
                </div>
              </div>
            </div>

            {/* Bank Account Setup */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-600" />
                <h3 className="font-medium text-gray-900">Bank Account Setup</h3>
                <Badge variant="outline">Required</Badge>
              </div>
              <p className="text-sm text-gray-600">Set up your bank account to receive payments from customers</p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    placeholder="Your registered business name"
                    value={paystackDetails.businessName}
                    onChange={(e) => handlePaystackDetailsChange("businessName", e.target.value)}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankCode">Bank</Label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={paystackDetails.bankCode}
                      onChange={(e) => handlePaystackDetailsChange("bankCode", e.target.value)}
                    >
                      <option value="">Select your bank</option>
                      {Array.isArray(banks) && banks.length > 0 ? (
                        banks.map((bank, index) => (
                          <option key={`${bank.id}-${bank.code}-${index}`} value={bank.code}>
                            {bank.name}
                          </option>
                        ))
                      ) : (
                        <option disabled>Loading banks...</option>
                      )}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="accountNumber"
                        placeholder="Your business account number"
                        value={paystackDetails.accountNumber}
                        onChange={(e) => handlePaystackDetailsChange("accountNumber", e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resolveAccount}
                        disabled={!paystackDetails.accountNumber || !paystackDetails.bankCode || isResolvingAccount}
                      >
                        {isResolvingAccount ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
                      </Button>
                    </div>
                    {/* Immediate verification feedback */}
                    {paystackDetails.accountName && (
                      <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Check className="h-4 w-4 text-green-600" />
                          <div>
                            <span className="text-sm font-medium text-green-800">Verified: </span>
                            <span className="text-sm font-bold text-green-900">{paystackDetails.accountName}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {paystackDetails.accountName && (
                  <div className="space-y-2">
                    <Label>Account Name</Label>
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-green-800 font-medium">{paystackDetails.accountName}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="bvn">BVN (Optional)</Label>
                  <Input
                    id="bvn"
                    placeholder="Your Bank Verification Number"
                    value={paystackDetails.bvn}
                    onChange={(e) => handlePaystackDetailsChange("bvn", e.target.value)}
                  />
                  <p className="text-xs text-gray-500">BVN helps with faster account verification</p>
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <Shield className="h-4 w-4 inline mr-1" />
                  Your banking information is encrypted and secure. We use Paystack for payment processing.
                </p>
              </div>
            </div>
          </>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrevious} disabled={isProcessing}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button onClick={handleNext} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
      {/* Account Verification Modal */}
      <Dialog open={showAccountModal} onOpenChange={setShowAccountModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Check className="h-5 w-5 text-green-600" />
              <span>Account Verified!</span>
            </DialogTitle>
            <DialogDescription>Your bank account has been successfully verified.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Bank:</span>
                  <span className="text-sm text-gray-900">
                    {banks.find((bank) => bank.code === paystackDetails.bankCode)?.name || "Selected Bank"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Account Number:</span>
                  <span className="text-sm text-gray-900">{paystackDetails.accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Account Name:</span>
                  <span className="text-sm font-bold text-green-800">
                    {paystackDetails.accountName || "Loading..."}
                  </span>
                </div>
              </div>
            </div>

            <Button onClick={() => setShowAccountModal(false)} className="w-full">
              Continue Setup
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
