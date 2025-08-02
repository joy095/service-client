// src/app/health-check/page.tsx
'use client'; // This is a Client Component because it uses useEffect and useState

import Image from 'next/image';
import { useState, useEffect } from 'react';

export const runtime = 'edge';

// Define types for better type safety
interface HealthData {
    // Adjust this interface based on the actual structure of your health data response
    status: string;
    timestamp?: string;
    // Add other fields as needed
    [key: string]: unknown; // Allow for additional unknown fields
}

export default function HealthCheckPage() {
    const [healthData, setHealthData] = useState<HealthData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Note: Extra spaces in the URL have been removed
                const url = 'https://r2-worker-proxy.joykarmakar987654321.workers.dev/health';

                const response = await fetch(url);

                if (!response.ok) {
                    let errorText = '';
                    try {
                        errorText = await response.text();
                    } catch (e) {
                        // If reading text fails, use status text
                        console.error(e)
                        errorText = response.statusText;
                    }
                    console.log('❌ Error response body:', errorText);
                    throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
                }

                const data: HealthData = await response.json();
                setHealthData(data);
            } catch (err: unknown) {
                // Type guard to check if err is an Error instance
                if (err instanceof Error) {
                    console.error('💥 Fetch error details:', {
                        message: err.message,
                        name: err.name,
                        stack: err.stack,
                    });

                    // More detailed error analysis
                    if (err.name === 'TypeError' && err.message.includes('fetch')) {
                        console.error('🌐 This is likely a CORS error or network issue');
                        console.error('💡 Solutions:');
                        console.error('   1. Add your frontend domain to CORS allowed origins in your Worker');
                        console.error('   2. Check if the Worker URL is correct');
                        console.error('   3. Verify the Worker is deployed and running');
                    }

                    setError(err.message);
                } else {
                    // Handle non-Error objects (though this is rare)
                    const errorMessage = 'An unknown error occurred';
                    console.error('💥 Unknown fetch error:', err);
                    setError(errorMessage);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []); // Empty dependency array means this effect runs once on mount, similar to Svelte's onMount

    return (
        <div style={{ fontFamily: 'monospace', padding: '20px' }}>
            <h1>Cloudflare Worker Debug</h1>

            {loading && <p>🔄 Loading...</p>}

            {error && (
                <div style={{ background: '#ffebee', padding: '15px', borderRadius: '5px' }}>
                    <h3 style={{ color: '#c62828', marginTop: 0 }}>❌ Error:</h3>
                    <p>
                        <strong>{error}</strong>
                    </p>
                    <p>Check browser console for detailed logs (F12 → Console)</p>
                </div>
            )}

            {healthData && (
                <div style={{ background: '#e8f5e8', padding: '15px', borderRadius: '5px' }}>
                    <h3 style={{ color: '#2e7d32', marginTop: 0 }}>✅ Success!</h3>
                    {/* Using JSON.stringify for display, consider using a more readable format for complex objects */}
                    <pre>{JSON.stringify(healthData, null, 2)}</pre>
                </div>
            )}

            <h3>Debug Steps:</h3>
            <ol>
                <li>Open browser DevTools (F12)</li>
                <li>Go to Console tab</li>
                <li>Refresh this page</li>
                <li>Check detailed error logs</li>
            </ol>

            <Image
                src="https://r2-worker-proxy.joykarmakar987654321.workers.dev/uploads/0197d626-bb8e-7b67-a6af-4f357bc858f8/79f49a819e1547c2af190d042c5f7d40.webp"
                alt=""
                width={500}
                height={300}
                quality={50}
            />
        </div>
    );
}