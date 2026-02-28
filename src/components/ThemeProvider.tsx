"use client";

import { useEffect, useState } from "react";
import { getBackground } from "@/lib/backgrounds";

function hexToRgbParts(hex: string): string | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return null;
    return `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`;
}

/** Applies the brand colour CSS variables to the document root */
function applyColor(primaryColor: string) {
    if (!primaryColor) return;
    const rgb = hexToRgbParts(primaryColor);
    if (!rgb) return;
    const root = document.documentElement;
    root.style.setProperty("--brand-primary", primaryColor);
    root.style.setProperty("--brand-primary-rgb", rgb);
    root.style.setProperty("--color-brand-gold-500", primaryColor);
    root.style.setProperty("--color-brand-gold-400", primaryColor);
    root.style.setProperty("--color-brand-gold-100", primaryColor);
}

// ── Live background element IDs ──────────────────────────────────────────────
const BG_PHOTO_ID = "__aura_bg_photo__";
const BG_VIGNETTE_ID = "__aura_bg_vignette__";

function applyBackground(backgroundId: string) {
    const bg = getBackground(backgroundId);

    // Remove existing elements
    document.getElementById(BG_PHOTO_ID)?.remove();
    document.getElementById(BG_VIGNETTE_ID)?.remove();

    if (!bg.url) return; // "none" / stars-only — nothing to inject

    // Photo layer
    const photo = document.createElement("div");
    photo.id = BG_PHOTO_ID;
    Object.assign(photo.style, {
        position: "fixed",
        inset: "0",
        zIndex: "-9",
        backgroundImage: `url(${bg.url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        transform: "scale(1.08)",
        filter: "blur(9px) brightness(0.32) saturate(0.90)",
        pointerEvents: "none",
        transition: "opacity 0.8s ease",
    });
    document.body.appendChild(photo);

    // Vignette layer
    const vignette = document.createElement("div");
    vignette.id = BG_VIGNETTE_ID;
    Object.assign(vignette.style, {
        position: "fixed",
        inset: "0",
        zIndex: "-8",
        background: "radial-gradient(ellipse at center, rgba(13,26,38,0.55) 0%, rgba(13,26,38,0.85) 100%)",
        pointerEvents: "none",
    });
    document.body.appendChild(vignette);
}

// ── Component ────────────────────────────────────────────────────────────────

export default function ThemeProvider({
    primaryColor: initialColor,
    backgroundId: initialBgId,
}: {
    primaryColor: string;
    backgroundId: string;
}) {
    const [color, setColor] = useState(initialColor);
    const [bgId, setBgId] = useState(initialBgId);

    // Apply initial values immediately
    useEffect(() => { applyColor(color); }, [color]);
    useEffect(() => { applyBackground(bgId); }, [bgId]);

    // Poll the system config every 4 seconds so changes made in the
    // config panel take effect live (without a full page reload).
    useEffect(() => {
        const sync = async () => {
            try {
                const res = await fetch("/api/system-config", { cache: "no-store" });
                if (!res.ok) return;
                const data = await res.json();
                if (data.primaryColor && data.primaryColor !== color) setColor(data.primaryColor);
                if (data.backgroundId && data.backgroundId !== bgId) setBgId(data.backgroundId);
            } catch { /* ignore network errors */ }
        };

        // Also listen for the instant event dispatched by the config page on save
        const onConfigUpdated = (e: Event) => {
            const detail = (e as CustomEvent).detail as { primaryColor?: string; backgroundId?: string };
            if (detail?.primaryColor) setColor(detail.primaryColor);
            if (detail?.backgroundId) setBgId(detail.backgroundId);
        };

        window.addEventListener("aura:config-updated", onConfigUpdated);
        const interval = setInterval(sync, 4000);
        return () => {
            clearInterval(interval);
            window.removeEventListener("aura:config-updated", onConfigUpdated);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}
