'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Trash2, Edit, MapPin } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AddressForm } from './AddressForm'; // Import the form we just created

type Address = {
    id: number;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
};

type AddressManagerProps = {
    selectedAddressId?: string;
    onAddressSelect: (addressId: string) => void;
};

export function AddressManager({ selectedAddressId, onAddressSelect }: AddressManagerProps) {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    const fetchAddresses = async () => {
        const response = await fetch('/api/addresses', { credentials: 'include' });
        if (response.ok) {
            setAddresses(await response.json());
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const handleOpenDialog = (address: Address | null = null) => {
        setEditingAddress(address);
        setIsDialogOpen(true);
    };

    const handleSaveSuccess = () => {
        setIsDialogOpen(false);
        fetchAddresses(); // Refresh the list after a successful save
    };

    const handleDelete = async (addressId: number) => {
        if (confirm('Are you sure you want to delete this address?')) {
            await fetch(`/api/addresses/${addressId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            fetchAddresses(); // Refresh the list
        }
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Card className="border-border shadow-sm">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <MapPin className="w-5 h-5 text-primary" />
                            <CardTitle className="text-xl font-serif">Delivery Address</CardTitle>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleOpenDialog()}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add New
                        </Button>
                    </div>
                    <CardDescription>Choose where you'd like your order delivered</CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup value={selectedAddressId} onValueChange={onAddressSelect} className="space-y-3">
                        {addresses.map((addr) => (
                            <div key={addr.id} className="flex items-center gap-2">
                                <Label
                                    htmlFor={`addr-${addr.id}`}
                                    className="flex-1 flex items-start space-x-4 border border-border p-4 rounded-lg has-[input:checked]:border-primary has-[input:checked]:bg-primary/5 cursor-pointer transition-all hover:border-primary/50"
                                >
                                    <RadioGroupItem value={addr.id.toString()} id={`addr-${addr.id}`} className="mt-1" />
                                    <div className="flex-1">
                                        <p className="font-medium text-foreground">{addr.street}</p>
                                        <p className="text-sm text-muted-foreground mt-1">{addr.city}, {addr.state} - {addr.zipCode}</p>
                                    </div>
                                </Label>
                                <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(addr)}><Edit className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(addr.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </div>
                        ))}
                    </RadioGroup>
                    {addresses.length === 0 && (
                        <div className="text-center py-8">
                            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                            <p className="text-muted-foreground">No saved addresses found. Click "Add New" to get started.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
                </DialogHeader>
                <AddressForm addressToEdit={editingAddress} onSave={handleSaveSuccess} />
            </DialogContent>
        </Dialog>
    );
}