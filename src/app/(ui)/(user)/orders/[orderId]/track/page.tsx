"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api"
import Pusher from "pusher-js"
import { Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

type Location = { lat: number; lng: number }

type OrderTrackData = {
  vendor: {
    restaurantName: string
    // The address is now a nested object
    address: {
      latitude: number
      longitude: number
    }
  }
  address: {
    // This is the user's delivery address
    street: string
    latitude: number
    longitude: number
  }
  deliveryMan: { latitude: number | null; longitude: number | null } | null
}

const containerStyle = { width: "100%", height: "calc(100vh - 150px)", borderRadius: "0.5rem" }

export default function OrderTrackingPage() {
  const params = useParams()
  const orderId = params.orderId as string

  const [orderData, setOrderData] = useState<OrderTrackData | null>(null)
  const [deliveryManPosition, setDeliveryManPosition] = useState<Location | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const mapRef = useRef<google.maps.Map | null>(null)

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  })

  // 1. Fetch the static order data (restaurant and user locations)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}/track`, { credentials: "include" })
        if (!response.ok) throw new Error("Could not fetch order data.")
        const data = await response.json()
        setOrderData(data)
        if (data.deliveryMan?.latitude && data.deliveryMan?.longitude) {
          setDeliveryManPosition({ lat: data.deliveryMan.latitude, lng: data.deliveryMan.longitude })
        }
        // Otherwise, set the driver's starting position to the restaurant's location.
        else if (data.vendor?.address?.latitude && data.vendor?.address?.longitude) {
          setDeliveryManPosition({
            lat: data.vendor.address.latitude,
            lng: data.vendor.address.longitude,
          })
        }
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchInitialData()
  }, [orderId])

  // 2. Subscribe to Pusher for real-time updates
  useEffect(() => {
    if (!orderId) return

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    })

    // Subscribe to a channel specific to this order
    const channel = pusher.subscribe(`order-${orderId}`)

    // Listen for the 'location-update' event
    channel.bind("location-update", (data: Location) => {
      console.log("New driver location received:", data)
      setDeliveryManPosition(data)
      // Optionally, pan the map to the new location
      mapRef.current?.panTo(data)
    })

    // Cleanup: unsubscribe when the component unmounts
    return () => {
      pusher.unsubscribe(`order-${orderId}`)
      pusher.disconnect()
    }
  }, [orderId])

  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map
    if (orderData) {
      const bounds = new google.maps.LatLngBounds()
      bounds.extend({ lat: orderData.vendor.address.latitude, lng: orderData.vendor.address.longitude })
      bounds.extend({ lat: orderData.address.latitude, lng: orderData.address.longitude })
      map.fitBounds(bounds)
    }
  }

  if (isLoading || !isLoaded) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-4">Tracking Order #{orderId}</h1>
      <Card>
        <CardContent className="p-2">
          <GoogleMap mapContainerStyle={containerStyle} onLoad={onMapLoad} zoom={12}>
            {orderData && (
              <>
                {/* Restaurant Marker */}
                <MarkerF
                  position={{ lat: orderData.vendor.address.latitude, lng: orderData.vendor.address.longitude }}
                  title={orderData.vendor.restaurantName}
                  icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: "blue",
                    fillOpacity: 1,
                    strokeColor: "white",
                    strokeWeight: 2,
                  }}
                />
                {/* Home/Delivery Address Marker */}
                <MarkerF
                  position={{ lat: orderData.address.latitude, lng: orderData.address.longitude }}
                  title="Your Address"
                  icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: "green",
                    fillOpacity: 1,
                    strokeColor: "white",
                    strokeWeight: 2,
                  }}
                />
                {/* Delivery Person Marker (this one will move!) */}
                {deliveryManPosition && (
                  <MarkerF
                    position={deliveryManPosition}
                    title="Delivery Partner"
                    icon={{
                      url:
                        "data:image/svg+xml;charset=UTF-8," +
                        encodeURIComponent(`
                          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="18" fill="#ff6b35" stroke="#ffffff" strokeWidth="3"/>
                            <g transform="translate(6, 8)">
                              <circle cx="6" cy="16" r="4" fill="none" stroke="#ffffff" strokeWidth="2"/>
                              <circle cx="18" cy="16" r="4" fill="none" stroke="#ffffff" strokeWidth="2"/>
                              <path d="M6 16h12" stroke="#ffffff" strokeWidth="2"/>
                              <path d="M12 8l4 8" stroke="#ffffff" strokeWidth="2"/>
                              <path d="M8 16l4-8h4" stroke="#ffffff" strokeWidth="2"/>
                              <circle cx="12" cy="6" r="2" fill="#ffffff"/>
                            </g>
                          </svg>
                        `),
                      scaledSize: new google.maps.Size(36, 36),
                      anchor: new google.maps.Point(18, 18),
                    }}
                  />
                )}
              </>
            )}
          </GoogleMap>
        </CardContent>
      </Card>
    </div>
  )
}
