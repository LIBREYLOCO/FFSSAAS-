"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { MapPin, Truck, Wifi, WifiOff, AlertCircle, CheckCircle2 } from "lucide-react";

export default function DriverLocationPage() {
    const [driverId, setDriverId] = useState("");
    const [drivers, setDrivers] = useState<any[]>([]);
    const [isSharing, setIsSharing] = useState(false);
    const [status, setStatus] = useState<"idle" | "active" | "error">("idle");
    const [lastSent, setLastSent] = useState<Date | null>(null);
    const [errorMsg, setErrorMsg] = useState("");
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const watchRef = useRef<number | null>(null);

    useEffect(() => {
        fetch("/api/drivers")
            .then(r => r.json())
            .then(d => setDrivers(d || []))
            .catch(() => {});
    }, []);

    const sendLocation = useCallback(async (lat: number, lng: number) => {
        if (!driverId) return;
        try {
            const res = await fetch(`/api/drivers/${driverId}/location`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ lat, lng }),
            });
            if (res.ok) {
                setLastSent(new Date());
                setStatus("active");
                setCoords({ lat, lng });
            } else {
                setStatus("error");
                setErrorMsg("Error al enviar ubicación");
            }
        } catch {
            setStatus("error");
            setErrorMsg("Sin conexión");
        }
    }, [driverId]);

    const startSharing = () => {
        if (!driverId) {
            setErrorMsg("Selecciona tu perfil de conductor primero");
            setStatus("error");
            return;
        }
        if (!navigator.geolocation) {
            setErrorMsg("Tu dispositivo no soporta geolocalización");
            setStatus("error");
            return;
        }

        setIsSharing(true);
        setStatus("idle");
        setErrorMsg("");

        // Get immediately, then watch for changes
        watchRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                sendLocation(pos.coords.latitude, pos.coords.longitude);
            },
            (err) => {
                setStatus("error");
                setErrorMsg(`GPS: ${err.message}`);
            },
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
        );

        // Also push every 30 seconds in case watchPosition doesn't fire
        intervalRef.current = setInterval(() => {
            navigator.geolocation.getCurrentPosition(
                (pos) => sendLocation(pos.coords.latitude, pos.coords.longitude),
                () => {},
                { enableHighAccuracy: true, maximumAge: 15000, timeout: 8000 }
            );
        }, 30000);
    };

    const stopSharing = () => {
        setIsSharing(false);
        setStatus("idle");
        if (watchRef.current !== null) {
            navigator.geolocation.clearWatch(watchRef.current);
            watchRef.current = null;
        }
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    useEffect(() => {
        return () => {
            if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-white">
            <div className="w-full max-w-sm space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-brand-gold-500/10 border border-brand-gold-500/20 flex items-center justify-center">
                        <Truck size={36} className="text-brand-gold-500" />
                    </div>
                    <h1 className="text-2xl font-black italic tracking-tighter aura-gradient bg-clip-text text-transparent">
                        AURA Conductor
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Comparte tu ubicación en tiempo real</p>
                </div>

                {/* Driver Selection */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Tu Perfil de Conductor
                    </label>
                    <select
                        value={driverId}
                        onChange={e => setDriverId(e.target.value)}
                        disabled={isSharing}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm disabled:opacity-50"
                    >
                        <option value="">— Selecciona tu nombre —</option>
                        {drivers.map((d: any) => (
                            <option key={d.id} value={d.id}>{d.name} {d.licensePlate ? `(${d.licensePlate})` : ""}</option>
                        ))}
                    </select>
                </div>

                {/* Status Card */}
                <div className={`p-5 rounded-2xl border transition-all ${
                    status === "active" ? "bg-emerald-500/10 border-emerald-500/30" :
                    status === "error" ? "bg-red-500/10 border-red-500/30" :
                    "bg-white/5 border-white/10"
                }`}>
                    <div className="flex items-center gap-3">
                        {status === "active" ? (
                            <>
                                <Wifi size={20} className="text-emerald-400 animate-pulse" />
                                <div>
                                    <p className="text-sm font-bold text-emerald-400">Ubicación activa</p>
                                    {lastSent && (
                                        <p className="text-[10px] text-slate-500">
                                            Último envío: {lastSent.toLocaleTimeString()}
                                        </p>
                                    )}
                                    {coords && (
                                        <p className="text-[10px] text-slate-600 font-mono">
                                            {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                                        </p>
                                    )}
                                </div>
                            </>
                        ) : status === "error" ? (
                            <>
                                <AlertCircle size={20} className="text-red-400" />
                                <div>
                                    <p className="text-sm font-bold text-red-400">Error</p>
                                    <p className="text-[10px] text-slate-400">{errorMsg}</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <WifiOff size={20} className="text-slate-600" />
                                <p className="text-sm text-slate-500">
                                    {isSharing ? "Obteniendo GPS..." : "Compartir desactivado"}
                                </p>
                            </>
                        )}
                    </div>
                </div>

                {/* Toggle Button */}
                <button
                    onClick={isSharing ? stopSharing : startSharing}
                    className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                        isSharing
                            ? "bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30"
                            : "btn-primary"
                    }`}
                >
                    {isSharing ? "Detener Compartir" : "Iniciar Compartir Ubicación"}
                </button>

                <p className="text-center text-[10px] text-slate-600">
                    Tu posición GPS se envía automáticamente cada 30 segundos mientras esta pantalla esté activa.
                    Mantén la pantalla encendida durante el servicio.
                </p>
            </div>
        </div>
    );
}
