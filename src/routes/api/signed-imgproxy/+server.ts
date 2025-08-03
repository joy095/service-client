// src/routes/api/signed-imgproxy/+server.ts
import type { RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

// --- Environment Setup ---
const keyHex = env.IMAGE_PROXY_KEY;
const saltHex = env.IMAGE_PROXY_SALT;
const baseUrl = env.IMAGE_PROXY_URL;

if (!keyHex || !saltHex || !baseUrl) {
    throw new Error('IMAGE_PROXY_KEY, IMAGE_PROXY_SALT, and IMAGE_PROXY_URL are required');
}

const key = hexToUint8Array(keyHex);
const salt = hexToUint8Array(saltHex);

// --- Type Definitions ---
type Format = 'avif' | 'webp' | 'jpeg' | 'png';
type Gravity =
    | 'ce' | 'north' | 'south' | 'east' | 'west'
    | 'north_east' | 'north_west' | 'south_east' | 'south_west'
    | 'sm' | 'so' | 'et'
    | `object:${string}`
    | `fp:${string}:${string}`;

// --- Helpers ---
function hexToUint8Array(hex: string): Uint8Array {
    if (hex.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(hex)) {
        throw new Error('Invalid hex string');
    }
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    return bytes;
}

function encodeUrlSafeBase64(buffer: ArrayBuffer): string {
    const binary = String.fromCharCode(...new Uint8Array(buffer));
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function isValidFormat(f: string): f is Format {
    return ['avif', 'webp', 'jpeg', 'png'].includes(f);
}

function isValidGravity(g: string): g is Gravity {
    const base = [
        'ce', 'north', 'south', 'east', 'west',
        'north_east', 'north_west', 'south_east', 'south_west',
        'sm', 'so', 'et'
    ];
    return base.includes(g) || g.startsWith('object:') || g.startsWith('fp:');
}

function parseNumber(value: string | null): number | null {
    if (!value) return null;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? null : parsed;
}

// --- Signing Logic ---
async function generateSignedUrl(
    imageUrl: string,
    transformation: string,
    format: Format
): Promise<string> {
    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        imageUrl = `https://${imageUrl}`;
    }

    const path = `/${transformation}/plain/${encodeURIComponent(imageUrl)}@${format}`;
    const enc = new TextEncoder();
    const data = new Uint8Array([...salt, ...enc.encode(path)]);

    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        key,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, data);
    const encodedSig = encodeUrlSafeBase64(signature);

    return `${baseUrl}/${encodedSig}${path}`;
}

// --- GET handler ---
export const GET: RequestHandler = async ({ url }) => {
    try {
        const src = url.searchParams.get('src');
        const width = parseNumber(url.searchParams.get('width'));
        const height = parseNumber(url.searchParams.get('height'));

        const rawFormat = url.searchParams.get('format')?.trim().toLowerCase() ?? '';
        const rawGravity = url.searchParams.get('gravity')?.trim().toLowerCase() ?? null;
        const rawQuality = url.searchParams.get('quality');

        if (!src || !width || !height || !rawFormat) {
            return new Response('Missing required parameters', { status: 400 });
        }

        // Handle 'jpg' alias
        const normalizedFormat = rawFormat === 'jpg' ? 'jpeg' : rawFormat;

        if (!isValidFormat(normalizedFormat)) {
            return new Response('Invalid format', { status: 400 });
        }
        const format: Format = normalizedFormat;

        // Handle gravity
        // --- Inside GET handler ---
        // Handle gravity and crop
        const rawCrop = url.searchParams.get('crop');
        const crop = rawCrop === 'true';
        const gravity: Gravity | null = rawGravity && isValidGravity(rawGravity) ? rawGravity : null;

        let transformation = '';

        // Prioritize explicit gravity for cropping.
        // If no gravity, use crop flag for simple center crop.
        // Otherwise, resize to fit.
        if (gravity) {
            // Use cropping with specified gravity
            transformation = `c:${width}:${height}:${gravity}`;
        } else if (crop) {
            // Use simple center crop if crop=true but no gravity specified
            transformation = `c:${width}:${height}`; // Implies 'ce' gravity
        } else {
            // Default to resize to fit
            transformation = `rs:fit:${width}:${height}`;
        }
        // --- End adjustment ---

        // Handle quality
        const quality = parseNumber(rawQuality);
        if (rawQuality !== null && rawQuality !== '' && (quality === null || quality < 1 || quality > 100)) {
            console.warn(`Invalid quality value '${rawQuality}' provided, ignoring.`);
        }

        if (quality && ['jpeg', 'webp', 'avif'].includes(format)) {
            transformation += `/q:${quality}`;
        }


        const signedUrl = await generateSignedUrl(src, transformation, format);

        return new Response(JSON.stringify({ url: signedUrl }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        console.error('API Error:', err);
        return new Response('Failed to generate signed URL', { status: 500 });
    }
};
