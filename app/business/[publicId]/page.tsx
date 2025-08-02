// src/app/business/[publicId]/page.tsx (Server Component version)
import { fetchBusinessData } from './fetchBusinessData';
import BusinessPageClient from './client';
import { PageProps } from './types';

export default async function BusinessPage(props: PageProps) {
    const { business, services } = await fetchBusinessData(props);
    return <BusinessPageClient business={business} services={services} />;
}