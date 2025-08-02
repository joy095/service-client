// src/app/page.tsx (or src/app/businesses/page.tsx)

import { Business } from '@/lib/types';
import PropertyCard from '@/components/PropertyCard';
import Image from 'next/image';

// Define the API response types
interface ApiBusinessImage {
  businessId: string;
  imageId: string;
  position: number;
  objectName: string;
  createdAt: string;
}

interface ApiBusiness {
  id: string;
  name: string;
  category: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  Latitude: number;
  Longitude: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  ownerId: string;
  publicId: string;
  images?: ApiBusinessImage[];
}

interface ApiResponse {
  businesses: ApiBusiness[];
}

// Server-side data fetching function
async function fetchBusinesses(): Promise<Business[]> {
  const API_URL = process.env.API_URL || 'http://localhost:3001';

  if (!API_URL) {
    console.error('API_URL environment variable is not set');
    return [];
  }

  try {
    const res = await fetch(`${API_URL}/business`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch businesses: ${res.status} ${res.statusText}`);
    }

    const data: ApiResponse = await res.json();

    // Transform the API response into the expected Business type
    const businesses: Business[] = data.businesses.map((business) => ({
      id: business.id,
      name: business.name,
      category: business.category,
      address: business.address,
      city: business.city,
      state: business.state,
      country: business.country,
      postalCode: business.postalCode,
      Latitude: business.Latitude,
      Longitude: business.Longitude,
      createdAt: business.createdAt,
      updatedAt: business.updatedAt,
      isActive: business.isActive,
      ownerId: business.ownerId,
      publicId: business.publicId,
      // Add imageId from the first image if available
      imageId: business.images?.[0]?.imageId || '',
      images: (business.images ?? []).map((img) => ({
        businessId: img.businessId,
        imageId: img.imageId,
        position: img.position,
        objectName: img.objectName,
        createdAt: img.createdAt,
      }))
    }));

    return businesses;
  } catch (error) {
    console.error('Error loading businesses:', error);
    return [];
  }
}

// Server Component - runs entirely on the server
export default async function BusinessesPage() {
  const businesses = await fetchBusinesses();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl mb-2 text-gray-800">Find your perfect stay</h1>
      <p className="text-gray-600 mb-8">Discover unique homes and experiences around the world</p>

      {businesses.length === 0 ? (
        <div className="text-center">
          <p className="mb-4">No businesses found</p>
          <Image
            src="/img/placeholder.webp"
            alt="No image available"
            className="h-48 w-full rounded-t object-cover mx-auto"
            width={500}
            height={200}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 my-8">
          {businesses.map((business) => (
            <PropertyCard key={business.publicId} business={business} />
          ))}
        </div>
      )}
    </div>
  );
}