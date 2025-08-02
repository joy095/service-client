// src/components/PropertyCard.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface BusinessImage {
    position: number;
    objectName: string;
}

interface Business {
    name: string;
    category: string;
    city: string;
    state: string;
    country: string;
    publicId: string;
    images: BusinessImage[];
}

interface PropertyCardProps {
    business: Business;
}

export default function PropertyCard({ business }: PropertyCardProps) {
    const [imageSrc, setImageSrc] = useState<string>(
        business?.images?.length > 0 && business.images[0]?.objectName
            ? business.images[0].objectName
            : '/static/image-placeholder.svg'
    );

    const handleImageError = () => {
        setImageSrc('/static/image-placeholder.svg');
    };

    return (
        <Link
            href={`/business/${business.publicId}`}
            className="block no-underline text-inherit rounded-xl overflow-hidden transition-transform duration-200 shadow-md hover:shadow-xl hover:-translate-y-1 bg-white"
        >
            <div className="w-full h-48">
                <Image
                    src={imageSrc}
                    alt={business.name}
                    width={400}
                    height={200}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                    loading='lazy'
                />
            </div>
            <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">{business.name}</h3>
                    <span className="font-bold text-red-500">{business.category}</span>
                </div>
                <p className="text-gray-600 text-sm mb-2">
                    {business.city}, {business.state}, {business.country}
                </p>
            </div>
        </Link>
    );
}