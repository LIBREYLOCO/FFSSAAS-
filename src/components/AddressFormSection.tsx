"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { MapPin, Search, Navigation, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

// Load map dynamically (Leaflet needs browser environment)
const LocationPickerMap = dynamic(() => import("./LocationPickerMap"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[240px] rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 text-sm">
            Cargando mapa...
        </div>
    ),
});

// ── Types ──────────────────────────────────────────────────────────────────────
export interface AddressValues {
    streetName: string;
    streetNumber: string;
    interiorNum: string;
    neighborhood: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    latitude: string;
    longitude: string;
}

export const emptyAddress = (): AddressValues => ({
    streetName: "",
    streetNumber: "",
    interiorNum: "",
    neighborhood: "",
    city: "",
    state: "",
    country: "México",
    zipCode: "",
    latitude: "",
    longitude: "",
});

interface AddressFormSectionProps {
    values: AddressValues;
    onChange: (updated: Partial<AddressValues>) => void;
}

// ── Geocoding via Nominatim (OpenStreetMap, free, no key needed) ───────────────
async function geocodeAddress(values: AddressValues): Promise<{ lat: number; lng: number } | null> {
    const parts = [
        values.streetNumber ? `${values.streetName} ${values.streetNumber}` : values.streetName,
        values.neighborhood,
        values.city,
        values.state,
        values.zipCode,
        values.country,
    ].filter(Boolean);

    if (parts.length < 2) return null;

    const query = encodeURIComponent(parts.join(", "));
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&addressdetails=1`;

    try {
        const res = await fetch(url, {
            headers: { "Accept-Language": "es", "User-Agent": "AuraApp/1.0" },
        });
        const data = await res.json();
        if (data.length > 0) {
            return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        }
    } catch { /* network error */ }
    return null;
}

// ── Shared styles ──────────────────────────────────────────────────────────────
const INPUT = "w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-slate-200 outline-none focus:border-brand-gold-500/50 transition-colors placeholder:text-slate-600 text-sm";
const LABEL = "text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1";

type GeoStatus = "idle" | "loading" | "found" | "not_found";

// ── Component ──────────────────────────────────────────────────────────────────
export default function AddressFormSection({ values, onChange }: AddressFormSectionProps) {
    const [showMap, setShowMap] = useState(false);
    const [manualMode, setManualMode] = useState(false);
    const [flyTrigger, setFlyTrigger] = useState(0);
    const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");

    const set = (field: keyof AddressValues) => (e: React.ChangeEvent<HTMLInputElement>) =>
        onChange({ [field]: e.target.value });

    const handleLocationChange = (lat: number, lng: number) => {
        onChange({ latitude: String(lat), longitude: String(lng) });
    };

    // ── Geocode and fly to location ────────────────────────────────────────────
    const handleGeocode = async () => {
        setGeoStatus("loading");
        setManualMode(false);
        const result = await geocodeAddress(values);
        if (result) {
            onChange({ latitude: String(result.lat), longitude: String(result.lng) });
            setGeoStatus("found");
            setShowMap(true);
            setFlyTrigger(t => t + 1);
        } else {
            setGeoStatus("not_found");
            setShowMap(true); // open map so user can place manually
        }
    };

    const handleManual = () => {
        setManualMode(true);
        setGeoStatus("idle");
        setShowMap(true);
    };

    const hasEnoughData = !!(values.streetName && (values.city || values.neighborhood));
    const hasPin = !!(values.latitude && values.longitude);

    return (
        <div className="space-y-4">
            {/* ── Section header ── */}
            <div className="flex items-center gap-2 text-brand-gold-500 pt-2">
                <MapPin size={16} />
                <span className="text-xs font-black uppercase tracking-widest">Domicilio</span>
            </div>

            {/* ── Street row ── */}
            <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1">
                    <label className={LABEL}>Nombre de la calle / Av. / Blvd.</label>
                    <input
                        type="text"
                        value={values.streetName}
                        onChange={set("streetName")}
                        className={INPUT}
                        placeholder="Ej. Av. Insurgentes Sur"
                    />
                </div>
                <div className="space-y-1">
                    <label className={LABEL}>N° Exterior</label>
                    <input
                        type="text"
                        value={values.streetNumber}
                        onChange={set("streetNumber")}
                        className={INPUT}
                        placeholder="Ej. 1457"
                    />
                </div>
            </div>

            {/* ── Interior / Neighborhood ── */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label className={LABEL}>N° Interior / Depto / Apt</label>
                    <input
                        type="text"
                        value={values.interiorNum}
                        onChange={set("interiorNum")}
                        className={INPUT}
                        placeholder="Ej. Piso 3, Apt 12 (opcional)"
                    />
                </div>
                <div className="space-y-1">
                    <label className={LABEL}>Colonia / Barrio</label>
                    <input
                        type="text"
                        value={values.neighborhood}
                        onChange={set("neighborhood")}
                        className={INPUT}
                        placeholder="Ej. Del Valle Centro"
                    />
                </div>
            </div>

            {/* ── City / State ── */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label className={LABEL}>Ciudad / Municipio</label>
                    <input
                        type="text"
                        value={values.city}
                        onChange={set("city")}
                        className={INPUT}
                        placeholder="Ej. Ciudad de México"
                    />
                </div>
                <div className="space-y-1">
                    <label className={LABEL}>Estado / Provincia</label>
                    <input
                        type="text"
                        value={values.state}
                        onChange={set("state")}
                        className={INPUT}
                        placeholder="Ej. CDMX"
                    />
                </div>
            </div>

            {/* ── Country / ZIP ── */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label className={LABEL}>País</label>
                    <input
                        type="text"
                        value={values.country}
                        onChange={set("country")}
                        className={INPUT}
                        placeholder="México"
                    />
                </div>
                <div className="space-y-1">
                    <label className={LABEL}>Código Postal</label>
                    <input
                        type="text"
                        value={values.zipCode}
                        onChange={set("zipCode")}
                        className={INPUT}
                        placeholder="Ej. 03100"
                    />
                </div>
            </div>

            {/* ── Geocode action bar ── */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
                {/* Primary: geocode button */}
                <button
                    type="button"
                    onClick={handleGeocode}
                    disabled={!hasEnoughData || geoStatus === "loading"}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-gold-500/10 hover:bg-brand-gold-500/20 border border-brand-gold-500/30 text-brand-gold-500 text-xs font-black uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {geoStatus === "loading" ? (
                        <Loader2 size={14} className="animate-spin" />
                    ) : (
                        <Search size={14} />
                    )}
                    {geoStatus === "loading" ? "Buscando…" : "Ubicar en mapa"}
                </button>

                {/* Fallback manual */}
                {(geoStatus === "not_found" || geoStatus === "idle") && (
                    <button
                        type="button"
                        onClick={handleManual}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-slate-200 text-xs font-black uppercase tracking-widest transition-all"
                    >
                        <Navigation size={14} />
                        Agregar manualmente
                    </button>
                )}

                {/* Toggle hide/show map if already visible */}
                {showMap && geoStatus !== "loading" && (
                    <button
                        type="button"
                        onClick={() => setShowMap(v => !v)}
                        className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-slate-300 transition-colors ml-auto"
                    >
                        {showMap ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {showMap ? "Ocultar mapa" : "Mostrar mapa"}
                    </button>
                )}
            </div>

            {/* ── Status messages ── */}
            {geoStatus === "found" && (
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <CheckCircle2 size={14} />
                    ¡Dirección ubicada! Puedes arrastrar el pin para ajustar la posición.
                </div>
            )}
            {geoStatus === "not_found" && (
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                    <AlertCircle size={14} />
                    No se encontró la dirección automáticamente. Mueve el pin manualmente.
                </div>
            )}

            {/* ── Coordinates display ── */}
            {hasPin && (
                <p className="text-[10px] text-slate-500 font-mono ml-1">
                    📍 {parseFloat(values.latitude).toFixed(6)}, {parseFloat(values.longitude).toFixed(6)}
                </p>
            )}

            {/* ── Map ── */}
            {showMap && (
                <div className="rounded-2xl overflow-hidden border border-white/10">
                    <LocationPickerMap
                        lat={values.latitude}
                        lng={values.longitude}
                        flyTrigger={flyTrigger}
                        onLocationChange={handleLocationChange}
                        height={240}
                    />
                    <p className="text-[10px] text-slate-500 text-center py-2 bg-white/3">
                        {manualMode || geoStatus === "not_found"
                            ? "Haz clic en el mapa o arrastra el pin para marcar la ubicación"
                            : "Arrastra el pin para ajustar la posición exacta"}
                    </p>
                </div>
            )}
        </div>
    );
}
