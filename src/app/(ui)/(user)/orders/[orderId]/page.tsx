"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Loader2, Clock, Truck, ChefHat, MapPin } from "lucide-react"
import Link from "next/link"

// Define types to match the API response
type OrderItemDetail = {
    quantity: number
    price: number
    menuItem: { name: string; imageUrl: string | null }
}

type OrderDetails = {
    id: number
    status: string
    amount: number
    createdAt: string
    vendor: { restaurantName: string }
    items: OrderItemDetail[]
}

export default function OrderConfirmationPage() {
    const params = useParams()
    const orderId = params.orderId as string

    const [order, setOrder] = useState<OrderDetails | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!orderId) return

        const fetchOrder = async () => {
            setIsLoading(true)
            try {
                const response = await fetch(`/api/orders/${orderId}`, { credentials: "include" })
                if (!response.ok) {
                    throw new Error("Could not find your order.")
                }
                const data = await response.json()
                setOrder(data)
            } catch (err: any) {
                setError(err.message)
            } finally {
                setIsLoading(false)
            }
        }

        fetchOrder()
    }, [orderId])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-card to-background flex flex-col items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold text-foreground">Loading your order details...</h2>
                        <p className="text-muted-foreground">{"Just a moment while we fetch everything!"}</p>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-card to-background flex flex-col items-center justify-center">
                <div className="text-center space-y-6 max-w-md">
                    <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-2xl">😕</span>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-destructive">Oops! Something went wrong</h2>
                        <p className="text-muted-foreground">{error}</p>
                    </div>
                    <Button asChild className="bg-primary hover:bg-primary/90">
                        <Link href="/restaurants">Browse Restaurants</Link>
                    </Button>
                </div>
            </div>
        )
    }

    if (!order) return null

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case "confirmed":
                return <CheckCircle className="h-5 w-5 text-primary" />
            case "preparing":
                return <ChefHat className="h-5 w-5 text-secondary" />
            case "on_the_way":
                return <Truck className="h-5 w-5 text-secondary" />
            default:
                return <Clock className="h-5 w-5 text-muted-foreground" />
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-card to-background">
            <div className="container mx-auto py-8 px-4 max-w-2xl">
                <div className="text-center mb-8 space-y-4">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-12 w-12 text-primary animate-pulse" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-foreground text-balance">🎉 Your Order is Confirmed!</h1>
                        <p className="text-lg text-muted-foreground text-pretty">
                            Thank you for choosing us! Your delicious meal is on its way.
                        </p>
                    </div>
                </div>

                <Card className="w-full shadow-lg border-0 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-xl text-card-foreground">Order #{order.id}</CardTitle>
                                <CardDescription className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    {order.vendor.restaurantName}
                                </CardDescription>
                            </div>
                            <div className="text-right space-y-2">
                                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                                    <span className="flex items-center gap-1">
                                        {getStatusIcon(order.status)}
                                        {order.status}
                                    </span>
                                </Badge>
                                <p className="text-sm text-muted-foreground">
                                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                                        weekday: "short",
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                    })}
                                </p>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <h4 className="font-semibold text-card-foreground flex items-center gap-2">
                                <span className="text-lg">🍽️</span>
                                Items Ordered
                            </h4>
                            <div className="space-y-3">
                                {order.items.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex justify-between items-center p-3 rounded-lg bg-background/50 border border-border/50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-primary"></div>
                                            <div>
                                                <span className="font-medium text-card-foreground">{item.menuItem.name}</span>
                                                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                            </div>
                                        </div>
                                        <span className="font-semibold text-primary">₹{(item.quantity * item.price).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Separator className="bg-border/50" />

                        <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-semibold text-card-foreground">Total Paid</span>
                                <span className="text-2xl font-bold text-primary">₹{order.amount.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="space-y-4 pt-2">
                            <div className="text-center space-y-3">
                                <p className="text-muted-foreground text-pretty">
                                    {"We'll keep you updated on your order status. Track your delivery in real-time!"}
                                </p>
                                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8">
                                    Track Your Order
                                </Button>
                            </div>

                            <div className="flex justify-center gap-4 pt-4">
                                <Button variant="outline" asChild className="border-border/50 bg-transparent">
                                    <Link href="/restaurants">Order Again</Link>
                                </Button>
                                <Button variant="outline" className="border-border/50 bg-transparent">
                                    Share Order
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="text-center mt-8 space-y-2">
                    <p className="text-sm text-muted-foreground text-pretty">
                        Questions about your order? Contact our support team anytime.
                    </p>
                </div>
            </div>
        </div>
    )
}
