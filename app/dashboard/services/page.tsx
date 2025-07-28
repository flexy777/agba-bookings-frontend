import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Trash2, Clock, DollarSign } from "lucide-react"

export default function ServicesPage() {
  const services = [
    {
      id: 1,
      name: "Hair Cut & Style",
      description: "Professional haircut with styling",
      duration: 45,
      price: 3500,
      active: true,
      bookings: 23,
    },
    {
      id: 2,
      name: "Beard Trim",
      description: "Precision beard trimming and shaping",
      duration: 20,
      price: 1500,
      active: true,
      bookings: 15,
    },
    {
      id: 3,
      name: "Full Service",
      description: "Complete grooming package",
      duration: 90,
      price: 5000,
      active: true,
      bookings: 8,
    },
    {
      id: 4,
      name: "Quick Wash",
      description: "Hair wash and basic styling",
      duration: 15,
      price: 1000,
      active: false,
      bookings: 5,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Services</h1>
              <p className="text-gray-600">Manage your service offerings</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Services List */}
          <div className="lg:col-span-2 space-y-4">
            {services.map((service) => (
              <Card key={service.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                        <Badge variant={service.active ? "default" : "secondary"}>
                          {service.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-4">{service.description}</p>
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {service.duration} min
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />₦{service.price.toLocaleString()}
                        </div>
                        <div>{service.bookings} bookings this month</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add/Edit Service Form */}
          <Card>
            <CardHeader>
              <CardTitle>Add New Service</CardTitle>
              <CardDescription>Create a new service offering</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="service-name">Service Name</Label>
                <Input id="service-name" placeholder="e.g., Hair Cut & Style" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="service-description">Description</Label>
                <Textarea
                  id="service-description"
                  placeholder="Brief description of the service"
                  className="min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input id="duration" type="number" placeholder="45" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₦)</Label>
                  <Input id="price" type="number" placeholder="3500" />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="active" />
                <Label htmlFor="active">Active service</Label>
              </div>

              <div className="space-y-2">
                <Label>Service Category</Label>
                <select className="w-full p-2 border rounded-md">
                  <option>Hair Services</option>
                  <option>Grooming</option>
                  <option>Spa Services</option>
                  <option>Other</option>
                </select>
              </div>

              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Service Analytics */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Service Performance</CardTitle>
            <CardDescription>Track how your services are performing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">4</div>
                <div className="text-sm text-gray-600">Total Services</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">₦11,000</div>
                <div className="text-sm text-gray-600">Avg. Service Value</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">51</div>
                <div className="text-sm text-gray-600">Total Bookings</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-orange-600">42min</div>
                <div className="text-sm text-gray-600">Avg. Duration</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
