// src/components/Form.tsx
'use client';

import { Backpack, Cross, Eye, EyeClosed, Loader } from 'lucide-react';
import { useState, FormEvent, useEffect } from 'react';

// Mock store implementation - Replace with your actual state management (e.g., Context API, Zustand)
let isFormOpenState = true; // Initially assume it's open based on the Svelte logic
const setIsFormOpen = (open: boolean) => {
    isFormOpenState = open;
    // Trigger a re-render if needed, or use a proper state management solution
    console.log(`Form is now ${open ? 'open' : 'closed'}`);
};

// Mock auth login function - Replace with your actual auth logic
const authLogin = (user: any) => {
    console.log('User logged in:', user);
    // Update your auth state/context here
};

// Mock invalidateAll - Replace if you have a specific cache invalidation need
const invalidateAll = async () => {
    console.log('Invalidating all caches');
};

export default function Form() {
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
                    throw new Error(data.message || 'Something went wrong.');
                }

                const { status } = await res.json();
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
                        throw new Error(data.message || 'Failed to resend OTP.');
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
                    throw new Error(data.message || 'Registration failed.');
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
                    throw new Error(data.message || 'Invalid OTP.');
                }
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
                if (!res.ok) throw new Error('Login failed.');

                let data;
                try {
                    data = JSON.parse(raw);
                } catch {
                    throw new Error('Invalid response format');
                }

                authLogin(data.user);
                setIsFormOpen(false);
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
                    throw new Error(data.message || 'Failed to send OTP.');
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
                        newPassword: password,
                    }),
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.message || 'Failed to reset password.');
                }
                setStep('password'); // User can now log in
            } else if (step === 'reset-password') {
                if (!API_URL) throw new Error('API URL is not configured');
                const res = await fetch(`${API_URL}/reset-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.message || 'Failed to reset password.');
                }
                setStep('password');
            }
        } catch (err: any) {
            setError(err.message || 'Something went wrong.');
            console.error("Form submission error:", err); // Log for debugging
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
            setStep('forgot-otp');
            setPassword('');
        }
        setError('');
    };

    // Conditional rendering based on isFormOpen state
    // In a real app, this would likely be controlled by a parent component or global state
    if (!isFormOpenState) {
        return null;
    }

    return (
        <>
            <div
                className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs"
                // transition:fade={{ duration: 200 }} - CSS transition or animation library needed for exact effect
                onClick={() => setIsFormOpen(false)}
            >
                <div
                    className="relative mx-4 w-full max-w-md rounded-2xl bg-white p-8"
                    onClick={(e) => e.stopPropagation()} // Equivalent to on:click|stopPropagation
                >
                    <button
                        // transition:fade={{ duration: 200 }}
                        onClick={() => setIsFormOpen(false)}
                        className="absolute top-4 right-4 cursor-pointer rounded-full p-1 text-gray-500 hover:bg-gray-200/30"
                    >
                        {/* <Icon icon="charm:cross" className="h-6 w-6" /> */}
                        <Cross />
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
                                    className="w-full rounded-lg border px-4 py-2 focus:ring-1 focus:outline-none"
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
                                    className="w-full rounded-lg border px-4 py-2 focus:ring-1 focus:outline-none"
                                    placeholder={step === 'forgot-otp' ? "Enter OTP" : "Enter the OTP"}
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
                                    className="w-full rounded-lg border px-4 py-2 focus:ring-1 focus:outline-none"
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
                                        className="w-full rounded-lg border px-4 py-2 focus:ring-1 focus:outline-none"
                                        placeholder={step === 'password' ? "Enter your password" : "Enter new password"}
                                        required={step !== 'password'} // Required for reset/forgot steps
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="absolute top-2 right-2 cursor-pointer text-gray-500 hover:text-gray-700 focus:outline-none"
                                    >
                                        {showPassword ? (
                                            // <Icon icon="mdi-light:eye" className="h-6 w-6" />
                                            <Eye />
                                        ) : (
                                            <EyeClosed />
                                            // <Icon icon="mdi-light:eye-off" className="h-6 w-6" />
                                        )}
                                    </button>
                                </div>
                                {step === 'password' && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setStep('forgot-email');
                                            setError('');
                                        }}
                                        className="mt-2 cursor-pointer text-sm font-medium underline"
                                    >
                                        Forgot password?
                                    </button>
                                )}
                            </div>
                        )}

                        {step === 'forgot-email' && (
                            <div className="mb-6">
                                <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded-lg border px-4 py-2 focus:ring-1 focus:outline-none"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                        )}

                        {step === 'register' && (
                            <>
                                <div className="mb-6">
                                    <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full rounded-lg border px-4 py-2 focus:ring-1 focus:outline-none"
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
                                        className="w-full rounded-lg border px-4 py-2 focus:ring-1 focus:outline-none"
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
                                        className="w-full rounded-lg border px-4 py-2 focus:ring-1 focus:outline-none"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full rounded-lg border px-4 py-2 focus:ring-1 focus:outline-none"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={togglePasswordVisibility}
                                            className="absolute top-2 right-2 cursor-pointer text-gray-500 hover:text-gray-700 focus:outline-none"
                                        >
                                            {showPassword ? (
                                                <Eye />
                                                // <Icon icon="mdi-light:eye" className="h-6 w-6" />
                                            ) : (
                                                <EyeClosed />
                                                // <Icon icon="mdi-light:eye-off" className="h-6 w-6" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

                        <button
                            type="submit"
                            className={`w-full rounded-lg bg-pink-600 py-2 text-white transition duration-200 hover:bg-pink-700 ${isLoading ? 'cursor-not-allowed opacity-50' : ''
                                }`}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader />
                                    {/* <Icon icon="mdi:loading" className="mr-2 inline-block h-5 w-5 animate-spin" /> */}
                                    Loading...
                                </>
                            ) : step === 'forgot-email' ? (
                                'Request OTP'
                            ) : step === 'forgot-otp' ? (
                                'Verify OTP'
                            ) : step === 'reset-password' ? (
                                'Reset Password'
                            ) : (
                                'Sign In'
                            )}
                        </button>

                        {step !== 'email' && (
                            <button
                                type="button"
                                onClick={goBack}
                                className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm hover:border-gray-900 focus:ring-1 focus:outline-none"
                                disabled={isLoading}
                            >
                                <Backpack />
                                {/* <Icon icon="weui:back-outlined" className="h-4 w-4" />  */}
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