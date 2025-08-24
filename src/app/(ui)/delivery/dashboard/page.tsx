"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Truck, MapPin, Clock, DollarSign, Package, CheckCircle, Navigation, User, Bell, Settings } from "lucide-react"

interface Order {
  id: string
  customer: string
  address: string
  items: number
  status: "pending" | "in-transit" | "delivered"
  earnings: number
  estimatedTime: string
}

const mockOrders: Order[] = [
  {
    id: "ORD-001",
    customer: "Sarah Johnson",
    address: "123 Oak Street, Downtown",
    items: 3,
    status: "pending",
    earnings: 12.5,
    estimatedTime: "15 min",
  },
  {
    id: "ORD-002",
    customer: "Mike Chen",
    address: "456 Pine Avenue, Midtown",
    items: 2,
    status: "in-transit",
    earnings: 8.75,
    estimatedTime: "8 min",
  },
  {
    id: "ORD-003",
    customer: "Emma Davis",
    address: "789 Elm Road, Uptown",
    items: 1,
    status: "delivered",
    earnings: 6.25,
    estimatedTime: "Completed",
  },
]

export default function DeliveryDashboard() {
  const [activeOrders, setActiveOrders] = useState(mockOrders)
  const [isOnline, setIsOnline] = useState(true)

  const todayEarnings = activeOrders.reduce(
    (sum, order) => (order.status === "delivered" ? sum + order.earnings : sum),
    0,
  )

  const completedDeliveries = activeOrders.filter((order) => order.status === "delivered").length
  const pendingOrders = activeOrders.filter((order) => order.status === "pending").length

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "in-transit":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200"
    }
  }

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "in-transit":
        return <Truck className="h-4 w-4" />
      case "delivered":
        return <CheckCircle className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Truck className="h-6 w-6 text-primary" />
              <h1 className="text-lg font-semibold text-foreground">DeliveryPro</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant={isOnline ? "default" : "outline"}
              size="sm"
              onClick={() => setIsOnline(!isOnline)}
              className="text-xs"
            >
              {isOnline ? "Online" : "Offline"}
            </Button>
            <Bell className="h-5 w-5 text-muted-foreground" />
            <Avatar className="h-8 w-8">
              <AvatarImage src="/delivery-driver-profile.png" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Today's Earnings</p>
                  <p className="text-xl font-semibold text-foreground">${todayEarnings.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-xl font-semibold text-foreground">{completedDeliveries}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-xl font-semibold text-foreground">{pendingOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Time</p>
                  <p className="text-xl font-semibold text-foreground">12m</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Delivery Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Current Delivery
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeOrders.find((order) => order.status === "in-transit") ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Delivering to Mike Chen</p>
                    <p className="text-sm text-muted-foreground">456 Pine Avenue, Midtown</p>
                  </div>
                  <Badge className={getStatusColor("in-transit")}>
                    {getStatusIcon("in-transit")}
                    In Transit
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>8 min remaining</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    <MapPin className="h-4 w-4 mr-2" />
                    Navigate
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                    Call Customer
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No active deliveries</p>
                <p className="text-sm text-muted-foreground">Accept an order to start delivering</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Available Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeOrders.map((order) => (
              <div key={order.id} className="border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{order.customer}</p>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {order.address}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.items} item{order.items > 1 ? "s" : ""} • ${order.earnings.toFixed(2)} •{" "}
                      {order.estimatedTime}
                    </p>
                  </div>
                </div>

                {order.status === "pending" && (
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      Accept Order
                    </Button>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                )}

                {order.status === "in-transit" && (
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      Mark Delivered
                    </Button>
                    <Button size="sm" variant="outline">
                      Report Issue
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="h-16 flex-col gap-2 bg-transparent">
            <Settings className="h-5 w-5" />
            Settings
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-2 bg-transparent">
            <User className="h-5 w-5" />
            Profile
          </Button>
        </div>
      </div>
    </div>
  )
}
