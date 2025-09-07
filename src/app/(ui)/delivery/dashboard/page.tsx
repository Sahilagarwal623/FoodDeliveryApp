'use client';

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Truck, MapPin, CheckCircle, Navigation, Bell, Package } from "lucide-react";

// Define the shape of an order/task from our API
type Task = {
  id: number;
  status: string;
  amount: number;
  user: { name: string | null };
  vendor: { restaurantName: string, address: { street: string, city: string } };
  address: { street: string, city: string }; // Customer's address
};

export default function DeliveryDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tasks assigned to the delivery person
  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/delivery/tasks', { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      setTasks(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Handler to accept a new order
  const handleAcceptOrder = async (orderId: number) => {
    try {
      const response = await fetch(`/api/delivery/tasks/${orderId}/accept`, {
        method: 'PATCH',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to accept order.');
      await fetchTasks(); // Refresh the list
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Handler to mark an order as delivered
  const handleMarkDelivered = async (orderId: number) => {
    try {
      const response = await fetch(`/api/delivery/tasks/${orderId}/complete`, {
        method: 'PATCH',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to complete order.');
      await fetchTasks(); // Refresh the list
    } catch (err: any) {
      alert(err.message);
    }
  }

  const activeDelivery = tasks.find(t => t.status === 'OUT_FOR_DELIVERY');
  const availableTasks = tasks.filter(t => t.status === 'PENDING');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border px-4 py-3">
        {/* ... Header JSX is fine, no changes needed ... */}
      </header>

      <div className="p-4 space-y-6">
        {/* Stats Section can be updated later with real data */}

        {/* Current Delivery Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Navigation className="h-5 w-5" />Current Delivery</CardTitle>
          </CardHeader>
          <CardContent>
            {activeDelivery ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Pick up from</p>
                  <p className="font-medium">{activeDelivery.vendor.restaurantName}</p>
                  <p className="text-sm text-muted-foreground">{activeDelivery.vendor.address.street}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Deliver to</p>
                  <p className="font-medium">{activeDelivery.user.name}</p>
                  <p className="text-sm text-muted-foreground">{activeDelivery.address.street}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleMarkDelivered(activeDelivery.id)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Delivered
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                    <MapPin className="h-4 w-4 mr-2" />
                    Navigate
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No active delivery.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" />Available Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? <p>Loading...</p> : availableTasks.length === 0 ? <p>No new delivery tasks available.</p> :
              availableTasks.map((order) => (
                <div key={order.id} className="border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">Order #{order.id} from {order.vendor.restaurantName}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Deliver to: {order.address.street}, {order.address.city}
                      </p>
                    </div>
                    <Badge variant="secondary">Potential Earnings: ₹{order.amount * 0.10}</Badge> {/* Example earning */}
                  </div>
                  <Button size="sm" className="w-full" onClick={() => handleAcceptOrder(order.id)}>
                    Accept Task
                  </Button>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}