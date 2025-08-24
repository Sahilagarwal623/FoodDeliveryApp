'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCartStore } from '@/store/cart-store';

// Define the type for a menu item
type MenuItem = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  category: string | null;
  isAvailable: boolean;
};

// Define the structure of the API response
type MenuApiResponse = {
  restaurant: {
    name: string;
  };
  menu: MenuItem[];
};

export default function MenuPage() {
  const router = useRouter();
  const params = useParams();
  const { restaurantId } = params;
  const { addItem } = useCartStore();
  const [menu, setMenu] = useState<Record<string, MenuItem[]>>({});
  const [restaurantName, setRestaurantName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!restaurantId) return;

    const fetchMenuData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/restaurants/${restaurantId}/menu-items`);
        if (!response.ok) {
          throw new Error('Restaurant not found.');
        }
        const data: MenuApiResponse = await response.json();

        // Group menu items by category
        const grouped = data.menu.reduce((acc, item) => {
          const category = item.category || 'Other';
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(item);
          return acc;
        }, {} as Record<string, MenuItem[]>);

        setRestaurantName(data.restaurant.name);
        setMenu(grouped);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuData();
  }, [restaurantId]);

  if (isLoading) {
    return <MenuSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600">Error</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Button variant="ghost" onClick={() => router.push('/restaurants')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Restaurants
      </Button>

      <h1 className="text-4xl font-bold mb-2">{restaurantName}</h1>
      <p className="text-lg text-muted-foreground mb-8">Browse the menu and add items to your cart.</p>

      {Object.keys(menu).length === 0 ? (
        <p>This restaurant has no menu items available at the moment.</p>
      ) : (
        <div className="space-y-8">
          {Object.entries(menu).map(([category, items]) => (
            <section key={category}>
              <h2 className="text-2xl font-semibold mb-4 border-b pb-2">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                  <Card key={item.id} className="flex flex-col">
                    <CardHeader>
                      <img
                        src={item.imageUrl || 'https://via.placeholder.com/300'}
                        alt={item.name}
                        className="w-full h-40 object-cover rounded-md mb-4"
                      />
                      <CardTitle>{item.name}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-xl font-bold">₹{item.price.toFixed(2)}</p>
                    </CardContent>
                    <CardFooter>
                      <Button onClick={() => addItem(item)} className="w-full" disabled={!item.isAvailable}>
                        {item.isAvailable ? (
                          <>
                            <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                          </>
                        ) : (
                          'Currently Unavailable'
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

// A simple skeleton component to show while data is loading
function MenuSkeleton() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <Skeleton className="h-8 w-48 mb-4" />
      <Skeleton className="h-12 w-96 mb-8" />
      <div className="space-y-8">
        {[...Array(2)].map((_, i) => (
          <div key={i}>
            <Skeleton className="h-10 w-1/4 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, j) => (
                <Card key={j}>
                  <Skeleton className="h-40 w-full rounded-t-md" />
                  <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                  <CardContent><Skeleton className="h-5 w-1/4" /></CardContent>
                  <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}