import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, DollarSign, MapPin, Phone, Star, Instagram, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function DemoPage() {
  const services = [
    {
      id: 1,
      name: "Hair Cut & Style",
      description: "Professional haircut with styling and consultation",
      duration: 45,
      price: 3500,
      popular: true,
    },
    {
      id: 2,
      name: "Beard Trim",
      description: "Precision beard trimming and shaping",
      duration: 20,
      price: 1500,
      popular: false,
    },
    {
      id: 3,
      name: "Full Service",
      description: "Complete grooming package - haircut, beard trim, and styling",
      duration: 90,
      price: 5000,
      popular: true,
    },
  ]

  const availableSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Header */}
      <div className="bg-purple-600 text-white py-3">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2">
            <Badge variant="secondary" className="bg-white text-purple-600">
              DEMO
            </Badge>
            <span className="text-sm">This is a preview of how your booking page will look</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center text-purple-600 hover:text-purple-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Provider Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-start space-x-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Alex's Barber Shop" />
              <AvatarFallback>AB</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Alex's Barber Shop</h1>
              <p className="text-gray-600 mb-3">
                Professional grooming services with 10+ years of experience. Specializing in modern cuts and classic
                styles.
              </p>
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  4.8 (127 reviews)
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  Victoria Island, Lagos
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-1" />
                  +234 801 234 5678
                </div>
                <div className="flex items-center">
                  <Instagram className="h-4 w-4 mr-1" />
                  @alexsbarber
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Services */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Select a Service</h2>
            <div className="space-y-4">
              {services.map((service) => (
                <Card
                  key={service.id}
                  className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-purple-200"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                          {service.popular && <Badge className="bg-purple-100 text-purple-800">Popular</Badge>}
                        </div>
                        <p className="text-gray-600 mb-3">{service.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {service.duration} min
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />₦{service.price.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <Button className="bg-purple-600 hover:bg-purple-700">Select</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Booking Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Book Appointment</CardTitle>
                <CardDescription>Choose your preferred date and time</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Calendar */}
                <div>
                  <h3 className="font-medium mb-3">Select Date</h3>
                  <div className="grid grid-cols-7 gap-1 text-center text-sm">
                    <div className="p-2 font-medium">Sun</div>
                    <div className="p-2 font-medium">Mon</div>
                    <div className="p-2 font-medium">Tue</div>
                    <div className="p-2 font-medium">Wed</div>
                    <div className="p-2 font-medium">Thu</div>
                    <div className="p-2 font-medium">Fri</div>
                    <div className="p-2 font-medium">Sat</div>
                    {Array.from({ length: 35 }, (_, i) => {
                      const day = i - 6
                      const isToday = day === 15
                      const isAvailable = day > 14 && day < 30
                      return (
                        <button
                          key={i}
                          className={`p-2 rounded ${
                            isToday
                              ? "bg-purple-600 text-white"
                              : isAvailable
                                ? "hover:bg-gray-100 text-gray-900"
                                : "text-gray-300 cursor-not-allowed"
                          }`}
                          disabled={!isAvailable}
                        >
                          {day > 0 && day <= 31 ? day : ""}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Time Slots */}
                <div>
                  <h3 className="font-medium mb-3">Available Times</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {availableSlots.map((slot, index) => (
                      <Button
                        key={slot}
                        variant={index === 3 ? "default" : "outline"}
                        size="sm"
                        className={index === 3 ? "bg-purple-600 hover:bg-purple-700" : ""}
                      >
                        {slot}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Selected Service Summary */}
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3">Booking Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Service:</span>
                      <span>Hair Cut & Style</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>45 minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span>Today, Dec 15</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time:</span>
                      <span>2:00 PM</span>
                    </div>
                    <div className="flex justify-between font-medium border-t pt-2">
                      <span>Total:</span>
                      <span>₦3,500</span>
                    </div>
                  </div>
                </div>

                <Button className="w-full bg-purple-600 hover:bg-purple-700" size="lg">
                  Book & Pay Now
                </Button>
              </CardContent>
            </Card>

            {/* Call to Action */}
            <Card className="mt-6 bg-purple-50 border-purple-200">
              <CardContent className="p-4 text-center">
                <h3 className="font-medium text-purple-900 mb-2">Like what you see?</h3>
                <p className="text-sm text-purple-700 mb-3">Create your own booking page in minutes</p>
                <Link href="/auth/signup">
                  <Button className="bg-purple-600 hover:bg-purple-700">Get Started Free</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
