// src/app/business/[publicId]/client.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Gallery from '@/components/Gallery';
import styles from '@/css/BusinessPage.module.css';
import { ApiBusiness, ApiService } from './types';


interface ImageType {
  id: string;
  url: string;
  alt: string;
  index: number;
}

// Props interface
interface BusinessPageProps {
  business?: ApiBusiness;
  services?: ApiService[];
}


export default function BusinessPage({ business, services = [] }: BusinessPageProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Process images with proper null checks
  const images: ImageType[] = business?.images
    ?.filter((img) => img?.objectName)
    .map((img, index) => ({
      id: img.imageId?.toString() || Math.random().toString(36).substr(2, 9),
      url: img.objectName?.trim() || '',
      alt: `${business?.name || 'Business'} - Gallery image ${index + 1}`,
      index
    })) || [];

  const handleBookNow = (serviceId: string) => {
    if (business?.publicId) {
      router.push(`/booking/${business.publicId}?service=${serviceId}`);
    }
  };

  // Handle case where business is undefined
  if (!business) {
    return (
      <div className={styles.container}>
        <div className="text-center">
          <h1 className="text-2xl font-bold">Business not found</h1>
          <p>The requested business could not be loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className='container'>
      <div className="grid grid-cols-3">
        <div className="col-span-2">
          {images.length === 0 ? (
            <div className="flex justify-center">
              <Image
                src="https://archive.org/details/placeholder-image"
                alt="No images available"
                fill
                className="max-w-md rounded-3xl opacity-50"
                quality={70}
              />
            </div>
          ) : (
            <Gallery images={images} />
          )}
        </div>
      </div>

      {/* Services Section */}
      <section
        className={styles.servicesSection}
        style={{
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.8s cubic-bezier(0.215, 0.61, 0.355, 1)'
        }}
      >
        <h2 className={styles.sectionTitle}>Our Services</h2>
        <div className={styles.servicesGrid}>
          {services.map((service, index) => (
            <div
              key={service.id}
              className={styles.serviceCard}
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: `opacity 0.6s cubic-bezier(0.215, 0.61, 0.355, 1) ${index * 0.1}s, transform 0.6s cubic-bezier(0.215, 0.61, 0.355, 1) ${index * 0.1}s`
              }}
            >
              <div className={styles.serviceImageWrapper}>
                <div className="relative w-full h-60">
                  <Image
                    loading="lazy"
                    src={service.objectName || '/static/image-placeholder.svg'}
                    alt={service.name}
                    fill
                    className={styles.serviceImage}
                    quality={50}
                  />
                </div>
                <div className={styles.serviceOverlay}>
                  <button
                    onClick={() => handleBookNow(service.id)}
                    className={styles.ctaButton}
                  >
                    Book Now
                  </button>
                </div>
              </div>
              <div className={styles.serviceInfo}>
                <h3>{service.name}</h3>
                <p className={styles.description}>{service.description}</p>
                <div className={styles.meta}>
                  <span className={styles.price}>₹{service.price}</span>
                  <span className="duration">
                    {service.durationMinutes >= 60
                      ? `${Math.floor(service.durationMinutes / 60)}h ${service.durationMinutes % 60}m`
                      : `${service.durationMinutes}m`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Map */}
      {business.Latitude && business.Longitude && business.Longitude !== 0 && (
        <iframe
          src={`https://maps.google.com/maps?q=${business.Latitude},${business.Longitude}(${encodeURIComponent(business.name || 'Business')})&z=16&output=embed`}
          className={styles.mapContainer}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      )}
    </div>
  );
}