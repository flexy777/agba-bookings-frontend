import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function SignupPage() {
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
          <CardContent className="space-y-6">
            {/* Business Details */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="business-name">Business Name *</Label>
                <Input id="business-name" placeholder="e.g., Alex's Barber Shop" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner-name">Your Name *</Label>
                <Input id="owner-name" placeholder="e.g., Alex Johnson" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="business-type">Business Type *</Label>
              <Select>
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
              />
            </div>

            {/* Contact Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input id="email" type="email" placeholder="your@email.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input id="phone" placeholder="+234 801 234 5678" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Business Address</Label>
              <Input id="address" placeholder="Street address, City, State" />
            </div>

            {/* Social Media */}
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram Handle (Optional)</Label>
              <Input id="instagram" placeholder="@yourbusiness" />
            </div>

            {/* Operating Hours */}
            <div className="space-y-4">
              <Label>Operating Hours</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="open-time">Opening Time</Label>
                  <Input id="open-time" type="time" defaultValue="09:00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="close-time">Closing Time</Label>
                  <Input id="close-time" type="time" defaultValue="18:00" />
                </div>
              </div>
            </div>

            {/* Pricing Plan */}
            <div className="space-y-4">
              <Label>Choose Your Plan</Label>
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="border-2 cursor-pointer hover:border-purple-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <input type="radio" name="plan" value="monthly" className="text-purple-600" />
                      <span className="font-medium">Monthly Plan</span>
                    </div>
                    <div className="text-2xl font-bold mb-1">
                      ₦3,500<span className="text-sm font-normal">/month</span>
                    </div>
                    <p className="text-sm text-gray-600">Fixed monthly fee, unlimited bookings</p>
                  </CardContent>
                </Card>
                <Card className="border-2 cursor-pointer hover:border-purple-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <input type="radio" name="plan" value="transaction" className="text-purple-600" defaultChecked />
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
              <input type="checkbox" id="terms" className="rounded" />
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

            <Button className="w-full" size="lg">
              Create My Booking Page
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>

            <div className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-purple-600 hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
