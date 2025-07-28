"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function PaymentSuccessPage() {
  const [isVerifying, setIsVerifying] = useState(true)
  const [verificationStatus, setVerificationStatus] = useState<"success" | "failed" | "pending">("pending")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get payment reference from URL params
        const urlParams = new URLSearchParams(window.location.search)
        const reference = urlParams.get("reference") || urlParams.get("trxref")

        if (!reference) {
          setVerificationStatus("failed")
          setMessage("Payment reference not found")
          setIsVerifying(false)
          return
        }

        const token = localStorage.getItem("auth_token")
        if (!token) {
          setVerificationStatus("failed")
          setMessage("Authentication required")
          setIsVerifying(false)
          return
        }

        // Verify payment with backend
        const response = await fetch(`http://127.0.0.1:8000/subscription/verify-payment/?reference=${reference}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        const data = await response.json()

        if (response.ok && data.status === "success") {
          setVerificationStatus("success")
          setMessage("Payment successful! Your subscription is now active.")

          // Clear payment flags
          localStorage.removeItem("payment_in_progress")
          const redirectTo = localStorage.getItem("redirect_after_payment") || "dashboard"
          localStorage.removeItem("redirect_after_payment")
          localStorage.removeItem("skip_review_step")

          // Redirect to the specified destination
          setTimeout(() => {
            window.location.href = `/${redirectTo}`
          }, 3000)
        } else {
          setVerificationStatus("failed")
          setMessage(data.message || "Payment verification failed")
        }
      } catch (error) {
        console.error("Payment verification error:", error)
        setVerificationStatus("failed")
        setMessage("Error verifying payment. Please contact support.")
      } finally {
        setIsVerifying(false)
      }
    }

    verifyPayment()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              {isVerifying && <Loader2 className="h-6 w-6 animate-spin text-purple-600" />}
              {verificationStatus === "success" && <Check className="h-6 w-6 text-green-600" />}
              {verificationStatus === "failed" && <AlertCircle className="h-6 w-6 text-red-600" />}
              <span>
                {isVerifying && "Verifying Payment..."}
                {verificationStatus === "success" && "Payment Successful!"}
                {verificationStatus === "failed" && "Payment Failed"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">{message}</p>

            {verificationStatus === "success" && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-green-800 text-sm">
                    🎉 Welcome to BookEasy! Your monthly subscription is now active.
                  </p>
                </div>
                <p className="text-sm text-gray-500">Redirecting to your dashboard in 3 seconds...</p>
                <Link href="/dashboard">
                  <Button className="w-full">Go to Dashboard Now</Button>
                </Link>
              </div>
            )}

            {verificationStatus === "failed" && (
              <div className="space-y-4">
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-red-800 text-sm">
                    Your payment could not be verified. Please try again or contact support.
                  </p>
                </div>
                <div className="space-y-2">
                  <Link href="/onboarding">
                    <Button className="w-full">Try Again</Button>
                  </Link>
                  <Link href="/auth/login">
                    <Button variant="outline" className="w-full bg-transparent">
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {isVerifying && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800 text-sm">Please wait while we verify your payment...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
