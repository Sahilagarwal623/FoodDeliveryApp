"use client"

import type React from "react"
import { useState, useEffect, type FormEvent } from "react"
import { Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { LocationPicker } from '../shared/LocationPicker';

type Address = {
    id: number;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    latitude?: number | null;
    longitude?: number | null;
};

type AddressFormData = Omit<Address, 'id'>;

type AddressFormProps = {
    addressToEdit?: Address | null;
    onSave: () => void;
};

const initialFormState: AddressFormData = {
    street: '', city: '', state: '', zipCode: '', phone: '',
    latitude: null, longitude: null
};

export function AddressForm({ addressToEdit, onSave }: AddressFormProps) {
    const [formData, setFormData] = useState<AddressFormData>(initialFormState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (addressToEdit) {
            setFormData({
                street: addressToEdit.street,
                city: addressToEdit.city,
                state: addressToEdit.state,
                zipCode: addressToEdit.zipCode,
                phone: addressToEdit.phone,
                latitude: addressToEdit.latitude || null,
                longitude: addressToEdit.longitude || null,
            });
        } else {
            setFormData(initialFormState);
        }
    }, [addressToEdit]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLocationChange = ({ lat, lng }: { lat: number, lng: number }) => {
        setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const isEditing = !!addressToEdit;
        const url = isEditing ? `/api/addresses/${addressToEdit.id}` : '/api/addresses';
        const method = isEditing ? 'PATCH' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to ${isEditing ? 'update' : 'add'} address.`);
            }

            onSave();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="street">Street Address</Label>
                <Input name="street" value={formData.street} onChange={handleInputChange} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input name="city" value={formData.city} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input name="state" value={formData.state} onChange={handleInputChange} required />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip Code</Label>
                    <Input name="zipCode" value={formData.zipCode} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input name="phone" value={formData.phone} onChange={handleInputChange} required />
                </div>
            </div>

            <div className="pt-2">
                <Label>Set Location on Map (Optional)</Label>
                <LocationPicker onLocationChange={handleLocationChange} />
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSubmitting ? 'Saving...' : 'Save Address'}
                </Button>
            </div>
        </form>
    );
}