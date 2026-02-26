"use client";

import { useEffect } from "react";

function hexToRgbParts(hex: string): string | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return null;
    return `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`;
}

export default function ThemeProvider({ primaryColor }: { primaryColor: string }) {
    useEffect(() => {
        if (!primaryColor) return;
        const rgb = hexToRgbParts(primaryColor);
        if (!rgb) return;

        // Inject the CSS custom properties into the document root
        const root = document.documentElement;
        root.style.setProperty("--brand-primary", primaryColor);
        root.style.setProperty("--brand-primary-rgb", rgb);

        // Override the Tailwind brand-gold CSS variables used app-wide
        // These are read by Tailwind as arbitrary values via var()
        root.style.setProperty("--color-brand-gold-500", primaryColor);
        root.style.setProperty("--color-brand-gold-400", primaryColor);
        root.style.setProperty("--color-brand-gold-100", primaryColor);
    }, [primaryColor]);

    return null;
}
