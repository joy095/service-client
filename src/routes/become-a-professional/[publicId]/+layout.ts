// src/routes/some-page/[publicId]/+layout.ts
export function load({ params }) {
    return {
        publicId: params.publicId
    };
}
