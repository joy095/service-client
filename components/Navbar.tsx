// src/components/Navbar.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Search from './Search';
import { AlignJustify, CircleUser, Info } from 'lucide-react';
import Link from 'next/link';
import styles from '@/css/Navbar.module.css';
import Form from './Form'; // Make sure the path is correct

// Mock store implementation since you're not using global state
// const isAuthenticated = false; // You might want to manage this state properly
const useAuth = () => { // Example of managing auth state locally or via context
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    // Mock login/logout functions or integrate with your auth system
    const login = () => setIsAuthenticated(true);
    const logout = () => setIsAuthenticated(false);
    return { isAuthenticated, login, logout };
};

export default function Navbar() {
    const { isAuthenticated, logout } = useAuth(); // Use the auth hook/state

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [formOpen, setFormOpen] = useState(false); // This is the correct state to manage Form visibility
    const menuRef = useRef<HTMLDivElement>(null);

    const handleClickOutside = useCallback((event: MouseEvent) => {
        const target = event.target as Node;
        if (isMenuOpen && menuRef.current && !menuRef.current.contains(target)) {
            setIsMenuOpen(false);
        }
    }, [isMenuOpen]);

    useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [handleClickOutside]);

    // Function to handle closing the form
    const handleFormClose = () => {
        setFormOpen(false);
    };

    return (
        <>
            <nav className={styles.navbar}>
                <div className={`${styles.navContainer} container mx-auto`}>
                    <Link href='/' className={styles.logo}>PremiumApp</Link>

                    <div className="relative" ref={menuRef}>
                        <button
                            className={styles.handBurger}
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <AlignJustify className='text-black h-4 w-5' />
                        </button>

                        <div className={`${styles.menuContainer} ${isMenuOpen ? styles.menuContainerToggled : ''}`}>
                            <Link className={`${styles.divide} flex items-center gap-2`} href="/">
                                <Info />
                                Help center
                            </Link>

                            {isAuthenticated ? (
                                <>
                                    <Link href="/become-a-professional" className={styles.divide}>Become a professional</Link>

                                    <div className={styles.divide}>
                                        <Link href="/profile" className="flex items-center gap-2">
                                            <CircleUser />
                                            Profile
                                        </Link>

                                        <Link href="/settings"> Account settings </Link>
                                    </div>
                                    <button onClick={logout}>Logout</button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" className={styles.divide}>Become a professional</Link>

                                    <button onClick={() => {
                                        setFormOpen(true); // Set to true to open
                                    }}>Log in or sign up</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className={styles.searchContainer}>
                    <Search />
                </div>
            </nav>

            {/* Render Form conditionally and pass the onClose handler */}
            {formOpen && <Form onClose={handleFormClose} />}
        </>
    );
}