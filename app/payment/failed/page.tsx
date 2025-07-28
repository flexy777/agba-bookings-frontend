"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export default function PaymentFailedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2 text-red-600">
              <AlertCircle className="h-6 w-6" />
              <span>Payment Failed</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Your payment could not be processed. This could be due to insufficient funds, network issues, or other
              payment-related problems.
            </p>

            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-red-800 text-sm">
                Don't worry! Your account is still active and you can try the payment again.
              </p>
            </div>

            <div className="space-y-2">
              <Link href="/onboarding">
                <Button className="w-full">Try Payment Again</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="w-full bg-transparent">
                  Continue to Dashboard
                </Button>
              </Link>
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <p>Need help? Contact our support team:</p>
              <p>Email: support@bookeasy.ng</p>
              <p>Phone: +234 800 123 4567</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
