'use client';

import React, { useState, useRef, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { Loader2, LocateFixed } from 'lucide-react';

const containerStyle = {
    width: '100%',
    height: '300px',
    borderRadius: '0.5rem',
    position: 'relative' as const, // Important for positioning the button
};

const defaultCenter = {
    lat: 20.5937, // Default center of India
    lng: 78.9629,
};

type Location = { lat: number; lng: number; };

type LocationPickerProps = {
    onLocationChange: (location: Location) => void;
};

export function LocationPicker({ onLocationChange }: LocationPickerProps) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    });

    const [markerPosition, setMarkerPosition] = useState<Location | null>(null);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const mapRef = useRef<google.maps.Map | null>(null);

    const onMapLoad = useCallback((map: google.maps.Map) => {
        mapRef.current = map;
    }, []);

    const handleGetCurrentLocation = () => {
        setIsLoadingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newPos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setMarkerPosition(newPos);
                    onLocationChange(newPos);
                    mapRef.current?.panTo(newPos); // Smoothly moves the map
                    mapRef.current?.setZoom(15);
                    setIsLoadingLocation(false);
                },
                () => {
                    alert('Location access was denied.');
                    setIsLoadingLocation(false);
                }
            );
        }
    };

    const handleMapClick = (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
            const newPos = {
                lat: event.latLng.lat(),
                lng: event.latLng.lng(),
            };
            setMarkerPosition(newPos);
            onLocationChange(newPos);
        }
    };

    if (!isLoaded) return <div>Loading Map...</div>;

    return (
        <div style={containerStyle}>
            <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={defaultCenter}
                zoom={5}
                onClick={handleMapClick}
                onLoad={onMapLoad}
                options={{
                    streetViewControl: false, // Disabling some default controls
                    mapTypeControl: false,
                    fullscreenControl: false,
                }}
            >
                {markerPosition && <MarkerF position={markerPosition} />}
            </GoogleMap>

            <Button
                type="button" // Important to prevent form submission
                size="icon"
                onClick={handleGetCurrentLocation}
                disabled={isLoadingLocation}
                className="absolute top-3 right-3 z-10 bg-white hover:bg-gray-100"
                variant="outline"
            >
                {isLoadingLocation ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                    <LocateFixed className="h-5 w-5 text-gray-700" />
                )}
            </Button>
        </div>
    );
}