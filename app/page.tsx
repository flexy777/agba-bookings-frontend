import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, CreditCard, MessageSquare, Zap, Star } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Calendar className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">BookEasy</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Automate Your Service Business</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Create your professional booking page, accept payments, and manage clients - all in one platform. Perfect
            for salons, laundry services, home technicians, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Everything You Need</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Calendar className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>Smart Booking</CardTitle>
                <CardDescription>
                  Automated scheduling with real-time availability and instant confirmations
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CreditCard className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Secure Payments</CardTitle>
                <CardDescription>Integrated Paystack payments with automatic invoicing and receipts</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <MessageSquare className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Auto Reminders</CardTitle>
                <CardDescription>
                  SMS and email notifications to reduce no-shows and keep clients informed
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Simple Pricing</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Monthly Plan</CardTitle>
                <div className="text-3xl font-bold">
                  ₦3,500<span className="text-lg font-normal">/month</span>
                </div>
                <CardDescription>Perfect for growing businesses</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Zap className="h-4 w-4 text-green-500 mr-2" />
                    Unlimited bookings
                  </li>
                  <li className="flex items-center">
                    <Zap className="h-4 w-4 text-green-500 mr-2" />
                    Payment processing
                  </li>
                  <li className="flex items-center">
                    <Zap className="h-4 w-4 text-green-500 mr-2" />
                    SMS & Email reminders
                  </li>
                  <li className="flex items-center">
                    <Zap className="h-4 w-4 text-green-500 mr-2" />
                    Custom booking page
                  </li>
                </ul>
                <Button className="w-full mt-6">Choose Plan</Button>
              </CardContent>
            </Card>
            <Card className="border-2 border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle>Pay Per Transaction</CardTitle>
                <div className="text-3xl font-bold">
                  5%<span className="text-lg font-normal"> per booking</span>
                </div>
                <CardDescription>Only pay when you earn</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Zap className="h-4 w-4 text-green-500 mr-2" />
                    No monthly fees
                  </li>
                  <li className="flex items-center">
                    <Zap className="h-4 w-4 text-green-500 mr-2" />
                    All features included
                  </li>
                  <li className="flex items-center">
                    <Zap className="h-4 w-4 text-green-500 mr-2" />
                    Perfect for startups
                  </li>
                  <li className="flex items-center">
                    <Zap className="h-4 w-4 text-green-500 mr-2" />
                    Scale as you grow
                  </li>
                </ul>
                <Button className="w-full mt-6 bg-transparent" variant="outline">
                  Choose Plan
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "BookEasy transformed my salon business. I now get 40% more bookings and zero no-shows!"
                </p>
                <div className="font-semibold">Sarah O. - Hair Salon Owner</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "The payment integration is seamless. My clients love how easy it is to book and pay."
                </p>
                <div className="font-semibold">Mike A. - Laundry Service</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "Setup took 10 minutes. Now I focus on my work while BookEasy handles the bookings."
                </p>
                <div className="font-semibold">John D. - Home Technician</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Calendar className="h-6 w-6" />
                <span className="text-xl font-bold">BookEasy</span>
              </div>
              <p className="text-gray-400">
                Empowering service providers with automated booking and payment solutions.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/features">Features</Link>
                </li>
                <li>
                  <Link href="/pricing">Pricing</Link>
                </li>
                <li>
                  <Link href="/demo">Demo</Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/help">Help Center</Link>
                </li>
                <li>
                  <Link href="/contact">Contact</Link>
                </li>
                <li>
                  <Link href="/api">API Docs</Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/about">About</Link>
                </li>
                <li>
                  <Link href="/privacy">Privacy</Link>
                </li>
                <li>
                  <Link href="/terms">Terms</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 BookEasy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
