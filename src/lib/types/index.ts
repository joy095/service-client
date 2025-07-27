export interface Business {
    id: string | null;
    name: string;
    category: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    imageId: string | null;
    Latitude: number;
    Longitude: number;
    createdAt: string | null;
    updatedAt: string | null;
    isActive: boolean;
    ownerId: string | null;
    publicId: string;
    images: {
        businessId: string;
        imageId: string;
        createdAt: string;
        objectName: string;
        position: number;
    }[] | null
};

export interface BusinessImage {
    imageId: string;
    businessId: string;
    createdAt: string;
    position: number;
    objectName: string;
}

export interface Service {
    id: string;
    businessId: string;
    name: string;
    description: string;
    duration: number;
    price: number;
    imageId: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    objectName: string;
};

export interface WorkingHour {
    id: string;
    businessId: string;
    dayOfWeek: string;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
    createdAt: string;
    updatedAt: string;
};

export interface Location {
    latitude: number;
    longitude: number;
}

export interface User {
    email: string;
    firstName: string;
    lastName: string;
}

export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
}

