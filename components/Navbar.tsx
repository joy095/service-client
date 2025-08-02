// src/components/Navbar.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Search from './Search';
import { AlignJustify, CircleUser, Info } from 'lucide-react';
import Link from 'next/link';
import styles from '@/css/Navbar.module.css';
import Form from './Form';

// Mock store implementation since you're not using global state
const isAuthenticated = false;

// Mock logout function
const logout = () => {
    console.log('Logout function called');
    // Implement your actual logout logic here
};

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
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
                                        setFormOpen(prev => !prev);
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

            {formOpen && <Form />}
        </>
    );
}