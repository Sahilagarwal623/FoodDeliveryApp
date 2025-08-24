'use client';

import React, { useState, useEffect } from 'react';
import { Search, Star, Clock, Tags } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

// Define the structure for a restaurant object
type Restaurant = {
  id: number;
  restaurantName: string;
  imageUrl: string;
  cuisine: string[];
  rating: number;
  deliveryTime: number; // in minutes
  priceRange: '₹' | '₹₹' | '₹₹₹';
};

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Effect to load initial data
  useEffect(() => {
    // Simulate API call

    const fetchRestaurants = async () => {
      try {
        const response = await fetch("/api/restaurants"); // adjust API URL
        if (!response.ok) {
          throw new Error("Failed to fetch restaurants");
        }
        const data = await response.json();

        setTimeout(() => {
          setRestaurants(data);
          setFilteredRestaurants(data);
          setIsLoading(false);
        }, 1000);

        setRestaurants(data);
        setFilteredRestaurants(data);
      } catch (err) {
        console.error("Error fetching restaurants:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurants();

  }, []);

  // Effect to filter restaurants based on search term
  useEffect(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    const results = restaurants.filter(restaurant =>
      restaurant.restaurantName.toLowerCase().includes(lowercasedTerm) 
      
    );
    setFilteredRestaurants(results);
  }, [searchTerm, restaurants]);

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Search and Filter Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Find Your Next Meal</h1>
        <p className="text-muted-foreground mb-4">Discover the best food from restaurants near you.</p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search restaurants or cuisines..."
            className="w-full pl-10 pr-4 py-2 text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Restaurant Listing Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">All Restaurants</h2>
        {isLoading ? (
          <p className="text-center text-muted-foreground">Loading restaurants...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRestaurants.length > 0 ? (
              filteredRestaurants.map((restaurant) => (
                <Card key={restaurant.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="relative">
                    <img
                      src={restaurant.imageUrl}
                      alt={restaurant.restaurantName}
                      className="w-full h-48 object-cover"
                    />
                    <Badge className="absolute top-2 right-2">{restaurant.priceRange}</Badge>
                  </div>
                  <CardHeader>
                    <CardTitle>{restaurant.restaurantName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-muted-foreground text-sm gap-2 mb-2">
                      <Tags className="w-4 h-4" />
                      <span>{restaurant.cuisine?.join(', ')}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground text-sm gap-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span>{restaurant.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{restaurant.deliveryTime} min</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/restaurants/${restaurant.id}/menu-items`} >
                      <Button className="w-full cursor-pointer">
                        View Menu
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <h3 className="text-xl font-semibold">No Restaurants Found</h3>
                <p className="text-muted-foreground">Try adjusting your search term.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}