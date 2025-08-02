// src/hooks/useStore.ts
'use client';

import { useState } from 'react';

export function useStore() {
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Implement your global state logic here
    // This could be replaced with context, Redux, or any state management solution

    return { isFormOpen, setIsFormOpen };
}