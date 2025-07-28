"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ArrowRight, ArrowLeft, Clock, Loader2, AlertCircle } from "lucide-react"

interface ScheduleStepProps {
  onNext: () => void
  onPrevious: () => void
  onDataChange: (data: any) => void
}

interface BusinessSchedule {
  id?: string
  day_of_week: number
  is_open: boolean
  opening_time: string
  closing_time: string
  break_start_time: string | null
  break_end_time: string | null
}

interface BookingSettings {
  id?: string
  min_advance_hours: number
  max_advance_days: number
  allow_same_day_booking: boolean
  require_phone: boolean
  require_email: boolean
  auto_confirm_bookings: boolean
}

const daysOfWeek = [
  { key: "monday", label: "Monday", dayNumber: 1 },
  { key: "tuesday", label: "Tuesday", dayNumber: 2 },
  { key: "wednesday", label: "Wednesday", dayNumber: 3 },
  { key: "thursday", label: "Thursday", dayNumber: 4 },
  { key: "friday", label: "Friday", dayNumber: 5 },
  { key: "saturday", label: "Saturday", dayNumber: 6 },
  { key: "sunday", label: "Sunday", dayNumber: 0 },
]

export default function ScheduleStep({ onNext, onPrevious, onDataChange }: ScheduleStepProps) {
  const [schedule, setSchedule] = useState({
    monday: { enabled: true, start: "09:00", end: "18:00", id: null as string | null },
    tuesday: { enabled: true, start: "09:00", end: "18:00", id: null as string | null },
    wednesday: { enabled: true, start: "09:00", end: "18:00", id: null as string | null },
    thursday: { enabled: true, start: "09:00", end: "18:00", id: null as string | null },
    friday: { enabled: true, start: "09:00", end: "18:00", id: null as string | null },
    saturday: { enabled: true, start: "09:00", end: "16:00", id: null as string | null },
    sunday: { enabled: false, start: "09:00", end: "16:00", id: null as string | null },
  })

  const [breakTime, setBreakTime] = useState({
    enabled: false,
    start: "12:00",
    end: "13:00",
  })

  const [bookingSettings, setBookingSettings] = useState({
    id: null as string | null,
    minHours: 2,
    maxDays: 30,
    allowSameDay: true,
    requirePhone: true,
    requireEmail: true,
    autoConfirm: true,
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  // Load existing schedules and booking settings on component mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        setError("No authentication token found")
        setIsLoading(false)
        return
      }

      // Load schedules and booking settings in parallel
      const [schedulesResponse, bookingSettingsResponse] = await Promise.all([
        fetch("http://127.0.0.1:8000/business-schedules/", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch("http://127.0.0.1:8000/booking-settings/", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
      ])

      // Process schedules
      if (schedulesResponse.ok) {
        const schedulesData = await schedulesResponse.json()
        console.log("Schedules loaded:", schedulesData)

        const newSchedule = { ...schedule }
        let hasBreaks = false

        schedulesData.forEach((apiSchedule: BusinessSchedule) => {
          const dayKey = getDayKeyFromNumber(apiSchedule.day_of_week)
          if (dayKey) {
            newSchedule[dayKey as keyof typeof schedule] = {
              enabled: apiSchedule.is_open,
              start: apiSchedule.opening_time,
              end: apiSchedule.closing_time,
              id: apiSchedule.id || null,
            }

            if (apiSchedule.break_start_time && apiSchedule.break_end_time) {
              hasBreaks = true
              setBreakTime({
                enabled: true,
                start: apiSchedule.break_start_time,
                end: apiSchedule.break_end_time,
              })
            }
          }
        })

        setSchedule(newSchedule)
      }

      // Process booking settings
      if (bookingSettingsResponse.ok) {
        const bookingData = await bookingSettingsResponse.json()
        console.log("Booking settings loaded:", bookingData)

        // Handle both single object and array responses
        const settings = Array.isArray(bookingData) ? bookingData[0] : bookingData

        if (settings) {
          setBookingSettings({
            id: settings.id || null,
            minHours: settings.min_advance_hours || 2,
            maxDays: settings.max_advance_days || 30,
            allowSameDay: settings.allow_same_day_booking ?? true,
            requirePhone: settings.require_phone ?? true,
            requireEmail: settings.require_email ?? true,
            autoConfirm: settings.auto_confirm_bookings ?? true,
          })
        }
      }

      onDataChange({ schedule, breakTime, bookingSettings })
    } catch (err) {
      console.error("Error loading data:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const getDayKeyFromNumber = (dayNumber: number): string | null => {
    const dayMap: { [key: number]: string } = {
      1: "monday",
      2: "tuesday",
      3: "wednesday",
      4: "thursday",
      5: "friday",
      6: "saturday",
      0: "sunday",
    }
    return dayMap[dayNumber] || null
  }

  const getDayNumberFromKey = (dayKey: string): number => {
    const dayMap: { [key: string]: number } = {
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
      sunday: 0,
    }
    return dayMap[dayKey]
  }

  const handleScheduleChange = async (day: string, field: string, value: string | boolean) => {
    const newSchedule = {
      ...schedule,
      [day]: {
        ...schedule[day as keyof typeof schedule],
        [field]: value,
      },
    }
    setSchedule(newSchedule)
    onDataChange({ schedule: newSchedule, breakTime, bookingSettings })

    // Auto-save to API (debounced)
    clearTimeout((window as any).scheduleTimeout)
    ;(window as any).scheduleTimeout = setTimeout(() => {
      saveScheduleToAPI(day, newSchedule[day as keyof typeof schedule])
    }, 1000)
  }

  const handleBreakTimeChange = async (field: string, value: string | boolean) => {
    const newBreakTime = { ...breakTime, [field]: value }
    setBreakTime(newBreakTime)
    onDataChange({ schedule, breakTime: newBreakTime, bookingSettings })

    // If break time is enabled/disabled, save all schedules
    if (field === "enabled") {
      for (const [dayKey, daySchedule] of Object.entries(schedule)) {
        if (daySchedule.enabled) {
          await saveScheduleToAPI(dayKey, daySchedule, newBreakTime)
        }
      }
    }
  }

  const handleBookingSettingsChange = (field: string, value: number | boolean) => {
    const newBookingSettings = { ...bookingSettings, [field]: value }
    setBookingSettings(newBookingSettings)
    onDataChange({ schedule, breakTime, bookingSettings: newBookingSettings })

    // Auto-save booking settings (debounced)
    clearTimeout((window as any).bookingTimeout)
    ;(window as any).bookingTimeout = setTimeout(() => {
      saveBookingSettings(newBookingSettings)
    }, 1000)
  }

  const saveScheduleToAPI = async (dayKey: string, daySchedule: any, customBreakTime?: any) => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) return

      const currentBreakTime = customBreakTime || breakTime
      const dayNumber = getDayNumberFromKey(dayKey)

      const payload = {
        day_of_week: dayNumber,
        is_open: daySchedule.enabled,
        opening_time: daySchedule.start,
        closing_time: daySchedule.end,
        break_start_time: currentBreakTime.enabled ? currentBreakTime.start : null,
        break_end_time: currentBreakTime.enabled ? currentBreakTime.end : null,
      }

      // Use PUT if we have an ID, POST if creating new
      const method = daySchedule.id ? "PUT" : "POST"
      const url = daySchedule.id
        ? `http://127.0.0.1:8000/business-schedules/${daySchedule.id}/`
        : "http://127.0.0.1:8000/business-schedules/"

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const savedSchedule = await response.json()
        console.log("Schedule saved:", savedSchedule)

        // Update the schedule with the returned ID if it's a new one
        if (!daySchedule.id) {
          setSchedule((prev) => ({
            ...prev,
            [dayKey]: {
              ...prev[dayKey as keyof typeof prev],
              id: savedSchedule.id,
            },
          }))
        }
      } else if (response.status === 401) {
        setError("Authentication failed. Please sign in again.")
      } else {
        console.error("Failed to save schedule for", dayKey)
      }
    } catch (err) {
      console.error("Error saving schedule:", err)
    }
  }

  const saveBookingSettings = async (settings: any) => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) return

      const payload = {
        min_advance_hours: settings.minHours,
        max_advance_days: settings.maxDays,
        allow_same_day_booking: settings.allowSameDay,
        require_phone: settings.requirePhone,
        require_email: settings.requireEmail,
        auto_confirm_bookings: settings.autoConfirm,
      }

      // Use PUT if we have an ID, POST if creating new
      const method = settings.id ? "PUT" : "POST"
      const url = settings.id
        ? `http://127.0.0.1:8000/booking-settings/${settings.id}/`
        : "http://127.0.0.1:8000/booking-settings/"

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const savedSettings = await response.json()
        console.log("Booking settings saved:", savedSettings)

        // Update with the returned ID if it's a new one
        if (!settings.id) {
          setBookingSettings((prev) => ({
            ...prev,
            id: savedSettings.id,
          }))
        }
      } else if (response.status === 401) {
        setError("Authentication failed. Please sign in again.")
      } else {
        console.error("Failed to save booking settings")
      }
    } catch (err) {
      console.error("Error saving booking settings:", err)
    }
  }

  const handleNext = async () => {
    setIsSubmitting(true)
    setError("")

    try {
      // Final save of all data before proceeding
      const savePromises = []

      // Save all schedules
      for (const [dayKey, daySchedule] of Object.entries(schedule)) {
        savePromises.push(saveScheduleToAPI(dayKey, daySchedule))
      }

      // Save booking settings
      savePromises.push(saveBookingSettings(bookingSettings))

      await Promise.all(savePromises)
      onNext()
    } catch (err) {
      setError("Failed to save settings. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
            <span className="text-gray-600">Loading your schedule...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set Your Availability</CardTitle>
        <CardDescription>Configure when clients can book appointments with you</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        {/* Weekly Schedule */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Weekly Schedule</h3>
          <div className="space-y-3">
            {daysOfWeek.map((day) => (
              <div key={day.key} className="flex items-center space-x-4 p-3 border rounded-lg">
                <div className="flex items-center space-x-2 min-w-[120px]">
                  <Switch
                    checked={schedule[day.key as keyof typeof schedule].enabled}
                    onCheckedChange={(checked) => handleScheduleChange(day.key, "enabled", checked)}
                  />
                  <Label className="text-sm font-medium">{day.label}</Label>
                </div>

                {schedule[day.key as keyof typeof schedule].enabled ? (
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex items-center space-x-2">
                      <Label className="text-sm">From:</Label>
                      <Input
                        type="time"
                        value={schedule[day.key as keyof typeof schedule].start}
                        onChange={(e) => handleScheduleChange(day.key, "start", e.target.value)}
                        className="w-28"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label className="text-sm">To:</Label>
                      <Input
                        type="time"
                        value={schedule[day.key as keyof typeof schedule].end}
                        onChange={(e) => handleScheduleChange(day.key, "end", e.target.value)}
                        className="w-28"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 text-sm text-gray-500 ml-4">Closed</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Break Time */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Break Time (Optional)</h3>
          <div className="p-3 border rounded-lg">
            <div className="flex items-center space-x-4 mb-3">
              <Switch
                checked={breakTime.enabled}
                onCheckedChange={(checked) => handleBreakTimeChange("enabled", checked)}
              />
              <Label>Enable daily break time</Label>
            </div>

            {breakTime.enabled && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Label className="text-sm">From:</Label>
                  <Input
                    type="time"
                    value={breakTime.start}
                    onChange={(e) => handleBreakTimeChange("start", e.target.value)}
                    className="w-28"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Label className="text-sm">To:</Label>
                  <Input
                    type="time"
                    value={breakTime.end}
                    onChange={(e) => handleBreakTimeChange("end", e.target.value)}
                    className="w-28"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Booking Rules */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Booking Rules</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minHours">Minimum advance booking (hours)</Label>
              <Input
                id="minHours"
                type="number"
                min="0"
                max="168"
                value={bookingSettings.minHours}
                onChange={(e) => handleBookingSettingsChange("minHours", Number.parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-gray-500">How far in advance must clients book?</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxDays">Maximum advance booking (days)</Label>
              <Input
                id="maxDays"
                type="number"
                min="1"
                max="365"
                value={bookingSettings.maxDays}
                onChange={(e) => handleBookingSettingsChange("maxDays", Number.parseInt(e.target.value) || 30)}
              />
              <p className="text-xs text-gray-500">How far ahead can clients book?</p>
            </div>
          </div>

          {/* Additional Booking Settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label className="font-medium">Allow same-day booking</Label>
                <p className="text-sm text-gray-600">Let clients book appointments for today</p>
              </div>
              <Switch
                checked={bookingSettings.allowSameDay}
                onCheckedChange={(checked) => handleBookingSettingsChange("allowSameDay", checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label className="font-medium">Require phone number</Label>
                <p className="text-sm text-gray-600">Make phone number mandatory for bookings</p>
              </div>
              <Switch
                checked={bookingSettings.requirePhone}
                onCheckedChange={(checked) => handleBookingSettingsChange("requirePhone", checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label className="font-medium">Require email address</Label>
                <p className="text-sm text-gray-600">Make email address mandatory for bookings</p>
              </div>
              <Switch
                checked={bookingSettings.requireEmail}
                onCheckedChange={(checked) => handleBookingSettingsChange("requireEmail", checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label className="font-medium">Auto-confirm bookings</Label>
                <p className="text-sm text-gray-600">Automatically confirm new bookings</p>
              </div>
              <Switch
                checked={bookingSettings.autoConfirm}
                onCheckedChange={(checked) => handleBookingSettingsChange("autoConfirm", checked)}
              />
            </div>
          </div>
        </div>

        {/* Schedule Preview */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Schedule Preview</h3>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              {daysOfWeek.map((day) => {
                const daySchedule = schedule[day.key as keyof typeof schedule]
                return (
                  <div key={day.key} className="text-center">
                    <div className="font-medium">{day.label.slice(0, 3)}</div>
                    <div className="text-gray-600">
                      {daySchedule.enabled ? `${daySchedule.start} - ${daySchedule.end}` : "Closed"}
                    </div>
                  </div>
                )
              })}
            </div>
            {breakTime.enabled && (
              <div className="mt-3 pt-3 border-t text-center text-sm text-gray-600">
                <Clock className="h-4 w-4 inline mr-1" />
                Break: {breakTime.start} - {breakTime.end}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrevious} disabled={isSubmitting}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button onClick={handleNext} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
