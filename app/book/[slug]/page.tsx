"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import type { Matcher } from "react-day-picker"
import { format } from "date-fns"
import { bookingApi } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { MapPin, Instagram, Info, CalendarDays, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"

// Type definitions
interface Business {
  id: string
  business_name: string
  business_type: string
  description: string
  address: string
  instagram_handle: string | null
  logo_url: string | null
  slug: string
}
interface Service {
  id: string
  name: string
  description: string
  duration_minutes: number
  price: string
}
interface Schedule {
  day_of_week: number
  is_open: boolean
  opening_time: string | null
  closing_time: string | null
}
interface BookingSettings {
  min_advance_hours: number
  max_advance_days: number
  allow_same_day_booking: boolean
  require_phone: boolean
  require_email: boolean
  auto_confirm_bookings: boolean
}
interface BusinessDetailsResponse {
  business: Business
  services: Service[]
  schedules: Schedule[]
  booking_settings: BookingSettings
}
interface AvailableSlotsResponse {
  available_slots: string[]
}
interface BookingResponse {
  message: string
  payment_url: string
  reference: string
  booking_id: string
}

const dayOfWeekMap: { [key: number]: string } = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
}

export default function PublicBookingPage() {
  const params = useParams()
  const slug = params.slug as string

  const [data, setData] = useState<BusinessDetailsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [slotsError, setSlotsError] = useState<string | null>(null)

  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [notes, setNotes] = useState("")
  const [isBooking, setIsBooking] = useState(false)

  const [paymentDetails, setPaymentDetails] = useState<BookingResponse | null>(null)

  useEffect(() => {
    if (slug) {
      const fetchBusinessDetails = async () => {
        try {
          setLoading(true)
          const response = await bookingApi.getBusinessDetails(slug)
          setData(response)
        } catch (err: any) {
          setError(err.message || "Failed to fetch business details.")
        } finally {
          setLoading(false)
        }
      }
      fetchBusinessDetails()
    }
  }, [slug])

  useEffect(() => {
    if (selectedDate && selectedService && data) {
      const fetchSlots = async () => {
        setSlotsLoading(true)
        setSlotsError(null)
        setAvailableSlots([])
        setSelectedTime(null)
        try {
          const dateString = format(selectedDate, "yyyy-MM-dd")
          const response: AvailableSlotsResponse = await bookingApi.getAvailableSlots(
            data.business.id,
            selectedService.id,
            dateString,
          )
          setAvailableSlots(response.available_slots || [])
        } catch (err: any) {
          setSlotsError(err.message || "Failed to fetch available times.")
        } finally {
          setSlotsLoading(false)
        }
      }
      fetchSlots()
    }
  }, [selectedDate, selectedService, data])

  const formatTime = (time: string | null, is24Hour = false) => {
    if (!time) return "Closed"
    const [hours, minutes] = time.split(":")
    const date = new Date()
    date.setHours(Number.parseInt(hours), Number.parseInt(minutes))
    if (is24Hour) {
      return date.toTimeString().slice(0, 5)
    }
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
  }

  const calculateEndTime = (startTime: string, duration: number): string => {
    const [hours, minutes] = startTime.split(":").map(Number)
    const startDate = new Date()
    startDate.setHours(hours, minutes, 0, 0)
    const endDate = new Date(startDate.getTime() + duration * 60000)
    return format(endDate, "HH:mm")
  }

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!data || !selectedService || !selectedDate || !selectedTime) return

    setIsBooking(true)
    try {
      const bookingData = {
        business_id: data.business.id,
        service: selectedService.id,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        booking_date: format(selectedDate, "yyyy-MM-dd"),
        start_time: formatTime(selectedTime, true),
        end_time: calculateEndTime(selectedTime, selectedService.duration_minutes),
        notes: notes,
      }
      const response = await bookingApi.createBooking(slug, bookingData)
      setPaymentDetails(response)
    } catch (error: any) {
      alert(`Booking failed: ${error.message}`)
    } finally {
      setIsBooking(false)
    }
  }

  const resetBookingFlow = () => {
    setSelectedService(null)
    setSelectedDate(undefined)
    setSelectedTime(null)
    setCustomerName("")
    setCustomerEmail("")
    setCustomerPhone("")
    setNotes("")
    setPaymentDetails(null)
  }

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-lg text-center">
          <CardHeader>
            <CardTitle className="text-2xl text-red-600">Business Not Found</CardTitle>
            <CardDescription>
              We couldn't find a business with the slug:{" "}
              <code className="bg-red-100 text-red-800 p-1 rounded">{slug}</code>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Please check the URL and try again. If you believe this is an error, please contact the business owner.
            </p>
            <div className="mt-6">
              <Button asChild>
                <Link href="/">Go to Homepage</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  if (!data) return <div className="flex min-h-screen items-center justify-center">Business not found.</div>

  const { business, services, schedules, booking_settings } = data
  const sortedSchedules = [...schedules].sort((a, b) => ((a.day_of_week + 6) % 7) - ((b.day_of_week + 6) % 7))
  const openDaysOfWeek = new Set(schedules.filter((s) => s.is_open).map((s) => s.day_of_week))
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const disabledDays: Matcher[] = [
    { before: today },
    { after: new Date(new Date().setDate(today.getDate() + booking_settings.max_advance_days)) },
    (day) => !openDaysOfWeek.has(day.getDay()),
  ]
  if (!booking_settings.allow_same_day_booking) disabledDays.push(today)

  return (
    <>
      <Dialog open={!!paymentDetails} onOpenChange={(isOpen) => !isOpen && setPaymentDetails(null)}>
        <DialogContent>
          <DialogHeader>
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <DialogTitle className="text-center text-2xl">Booking Created!</DialogTitle>
            <DialogDescription className="text-center">
              {paymentDetails?.message} Your appointment is reserved pending payment.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              className="w-full"
              onClick={() => {
                if (paymentDetails?.payment_url) {
                  window.location.href = paymentDetails.payment_url
                }
              }}
            >
              Proceed to Payment
            </Button>
            <Button className="w-full" variant="ghost" onClick={resetBookingFlow}>
              Book Another Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="bg-gray-50 min-h-screen">
        <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          <Card className="overflow-hidden shadow-lg">
            <div className="bg-gray-100 h-32 sm:h-40" />
            <CardHeader className="flex flex-col sm:flex-row items-start gap-4 -mt-16 sm:-mt-20 px-6">
              <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-white shadow-md">
                <AvatarImage
                  src={business.logo_url || "/placeholder.svg?width=128&height=128&query=logo"}
                  alt={business.business_name}
                />
                <AvatarFallback className="text-4xl">{business.business_name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="pt-16 sm:pt-4">
                <CardTitle className="text-3xl font-bold">{business.business_name}</CardTitle>
                <CardDescription className="text-md text-gray-600 mt-1">{business.description}</CardDescription>
                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-sm text-gray-500">
                  {business.address && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      <span>{business.address}</span>
                    </div>
                  )}
                  {business.instagram_handle && (
                    <div className="flex items-center gap-1.5">
                      <Instagram className="w-4 h-4" />
                      <a
                        href={`https://instagram.com/${business.instagram_handle.replace("@", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {business.instagram_handle}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-6 py-4">
              <Separator className="my-6" />
              <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <h2 className="text-xl font-semibold mb-4">1. Select a Service</h2>
                  <div className="space-y-3">
                    {services.map((service) => (
                      <Card
                        key={service.id}
                        className={`cursor-pointer transition-all ${selectedService?.id === service.id ? "ring-2 ring-blue-500 shadow-md" : "hover:shadow-md"}`}
                        onClick={() => {
                          setSelectedService(service)
                          setSelectedDate(undefined)
                          setSelectedTime(null)
                        }}
                      >
                        <CardContent className="p-4 flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold">{service.name}</h3>
                            <p className="text-sm text-gray-500">{service.duration_minutes} min</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">₦{Number.parseFloat(service.price).toLocaleString()}</p>
                            <Button variant="link" size="sm" className="p-0 h-auto text-blue-600">
                              {selectedService?.id === service.id ? "Selected" : "Select"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {selectedService && (
                    <div className="mt-8">
                      <Separator className="my-6" />
                      <h2 className="text-xl font-semibold my-4">2. Select a Date</h2>
                      <div className="flex justify-center p-2 bg-gray-100 rounded-lg">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={disabledDays}
                          className="rounded-md border bg-white"
                        />
                      </div>
                    </div>
                  )}

                  {selectedDate && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-3">3. Select a Time</h3>
                      {slotsLoading && (
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        </div>
                      )}
                      {slotsError && <p className="text-red-500 text-center">{slotsError}</p>}
                      {!slotsLoading && !slotsError && availableSlots.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {availableSlots.map((time) => (
                            <Button
                              key={time}
                              variant={selectedTime === time ? "default" : "outline"}
                              onClick={() => setSelectedTime(time)}
                            >
                              {formatTime(time)}
                            </Button>
                          ))}
                        </div>
                      )}
                      {!slotsLoading && !slotsError && availableSlots.length === 0 && (
                        <p className="text-gray-500 text-center py-4">No available slots for this day.</p>
                      )}
                    </div>
                  )}

                  {selectedTime && (
                    <div className="mt-8">
                      <Separator className="my-6" />
                      <h2 className="text-xl font-semibold my-4">4. Your Details</h2>
                      <form onSubmit={handleBookingSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="name">Full Name *</Label>
                          <Input
                            id="name"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Enter your full name"
                            required
                          />
                        </div>
                        {booking_settings.require_email && (
                          <div>
                            <Label htmlFor="email">Email Address *</Label>
                            <Input
                              id="email"
                              type="email"
                              value={customerEmail}
                              onChange={(e) => setCustomerEmail(e.target.value)}
                              placeholder="Enter your email"
                              required
                            />
                          </div>
                        )}
                        {booking_settings.require_phone && (
                          <div>
                            <Label htmlFor="phone">Phone Number *</Label>
                            <Input
                              id="phone"
                              type="tel"
                              value={customerPhone}
                              onChange={(e) => setCustomerPhone(e.target.value)}
                              placeholder="Enter your phone number"
                              required
                            />
                          </div>
                        )}
                        <div>
                          <Label htmlFor="notes">Additional Notes (Optional)</Label>
                          <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Any special requests..."
                            rows={3}
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={isBooking}>
                          {isBooking ? "Creating Booking..." : "Book Appointment"}
                        </Button>
                      </form>
                    </div>
                  )}
                </div>

                <div className="md:col-span-1 space-y-8">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Opening Hours</h2>
                    <Card>
                      <CardContent className="p-4 space-y-2 text-sm">
                        {sortedSchedules.map((day) => (
                          <div key={day.day_of_week} className="flex justify-between items-center">
                            <span className="text-gray-600">{dayOfWeekMap[day.day_of_week]}</span>
                            {day.is_open ? (
                              <span className="font-medium text-gray-800">
                                {formatTime(day.opening_time)} - {formatTime(day.closing_time)}
                              </span>
                            ) : (
                              <Badge variant="outline" className="font-normal text-gray-500">
                                Closed
                              </Badge>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Booking Policy</h2>
                    <Card>
                      <CardContent className="p-4 space-y-3 text-sm text-gray-600">
                        <div className="flex items-start gap-3">
                          <CalendarDays className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-500" />
                          <span>Book up to {booking_settings.max_advance_days} days in advance.</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <Clock className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-500" />
                          <span>Book at least {booking_settings.min_advance_hours} hour(s) in advance.</span>
                        </div>
                        {booking_settings.allow_same_day_booking && (
                          <div className="flex items-start gap-3">
                            <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-500" />
                            <span>Same-day bookings are available.</span>
                          </div>
                        )}
                        {booking_settings.auto_confirm_bookings && (
                          <div className="flex items-start gap-3">
                            <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-500" />
                            <span>Your booking will be automatically confirmed.</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  )
}
