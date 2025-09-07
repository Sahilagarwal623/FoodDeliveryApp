"use client"

import type React from "react"
import { useState, useEffect, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Loader2, User, AlertCircle, CheckCircle, Truck, Phone, Mail, MapPin, Clock, Shield } from "lucide-react"

// Define the shape of the data we expect from the API
type DeliveryProfile = {
    name: string
    email: string
    phone: string | null
    deliveryMan: {
        isAvailable: boolean
        vehicleType: string | null
        vehicleNumber: string | null
    } | null
}

export default function DeliveryProfilePage() {
    const [profile, setProfile] = useState<DeliveryProfile | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const fetchProfile = async () => {
        setIsLoading(true)
        try {
            const response = await fetch("/api/profile/delivery", { credentials: "include" })
            if (!response.ok) throw new Error("Failed to fetch profile.")
            const data = await response.json()
            setProfile(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchProfile()
    }, [])

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        setError("")
        setSuccess("")

        // Prepare data from the profile state to be sent
        const formData = {
            name: profile?.name,
            phone: profile?.phone,
            isAvailable: profile?.deliveryMan?.isAvailable,
            vehicleType: profile?.deliveryMan?.vehicleType,
            vehicleNumber: profile?.deliveryMan?.vehicleNumber,
        }

        try {
            const response = await fetch("/api/profile/delivery", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
                credentials: "include",
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to update profile.")
            }

            setSuccess("Profile updated successfully!")
            await fetchProfile() // Re-fetch to confirm changes
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsSaving(false)
        }
    }

    // Helper for controlled inputs
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        if (!profile) return

        if (name === "name" || name === "phone") {
            setProfile({ ...profile, [name]: value })
        } else if (profile.deliveryMan) {
            setProfile({
                ...profile,
                deliveryMan: { ...profile.deliveryMan, [name]: value },
            })
        }
    }

    // Helper for the availability switch
    const handleAvailabilityChange = (checked: boolean) => {
        if (!profile || !profile.deliveryMan) return
        setProfile({
            ...profile,
            deliveryMan: { ...profile.deliveryMan, isAvailable: checked },
        })
    }

    if (isLoading) {
        return (
            <div className="container mx-auto py-12 px-4 max-w-4xl">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-muted-foreground">Loading your profile...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="container mx-auto py-12 px-4 max-w-4xl">
                <Card className="border-destructive/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3 text-destructive">
                            <AlertCircle className="h-5 w-5" />
                            <p className="font-medium">Error: {error || "Could not load profile."}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl space-y-8">
            {/* Header Section */}
            <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-3">
                    <div className="p-3 rounded-full bg-primary/10">
                        <Truck className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-balance">Delivery Partner Profile</h1>
                        <p className="text-muted-foreground text-pretty">Manage your availability and vehicle information</p>
                    </div>
                </div>
            </div>

            {/* Status Card */}
            <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2 rounded-full bg-background">
                                <Clock className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Delivery Status</h3>
                                <p className="text-sm text-muted-foreground">
                                    {profile.deliveryMan?.isAvailable
                                        ? "You're currently available for deliveries"
                                        : "You're currently offline"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge variant={profile.deliveryMan?.isAvailable ? "default" : "secondary"} className="px-3 py-1">
                                {profile.deliveryMan?.isAvailable ? "Available" : "Offline"}
                            </Badge>
                            <Switch
                                checked={profile.deliveryMan?.isAvailable || false}
                                onCheckedChange={handleAvailabilityChange}
                                className="data-[state=checked]:bg-primary"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Information */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-primary" />
                            <div>
                                <CardTitle>Personal Information</CardTitle>
                                <CardDescription>Your basic contact details</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Full Name
                                </Label>
                                <Input id="name" name="name" value={profile.name} onChange={handleInputChange} className="h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    Phone Number
                                </Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    value={profile.phone || ""}
                                    onChange={handleInputChange}
                                    placeholder="Enter your phone number"
                                    className="h-11"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Email Address
                            </Label>
                            <Input value={profile.email} disabled className="h-11 bg-muted" />
                            <p className="text-xs text-muted-foreground">Email cannot be changed from this page</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Vehicle Information */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Truck className="h-5 w-5 text-primary" />
                            <div>
                                <CardTitle>Vehicle Information</CardTitle>
                                <CardDescription>Details about your delivery vehicle</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="vehicleType" className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    Vehicle Type
                                </Label>
                                <Input
                                    id="vehicleType"
                                    name="vehicleType"
                                    placeholder="e.g., Scooter, Motorcycle, Bicycle"
                                    value={profile.deliveryMan?.vehicleType || ""}
                                    onChange={handleInputChange}
                                    className="h-11"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="vehicleNumber" className="flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    Vehicle Number
                                </Label>
                                <Input
                                    id="vehicleNumber"
                                    name="vehicleNumber"
                                    placeholder="e.g., RJ 14 1M 1234"
                                    value={profile.deliveryMan?.vehicleNumber || ""}
                                    onChange={handleInputChange}
                                    className="h-11"
                                />
                            </div>
                        </div>

                        {profile.deliveryMan?.vehicleType && profile.deliveryMan?.vehicleNumber && (
                            <div className="p-4 bg-muted rounded-lg border">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    <div>
                                        <p className="font-medium">Vehicle Registered</p>
                                        <p className="text-sm text-muted-foreground">
                                            {profile.deliveryMan.vehicleType} • {profile.deliveryMan.vehicleNumber}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Status Messages */}
                {(success || error) && (
                    <Card className={success ? "border-green-200 bg-green-50" : "border-destructive/20 bg-destructive/5"}>
                        <CardContent className="pt-6">
                            {success && (
                                <div className="flex items-center gap-3 text-green-700">
                                    <CheckCircle className="h-5 w-5" />
                                    <p className="font-medium">{success}</p>
                                </div>
                            )}
                            {error && (
                                <div className="flex items-center gap-3 text-destructive">
                                    <AlertCircle className="h-5 w-5" />
                                    <p className="font-medium">{error}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={fetchProfile}
                        disabled={isSaving}
                        className="h-11 px-6 bg-transparent"
                    >
                        Reset Changes
                    </Button>
                    <Button type="submit" disabled={isSaving} className="h-11 px-8 bg-primary hover:bg-primary/90">
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            </form>
        </div>
    )
}
