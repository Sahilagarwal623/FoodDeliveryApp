'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Building, AlertCircle, CheckCircle } from 'lucide-react';

type VendorProfile = {
    restaurantName: string;
    imageUrl: string | null;
    priceRange: number | null;
    user: {
        name: string;
        email: string;
        phone: string | null;
    };
    address: {
        id: number;
        street: string;
        city: string;
        state: string;
        zipCode: string;
        phone: string;
    } | null;
};

export default function VendorProfilePage() {
    const [profile, setProfile] = useState<VendorProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/profile/vendor', { credentials: 'include' });
            if (!response.ok) throw new Error('Failed to fetch profile.');
            const data = await response.json();
            setProfile(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, model: 'user' | 'vendor' | 'address') => {
        const { name, value } = e.target;

        // Use the functional form of setState to ensure you're working with the latest state
        setProfile(prevProfile => {
            // If profile is null for any reason, do nothing
            if (!prevProfile) return null;

            // Use a switch to handle updates in a type-safe way
            switch (model) {
                case 'user':
                    return {
                        ...prevProfile,
                        user: {
                            ...prevProfile.user,
                            [name]: value
                        }
                    };
                case 'vendor':
                    // Vendor fields are at the top level of the profile state
                    return {
                        ...prevProfile,
                        [name]: value
                    };
                case 'address':
                    // The address object could be null, so we need to handle that
                    if (!prevProfile.address) return prevProfile;
                    return {
                        ...prevProfile,
                        address: {
                            ...prevProfile.address,
                            [name]: value
                        }
                    };
                default:
                    // Return the previous state if the model is unrecognized
                    return prevProfile;
            }
        });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/profile/vendor', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user: profile?.user,
                    vendor: profile,
                    address: {
                        ...profile?.address,
                        addressPhone: profile?.address?.phone // Renaming to avoid conflict
                    }
                }),
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update profile.');
            }

            setSuccess('Profile updated successfully!');
            await fetchProfile();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <p>Loading profile...</p>;
    if (!profile) return <p>Error: {error || 'Could not load profile.'}</p>;

    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Restaurant Profile</CardTitle>
                    <CardDescription>Manage your restaurant's public information and contact details.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Section for Personal Info */}
                        <h3 className="text-lg font-semibold border-b pb-2">Owner Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Owner Name</Label>
                                <Input id="name" name="name" value={profile.user.name} onChange={(e) => handleInputChange(e, 'user')} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Owner Contact</Label>
                                <Input id="phone" name="phone" value={profile.user.phone || ''} onChange={(e) => handleInputChange(e, 'user')} />
                            </div>
                        </div>

                        {/* Section for Restaurant Info */}
                        <h3 className="text-lg font-semibold border-b pb-2 pt-4">Restaurant Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="restaurantName">Restaurant Name</Label>
                                <Input id="restaurantName" name="restaurantName" value={profile.restaurantName} onChange={(e) => handleInputChange(e, 'vendor')} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="imageUrl">Restaurant Image URL</Label>
                                <Input id="imageUrl" name="imageUrl" value={profile.imageUrl || ''} onChange={(e) => handleInputChange(e, 'vendor')} />
                            </div>
                        </div>

                        {/* Section for Address Info */}
                        <h3 className="text-lg font-semibold border-b pb-2 pt-4">Restaurant Address</h3>
                        {profile.address && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="street">Street Address</Label>
                                    <Input name="street" value={profile.address.street} onChange={(e) => handleInputChange(e, 'address')} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label htmlFor="city">City</Label><Input name="city" value={profile.address.city} onChange={(e) => handleInputChange(e, 'address')} /></div>
                                    <div className="space-y-2"><Label htmlFor="state">State</Label><Input name="state" value={profile.address.state} onChange={(e) => handleInputChange(e, 'address')} /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label htmlFor="zipCode">Zip Code</Label><Input name="zipCode" value={profile.address.zipCode} onChange={(e) => handleInputChange(e, 'address')} /></div>
                                    <div className="space-y-2"><Label htmlFor="phone">Restaurant Phone</Label><Input name="phone" value={profile.address.phone} onChange={(e) => handleInputChange(e, 'address')} /></div>
                                </div>
                            </div>
                        )}

                        {success && <p className="text-sm text-green-600 flex items-center gap-2"><CheckCircle className="h-4 w-4" />{success}</p>}
                        {error && <p className="text-sm text-destructive flex items-center gap-2"><AlertCircle className="h-4 w-4" />{error}</p>}

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}