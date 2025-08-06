"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, ArrowRight, ArrowLeft, Edit, Trash2, Clock, DollarSign, Loader2, AlertCircle } from "lucide-react"

interface Service {
  id: string
  name: string
  description: string
  duration_minutes: number
  price: string
  is_active: boolean
  sort_order: number
}

interface ServicesStepProps {
  onNext: () => void
  onPrevious: () => void
  onDataChange: (data: any) => void
}

export default function ServicesStep({ onNext, onPrevious, onDataChange }: ServicesStepProps) {
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingService, setIsAddingService] = useState(false)
  const [editingService, setEditingService] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [currentService, setCurrentService] = useState({
    name: "",
    description: "",
    duration_minutes: 30,
    price: "",
    is_active: true,
  })

  // Load existing services on component mount
  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        setError("No authentication token found")
        return
      }

      const response = await fetch("https://api.legitbills.com/agba/services/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setServices(data)
        onDataChange(data)
        console.log("Services loaded:", data)
      } else if (response.status === 401) {
        setError("Authentication failed. Please sign in again.")
        setTimeout(() => {
          window.location.href = "/auth/login"
        }, 2000)
      } else {
        console.error("Failed to load services")
        // Don't show error for empty services list
      }
    } catch (err) {
      console.error("Error loading services:", err)
      // Don't show error for network issues during initial load
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddService = async () => {
    if (!currentService.name || !currentService.price) {
      setError("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        setError("No authentication token found")
        return
      }

      const response = await fetch("https://api.legitbills.com/agba/services/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: currentService.name,
          description: currentService.description,
          duration_minutes: currentService.duration_minutes,
          price: currentService.price,
          is_active: currentService.is_active,
          sort_order: services.length + 1,
        }),
      })

      if (response.ok) {
        const newService = await response.json()
        const updatedServices = [...services, newService]
        setServices(updatedServices)
        onDataChange(updatedServices)
        setCurrentService({ name: "", description: "", duration_minutes: 30, price: "", is_active: true })
        setIsAddingService(false)
        console.log("Service added:", newService)
      } else if (response.status === 401) {
        setError("Authentication failed. Please sign in again.")
      } else {
        const errorData = await response.json()
        setError(errorData.message || errorData.detail || "Failed to add service")
      }
    } catch (err) {
      console.error("Error adding service:", err)
      setError("Network error. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditService = (service: Service) => {
    setCurrentService({
      name: service.name,
      description: service.description,
      duration_minutes: service.duration_minutes,
      price: service.price,
      is_active: service.is_active,
    })
    setEditingService(service.id)
    setIsAddingService(true)
  }

  const handleUpdateService = async () => {
    if (!editingService || !currentService.name || !currentService.price) {
      setError("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        setError("No authentication token found")
        return
      }

      const response = await fetch(`https://api.legitbills.com/agba/services/${editingService}/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: currentService.name,
          description: currentService.description,
          duration_minutes: currentService.duration_minutes,
          price: currentService.price,
          is_active: currentService.is_active,
        }),
      })

      if (response.ok) {
        const updatedService = await response.json()
        const updatedServices = services.map((service) => (service.id === editingService ? updatedService : service))
        setServices(updatedServices)
        onDataChange(updatedServices)
        setCurrentService({ name: "", description: "", duration_minutes: 30, price: "", is_active: true })
        setIsAddingService(false)
        setEditingService(null)
        console.log("Service updated:", updatedService)
      } else if (response.status === 401) {
        setError("Authentication failed. Please sign in again.")
      } else {
        const errorData = await response.json()
        setError(errorData.message || errorData.detail || "Failed to update service")
      }
    } catch (err) {
      console.error("Error updating service:", err)
      setError("Network error. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteService = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) {
      return
    }

    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        setError("No authentication token found")
        return
      }

      const response = await fetch(`https://api.legitbills.com/agba/services/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const updatedServices = services.filter((service) => service.id !== id)
        setServices(updatedServices)
        onDataChange(updatedServices)
        console.log("Service deleted:", id)
      } else if (response.status === 401) {
        setError("Authentication failed. Please sign in again.")
      } else {
        setError("Failed to delete service")
      }
    } catch (err) {
      console.error("Error deleting service:", err)
      setError("Network error. Please try again.")
    }
  }

  const handleNext = () => {
    if (services.length > 0) {
      onNext()
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
            <span className="text-gray-600">Loading your services...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Services</CardTitle>
        <CardDescription>Add the services you offer with pricing and duration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        {/* Existing Services */}
        {services.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Your Services ({services.length})</h3>
            <div className="space-y-3">
              {services.map((service) => (
                <div key={service.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{service.name}</h4>
                      {service.description && <p className="text-sm text-gray-600 mt-1">{service.description}</p>}
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {service.duration_minutes} min
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <DollarSign className="h-4 w-4 mr-1" />₦{service.price}
                        </div>
                        <div className="text-sm text-gray-500">{service.is_active ? "Active" : "Inactive"}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditService(service)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteService(service.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Service Form */}
        {isAddingService ? (
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-medium text-gray-900 mb-4">{editingService ? "Edit Service" : "Add New Service"}</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="serviceName">Service Name *</Label>
                <Input
                  id="serviceName"
                  placeholder="e.g., Hair Cut & Style"
                  value={currentService.name}
                  onChange={(e) => setCurrentService((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceDescription">Description</Label>
                <Textarea
                  id="serviceDescription"
                  placeholder="Brief description of the service"
                  value={currentService.description}
                  onChange={(e) => setCurrentService((prev) => ({ ...prev, description: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="5"
                    max="480"
                    value={currentService.duration_minutes}
                    onChange={(e) =>
                      setCurrentService((prev) => ({
                        ...prev,
                        duration_minutes: Number.parseInt(e.target.value) || 30,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₦) *</Label>
                  <Input
                    id="price"
                    type="text"
                    placeholder="3500"
                    value={currentService.price}
                    onChange={(e) => setCurrentService((prev) => ({ ...prev, price: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={currentService.is_active}
                  onChange={(e) => setCurrentService((prev) => ({ ...prev, is_active: e.target.checked }))}
                />
                <Label htmlFor="active">Active service</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingService(false)
                    setEditingService(null)
                    setCurrentService({ name: "", description: "", duration_minutes: 30, price: "", is_active: true })
                    setError("")
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={editingService ? handleUpdateService : handleAddService}
                  disabled={!currentService.name || !currentService.price || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {editingService ? "Updating..." : "Adding..."}
                    </>
                  ) : editingService ? (
                    "Update Service"
                  ) : (
                    "Add Service"
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <Button variant="outline" onClick={() => setIsAddingService(true)} className="w-full border-dashed">
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Button>
        )}

        {/* Popular Service Templates */}
        {services.length === 0 && !isAddingService && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Quick Start Templates</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                { name: "Hair Cut", duration_minutes: 45, price: "3500" },
                { name: "Beard Trim", duration_minutes: 20, price: "1500" },
                { name: "Full Service", duration_minutes: 90, price: "5000" },
                { name: "Quick Wash", duration_minutes: 15, price: "1000" },
              ].map((template, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="justify-start h-auto p-3 bg-transparent"
                  onClick={() => {
                    setCurrentService({
                      name: template.name,
                      description: "",
                      duration_minutes: template.duration_minutes,
                      price: template.price,
                      is_active: true,
                    })
                    setIsAddingService(true)
                  }}
                >
                  <div className="text-left">
                    <div className="font-medium">{template.name}</div>
                    <div className="text-sm text-gray-500">
                      {template.duration_minutes}min • ₦{template.price}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrevious}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button onClick={handleNext} disabled={services.length === 0}>
            Continue
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
