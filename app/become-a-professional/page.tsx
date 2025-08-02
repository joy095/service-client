'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Assuming App Router

// Define TypeScript interfaces
interface FormData {
    name: string;
    category: string;
    latitude: string;
    longitude: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    road: string;
    house_number: string;
}

interface Errors {
    name: string;
    category: string;
    location: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    address: string;
}

interface ReceivedLocationDetails {
    latitude: number;
    longitude: number;
    address?: string;
    road?: string;
    house_number?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
}

// Placeholder MapPicker Component (Needs actual implementation)
const MapPicker = ({
    // initialLat,
    // initialLng,
    error,
    onLocationSelected,
    onLocationError,
}: {
    initialLat?: number;
    initialLng?: number;
    error?: string | null;
    onLocationSelected: (details: ReceivedLocationDetails) => void;
    onLocationError: (message: string) => void;
}) => {
    // This is a placeholder. You would integrate a real map library here.
    // Example using a simple button to simulate selection:
    const handleSimulateLocation = () => {
        // Simulate successful location selection
        onLocationSelected({
            latitude: 40.7128,
            longitude: -74.0060,
            address: 'Simulated Address, New York, NY',
            city: 'New York',
            state: 'NY',
            country: 'USA',
            postalCode: '10001',
            road: 'Simulated Road',
            house_number: '123',
        });
    };

    const handleSimulateError = () => {
        // Simulate an error
        onLocationError('Simulated map error. Please try again.');
    };

    return (
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 h-96 flex flex-col items-center justify-center">
            <p className="mb-4 text-gray-700">Map Picker Placeholder</p>
            <div className="flex space-x-4">
                <button
                    type="button"
                    onClick={handleSimulateLocation}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                >
                    Simulate Location Select
                </button>
                <button
                    type="button"
                    onClick={handleSimulateError}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                    Simulate Map Error
                </button>
            </div>
            {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
            <p className="mt-4 text-xs text-gray-500">Integrate your map library here (e.g., react-leaflet, Google Maps).</p>
        </div>
    );
};

const CreateServicePage = () => {
    const router = useRouter();

    // --- State ---
    const [formData, setFormData] = useState<FormData>({
        name: '',
        category: '',
        latitude: '',
        longitude: '',
        address: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
        road: '',
        house_number: '',
    });

    const [errors, setErrors] = useState<Errors>({
        name: '',
        category: '',
        location: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
        address: '',
    });

    const [currentStep, setCurrentStep] = useState<number>(1);
    const [mapError, setMapError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [formFeedback, setFormFeedback] = useState<{ success?: boolean; message?: string; error?: string } | null>(null); // For displaying server messages

    // --- Constants ---
    const categories = [
        'Barbershops',
        'Hair Salons',
        'Spa Salons',
        'Nail Salons',
        'Salons',
        'Make up artist',
    ];

    // --- Validation Logic ---
    const validateStep = (step: number): boolean => {
        let isValid = true;
        const newErrors: Errors = {
            name: '',
            category: '',
            location: '',
            city: '',
            state: '',
            country: '',
            postalCode: '',
            address: '',
        };

        if (step === 1) {
            if (!formData.name.trim()) {
                newErrors.name = 'Business name is required.';
                isValid = false;
            }
            if (!formData.category) {
                newErrors.category = 'Please select a category.';
                isValid = false;
            }
        } else if (step === 2) {
            if (!formData.latitude || !formData.longitude) {
                newErrors.location = 'Please select a location on the map to set coordinates.';
                isValid = false;
            }
            if (!formData.address.trim()) {
                newErrors.address = 'Detailed address information is required.';
                isValid = false;
            }
        } else if (step === 3) {
            // Re-validate key fields for step 3 submission
            if (!formData.name.trim()) {
                newErrors.name = 'Business name is required.';
                isValid = false;
            }
            if (!formData.category) {
                newErrors.category = 'Please select a category.';
                isValid = false;
            }
            if (!formData.latitude || !formData.longitude) {
                newErrors.location = 'Location coordinates are required.';
                isValid = false;
            }
            if (!formData.address.trim()) {
                newErrors.address = 'Address is required.';
                isValid = false;
            }
            if (!formData.city.trim()) {
                newErrors.city = 'City is required.';
                isValid = false;
            }
            if (!formData.state.trim()) {
                newErrors.state = 'State is required.';
                isValid = false;
            }
            if (!formData.country.trim()) {
                newErrors.country = 'Country is required.';
                isValid = false;
            }
            if (!formData.postalCode.trim()) {
                newErrors.postalCode = 'Postal code is required.';
                isValid = false;
            }
        }

        setErrors(newErrors);
        return isValid;
    };

    // --- Navigation Logic ---
    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep((prev) => prev + 1);
            setMapError(null);
        }
    };

    const prevStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1)); // Ensure step doesn't go below 1
        // Clear errors and map error when going back
        setErrors({
            name: '',
            category: '',
            location: '',
            city: '',
            state: '',
            country: '',
            postalCode: '',
            address: '',
        });
        setMapError(null);
    };

    // --- Map Interaction Handlers ---
    const handleLocationSelected = (details: ReceivedLocationDetails) => {
        setFormData((prev) => ({
            ...prev,
            latitude: details.latitude.toString(),
            longitude: details.longitude.toString(),
            address: details.address || 'Not provided',
            road: details.road || '',
            house_number: details.house_number || '',
            city: details.city || 'Not provided',
            state: details.state || 'Not provided',
            country: details.country || 'Not provided',
            postalCode: details.postalCode || 'Not provided',
        }));
        // Clear location-specific errors
        setErrors((prev) => ({ ...prev, location: '', city: '', state: '', country: '', postalCode: '' }));
        setMapError(null);
    };

    const handleLocationError = (errorMessage: string) => {
        setMapError(errorMessage);
        setErrors((prev) => ({ ...prev, location: errorMessage }));
    };

    // --- Form Submission ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormFeedback(null); // Clear previous feedback

        // Final validation before submission
        if (!validateStep(3)) {
            setIsSubmitting(false);
            return; // Stop submission if validation fails
        }

        try {
            // --- REPLACE THIS WITH YOUR ACTUAL API CALL ---
            // Example using fetch:
            /*
            const response = await fetch('/api/create-service', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(formData),
            });
      
            const result = await response.json();
      
            if (response.ok) {
              setFormFeedback({ success: true, message: result.message || 'Service created successfully!' });
              // Optional: Reset form
              // setFormData({ ... }); // Reset to initial state if needed
               setTimeout(() => {
                  router.push('/upload-images'); // Redirect on success
               }, 1000); // Optional delay
            } else {
              setFormFeedback({ success: false, error: result.error || 'Failed to create service.' });
            }
            */

            // --- SIMULATION ---
            console.log("Submitting form data:", formData);
            // Simulate a successful response
            setTimeout(() => {
                setFormFeedback({ success: true, message: 'Service created successfully!' });
                setIsSubmitting(false);
                // Simulate redirect after a short delay
                setTimeout(() => {
                    router.push('/upload-images');
                }, 1500);
            }, 1000);

        } catch (err) {
            console.error("Submission error:", err);
            setFormFeedback({ success: false, error: 'An unexpected error occurred. Please try again.' });
            setIsSubmitting(false);
        }
    };

    // --- Form Input Handler ---
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Clear error for the field being edited
        if (errors[name as keyof Errors]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    // --- Render Step Content ---
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="transition-all duration-300 ease-in-out transform"> {/* Add transition classes if needed */}
                        <h2 className="mb-6 text-xl font-semibold text-gray-900">Basic Information</h2>
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="business-name" className="mb-2 block text-sm font-medium text-gray-700">
                                    Business Name
                                </label>
                                <input
                                    id="business-name"
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter your business name"
                                    className={`w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-all duration-300 focus:ring-2 focus:outline-none ${errors.name ? 'border-red-500 focus:ring-coral-200 focus:border-coral-500' : 'focus:ring-coral-200 focus:border-coral-500'
                                        }`}
                                    required
                                />
                                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                            </div>
                            <div>
                                <label htmlFor="category-select" className="mb-2 block text-sm font-medium text-gray-700">
                                    Category
                                </label>
                                <select
                                    id="category-select"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className={`w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-all duration-300 focus:ring-2 focus:outline-none ${errors.category ? 'border-red-500 focus:ring-coral-200 focus:border-coral-500' : 'focus:ring-coral-200 focus:border-coral-500'
                                        }`}
                                    required
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                                {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="transition-all duration-300 ease-in-out transform"> {/* Add transition classes if needed */}
                        <h2 className="mb-6 text-xl font-semibold text-gray-900">Set Your Location</h2>
                        <MapPicker
                            initialLat={formData.latitude ? parseFloat(formData.latitude) : undefined}
                            initialLng={formData.longitude ? parseFloat(formData.longitude) : undefined}
                            error={errors.location || mapError}
                            onLocationSelected={handleLocationSelected}
                            onLocationError={handleLocationError}
                        />
                        {(errors.location || mapError) && (
                            <p className="mt-2 text-center text-xs text-red-500">{errors.location || mapError}</p>
                        )}
                    </div>
                );
            case 3:
                return (
                    <div className="transition-all duration-300 ease-in-out transform"> {/* Add transition classes if needed */}
                        <h2 className="mb-6 text-xl font-semibold text-gray-900">Review Your Information</h2>
                        {(errors.city || errors.state || errors.country || errors.postalCode) && (
                            <div className="mb-6 rounded-lg bg-yellow-50 p-4 text-yellow-700">
                                <p className="font-medium">Please complete the following required fields:</p>
                                <ul className="mt-2 list-disc pl-5 text-sm">
                                    {errors.city && <li>{errors.city}</li>}
                                    {errors.state && <li>{errors.state}</li>}
                                    {errors.country && <li>{errors.country}</li>}
                                    {errors.postalCode && <li>{errors.postalCode}</li>}
                                </ul>
                            </div>
                        )}
                        <div className="space-y-6">
                            <div className="rounded-lg bg-gray-50 p-6">
                                <h3 className="mb-4 text-base font-semibold text-gray-900">Basic Information</h3>
                                <div className="grid grid-cols-1 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium">Business Name:</span> {formData.name || 'N/A'}
                                    </div>
                                    <div>
                                        <span className="font-medium">Category:</span> {formData.category || 'N/A'}
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-lg bg-gray-50 p-6">
                                <h3 className="mb-4 text-base font-semibold text-gray-900">Location Details</h3>
                                <div className="space-y-4">
                                    <div>
                                        <span className="font-medium">Location Set:</span>{' '}
                                        {formData.latitude && formData.longitude ? 'Yes' : 'No'}
                                    </div>

                                    {/* Hidden Inputs for Submission (React handles state, but these ensure data is sent) */}
                                    <input type="hidden" name="name" value={formData.name} />
                                    <input type="hidden" name="category" value={formData.category} />
                                    <input type="hidden" name="latitude" value={formData.latitude} />
                                    <input type="hidden" name="longitude" value={formData.longitude} />
                                    <input type="hidden" name="address" value={formData.address} />
                                    <input type="hidden" name="road" value={formData.road} />
                                    <input type="hidden" name="house_number" value={formData.house_number} />
                                    <input type="hidden" name="city" value={formData.city} />
                                    <input type="hidden" name="state" value={formData.state} />
                                    <input type="hidden" name="country" value={formData.country} />
                                    <input type="hidden" name="postalCode" value={formData.postalCode} />

                                    <div>
                                        <label htmlFor="address" className="mb-2 block text-sm font-medium text-gray-700">
                                            Full Address
                                        </label>
                                        <input
                                            id="address"
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            placeholder="Enter full address"
                                            className={`w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-all duration-300 focus:ring-2 focus:outline-none ${errors.address ? 'border-red-500 focus:ring-coral-200 focus:border-coral-500' : 'focus:ring-coral-200 focus:border-coral-500'
                                                }`}
                                        />
                                        {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="road" className="mb-2 block text-sm font-medium text-gray-700">
                                            Road
                                        </label>
                                        <input
                                            id="road"
                                            type="text"
                                            name="road"
                                            value={formData.road}
                                            onChange={handleInputChange}
                                            placeholder="Enter road name"
                                            className="focus:border-coral-500 focus:ring-coral-200 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-all duration-300 focus:ring-2 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="city" className="mb-2 block text-sm font-medium text-gray-700">
                                            City
                                        </label>
                                        <input
                                            id="city"
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            placeholder="Enter city"
                                            className={`w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-all duration-300 focus:ring-2 focus:outline-none ${errors.city ? 'border-red-500 focus:ring-coral-200 focus:border-coral-500' : 'focus:ring-coral-200 focus:border-coral-500'
                                                }`}
                                        />
                                        {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="state" className="mb-2 block text-sm font-medium text-gray-700">
                                            State
                                        </label>
                                        <input
                                            id="state"
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            placeholder="Enter state"
                                            className={`w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-all duration-300 focus:ring-2 focus:outline-none ${errors.state ? 'border-red-500 focus:ring-coral-200 focus:border-coral-500' : 'focus:ring-coral-200 focus:border-coral-500'
                                                }`}
                                        />
                                        {errors.state && <p className="mt-1 text-xs text-red-500">{errors.state}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="country" className="mb-2 block text-sm font-medium text-gray-700">
                                            Country
                                        </label>
                                        <input
                                            id="country"
                                            type="text"
                                            name="country"
                                            value={formData.country}
                                            onChange={handleInputChange}
                                            placeholder="Enter country"
                                            className={`w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-all duration-300 focus:ring-2 focus:outline-none ${errors.country ? 'border-red-500 focus:ring-coral-200 focus:border-coral-500' : 'focus:ring-coral-200 focus:border-coral-500'
                                                }`}
                                        />
                                        {errors.country && <p className="mt-1 text-xs text-red-500">{errors.country}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="postalCode" className="mb-2 block text-sm font-medium text-gray-700">
                                            Postal Code
                                        </label>
                                        <input
                                            id="postalCode"
                                            type="text"
                                            name="postalCode"
                                            value={formData.postalCode}
                                            onChange={handleInputChange}
                                            placeholder="Enter postal code"
                                            className={`w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-all duration-300 focus:ring-2 focus:outline-none ${errors.postalCode ? 'border-red-500 focus:ring-coral-200 focus:border-coral-500' : 'focus:ring-coral-200 focus:border-coral-500'
                                                }`}
                                        />
                                        {errors.postalCode && <p className="mt-1 text-xs text-red-500">{errors.postalCode}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-12">
            <div className="mx-auto max-w-3xl">
                <div className="mb-10 text-center">
                    <h1 className="mb-3 text-3xl font-bold text-gray-900 md:text-4xl">Create Your Service</h1>
                    <p className="text-base text-gray-600">Set up your business profile in a few simple steps</p>
                </div>
                <div className="mb-10 flex items-center justify-center">
                    <div className="flex items-center space-x-6">
                        {[1, 2, 3].map((step) => (
                            <div key={step} className="flex flex-col items-center">
                                <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-full text-base font-semibold text-white transition-all duration-300 ${currentStep >= step ? 'bg-coral-500 shadow-md scale-110' : 'bg-gray-300'
                                        }`}
                                >
                                    {step}
                                </div>
                                <span
                                    className={`mt-2 text-xs font-medium ${currentStep >= step ? 'text-gray-900' : 'text-gray-500'
                                        }`}
                                >
                                    {step === 1 ? 'Basic Info' : step === 2 ? 'Location' : 'Review'}
                                </span>
                                {step < 3 && (
                                    <div
                                        className={`absolute top-5 left-1/2 w-12 h-1 rounded-full -translate-y-1/2 ${currentStep > step ? 'bg-coral-500' : 'bg-gray-200'
                                            }`}
                                        style={{ marginLeft: '1.5rem' }} // Adjust spacing
                                    ></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="rounded-2xl bg-white p-8 shadow-lg">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Render the content for the current step */}
                        {renderStepContent()}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between pt-6">
                            <button
                                type="button"
                                onClick={prevStep}
                                disabled={currentStep === 1}
                                className={`rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 transition-all duration-300 hover:bg-gray-100 ${currentStep === 1 ? 'invisible' : ''
                                    }`}
                            >
                                Previous
                            </button>

                            {currentStep < 3 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="bg-coral-500 hover:bg-coral-600 focus:ring-coral-200 rounded-lg px-6 py-2.5 text-sm font-medium text-white transition-all duration-300 focus:ring-2 focus:outline-none"
                                >
                                    Next
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={
                                        isSubmitting ||
                                        !!errors.name ||
                                        !!errors.category ||
                                        !!errors.location ||
                                        !!errors.city ||
                                        !!errors.state ||
                                        !!errors.country ||
                                        !!errors.postalCode ||
                                        !!errors.address
                                    }
                                    className="bg-coral-500 hover:bg-coral-600 focus:ring-coral-200 flex items-center justify-center rounded-lg px-6 py-2.5 text-sm font-medium text-white transition-all duration-300 focus:ring-2 focus:outline-none disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg
                                                className="mr-2 h-5 w-5 animate-spin text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            Submitting...
                                        </>
                                    ) : (
                                        'Submit'
                                    )}
                                </button>
                            )}
                        </div>
                    </form>

                    {/* Feedback Messages */}
                    {formFeedback?.success && (
                        <div className="mt-4 flex items-center rounded-lg bg-green-50 p-4 text-green-700 animate-fadeIn">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="mr-2 h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            {formFeedback.message || 'Service created successfully!'}
                        </div>
                    )}
                    {formFeedback?.error && (
                        <div className="mt-4 flex items-center rounded-lg bg-red-50 p-4 text-red-700 animate-fadeIn">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="mr-2 h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            {formFeedback.error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateServicePage;