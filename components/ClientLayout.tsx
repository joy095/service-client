// src/components/ClientLayout.tsx
'use client';

import Navbar from './Navbar';
import Footer from './Footer';

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Navbar />
            {children}
            <Footer />
        </>
    );
}
