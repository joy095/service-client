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
    latitude: number;
    longitude: number;
    createdAt: string | null;
    updatedAt: string | null;
    isActive: boolean;
    ownerId: string | null;
    publicId: string;
    about: string | null;
    images: {
        businessId: string;
        imageId: string;
        createdAt: string;
        objectName: string;
        position: number;
    }[]
    isServiceBusiness: boolean;
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
    imageId: string;
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
    phone: string;
}

export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
}

export interface Image {
    id: string;
    url: string;
    alt: string;
    index: number;
};

export interface PricingPlan {
    id: string;
    name: string;
    price: number;
    description: string;
    features: string[];
    isPopular?: boolean;
}

export interface PaymentFormData {
    name: string;
    email: string;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
}

export type SlotStatus = "pending" | "confirmed" | "cancelled" | "refunded";

export interface SlotData {
    id: string
    service_id: string
    user_id: string
    open_time: string
    close_time: string
    created_at: string
    updated_at: string
    status: SlotStatus
}