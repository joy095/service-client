// src/hooks/useAuth.ts
'use client';

import { useState, useEffect } from 'react';

export function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check authentication status (implement based on your auth system)
        const checkAuth = () => {
            // Example: check if token exists in localStorage or cookie
            const token = localStorage.getItem('authToken');
            setIsAuthenticated(!!token);
        };

        checkAuth();
    }, []);

    const logout = () => {
        // Implement your logout logic
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
        // Redirect to login page or home page
    };

    return { isAuthenticated, logout };
}