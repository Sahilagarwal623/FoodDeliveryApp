"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCartStore } from "@/store/cart-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Loader2, MapPin, CreditCard, ShoppingBag, CheckCircle, Clock, Truck } from "lucide-react"

import { AddressManager } from "@/components/user/AddressManager"

export default function CheckoutPage() {
    const router = useRouter()
    const { items, getCartTotal, clearCart, isInitialized, initializeCart } = useCartStore()
    const cartTotal = getCartTotal()
    const itemArray = Object.values(items)
    const [selectedAddress, setSelectedAddress] = useState<string | undefined>(undefined)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {

        const cartInitialization = async () => {
            initializeCart();
        }

        cartInitialization();

    }, [])

    const handlePlaceOrder = async () => {
        // ... (This function remains exactly the same)
        if (!selectedAddress) {
            setError("Please select a delivery address.")
            return
        }
        setIsLoading(true)
        setError("")
        try {
            const response = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ addressId: Number.parseInt(selectedAddress, 10) }),
                credentials: "include",
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to place order.")
            }

            const result = await response.json()
            await clearCart()
            router.push(`/orders/${result.orderId}`)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    // Redirect if cart is empty after initialization
    useEffect(() => {
        if (isInitialized && itemArray.length === 0) {
            router.replace("/restaurants")
        }
    }, [isInitialized, itemArray.length, router])

    return (
        <div className="min-h-screen bg-background">
            <div className="bg-card border-b border-border">
                <div className="container mx-auto px-4 py-6 max-w-4xl">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-serif font-bold text-foreground">Secure Checkout</h1>
                        <Badge variant="secondary" className="text-sm">
                            <Clock className="w-4 h-4 mr-1" />
                            Est. 25-35 min
                        </Badge>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                                1
                            </div>
                            <span className="ml-2 text-sm font-medium text-foreground">Address</span>
                        </div>
                        <div className="flex-1 h-px bg-border"></div>
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                                2
                            </div>
                            <span className="ml-2 text-sm font-medium text-foreground">Review</span>
                        </div>
                        <div className="flex-1 h-px bg-border"></div>
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-sm font-medium">
                                3
                            </div>
                            <span className="ml-2 text-sm font-medium text-muted-foreground">Payment</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto py-8 px-4 max-w-4xl">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Address & Payment */}
                    <div className="lg:col-span-2 space-y-6">

                        <AddressManager
                            selectedAddressId={selectedAddress}
                            onAddressSelect={setSelectedAddress}
                        />


                        <Card className="border-border shadow-sm">
                            <CardHeader className="pb-4">
                                <div className="flex items-center space-x-2">
                                    <CreditCard className="w-5 h-5 text-primary" />
                                    <CardTitle className="text-xl font-serif">Payment Method</CardTitle>
                                </div>
                                <CardDescription>Secure payment processing</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center space-x-3 p-4 bg-muted rounded-lg">
                                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                        <Truck className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">Cash on Delivery</p>
                                        <p className="text-sm text-muted-foreground">Pay when your order arrives</p>
                                    </div>
                                    <CheckCircle className="w-5 h-5 text-primary ml-auto" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="lg:col-span-1">
                        <Card className="border-border shadow-sm sticky top-6">
                            <CardHeader className="pb-4">
                                <div className="flex items-center space-x-2">
                                    <ShoppingBag className="w-5 h-5 text-primary" />
                                    <CardTitle className="text-xl font-serif">Order Summary</CardTitle>
                                </div>
                                <CardDescription>
                                    {itemArray.length} item{itemArray.length !== 1 ? "s" : ""} in your order
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    {itemArray.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between py-2">
                                            <div className="flex-1">
                                                <p className="font-medium text-foreground text-sm">{item.name}</p>
                                                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="font-medium text-foreground">₹{(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span className="text-foreground">₹{cartTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Delivery Fee</span>
                                        <span className="text-primary font-medium">FREE</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between text-lg font-semibold">
                                        <span className="text-foreground">Total</span>
                                        <span className="text-primary">₹{cartTotal.toFixed(2)}</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex-col gap-4 pt-4">
                                {error && (
                                    <Alert variant="destructive" className="w-full">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Error</AlertTitle>
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}
                                <Button
                                    className="w-full h-12 text-base font-medium cursor-pointer"
                                    onClick={handlePlaceOrder}
                                    disabled={isLoading || itemArray.length === 0 || !selectedAddress}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Processing Order...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Place Order
                                        </>
                                    )}
                                </Button>
                                <p className="text-xs text-muted-foreground text-center">
                                    By placing this order, you agree to our terms and conditions
                                </p>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
