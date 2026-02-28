"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { MapPin, Search, Navigation, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

const LocationPickerMap = dynamic(() => import("./LocationPickerMap"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[240px] rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 text-sm">
            Cargando mapa…
        </div>
    ),
});

// ── Mexico States ──────────────────────────────────────────────────────────────
const MEXICO_STATES = [
    "Aguascalientes", "Baja California", "Baja California Sur", "Campeche",
    "Chiapas", "Chihuahua", "Ciudad de México", "Coahuila", "Colima",
    "Durango", "Estado de México", "Guanajuato", "Guerrero", "Hidalgo",
    "Jalisco", "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca",
    "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa",
    "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz",
    "Yucatán", "Zacatecas",
];

const isMexico = (c: string) =>
    c?.toLowerCase().replace(/é/g, "e") === "mexico" ||
    c?.toLowerCase() === "méxico";

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
    streetName: "", streetNumber: "", interiorNum: "", neighborhood: "",
    city: "", state: "", country: "México", zipCode: "",
    latitude: "", longitude: "",
});

interface AddressFormSectionProps {
    values: AddressValues;
    onChange: (updated: Partial<AddressValues>) => void;
}

// ── Geocoding via Nominatim ────────────────────────────────────────────────────
async function nominatim(query: string): Promise<{ lat: number; lng: number } | null> {
    try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
        const res = await fetch(url, { headers: { "Accept-Language": "es", "User-Agent": "AuraApp/1.0" } });
        const data = await res.json();
        if (data.length > 0) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    } catch { /* ignore */ }
    return null;
}

async function geocodeAddress(v: AddressValues): Promise<{ lat: number; lng: number } | null> {
    // Try 1: full address
    const fullParts = [
        v.streetNumber ? `${v.streetName} ${v.streetNumber}` : v.streetName,
        v.neighborhood, v.city, v.state, v.zipCode, v.country,
    ].filter(Boolean);
    if (fullParts.length >= 2) {
        const r = await nominatim(fullParts.join(", "));
        if (r) return r;
    }

    // Try 2: zip + city + country
    if (v.zipCode) {
        const zipParts = [v.zipCode, v.city || v.state, v.country].filter(Boolean);
        const r = await nominatim(zipParts.join(", "));
        if (r) return r;
    }

    // Try 3: just zip + country
    if (v.zipCode && v.country) {
        const r = await nominatim(`${v.zipCode} ${v.country}`);
        if (r) return r;
    }

    // Try 4: city + state + country
    if (v.city || v.state) {
        const r = await nominatim([v.city, v.state, v.country].filter(Boolean).join(", "));
        if (r) return r;
    }

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

    const set = (field: keyof AddressValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        onChange({ [field]: e.target.value });

    const handleLocationChange = (lat: number, lng: number) =>
        onChange({ latitude: String(lat), longitude: String(lng) });

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
            setShowMap(true);
        }
    };

    const handleManual = () => { setManualMode(true); setGeoStatus("idle"); setShowMap(true); };

    const hasEnoughData = !!(values.streetName || values.zipCode || values.city);
    const hasPin = !!(values.latitude && values.longitude);
    const showMexicoStates = isMexico(values.country);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-brand-gold-500 pt-2">
                <MapPin size={16} />
                <span className="text-xs font-black uppercase tracking-widest">Domicilio</span>
            </div>

            {/* Street */}
            <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1">
                    <label className={LABEL}>Calle / Av. / Blvd.</label>
                    <input type="text" value={values.streetName} onChange={set("streetName")}
                        className={INPUT} placeholder="Ej. Av. Insurgentes Sur" />
                </div>
                <div className="space-y-1">
                    <label className={LABEL}>N° Exterior</label>
                    <input type="text" value={values.streetNumber} onChange={set("streetNumber")}
                        className={INPUT} placeholder="1457" />
                </div>
            </div>

            {/* Interior / Neighborhood */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label className={LABEL}>N° Interior / Depto</label>
                    <input type="text" value={values.interiorNum} onChange={set("interiorNum")}
                        className={INPUT} placeholder="Piso 3, Apt 12 (opcional)" />
                </div>
                <div className="space-y-1">
                    <label className={LABEL}>Colonia / Barrio</label>
                    <input type="text" value={values.neighborhood} onChange={set("neighborhood")}
                        className={INPUT} placeholder="Del Valle Centro" />
                </div>
            </div>

            {/* City / State */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label className={LABEL}>Ciudad / Municipio</label>
                    <input type="text" value={values.city} onChange={set("city")}
                        className={INPUT} placeholder="Ciudad de México" />
                </div>
                <div className="space-y-1">
                    <label className={LABEL}>Estado / Provincia</label>
                    {showMexicoStates ? (
                        <select value={values.state} onChange={set("state")}
                            className={`${INPUT} appearance-none cursor-pointer`}>
                            <option value="">— Seleccionar estado —</option>
                            {MEXICO_STATES.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    ) : (
                        <input type="text" value={values.state} onChange={set("state")}
                            className={INPUT} placeholder="Provincia / Estado" />
                    )}
                </div>
            </div>

            {/* Country / ZIP */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label className={LABEL}>País</label>
                    <input type="text" value={values.country} onChange={e => {
                        onChange({ country: e.target.value, state: "" }); // reset state on country change
                    }} className={INPUT} placeholder="México" />
                </div>
                <div className="space-y-1">
                    <label className={LABEL}>Código Postal</label>
                    <input type="text" value={values.zipCode} onChange={set("zipCode")}
                        className={INPUT} placeholder="03100" />
                </div>
            </div>

            {/* Action bar */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
                <button type="button" onClick={handleGeocode}
                    disabled={!hasEnoughData || geoStatus === "loading"}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-gold-500/10 hover:bg-brand-gold-500/20 border border-brand-gold-500/30 text-brand-gold-500 text-xs font-black uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                    {geoStatus === "loading" ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                    {geoStatus === "loading" ? "Buscando…" : "Ubicar en mapa"}
                </button>

                <button type="button" onClick={handleManual}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-slate-200 text-xs font-black uppercase tracking-widest transition-all">
                    <Navigation size={14} />
                    Agregar manualmente
                </button>

                {showMap && geoStatus !== "loading" && (
                    <button type="button" onClick={() => setShowMap(v => !v)}
                        className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-slate-300 transition-colors ml-auto">
                        {showMap ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {showMap ? "Ocultar mapa" : "Mostrar mapa"}
                    </button>
                )}
            </div>

            {/* Status */}
            {geoStatus === "found" && (
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <CheckCircle2 size={14} />
                    ¡Dirección ubicada! Arrastra el pin para afinar la posición.
                </div>
            )}
            {geoStatus === "not_found" && (
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                    <AlertCircle size={14} />
                    No se encontró la dirección. Se aproximó al código postal · mueve el pin manualmente.
                </div>
            )}

            {hasPin && (
                <p className="text-[10px] text-slate-500 font-mono ml-1">
                    📍 {parseFloat(values.latitude).toFixed(6)}, {parseFloat(values.longitude).toFixed(6)}
                </p>
            )}

            {showMap && (
                <div className="rounded-2xl overflow-hidden border border-white/10">
                    <LocationPickerMap
                        lat={values.latitude} lng={values.longitude}
                        flyTrigger={flyTrigger}
                        onLocationChange={handleLocationChange}
                        height={240}
                    />
                    <p className="text-[10px] text-slate-500 text-center py-2 bg-black/20">
                        {manualMode || geoStatus === "not_found"
                            ? "Haz clic o arrastra el pin para marcar la ubicación"
                            : "Arrastra el pin para ajustar la posición exacta"}
                    </p>
                </div>
            )}
        </div>
    );
}
