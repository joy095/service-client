export interface Business {
    id: string;
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
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    ownerId: string;
    ObjectName: string | null;
    publicId: string;
};

export interface Service {
    id: string;
    businessId: string;
    name: string;
    description: string;
    durationMinutes: number;
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

