"use client"

import { useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Calendar } from "lucide-react"
import BusinessInfoStep from "@/components/onboarding/business-info-step"
import ServicesStep from "@/components/onboarding/services-step"
import ScheduleStep from "@/components/onboarding/schedule-step"
import PaymentStep from "@/components/onboarding/payment-step"
import ReviewStep from "@/components/onboarding/review-step"

const steps = [
  { id: 1, title: "Business Info", description: "Tell us about your business" },
  { id: 2, title: "Services", description: "Add your services and pricing" },
  { id: 3, title: "Schedule", description: "Set your availability" },
  { id: 4, title: "Payment", description: "Setup payment processing" },
  { id: 5, title: "Review", description: "Review and launch" },
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    businessInfo: {},
    services: [],
    schedule: {},
    payment: {},
  })

  const progress = (currentStep / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStepData = (stepData: any) => {
    setFormData((prev) => ({
      ...prev,
      [getStepKey(currentStep)]: stepData,
    }))
  }

  const getStepKey = (step: number) => {
    switch (step) {
      case 1:
        return "businessInfo"
      case 2:
        return "services"
      case 3:
        return "schedule"
      case 4:
        return "payment"
      default:
        return "businessInfo"
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BusinessInfoStep onNext={handleNext} onDataChange={handleStepData} />
      case 2:
        return <ServicesStep onNext={handleNext} onPrevious={handlePrevious} onDataChange={handleStepData} />
      case 3:
        return <ScheduleStep onNext={handleNext} onPrevious={handlePrevious} onDataChange={handleStepData} />
      case 4:
        return (
          <PaymentStep
            onNext={handleNext}
            onPrevious={handlePrevious}
            onDataChange={handleStepData}
            formData={formData}
          />
        )
      case 5:
        return <ReviewStep formData={formData} onPrevious={handlePrevious} />
      default:
        return <BusinessInfoStep onNext={handleNext} onDataChange={handleStepData} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-purple-600" />
              <span className="text-xl font-bold text-gray-900">BookEasy</span>
            </div>
            <div className="text-sm text-gray-600">
              Step {currentStep} of {steps.length}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Setup Your Business</h1>
              <span className="text-sm text-gray-600">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Steps Navigation */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                      currentStep >= step.id ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {step.id}
                  </div>
                  <div className="ml-2 hidden sm:block">
                    <div
                      className={`text-sm font-medium ${currentStep >= step.id ? "text-purple-600" : "text-gray-600"}`}
                    >
                      {step.title}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-4 ${currentStep > step.id ? "bg-purple-600" : "bg-gray-200"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-white rounded-lg shadow-sm">{renderStep()}</div>
        </div>
      </div>
    </div>
  )
}
