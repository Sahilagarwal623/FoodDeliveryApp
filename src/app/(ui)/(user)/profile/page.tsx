'use client';

import type React from "react";
import { useState, useEffect, type FormEvent, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, AlertCircle, CheckCircle, Mail, MapPin, Calendar, Phone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AddressManager } from "@/components/user/AddressManager";

// Define the types for the data fetched from your API
type Address = {
    id: number;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    latitude: number | null;
    longitude: number | null;
};

type UserProfile = {
    name: string;
    email: string;
    phone: string | null;
    createdAt: string;
    addresses: Address[];
};

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [formData, setFormData] = useState({ name: '', phone: '' });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Reusable function to fetch the latest profile data
    const fetchProfile = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/profile', { credentials: 'include' });
            if (!response.ok) throw new Error('Failed to fetch profile.');
            const data: UserProfile = await response.json();
            setProfile(data);
            setFormData({ name: data.name, phone: data.phone || '' });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');
        setSuccess('');
        try {
            const response = await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update profile.');
            }

            setSuccess('Profile updated successfully!');
            await fetchProfile(); // Re-fetch profile to show updated info
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    // Helper to format the join date
    const formattedJoinedDate = profile ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : '';
    // Helper to get a primary location string from the address list
    const displayLocation = profile?.addresses[0] ? `${profile.addresses[0].city}, ${profile.addresses[0].state}` : 'No address saved';

    if (isLoading) {
        return <ProfileSkeleton />;
    }

    if (!profile) {
        return <p className="text-center p-8">Could not load profile. {error}</p>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto py-8 px-4 max-w-4xl space-y-8">

                {/* --- PROFILE DISPLAY CARD --- */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Profile Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <Avatar className="w-20 h-20 border-2 border-primary">
                                <AvatarFallback className="text-2xl">{profile.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-1 text-center sm:text-left">
                                <h2 className="text-2xl font-bold">{profile.name}</h2>
                                <p className="text-muted-foreground flex items-center gap-2 justify-center sm:justify-start"><Mail className="w-4 h-4" /> {profile.email}</p>
                                <p className="text-muted-foreground flex items-center gap-2 justify-center sm:justify-start"><Phone className="w-4 h-4" /> {profile.phone || 'Not provided'}</p>
                                <p className="text-muted-foreground flex items-center gap-2 justify-center sm:justify-start"><MapPin className="w-4 h-4" /> {displayLocation}</p>
                                <p className="text-muted-foreground flex items-center gap-2 justify-center sm:justify-start"><Calendar className="w-4 h-4" /> Joined {formattedJoinedDate}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* --- EDIT PROFILE FORM CARD --- */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Edit Information</CardTitle>
                        <CardDescription>Update your name and phone number.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" name="name" value={formData.name} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input id="phone" name="phone" value={formData.phone || ''} onChange={handleInputChange} />
                                </div>
                            </div>

                            {success && <p className="text-sm text-green-600 flex items-center gap-2"><CheckCircle className="h-4 w-4" />{success}</p>}
                            {error && <p className="text-sm text-destructive flex items-center gap-2"><AlertCircle className="h-4 w-4" />{error}</p>}

                            <div className="flex justify-end">
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* --- ADDRESS MANAGEMENT SECTION --- */}
                {/* The AddressManager is self-contained and handles its own state and API calls for addresses */}
                <AddressManager onAddressSelect={() => { }} selectedAddressId={undefined} />
            </div>
        </div>
    );
}

// Skeleton component for loading state
function ProfileSkeleton() {
    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl space-y-8">
            <Card>
                <CardHeader><Skeleton className="h-8 w-48" /></CardHeader>
                <CardContent>
                    <div className="flex items-center gap-6">
                        <Skeleton className="w-20 h-20 rounded-full" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-7 w-1/3" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-4 w-1/3" />
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><Skeleton className="h-7 w-40" /></CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        </div>
    )
}