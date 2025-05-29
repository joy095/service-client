// src/lib/types.ts

// Interface for successful API responses
export interface SubscriptionResponse {
    message: string;
}

// Interface for error API responses
export interface ErrorResponse {
    message: string;
}

// Define possible subscriber statuses
export type SubscriberStatus = 'pending' | 'confirmed' | 'unsubscribed';

// Interface for a subscriber record from the database (optional, but good practice)
export interface Subscriber {
    id: number;
    email: string;
    subscribed_at: Date;
    status: SubscriberStatus;
    confirmation_token: string | null; // Token can be null after confirmation
}


export interface SubscriptionRequestBody {
    email: string;
    name: string; // Make optional if it's not strictly required on the backend
    phone?: string; // Optional
    addressCity: string;
    addressState: string;
    message?: string; // Optional
}