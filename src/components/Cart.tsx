"use client"

import { ShoppingCart } from "lucide-react"
import { useCartStore } from "@/store/cart-store"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { useEffect } from "react"

export default function Cart() {
    // Subscribe to the store to get the state and actions
    const { items, addItem, removeItem, getTotalItems, getCartTotal, initializeCart, clearCart } = useCartStore()

    // Use selectors to get computed values
    const totalItems = getTotalItems()
    const cartTotal = getCartTotal()

    // The store now holds items as an object, so we get an array for mapping
    const itemArray = Object.values(items)

    useEffect(() => {

        const cartInitialization = async () => {
            initializeCart();
        }

        cartInitialization();

    }, [])

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="relative bg-transparent">
                    <ShoppingCart className="h-5 w-5" />
                    {totalItems > 0 && (
                        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1">
                            {totalItems}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col w-full sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>Your Cart ({totalItems})</SheetTitle>
                </SheetHeader>

                {itemArray.length > 0 ? (
                    <>
                        <div className="flex-1 overflow-y-auto py-4 space-y-4">
                            {itemArray.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex-1">
                                        <p className="font-semibold">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">₹{item.price.toFixed(2)}</p>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        <Button size="sm" variant="outline" onClick={() => removeItem(item.id)}>
                                            -
                                        </Button>
                                        <span className="min-w-8 text-center">{item.quantity}</span>
                                        <Button size="sm" onClick={() => addItem(item)}>
                                            +
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Separator />
                        <SheetFooter className="mt-4 flex-col space-y-4">
                            <div className="flex justify-between items-center font-bold text-lg">
                                <span>Total</span>
                                <span>₹{cartTotal.toFixed(2)}</span>
                            </div>
                            <SheetClose asChild>
                                <Button className="w-full" size="lg">
                                    <Link href="/checkout">Proceed to Checkout</Link>
                                </Button>
                            </SheetClose>
                        </SheetFooter>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                        <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground text-lg">Your cart is empty.</p>
                        <p className="text-sm text-muted-foreground mt-2">Add some items to get started!</p>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}
