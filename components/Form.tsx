// src/components/Form.tsx
'use client';
import { AuthState } from '@/lib/types'; // Ensure this path is correct
import { ChevronLeft, LoaderCircle, X } from 'lucide-react';
import { useState, FormEvent } from 'react';
import { EyeSlashIcon, EyeIcon } from '@heroicons/react/24/outline';

interface ApiError {
    message?: string;
    // Add other potential error fields here if they exist in your API responses
}

interface UserStatusResponse {
    status: string;
    // Add other potential fields from the response if they exist
}

// --- Mock functions (Replace with your actual implementations) ---
// Mock auth login function - Replace with your actual auth logic (e.g., updating context or global state)
const authLogin = (user: AuthState) => {
    console.log('User logged in:', user);
    // Example: Call a function passed as a prop, or dispatch to a context
    // props.onLoginSuccess(user);
};

// Mock invalidateAll - Replace if you have a specific cache invalidation need
const invalidateAll = async () => {
    console.log('Invalidating all caches');
};
// --- End Mock functions ---

export default function Form({ initialIsOpen = true, onClose }: { initialIsOpen?: boolean; onClose?: () => void }) {
    // --- Manage `isOpen` state correctly with useState ---
    const [isFormOpen] = useState(initialIsOpen);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [deviceName, setDeviceName] = useState('Web Browser');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [step, setStep] = useState<
        'email' | 'register' | 'otp' | 'password' | 'forgot-email' | 'forgot-otp' | 'reset-password'
    >('email');
    const [userStatus, setUserStatus] = useState('');

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const API_URL = process.env.NEXT_PUBLIC_API_URL; // Ensure this is set in your .env.local

    const handleStepSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            if (step === 'email') {
                if (!API_URL) throw new Error('API URL is not configured');
                const res = await fetch(`${API_URL}/user-is-registered`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                });
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error((data as { message?: string })?.message || 'Something went wrong.');
                }
                const { status } = await res.json() as UserStatusResponse;
                setUserStatus(status);
                if (status === 'Pending') {
                    setStep('otp');
                } else if (status === 'Not Verified') {
                    const resendRes = await fetch(`${API_URL}/resend-otp`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email }),
                    });
                    if (!resendRes.ok) {
                        const data = await resendRes.json();
                        throw new Error((data as ApiError)?.message || 'Failed to resend OTP.');
                    }
                    setStep('otp');
                } else if (status === 'Verified') {
                    setStep('password');
                } else if (status === 'Not found') {
                    setStep('register');
                }
            } else if (step === 'register') {
                if (!API_URL) throw new Error('API URL is not configured');
                const res = await fetch(`${API_URL}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    // credentials: 'include', // Uncomment if your API uses cookies
                    body: JSON.stringify({
                        firstName,
                        lastName,
                        email,
                        password,
                        device: deviceName,
                    }),
                });
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error((data as ApiError)?.message || 'Registration failed.');
                }
                // Backend should set access/refresh token in HttpOnly cookie
                setStep('otp');
            } else if (step === 'otp') {
                if (!API_URL) throw new Error('API URL is not configured');
                const res = await fetch(`${API_URL}/verify-email`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, otp, device: deviceName }),
                });
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error((data as ApiError)?.message || 'Invalid OTP.');
                }
                // After successful OTP verification, you might want to clear the OTP field
                // setOtp('');
                setStep('password');
            } else if (step === 'password') {
                if (!API_URL) throw new Error('API URL is not configured');
                const res = await fetch(`${API_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                    // credentials: 'include', // Uncomment if your API uses cookies
                });
                const raw = await res.text();
                if (!res.ok) {
                    // Try to parse error message from response
                    let errorMessage = 'Login failed.';
                    try {
                        const errorData = JSON.parse(raw);
                        errorMessage = (errorData as ApiError)?.message || errorMessage;
                    } catch (e) {
                        console.error(e)
                        // If parsing fails, use the raw text or default message
                        errorMessage = raw || errorMessage;
                    }
                    throw new Error(errorMessage);
                }
                let data;
                try {
                    data = JSON.parse(raw);
                } catch {
                    throw new Error('Invalid response format from server.');
                }
                authLogin(data.user);
                // Close the form upon successful login
                handleClose(); // Use the new handleClose function
                await invalidateAll();
            } else if (step === 'forgot-email') {
                if (!API_URL) throw new Error('API URL is not configured');
                const res = await fetch(`${API_URL}/forgot-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                });
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error((data as ApiError)?.message || 'Failed to send OTP.');
                }
                setStep('forgot-otp');
            } else if (step === 'forgot-otp') {
                if (!API_URL) throw new Error('API URL is not configured');
                const res = await fetch(`${API_URL}/forgot-password-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email,
                        otp,
                        newPassword: password, // Assuming newPassword is expected here
                    }),
                });
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error((data as ApiError)?.message || 'Failed to reset password.');
                }
                // After successful reset, clear fields and go to login
                setOtp('');
                setPassword('');
                setStep('password');
            } else if (step === 'reset-password') {
                // This step logic seems similar to 'forgot-otp'. Adjust if needed based on your API.
                // Assuming it's for setting a new password after OTP verification in 'forgot-otp'
                // If it's a separate flow, you'll need the specific API endpoint and logic.
                if (!API_URL) throw new Error('API URL is not configured');
                // Example logic (replace with your actual endpoint)
                const res = await fetch(`${API_URL}/reset-password`, { // Replace with correct endpoint
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }), // Or include OTP if required
                });
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error((data as ApiError)?.message || 'Failed to reset password.');
                }
                // After successful reset, clear fields and go to login
                setPassword('');
                setStep('password');
            }
        } catch (err: unknown) {
            // Type guard to check if err is an Error instance
            if (err instanceof Error) {
                setError(err.message || 'Something went wrong.');
                console.error("Form submission error:", err);
            } else {
                // Handle non-Error objects (though this is rare)
                setError('Something went wrong.');
                console.error("Form submission error:", err);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const goBack = () => {
        if (step === 'register') {
            setStep('email');
            setFirstName('');
            setLastName('');
            setPassword('');
        } else if (step === 'otp') {
            setStep(userStatus === 'Not found' ? 'register' : 'email');
            setOtp('');
        } else if (step === 'password') {
            setStep(userStatus === 'Pending' || userStatus === 'Not Verified' ? 'otp' : 'email');
            setPassword('');
        } else if (step === 'forgot-otp') {
            setStep('forgot-email');
            setOtp('');
        } else if (step === 'reset-password') {
            // Adjust based on your flow. If reset-password comes after forgot-otp, maybe go back to forgot-otp or email.
            setStep('forgot-email'); // Example
            setPassword('');
        }
        setError('');
    };

    // Function to handle closing the form
    const handleClose = () => {
        // If a parent component passed an onClose handler, call it
        if (onClose) {
            onClose();
        }
    };

    // Conditional rendering based on the component's own state
    if (!isFormOpen) {
        return null;
    }

    return (
        <>
            <div
                className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs"
                // transition:fade={{ duration: 200 }} - CSS transition or animation library needed for exact effect
                onClick={handleClose} // Use handleClose here too
            >
                <div
                    className="relative mx-4 w-full max-w-md rounded-2xl bg-white p-8"
                    onClick={(e) => e.stopPropagation()} // Equivalent to on:click|stopPropagation
                >
                    <button
                        // transition:fade={{ duration: 200 }}
                        onClick={handleClose} // Use handleClose
                        className="absolute top-4 right-4 cursor-pointer rounded-full p-1 text-gray-500 hover:bg-gray-200/30"
                        aria-label="Close" // Add aria-label for accessibility
                    >
                        <X className="h-6 w-6" /> {/* Use className for Lucide icons */}
                    </button>
                    <div className="mb-6 text-center">
                        <h2 className="text-2xl font-bold text-gray-800">Welcome</h2>
                    </div>
                    <form method="POST" onSubmit={handleStepSubmit}>
                        {step === 'email' && (
                            <div className="mb-6">
                                <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded-lg border px-4 py-2 focus:ring-1 focus:outline-none focus:ring-pink-500 focus:border-pink-500" // Added focus styles
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                        )}
                        {(step === 'otp' || step === 'forgot-otp') && (
                            <div className="mb-6">
                                <label htmlFor="otp" className="mb-1 block text-sm font-medium text-gray-700">
                                    OTP
                                </label>
                                <input
                                    type="text"
                                    id="otp"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full rounded-lg border px-4 py-2 focus:ring-1 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                                    placeholder={step === 'forgot-otp' ? "Enter OTP sent to your email" : "Enter the OTP sent to your email"}
                                    required
                                />
                            </div>
                        )}
                        {step === 'otp' && (
                            <div className="mb-6">
                                <label htmlFor="deviceName" className="mb-1 block text-sm font-medium text-gray-700">
                                    Device Name (Optional)
                                </label>
                                <input
                                    type="text"
                                    id="deviceName"
                                    value={deviceName}
                                    onChange={(e) => setDeviceName(e.target.value)}
                                    className="w-full rounded-lg border px-4 py-2 focus:ring-1 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                                    placeholder="e.g., My Laptop"
                                />
                            </div>
                        )}
                        {(step === 'password' || step === 'forgot-otp' || step === 'reset-password') && (
                            <div className="mb-6">
                                <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
                                    {step === 'password' ? 'Password' : 'New Password'}
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full rounded-lg border px-4 py-2 focus:ring-1 focus:outline-none focus:ring-pink-500 focus:border-pink-500 pr-10" // Added padding for icon
                                        placeholder={step === 'password' ? "Enter your password" : "Enter new password"}
                                        required={step !== 'password'} // Required for reset/forgot steps
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="absolute top-2 right-2 cursor-pointer text-gray-500 hover:text-gray-700 focus:outline-none"
                                        aria-label={showPassword ? "Hide password" : "Show password"} // Accessibility
                                    >
                                        {showPassword ? (
                                            <EyeIcon className="h-5 w-5" />
                                        ) : (
                                            <EyeSlashIcon className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                {step === 'password' && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setStep('forgot-email');
                                            setError('');
                                            setOtp(''); // Clear OTP when switching to forgot flow
                                        }}
                                        className="mt-2 cursor-pointer text-sm font-medium text-pink-600 hover:underline" // Styled link
                                    >
                                        Forgot password?
                                    </button>
                                )}
                            </div>
                        )}
                        {step === 'forgot-email' && (
                            <>
                                <div className="mb-6">
                                    <label htmlFor="forgot-email" className="mb-1 block text-sm font-medium text-gray-700">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="forgot-email" // Unique ID
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full rounded-lg border px-4 py-2 focus:ring-1 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                                        placeholder="Enter your email to receive OTP"
                                        required
                                    />
                                </div>
                                <p className="text-sm text-gray-600 mb-4"> {/* Info text */}
                                    An OTP will be sent to your email address.
                                </p>
                            </>
                        )}
                        {step === 'register' && (
                            <>
                                <div className="mb-4"> {/* Adjusted margin */}
                                    <label htmlFor="reg-email" className="mb-1 block text-sm font-medium text-gray-700"> {/* Unique ID */}
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="reg-email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full rounded-lg border px-4 py-2 focus:ring-1 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                                        First Name
                                    </label>
                                    <input
                                        id="firstName"
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full rounded-lg border px-4 py-2 focus:ring-1 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                                        Last Name
                                    </label>
                                    <input
                                        id="lastName"
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="w-full rounded-lg border px-4 py-2 focus:ring-1 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                                        required
                                    />
                                </div>
                                <div className="mb-6"> {/* Adjusted margin */}
                                    <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700"> {/* Unique ID */}
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="reg-password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full rounded-lg border px-4 py-2 focus:ring-1 focus:outline-none focus:ring-pink-500 focus:border-pink-500 pr-10"
                                            placeholder="Create a password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={togglePasswordVisibility}
                                            className="absolute top-2 right-2 cursor-pointer text-gray-500 hover:text-gray-700 focus:outline-none"
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? (
                                                <EyeIcon className="h-5 w-5" />
                                            ) : (
                                                <EyeSlashIcon className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1"> {/* Password hint */}
                                        Use 8 or more characters with a mix of letters, numbers & symbols.
                                    </p>
                                </div>
                            </>
                        )}
                        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
                        <button
                            type="submit"
                            className={`w-full rounded-lg bg-pink-600 py-2 text-white transition duration-200 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 ${isLoading ? 'cursor-not-allowed opacity-50' : ''
                                }`}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <LoaderCircle className='mr-2 inline-block h-5 w-5 animate-spin' />
                                    Loading...
                                </>
                            ) : step === 'forgot-email' ? (
                                'Request OTP'
                            ) : step === 'forgot-otp' ? (
                                'Verify OTP & Set Password'
                            ) : step === 'reset-password' ? (
                                'Reset Password' // Adjust text if needed
                            ) : step === 'register' ? (
                                'Sign Up'
                            ) : (
                                'Sign In'
                            )}
                        </button>
                        {step !== 'email' && (
                            <button
                                type="button"
                                onClick={goBack}
                                className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2" // Improved button style
                                disabled={isLoading}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Back
                            </button>
                        )}
                    </form>
                </div>
            </div>
            {/* Inline styles - using Tailwind, so this section is not needed */}
            {/* If you had specific styles not covered by Tailwind, you could add them here with <style jsx> */}
        </>
    );
}