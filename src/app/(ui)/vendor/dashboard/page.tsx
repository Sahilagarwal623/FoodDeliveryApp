"use client"

import type React from "react"
import { useState, useEffect, type FormEvent, useCallback } from "react"
import { PlusCircle, Trash2, Edit, AlertCircle, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

// --- TYPES ---
type MenuItem = {
    id: number
    name: string
    description: string
    price: number
    imageUrl: string
    category: string
    isAvailable: boolean
}

type OrderItem = {
    quantity: number;
    price: number;
    menuItem: { name: string };
};

type Order = {
    id: number;
    status: string;
    amount: number;
    createdAt: string;
    user: { name: string | null };
    items: OrderItem[];
};

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
    const [isLoadingMenu, setIsLoadingMenu] = useState(true)

    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);

    const [error, setError] = useState<string | null>(null)
    const [editingItemId, setEditingItemId] = useState<number | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const fetchMenuItems = useCallback(async () => {
        setIsLoadingMenu(true)
        try {
            const response = await fetch('/api/vendor/menu-items', { credentials: 'include' })
            if (!response.ok) throw new Error("Failed to fetch menu items.")
            const data = await response.json()
            if (Array.isArray(data)) {
                setMenuItems(data)
            } else {
                throw new Error("Invalid data format for menu items.")
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoadingMenu(false)
        }
    }, [])

    const fetchOrders = useCallback(async () => {
        setIsLoadingOrders(true);
        try {
            const response = await fetch('/api/vendor/orders', { credentials: 'include' });
            if (!response.ok) throw new Error("Failed to fetch orders.");
            const data = await response.json();
            if (Array.isArray(data)) {
                setOrders(data);
            } else {
                throw new Error("Invalid data format for orders.");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoadingOrders(false);
        }
    }, [])

    useEffect(() => {
        fetchMenuItems()
        fetchOrders();
    }, [fetchMenuItems, fetchOrders])

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
        setNewItem((prev) => ({ ...prev, isAvailable: !!checked }))
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsSubmitting(true)

        try {
            if (editingItemId) {
                // Update existing item
                const response = await fetch(`/api/vendor/menu-items/${editingItemId}`, {
                    method: 'PATCH',
                    body: JSON.stringify(newItem),
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' }
                })
                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.error || "Failed to update item.")
                }
                setEditingItemId(null)
            } else {
                // Create new item
                const response = await fetch('/api/vendor/menu-items', {
                    method: 'POST',
                    body: JSON.stringify(newItem),
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' }
                })
                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.error || "Failed to add new item.")
                }
            }
            setNewItem(initialFormState)
            await fetchMenuItems();
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleEditItem = (item: MenuItem) => {
        setNewItem(item)
        setEditingItemId(item.id)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleDeleteItem = async (itemId: number) => {
        if (!confirm('Are you sure you want to delete this item?')) {
            return
        }

        setError(null)
        try {
            const response = await fetch(`/api/vendor/menu-items/${itemId}`, {
                method: 'DELETE',
                credentials: 'include',
            })
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to delete item.")
            }
            await fetchMenuItems();
        } catch (err: any) {
            setError(err.message)
        }
    }

    const handleCancelEdit = () => {
        setEditingItemId(null)
        setNewItem(initialFormState)
    }

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8">
            <h1 className="text-3xl font-bold">Vendor Dashboard</h1>

            {error && (
                <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                    <p><span className="font-bold">Error:</span> {error}</p>
                </div>
            )}

            <div className="grid gap-8 lg:grid-cols-3 items-start">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl flex items-center gap-2">
                                <ShoppingBag className="h-6 w-6" />
                                Incoming Orders
                            </CardTitle>
                            <CardDescription>Review and manage orders from your customers.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoadingOrders ? (
                                <p className="text-muted-foreground">Loading orders...</p>
                            ) : orders.length === 0 ? (
                                <p className="text-muted-foreground">You have no new orders.</p>
                            ) : (
                                <div className="space-y-6">
                                    {orders.map((order) => (
                                        <div key={order.id} className="border p-4 rounded-lg">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold">Order #{order.id}</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Customer: {order.user.name || 'N/A'}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Placed at: {new Date(order.createdAt).toLocaleString()}
                                                    </p>
                                                </div>
                                                <Badge variant={order.status === 'PENDING' ? 'destructive' : 'default'}>
                                                    {order.status}
                                                </Badge>
                                            </div>
                                            <Separator className="my-3" />
                                            <div className="space-y-1 text-sm">
                                                {order.items.map((item, index) => (
                                                    <p key={index} className="text-muted-foreground">
                                                        {item.quantity} x {item.menuItem.name}
                                                    </p>
                                                ))}
                                            </div>
                                            <div className="text-right font-bold mt-2">
                                                Total: ₹{order.amount.toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">{editingItemId ? 'Edit Menu Item' : 'Add Menu Item'}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* ✅ FIXED FORM INPUTS START HERE */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input type="text" name="name" id="name" value={newItem.name} onChange={handleInputChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea name="description" id="description" value={newItem.description} onChange={handleInputChange} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="price">Price (₹)</Label>
                                        <Input type="number" name="price" id="price" value={newItem.price} onChange={handleInputChange} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Category</Label>
                                        <Select value={newItem.category} onValueChange={handleSelectChange}>
                                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Main Course">Main Course</SelectItem>
                                                <SelectItem value="Appetizer">Appetizer</SelectItem>
                                                <SelectItem value="Dessert">Dessert</SelectItem>
                                                <SelectItem value="Beverage">Beverage</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="imageUrl">Image URL</Label>
                                    <Input type="url" name="imageUrl" id="imageUrl" value={newItem.imageUrl} onChange={handleInputChange} />
                                </div>
                                <div className="flex items-center space-x-2 pt-2">
                                    <Checkbox id="isAvailable" checked={newItem.isAvailable} onCheckedChange={handleCheckboxChange} />
                                    <Label htmlFor="isAvailable">Available for order</Label>
                                </div>
                                {/* ✅ FIXED FORM INPUTS END HERE */}
                                {editingItemId ? (
                                    <div className="space-y-2">
                                        <Button type="submit" className="w-full flex items-center gap-2" disabled={isSubmitting}>
                                            {isSubmitting ? 'Updating...' : 'Update Item'}
                                        </Button>
                                        <Button type="button" variant="outline" className="w-full" onClick={handleCancelEdit}>
                                            Cancel
                                        </Button>
                                    </div>
                                ) : (
                                    <Button type="submit" className="w-full flex items-center gap-2" disabled={isSubmitting}>
                                        <PlusCircle className="h-4 w-4" />
                                        {isSubmitting ? 'Adding...' : 'Add Item'}
                                    </Button>
                                )}
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">My Menu</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoadingMenu ? (
                        <p className="text-muted-foreground">Loading menu...</p>
                    ) : menuItems.length === 0 ? (
                        <p className="text-muted-foreground">You haven't added any items to your menu yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {menuItems.map((item) => (
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
                                                <Badge variant={item.isAvailable ? "default" : "destructive"}>
                                                    {item.isAvailable ? "Available" : "Unavailable"}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEditItem(item)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)}>
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