// src/components/Gallery.tsx
'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import styles from '@/css/Gallery.module.css';

interface ImageType {
  id: string;
  url: string;
  alt: string;
  index: number;
}

interface GalleryProps {
  images: ImageType[];
}

export default function Gallery({ images }: GalleryProps) {
  const thumbnailsContainerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Function to change the current image and scroll the thumbnail into view
  const changeImage = (index: number) => {
    if (index < 0 || index >= images.length) return;

    setCurrentIndex(index);

    // Scroll the active thumbnail into view
    const thumbnail = thumbnailsContainerRef.current?.children[index] as HTMLElement | null;
    if (thumbnail) {
      thumbnail.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }
  };

  // Auto-scroll to the active thumbnail when the component mounts
  useEffect(() => {
    const thumbnail = thumbnailsContainerRef.current?.children[currentIndex] as HTMLElement | null;
    if (thumbnail) {
      thumbnail.scrollIntoView({ block: 'nearest' });
    }
  }, [currentIndex]);

  return (
    <div className={styles.galleryContainer}>
      {/* Main Image */}
      <div className={styles.mainImage}>
        <Image
          src={images[currentIndex]?.url || '/static/image-placeholder.svg'}
          alt={images[currentIndex]?.alt || 'Main Image'}
          width={690}
          height={450}
          quality={50}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Thumbnails (Scrollable, No Visible Scrollbar) */}
      <div ref={thumbnailsContainerRef} className={styles.thumbnails}>
        {images.map((image) => (
          <div
            key={image.id}
            className={`${styles.thumbnail} ${currentIndex === image.index ? styles.activeThumbnail : ''}`}
            onClick={() => changeImage(image.index)}
          >
            <Image
              src={image.url}
              alt={image.alt}
              width={80}
              height={80}
              quality={50}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}