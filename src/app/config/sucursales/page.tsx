"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Plus, MapPin, Phone, Mail, Pencil, X,
  ToggleLeft, ToggleRight, CheckCircle, AlertCircle,
  Grid3X3, Map, Navigation, Search, Loader2, Route,
} from "lucide-react";

// ── Leaflet (client-only, no SSR) ─────────────────────────────────────────────
const MapContainer     = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer        = dynamic(() => import("react-leaflet").then((m) => m.TileLayer),    { ssr: false });
const Marker           = dynamic(() => import("react-leaflet").then((m) => m.Marker),       { ssr: false });
const Popup            = dynamic(() => import("react-leaflet").then((m) => m.Popup),        { ssr: false });
const Polyline         = dynamic(() => import("react-leaflet").then((m) => m.Polyline),     { ssr: false });
const LocationPickerMap = dynamic(() => import("@/components/LocationPickerMap"),            { ssr: false });

// ── Types ─────────────────────────────────────────────────────────────────────
interface Sucursal {
  id: string;
  nombre: string;
  codigo: string;
  direccion?: string;
  ciudad?: string;
  estado?: string;
  telefono?: string;
  email?: string;
  latitude?: number | null;
  longitude?: number | null;
  isActive: boolean;
  createdAt: string;
  _count?: { users: number; serviceOrders: number; drivers: number };
}

const EMPTY_FORM = {
  nombre: "", codigo: "", direccion: "", ciudad: "",
  estado: "", telefono: "", email: "", latitude: "", longitude: "",
};

// ── Haversine (km in straight line) ──────────────────────────────────────────
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SucursalesPage() {
  const [sucursales, setSucursales]   = useState<Sucursal[]>([]);
  const [loading, setLoading]         = useState(true);
  const [view, setView]               = useState<"cards" | "map">("cards");
  const [modalOpen, setModalOpen]     = useState(false);
  const [editing, setEditing]         = useState<Sucursal | null>(null);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [saving, setSaving]           = useState(false);
  const [geocoding, setGeocoding]     = useState(false);
  const [error, setError]             = useState("");
  const [flyTrigger, setFlyTrigger]   = useState(0);
  const [leafletReady, setLeafletReady] = useState(false);
  const [L, setL]                     = useState<any>(null);

  // Nearest-branch finder
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching]     = useState(false);
  const [clientCoords, setClientCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [distances, setDistances]     = useState<Array<{ sucursal: Sucursal; km: number }>>([]);

  // ── Load Leaflet once when map view is activated ─────────────────────────
  useEffect(() => {
    if (view !== "map" || leafletReady) return;
    import("leaflet").then((leaflet) => {
      // Fix default marker icons with webpack
      delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
      setL(leaflet);
      setLeafletReady(true);
    });
  }, [view, leafletReady]);

  // ── Data ─────────────────────────────────────────────────────────────────
  const fetchSucursales = () => {
    setLoading(true);
    fetch("/api/sucursales")
      .then((r) => r.json())
      .then((data) => setSucursales(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSucursales(); }, []);

  // ── Modal helpers ─────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError("");
    setFlyTrigger(0);
    setModalOpen(true);
  };

  const openEdit = (s: Sucursal) => {
    setEditing(s);
    setForm({
      nombre: s.nombre, codigo: s.codigo,
      direccion: s.direccion ?? "", ciudad: s.ciudad ?? "",
      estado: s.estado ?? "", telefono: s.telefono ?? "", email: s.email ?? "",
      latitude: s.latitude?.toString() ?? "", longitude: s.longitude?.toString() ?? "",
    });
    setError("");
    setFlyTrigger(0);
    setModalOpen(true);
  };

  // ── Geocode address → lat/lng via Nominatim ───────────────────────────────
  const geocodeForm = async () => {
    const address = [form.direccion, form.ciudad, form.estado, "México"]
      .filter(Boolean)
      .join(", ");
    if (!address.trim()) return;
    setGeocoding(true);
    setError("");
    try {
      const res  = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&countrycodes=mx`,
        { headers: { "Accept-Language": "es" } }
      );
      const data = await res.json();
      if (data[0]) {
        setForm((f) => ({ ...f, latitude: data[0].lat, longitude: data[0].lon }));
        setFlyTrigger((t) => t + 1);
      } else {
        setError("No se encontró la dirección. Haz clic en el mapa para ubicar la sucursal manualmente.");
      }
    } catch {
      setError("Error al geocodificar. Verifica tu conexión.");
    } finally {
      setGeocoding(false);
    }
  };

  // ── Save sucursal ─────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.nombre || !form.codigo) {
      setError("Nombre y código son requeridos.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(
        editing ? `/api/sucursales/${editing.id}` : "/api/sucursales",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            latitude:  form.latitude  ? parseFloat(form.latitude)  : null,
            longitude: form.longitude ? parseFloat(form.longitude) : null,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Error al guardar."); return; }
      setModalOpen(false);
      fetchSucursales();
    } catch {
      setError("Error de red.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (s: Sucursal) => {
    await fetch(`/api/sucursales/${s.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !s.isActive }),
    });
    fetchSucursales();
  };

  // ── Find nearest branch ───────────────────────────────────────────────────
  const findNearest = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setDistances([]);
    try {
      const res  = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery + ", México")}&format=json&limit=1`,
        { headers: { "Accept-Language": "es" } }
      );
      const data = await res.json();
      if (!data[0]) {
        alert("No se encontró esa dirección. Intenta con más detalle.");
        return;
      }
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      setClientCoords({ lat, lng });

      const ranked = sucursales
        .filter((s) => s.latitude && s.longitude && s.isActive)
        .map((s) => ({
          sucursal: s,
          km: haversine(lat, lng, s.latitude!, s.longitude!),
        }))
        .sort((a, b) => a.km - b.km);

      setDistances(ranked);
    } catch {
      alert("Error al buscar la dirección.");
    } finally {
      setSearching(false);
    }
  };

  // ── Map helpers ───────────────────────────────────────────────────────────
  const sucursalesWithCoords = sucursales.filter((s) => s.latitude && s.longitude);

  const mapCenter: [number, number] =
    sucursalesWithCoords.length > 0
      ? [
          sucursalesWithCoords.reduce((a, s) => a + s.latitude!, 0) / sucursalesWithCoords.length,
          sucursalesWithCoords.reduce((a, s) => a + s.longitude!, 0) / sucursalesWithCoords.length,
        ]
      : [23.6345, -102.5528]; // centro de México

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold italic tracking-tight">Sucursales</h2>
          <p className="text-slate-400">Gestiona las sedes y visualízalas en el mapa.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex rounded-xl overflow-hidden border border-white/20">
            <button
              onClick={() => setView("cards")}
              className={`px-4 py-2 flex items-center gap-2 text-sm font-medium transition-colors ${
                view === "cards" ? "bg-white/20 text-white" : "text-slate-400 hover:bg-white/10"
              }`}
            >
              <Grid3X3 size={16} /> Lista
            </button>
            <button
              onClick={() => setView("map")}
              className={`px-4 py-2 flex items-center gap-2 text-sm font-medium transition-colors ${
                view === "map" ? "bg-white/20 text-white" : "text-slate-400 hover:bg-white/10"
              }`}
            >
              <Map size={16} /> Mapa
            </button>
          </div>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus size={20} /> Nueva Sucursal
          </button>
        </div>
      </header>

      {/* ── Cards view ── */}
      {view === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="glass-card h-52 rounded-3xl animate-pulse" />
            ))
          ) : sucursales.length === 0 ? (
            <div className="col-span-full py-20 text-center glass-card rounded-3xl space-y-3">
              <Building2 size={48} className="mx-auto text-slate-600" />
              <p className="text-slate-400">No hay sucursales registradas.</p>
              <button onClick={openCreate} className="btn-primary mx-auto flex items-center gap-2 w-fit">
                <Plus size={18} /> Agregar primera sucursal
              </button>
            </div>
          ) : (
            sucursales.map((s) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className={`glass-card rounded-3xl p-6 space-y-4 border ${
                  s.isActive ? "border-white/10" : "border-slate-700/40 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-gold-500/20 flex items-center justify-center">
                      <Building2 size={20} className="text-brand-gold-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-tight">{s.nombre}</h3>
                      <span className="text-xs font-mono bg-white/10 px-2 py-0.5 rounded-full text-slate-300">
                        {s.codigo}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(s)}
                      className="p-2 rounded-xl hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleToggleActive(s)}
                      className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                    >
                      {s.isActive
                        ? <ToggleRight size={20} className="text-green-400" />
                        : <ToggleLeft  size={20} className="text-slate-500" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-sm text-slate-400">
                  {s.direccion && (
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="shrink-0" />
                      <span className="truncate">{s.direccion}</span>
                    </div>
                  )}
                  {(s.ciudad || s.estado) && (
                    <div className="flex items-center gap-2 pl-5">
                      <span>{[s.ciudad, s.estado].filter(Boolean).join(", ")}</span>
                    </div>
                  )}
                  {s.telefono && (
                    <div className="flex items-center gap-2">
                      <Phone size={14} /> <span>{s.telefono}</span>
                    </div>
                  )}
                  {s.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={14} /> <span>{s.email}</span>
                    </div>
                  )}
                  {s.latitude && s.longitude ? (
                    <div className="flex items-center gap-2 text-xs text-green-500/70">
                      <Navigation size={12} />
                      <span>{s.latitude.toFixed(5)}, {s.longitude.toFixed(5)}</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => openEdit(s)}
                      className="flex items-center gap-1.5 text-xs text-brand-gold-500/70 hover:text-brand-gold-500 transition-colors"
                    >
                      <Navigation size={12} /> Sin coordenadas — agregar
                    </button>
                  )}
                </div>

                {s._count && (
                  <div className="flex gap-3 pt-2 border-t border-white/10 text-xs text-slate-400">
                    <span>{s._count.users} usuarios</span>
                    <span>·</span>
                    <span>{s._count.serviceOrders} órdenes</span>
                    <span>·</span>
                    <span>{s._count.drivers} conductores</span>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* ── Map view ── */}
      {view === "map" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Mapa Leaflet */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-3xl overflow-hidden" style={{ height: 520 }}>
              {sucursalesWithCoords.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4 p-8 text-center">
                  <MapPin size={40} />
                  <p className="text-sm">Ninguna sucursal tiene coordenadas todavía.</p>
                  <p className="text-xs text-slate-600">
                    Ve a la vista Lista, edita una sucursal y presiona "Geocodificar dirección".
                  </p>
                  <button onClick={() => setView("cards")} className="btn-primary text-sm">
                    Ir a Lista
                  </button>
                </div>
              ) : leafletReady && L ? (
                <MapContainer
                  center={mapCenter}
                  zoom={sucursalesWithCoords.length === 1 ? 13 : 6}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {/* Branch markers */}
                  {sucursalesWithCoords.map((s, i) => (
                    <Marker key={s.id} position={[s.latitude!, s.longitude!]}>
                      <Popup>
                        <div style={{ minWidth: 160 }}>
                          <p style={{ fontWeight: "bold", marginBottom: 2 }}>{s.nombre}</p>
                          <p style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>{s.codigo}</p>
                          {s.direccion && <p style={{ fontSize: 12 }}>{s.direccion}</p>}
                          {(s.ciudad || s.estado) && (
                            <p style={{ fontSize: 12 }}>{[s.ciudad, s.estado].filter(Boolean).join(", ")}</p>
                          )}
                          {s.telefono && <p style={{ fontSize: 12, marginTop: 4 }}>📞 {s.telefono}</p>}
                          {s._count && (
                            <p style={{ fontSize: 11, color: "#888", marginTop: 6 }}>
                              {s._count.serviceOrders} órdenes · {s._count.drivers} conductores
                            </p>
                          )}
                          {distances.find((d) => d.sucursal.id === s.id) && (
                            <p style={{ fontSize: 12, color: "#16a34a", marginTop: 4, fontWeight: "bold" }}>
                              {(() => {
                                const km = distances.find((d) => d.sucursal.id === s.id)!.km;
                                return km < 1 ? `${(km * 1000).toFixed(0)} m del cliente` : `${km.toFixed(1)} km del cliente`;
                              })()}
                            </p>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  {/* Client location (red dot) */}
                  {clientCoords && (
                    <Marker
                      position={[clientCoords.lat, clientCoords.lng]}
                      icon={L.divIcon({
                        className: "",
                        html: `<div style="background:#ef4444;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.5)"></div>`,
                        iconSize: [20, 20],
                        iconAnchor: [10, 10],
                      })}
                    >
                      <Popup>
                        <p style={{ fontWeight: "bold", fontSize: 12 }}>Ubicación del cliente</p>
                      </Popup>
                    </Marker>
                  )}

                  {/* Dashed line to nearest branch */}
                  {clientCoords && distances[0]?.sucursal.latitude && (
                    <Polyline
                      positions={[
                        [clientCoords.lat, clientCoords.lng],
                        [distances[0].sucursal.latitude!, distances[0].sucursal.longitude!],
                      ]}
                      color="#22c55e"
                      weight={2}
                      dashArray="6,10"
                    />
                  )}
                </MapContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="animate-spin text-brand-gold-500" size={32} />
                </div>
              )}
            </div>
          </div>

          {/* Right panel */}
          <div className="space-y-4">

            {/* Nearest branch finder */}
            <div className="glass-card rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Route size={18} className="text-brand-gold-500" />
                <h3 className="font-bold">Sucursal más cercana</h3>
              </div>
              <p className="text-xs text-slate-500">
                Ingresa la dirección del cliente o punto de recolección.
                La sucursal más cercana (en línea recta) aparecerá primero.
              </p>
              <div className="flex gap-2">
                <input
                  className="input-field flex-1 text-sm"
                  placeholder="Av. Insurgentes 123, CDMX"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && findNearest()}
                />
                <button
                  onClick={findNearest}
                  disabled={searching || !searchQuery.trim()}
                  className="p-2.5 rounded-xl bg-brand-gold-500/20 hover:bg-brand-gold-500/30 text-brand-gold-500 transition-colors disabled:opacity-40"
                >
                  {searching
                    ? <Loader2 size={18} className="animate-spin" />
                    : <Search size={18} />}
                </button>
              </div>

              {distances.length > 0 && (
                <div className="space-y-2">
                  {distances.map(({ sucursal: s, km }, i) => (
                    <div
                      key={s.id}
                      className={`flex items-center gap-3 p-3 rounded-2xl transition-colors ${
                        i === 0
                          ? "bg-green-500/10 border border-green-500/20"
                          : "bg-white/5 border border-white/5"
                      }`}
                    >
                      <span className={`text-xs font-bold w-5 text-center shrink-0 ${
                        i === 0 ? "text-green-400" : "text-slate-500"
                      }`}>
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{s.nombre}</p>
                        <p className="text-xs text-slate-500 truncate">
                          {[s.ciudad, s.estado].filter(Boolean).join(", ") || "Sin ciudad"}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-sm font-bold ${i === 0 ? "text-green-400" : "text-slate-300"}`}>
                          {km < 1 ? `${(km * 1000).toFixed(0)} m` : `${km.toFixed(1)} km`}
                        </p>
                        {i === 0 && (
                          <p className="text-[10px] text-green-500">Más cercana</p>
                        )}
                      </div>
                    </div>
                  ))}
                  <p className="text-[10px] text-slate-600 text-center pt-1">
                    Distancia en línea recta · La ruta real puede variar
                  </p>
                </div>
              )}

              {distances.length === 0 && sucursalesWithCoords.length === 0 && (
                <p className="text-xs text-slate-600 text-center py-2">
                  Agrega coordenadas a tus sucursales para usar esta función.
                </p>
              )}
            </div>

            {/* Branches mini list */}
            <div className="glass-card rounded-3xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Sedes activas
              </h3>
              {sucursales.filter((s) => s.isActive).length === 0 && (
                <p className="text-xs text-slate-600">Sin sucursales activas.</p>
              )}
              {sucursales.filter((s) => s.isActive).map((s) => (
                <div key={s.id} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    s.latitude ? "bg-green-400" : "bg-slate-600"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{s.nombre}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {s.ciudad ?? "Sin ciudad"}
                    </p>
                  </div>
                  {!s.latitude && (
                    <button
                      onClick={() => { setView("cards"); openEdit(s); }}
                      className="text-[10px] text-brand-gold-500 hover:underline shrink-0"
                    >
                      + coords
                    </button>
                  )}
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* ── Modal: Create / Edit ── */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card rounded-3xl p-8 w-full max-w-2xl space-y-6 max-h-[92vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold italic">
                  {editing ? "Editar Sucursal" : "Nueva Sucursal"}
                </h3>
                <button onClick={() => setModalOpen(false)} className="p-2 rounded-xl hover:bg-white/10">
                  <X size={20} />
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 rounded-xl p-3">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs text-slate-400 mb-1">Nombre *</label>
                  <input
                    className="input-field w-full"
                    placeholder="Ej: Sucursal Norte"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Código *</label>
                  <input
                    className="input-field w-full uppercase"
                    placeholder="CDMX-01"
                    value={form.codigo}
                    onChange={(e) => setForm({ ...form, codigo: e.target.value.toUpperCase() })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Teléfono</label>
                  <input
                    className="input-field w-full"
                    placeholder="55 1234 5678"
                    value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Ciudad</label>
                  <input
                    className="input-field w-full"
                    placeholder="Guadalajara"
                    value={form.ciudad}
                    onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Estado</label>
                  <input
                    className="input-field w-full"
                    placeholder="Jalisco"
                    value={form.estado}
                    onChange={(e) => setForm({ ...form, estado: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-slate-400 mb-1">Dirección completa</label>
                  <input
                    className="input-field w-full"
                    placeholder="Av. Principal #123, Col. Centro"
                    value={form.direccion}
                    onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-slate-400 mb-1">Email</label>
                  <input
                    className="input-field w-full"
                    type="email"
                    placeholder="sucursal@empresa.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>

                {/* Location picker section */}
                <div className="col-span-2 border-t border-white/10 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
                      <Navigation size={13} className="text-brand-gold-500" />
                      Ubicación en el mapa
                    </label>
                    <button
                      onClick={geocodeForm}
                      disabled={geocoding || (!form.direccion && !form.ciudad)}
                      className="flex items-center gap-1.5 text-xs text-brand-gold-500 hover:text-brand-gold-400 disabled:opacity-40 transition-colors font-bold"
                    >
                      {geocoding
                        ? <Loader2 size={12} className="animate-spin" />
                        : <Search size={12} />}
                      {geocoding ? "Buscando..." : "Buscar por dirección"}
                    </button>
                  </div>

                  {/* Interactive map */}
                  <div className="relative rounded-2xl overflow-hidden border border-white/10" style={{ isolation: "isolate" }}>
                    <LocationPickerMap
                      lat={form.latitude}
                      lng={form.longitude}
                      flyTrigger={flyTrigger}
                      height={260}
                      onLocationChange={(lat, lng) =>
                        setForm((f) => ({
                          ...f,
                          latitude: lat.toFixed(6),
                          longitude: lng.toFixed(6),
                        }))
                      }
                    />
                    {/* Overlay hint when no pin set */}
                    {!form.latitude && !form.longitude && (
                      <div className="absolute inset-0 flex items-end justify-center pb-4 pointer-events-none">
                        <div className="bg-black/75 backdrop-blur-sm rounded-2xl px-4 py-2.5 text-center">
                          <p className="text-xs text-slate-200 font-bold">Haz clic en el mapa para colocar el pin</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">o busca la dirección con el botón de arriba</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Coords display / clear */}
                  {form.latitude && form.longitude ? (
                    <div className="flex items-center gap-2 text-xs bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2">
                      <Navigation size={12} className="text-green-400 shrink-0" />
                      <span className="font-mono text-green-300">
                        {parseFloat(form.latitude).toFixed(5)}, {parseFloat(form.longitude).toFixed(5)}
                      </span>
                      <button
                        onClick={() => setForm((f) => ({ ...f, latitude: "", longitude: "" }))}
                        className="ml-auto text-slate-500 hover:text-red-400 transition-colors"
                        title="Borrar coordenadas"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-600">
                      Sin coordenadas · La sucursal no aparecerá en el mapa de rutas.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl border border-white/20 text-slate-300 hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  {saving
                    ? <span className="animate-pulse">Guardando...</span>
                    : <><CheckCircle size={18} /> {editing ? "Guardar cambios" : "Crear sucursal"}</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
