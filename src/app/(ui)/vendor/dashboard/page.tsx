"use client"

import type React from "react"
import { useState, useEffect, type FormEvent } from "react"
import { PlusCircle, Trash2, Edit, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

// Define the type for a menu item based on your database schema
type MenuItem = {
    id: number
    name: string
    description: string
    price: number
    imageUrl: string
    category: string
    isAvailable: boolean
}

const initialFormState = {
    name: "",
    description: "",
    price: 0,
    imageUrl: "",
    category: "Main Course",
    isAvailable: true,
}

export default function VendorDashboard() {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([])
    const [newItem, setNewItem] = useState(initialFormState)
    const [isLoading, setIsLoading] = useState(true)
    // 1. State for storing and displaying error messages
    const [error, setError] = useState<string | null>(null)

    // 2. Reusable function to fetch data and handle loading/error states
    const fetchMenuItems = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await fetch('/api/vendor/menu-items', { credentials: 'include' })

            // This handles server errors like 500
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to fetch menu items.")
            }

            const data = await response.json()



            // ✅ Add this check to ensure the data is an array
            if (Array.isArray(data)) {
                setMenuItems(data)
            } else {
                // If it's not an array, it's an unexpected response.
                // Clear the items and set an error.
                setMenuItems([])
                throw new Error("Received an invalid format from the server.")
            }

        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    // Fetch data on initial component mount
    useEffect(() => {
        fetchMenuItems()
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (type === "number") {
            const parsedValue = parseFloat(value);
            setNewItem((prev) => ({ ...prev, [name]: isNaN(parsedValue) ? 0 : parsedValue }));
        } else {
            setNewItem((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSelectChange = (value: string) => {
        setNewItem((prev) => ({ ...prev, category: value }))
    }

    const handleCheckboxChange = (checked: boolean) => {
        setNewItem((prev) => ({ ...prev, isAvailable: checked }))
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError(null) // Clear previous errors before submitting

        try {
            const response = await fetch('/api/vendor/menu-items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newItem),
                credentials: 'include',
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to add new item.")
            }

            // If successful, reset the form and refresh the menu list
            setNewItem(initialFormState)
            await fetchMenuItems()
        } catch (err: any) {
            // Set the error state to display the message to the user
            setError(err.message)
        }
    }

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8">
            <h1 className="text-3xl font-bold">Vendor Dashboard</h1>

            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Add New Menu Item</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* ... your form inputs ... */}

                        <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input type="text" name="name" id="name" value={newItem.name} onChange={handleInputChange} required />
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                name="description"
                                id="description"
                                value={newItem.description}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="price">Price (in ₹)</Label>
                            <Input
                                type="number"
                                name="price"
                                id="price"
                                value={newItem.price}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select value={newItem.category} onValueChange={handleSelectChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Main Course">Main Course</SelectItem>
                                    <SelectItem value="Appetizer">Appetizer</SelectItem>
                                    <SelectItem value="Dessert">Dessert</SelectItem>
                                    <SelectItem value="Beverage">Beverage</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="imageUrl">Image URL</Label>
                            <Input
                                type="text"
                                name="imageUrl"
                                id="imageUrl"
                                value={newItem.imageUrl}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox id="isAvailable" checked={newItem.isAvailable} onCheckedChange={handleCheckboxChange} />
                            <Label htmlFor="isAvailable">Available for order</Label>
                        </div>

                        {/* 3. Display form submission error message */}
                        {error && (
                            <div className="md:col-span-2 flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md">
                                <AlertCircle className="h-5 w-5" />
                                <p>{error}</p>
                            </div>
                        )}

                        <div className="md:col-span-2 flex justify-end">
                            <Button type="submit" className="flex items-center gap-2">
                                <PlusCircle className="h-4 w-4" />
                                Add Item
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Current Menu</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <p className="text-muted-foreground">Loading menu...</p>
                    ) : menuItems.length === 0 && !error ? (
                        <p className="text-muted-foreground">You haven't added any menu items yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {menuItems.map((item) => (
                                // ... card mapping ...
                                <Card key={item.id} className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={item.imageUrl || "/placeholder.svg"}
                                                alt={item.name}
                                                className="w-16 h-16 rounded-md object-cover"
                                            />
                                            <div className="space-y-1">
                                                <h3 className="text-lg font-semibold">{item.name}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {item.category} - ₹{item.price.toFixed(2)}
                                                </p>
                                                <Badge variant={item.isAvailable ? "default" : "secondary"}>
                                                    {item.isAvailable ? "Available" : "Unavailable"}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}