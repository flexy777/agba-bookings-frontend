"use client"

import { Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { PartyPopper } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function SuccessContent() {
  const searchParams = useSearchParams()
  const businessSlug = searchParams.get("business_slug")

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center">
          <div className="rounded-full bg-green-100 p-4 dark:bg-green-900">
            <PartyPopper className="h-12 w-12 text-green-500 dark:text-green-400" />
          </div>
          <CardTitle className="mt-4 text-2xl font-bold">Booking Successful!</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Your payment has been confirmed and your appointment is booked. You will receive a confirmation email
            shortly.
          </p>
          <div className="mt-6">
            {businessSlug ? (
              <Button asChild>
                <Link href={`/book/${businessSlug}`}>Book Another Appointment</Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href="/">Go to Homepage</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}
