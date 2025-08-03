// src/routes/api/signed-imgproxy/+server.ts
import { env } from '$env/dynamic/private'; // Use static since env is known at build time

const keyHex = env.IMAGE_PROXY_KEY;
const saltHex = env.IMAGE_PROXY_SALT;
const baseUrl = env.IMAGE_PROXY_URL;

if (!keyHex || !saltHex || !baseUrl) {
    throw new Error('IMAGE_PROXY_KEY, IMAGE_PROXY_SALT, and IMAGE_PROXY_URL are required');
}

const key = hexToUint8Array(keyHex);
const salt = hexToUint8Array(saltHex);

function hexToUint8Array(hex: string): Uint8Array {
    if (hex.length % 2 !== 0) {
        throw new Error('Invalid hex string: odd length');
    }
    if (!/^[0-9a-fA-F]*$/.test(hex)) {
        throw new Error('Invalid hex string: contains non-hex characters');
    }
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    return bytes;
}

function encodeUrlSafeBase64(buffer: ArrayBuffer): string {
    const uint8 = new Uint8Array(buffer);
    let str = '';
    for (let i = 0; i < uint8.length; i++) {
        str += String.fromCharCode(uint8[i]);
    }
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function generateSignedUrl(imageUrl: string, transformation: string, format: string): Promise<string> {
    if (!imageUrl || !transformation || !format) {
        throw new Error('Missing required parameters');
    }
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

export async function GET({ url }) {
    try {
        const src = url.searchParams.get('src');
        const width = url.searchParams.get('width');
        const height = url.searchParams.get('height');
        let format = url.searchParams.get('format'); // ← 'avif', 'webp', etc.

        if (!src || !width || !height || !format) {
            return new Response('Missing required parameters', { status: 400 });
        }

        // 🔽 Sanitize format
        format = format.trim().toLowerCase();
        if (!['avif', 'webp', 'jpeg', 'jpg', 'png'].includes(format)) {
            return new Response('Invalid format', { status: 400 });
        }

        // Handle jpg → jpeg for imgproxy
        if (format === 'jpg') format = 'jpeg';

        const transformation = `rs:fit:${width}:${height}`;
        const signedUrl = await generateSignedUrl(src, transformation, format);

        return new Response(JSON.stringify({ url: signedUrl }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        console.error(e);
        return new Response('Failed to generate signed URL', { status: 500 });
    }
}
