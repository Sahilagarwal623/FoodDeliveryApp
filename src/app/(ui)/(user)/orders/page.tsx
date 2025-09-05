"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Clock, Search, ShoppingBag } from "lucide-react"
import Link from "next/link"
// Define types to match the API response
type OrderItem = {
    quantity: number
    menuItem: { name: string }
}

type Order = {
    id: number
    status: string
    amount: number
    createdAt: string
    vendor: { restaurantName: string }
    items: OrderItem[]
}

const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case "delivered":
            return "bg-green-100 text-green-800 border-green-200"
        case "pending":
            return "bg-secondary text-secondary-foreground"
        case "preparing":
            return "bg-blue-100 text-blue-800 border-blue-200"
        case "cancelled":
            return "bg-red-100 text-red-800 border-red-200"
        default:
            return "bg-gray-100 text-gray-800 border-gray-200"
    }
}

const getStatusProgress = (status: string) => {
    switch (status.toLowerCase()) {
        case "pending":
            return 25
        case "preparing":
            return 50
        case "out for delivery":
            return 75
        case "delivered":
            return 100
        default:
            return 0
    }
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch("/api/orders", { credentials: "include" })
                if (!response.ok) {
                    throw new Error("Failed to fetch your orders.")
                }
                const data = await response.json()
                setOrders(data)
            } catch (err: any) {
                setError(err.message)
            } finally {
                setIsLoading(false)
            }
        }

        fetchOrders()
    }, [])

    const filteredOrders = orders.filter(
        (order) =>
            order.vendor.restaurantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.id.toString().includes(searchTerm),
    )

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto py-8 px-4">
                    <div className="space-y-6">
                        <div className="h-12 bg-muted rounded-lg animate-pulse" />
                        <div className="h-10 bg-muted rounded-lg animate-pulse" />
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                        <ShoppingBag className="w-8 h-8 text-destructive" />
                    </div>
                    <h2 className="text-xl font-serif font-bold text-foreground">{"Oops! Something went wrong"}</h2>
                    <p className="text-muted-foreground">{error}</p>
                    <Button
                        onClick={() => window.location.reload()}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        {"Try Again"}
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto py-8 px-4 max-w-4xl">
                {/* Header Section */}
                <div className="space-y-6 mb-8">
                    <div className="text-center space-y-2">
                        <h1 className="text-4xl font-serif font-bold text-foreground text-balance">{"Order History"}</h1>
                        <p className="text-muted-foreground text-lg">{"Track your delicious journey with us"}</p>
                    </div>

                    {/* Search Bar */}
                    <div className="relative max-w-md mx-auto">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Search by restaurant or order ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-card border-border"
                        />
                    </div>
                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-16 space-y-4">
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
                            <ShoppingBag className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-serif font-semibold text-foreground">
                            {searchTerm ? "No orders found" : "No orders yet"}
                        </h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                            {searchTerm
                                ? "Try adjusting your search terms to find what you're looking for."
                                : "When you place your first order, it will appear here."}
                        </p>
                        {!searchTerm && (
                            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 mt-4">
                                {"Place Your First Order"}
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredOrders.map((order) => (
                            <Card
                                key={order.id}
                                className="bg-card border-border shadow-sm hover:shadow-md transition-shadow duration-200"
                            >
                                <CardHeader className="pb-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <CardTitle className="text-lg font-serif text-card-foreground">
                                                {order.vendor.restaurantName}
                                            </CardTitle>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span>
                                                        {"Order #"}
                                                        {order.id}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <Badge className={`${getStatusColor(order.status)} font-medium px-3 py-1`}>{order.status}</Badge>
                                    </div>

                                    {/* Status Progress Bar */}
                                    <div className="mt-4">
                                        <div className="flex justify-between text-xs text-muted-foreground mb-2">
                                            <span>{"Order Placed"}</span>
                                            <span>{"Preparing"}</span>
                                            <span>{"Out for Delivery"}</span>
                                            <span>{"Delivered"}</span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-2">
                                            <div
                                                className="bg-accent h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${getStatusProgress(order.status)}%` }}
                                            />
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="pt-0">
                                    <div className="space-y-3">
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-foreground">{"Order Items"}</h4>
                                            {order.items.map((item, index) => (
                                                <div key={index} className="flex justify-between items-center text-sm">
                                                    <span className="text-muted-foreground">
                                                        {item.quantity} × {item.menuItem.name}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        <Separator className="bg-border" />

                                        <div className="flex justify-between items-center">
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" className="text-xs bg-transparent cursor-pointer">
                                                    <Link href={`/orders/${order.id}`}>View Details</Link>
                                                </Button>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xl font-bold text-primary">
                                                    {"₹"}
                                                    {order.amount.toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Call to Action */}
                        <div className="text-center pt-8">
                            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3">
                                {"Place New Order"}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
