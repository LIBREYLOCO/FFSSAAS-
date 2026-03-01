"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { motion } from "framer-motion";
import { ChevronLeft, MapPin, Dog, Loader2, Truck, RefreshCw } from "lucide-react";
import Link from "next/link";

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

export default function LogisticsMap() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [L, setL] = useState<any>(null);
    const [lastRefresh, setLastRefresh] = useState(new Date());

    const fetchData = useCallback(() => {
        fetch("/api/mapa")
            .then(res => res.ok ? res.json() : null)
            .then(d => {
                setData(d || { clinics: [], activeOrders: [], activeDrivers: [] });
                setLastRefresh(new Date());
                setLoading(false);
            })
            .catch(err => {
                console.error("Fetch mapa error:", err);
                setData((prev: any) => prev || { clinics: [], activeOrders: [], activeDrivers: [] });
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        import("leaflet").then((leaflet) => {
            setL(leaflet);
            fetchData();
        });
    }, [fetchData]);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        if (!L) return;
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [L, fetchData]);

    if (loading || !L) return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-brand-gold-500 gap-4">
            <Loader2 className="animate-spin" size={48} />
            <p className="text-xs font-black tracking-widest uppercase">Cargando Mapa de Aura...</p>
        </div>
    );

    const clinicIcon = new L.Icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    const orderIcon = new L.Icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    const driverIcon = new L.Icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    const defaultCenter: [number, number] = [20.6719, -103.3500];

    const formatTimeAgo = (date: string) => {
        const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
        if (seconds < 60) return `Hace ${seconds}s`;
        return `Hace ${Math.floor(seconds / 60)}min`;
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <header className="p-6 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 bg-white/5 rounded-xl text-slate-400 hover:text-white transition-colors">
                        <ChevronLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-xl font-black italic tracking-tighter aura-gradient bg-clip-text text-transparent">LOGÍSTICA AURA</h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Monitoreo en Tiempo Real</p>
                    </div>
                </div>
                <div className="flex gap-3 items-center">
                    <button
                        onClick={fetchData}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all text-xs font-bold"
                    >
                        <RefreshCw size={12} />
                        Actualizar
                    </button>
                    <div className="flex items-center gap-2 px-3 py-1 bg-brand-gold-500/10 rounded-full border border-brand-gold-500/20">
                        <div className="w-2 h-2 rounded-full bg-brand-gold-500" />
                        <span className="text-[10px] font-bold text-brand-gold-100 uppercase">Clínicas</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-[10px] font-bold text-blue-100 uppercase">Servicios</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-emerald-100 uppercase">Conductores</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 relative">
                <div className="absolute inset-0 z-0">
                    <MapContainer
                        center={data?.clinics?.[0] ? [data.clinics[0].latitude, data.clinics[0].longitude] : defaultCenter}
                        zoom={13}
                        style={{ height: "100%", width: "100%" }}
                    >
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        />

                        {/* Clinic Markers */}
                        {data?.clinics?.map((clinic: any) => (
                            <Marker key={clinic.id} position={[clinic.latitude, clinic.longitude]} icon={clinicIcon}>
                                <Popup className="aura-popup">
                                    <div className="p-2 space-y-1">
                                        <h3 className="font-bold text-sm">{clinic.businessName}</h3>
                                        <p className="text-[10px] text-slate-500">{clinic.address}</p>
                                        <p className="text-[10px] font-bold text-brand-gold-600 uppercase">Socio Preferente</p>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}

                        {/* Active Order Markers */}
                        {data?.activeOrders?.map((order: any) => {
                            const lat = order.lat || (order.clinic?.latitude ? order.clinic.latitude + (Math.random() - 0.5) * 0.01 : null);
                            const lng = order.lng || (order.clinic?.longitude ? order.clinic.longitude + (Math.random() - 0.5) * 0.01 : null);
                            if (!lat || !lng) return null;
                            return (
                                <Marker key={order.id} position={[lat, lng]} icon={orderIcon}>
                                    <Popup className="aura-popup">
                                        <div className="p-2 space-y-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="p-1 bg-blue-500/10 rounded text-blue-500">
                                                    <Dog size={12} />
                                                </div>
                                                <h3 className="font-bold text-sm">{order.pet?.name}</h3>
                                            </div>
                                            <p className="text-[10px] text-slate-500">Folio: {order.folio}</p>
                                            <span className="inline-block px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[9px] font-black uppercase">
                                                {order.status}
                                            </span>
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        })}

                        {/* Driver Live Location Markers */}
                        {data?.activeDrivers?.map((driver: any) => (
                            <Marker
                                key={driver.id}
                                position={[driver.currentLat, driver.currentLng]}
                                icon={driverIcon}
                            >
                                <Popup className="aura-popup">
                                    <div className="p-2 space-y-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="p-1 bg-emerald-500/10 rounded text-emerald-500">
                                                <Truck size={12} />
                                            </div>
                                            <h3 className="font-bold text-sm">{driver.name}</h3>
                                        </div>
                                        {driver.licensePlate && (
                                            <p className="text-[10px] text-slate-400">Placa: <span className="font-bold text-white">{driver.licensePlate}</span></p>
                                        )}
                                        <p className="text-[10px] text-emerald-400 font-bold">
                                            {driver.lastLocationAt ? formatTimeAgo(driver.lastLocationAt) : "Ubicación activa"}
                                        </p>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>

                {/* Sidebar Info Panel */}
                <div className="absolute top-6 left-6 z-[1000] w-72 space-y-4 pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-card p-6 rounded-3xl pointer-events-auto border border-white/10"
                    >
                        <div className="flex items-center gap-3 mb-4 text-brand-gold-500">
                            <MapPin size={20} />
                            <h2 className="font-bold italic tracking-tighter">Resumen Operativo</h2>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400">Clínicas Registradas</span>
                                <span className="font-bold">{data?.clinics?.length || 0}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400">Servicios en Curso</span>
                                <span className="font-bold text-blue-400">{data?.activeOrders?.length || 0}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400">Conductores Activos</span>
                                <span className="font-bold text-emerald-400">{data?.activeDrivers?.length || 0}</span>
                            </div>
                        </div>
                        <p className="text-[9px] text-slate-600 mt-4 text-right">
                            Actualización: {lastRefresh.toLocaleTimeString()} · cada 30s
                        </p>
                    </motion.div>

                    {/* Active Driver List */}
                    {data?.activeDrivers?.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="glass-card p-4 rounded-3xl pointer-events-auto border border-emerald-500/20"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">En Ruta</span>
                            </div>
                            <div className="space-y-2">
                                {data.activeDrivers.map((driver: any) => (
                                    <div key={driver.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Truck size={12} className="text-emerald-500" />
                                            <span className="text-xs font-semibold text-slate-200">{driver.name}</span>
                                        </div>
                                        <span className="text-[9px] text-slate-500">
                                            {driver.lastLocationAt ? formatTimeAgo(driver.lastLocationAt) : ""}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </main>

            <style jsx global>{`
                .leaflet-container {
                    background: #000 !important;
                }
                .aura-popup .leaflet-popup-content-wrapper {
                    background: #1a1a1a !important;
                    color: white !important;
                    border: 1px solid rgba(212, 175, 55, 0.2);
                    border-radius: 16px;
                }
                .aura-popup .leaflet-popup-tip {
                    background: #1a1a1a !important;
                    border: 1px solid rgba(212, 175, 55, 0.2);
                }
            `}</style>
        </div>
    );
}
