// Define the API response types
export interface ApiBusinessImage {
    imageId?: string;
    objectName?: string;
    position?: number;
}

export interface PageProps {
    params: Promise<{
        publicId: string;
    }>;
}


export interface ApiBusiness {
    id?: string;
    publicId?: string;
    name?: string;
    description?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    Latitude?: number;
    Longitude?: number;
    isActive?: boolean;
    images?: ApiBusinessImage[];
    [key: string]: unknown;
}

export interface ApiBusinessResponse {
    business?: ApiBusiness;
}

export interface ApiService {
    id: string;
    name: string;
    description: string;
    price: number;
    durationMinutes: number;
    objectName?: string;
    [key: string]: unknown;
}

export interface ApiServiceResponse {
    service?: ApiService[];
}

