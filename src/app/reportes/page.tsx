"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart2, Flame, TrendingUp, Users2, Filter, Download,
  RefreshCcw, ChevronDown, Calendar, Building2, Loader2,
  CheckCircle2, Clock, Truck, Package, FileText,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Sucursal { id: string; nombre: string; codigo: string; }
interface Horno    { id: string; nombre: string; codigo: string; }
interface Vendedor { id: string; name: string; level: string; }

type ReportType = "servicios" | "ingresos" | "cremaciones" | "comisiones";

const REPORT_TABS: { id: ReportType; label: string; icon: React.ElementType; color: string }[] = [
  { id: "servicios",   label: "Servicios",       icon: BarChart2,  color: "text-brand-gold-500" },
  { id: "ingresos",    label: "Ingresos",         icon: TrendingUp, color: "text-green-400"      },
  { id: "cremaciones", label: "Cremaciones",      icon: Flame,      color: "text-orange-400"     },
  { id: "comisiones",  label: "Comisiones",       icon: Users2,     color: "text-purple-400"     },
];

const STATUS_LABELS: Record<string, string> = {
  PENDING_PICKUP:     "Pendiente recolección",
  IN_TRANSIT:         "En tránsito",
  AT_CREMATORY:       "En crematorio",
  CREMATING:          "En cremación",
  READY_FOR_DELIVERY: "Listo para entrega",
  DELIVERED:          "Entregado",
  COMPLETED:          "Completado",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING_PICKUP:     "bg-amber-500/20 text-amber-400",
  IN_TRANSIT:         "bg-blue-500/20 text-blue-400",
  AT_CREMATORY:       "bg-orange-500/20 text-orange-400",
  CREMATING:          "bg-red-500/20 text-red-400",
  READY_FOR_DELIVERY: "bg-emerald-500/20 text-emerald-400",
  DELIVERED:          "bg-sky-500/20 text-sky-400",
  COMPLETED:          "bg-slate-500/20 text-slate-400",
};

function fmt$(n: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", { dateStyle: "short" });
}

function duracion(inicio: string, fin?: string | null) {
  const ms = new Date(fin ?? new Date()).getTime() - new Date(inicio).getTime();
  const h  = Math.floor(ms / 3600000);
  const m  = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// ─── CSV export ───────────────────────────────────────────────────────────────

function exportCSV(rows: Record<string, unknown>[], filename: string) {
  if (!rows.length) return;
  const keys   = Object.keys(rows[0]);
  const header = keys.join(",");
  const body   = rows.map((r) =>
    keys.map((k) => {
      const v = r[k];
      const s = v == null ? "" : String(v).replace(/"/g, '""');
      return `"${s}"`;
    }).join(",")
  ).join("\n");
  const blob = new Blob(["\uFEFF" + header + "\n" + body], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────

function DateRangeFilter({ from, to, onChange }: {
  from: string; to: string;
  onChange: (f: string, t: string) => void;
}) {
  const presets = [
    { label: "Hoy",       days: 0  },
    { label: "7 días",    days: 7  },
    { label: "30 días",   days: 30 },
    { label: "3 meses",   days: 90 },
    { label: "Este año",  days: 365 },
  ];
  const apply = (days: number) => {
    const t = new Date();
    const f = new Date(t.getTime() - days * 86400000);
    onChange(f.toISOString().slice(0, 10), t.toISOString().slice(0, 10));
  };
  return (
    <div className="flex flex-wrap items-center gap-2">
      {presets.map((p) => (
        <button key={p.label} onClick={() => apply(p.days)}
          className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors">
          {p.label}
        </button>
      ))}
      <div className="flex items-center gap-2 ml-2">
        <Calendar size={14} className="text-slate-500" />
        <input type="date" value={from} onChange={(e) => onChange(e.target.value, to)}
          className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white" />
        <span className="text-slate-600">—</span>
        <input type="date" value={to} onChange={(e) => onChange(from, e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white" />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReportesPage() {
  const [tab,        setTab]        = useState<ReportType>("servicios");
  const [loading,    setLoading]    = useState(false);
  const [data,       setData]       = useState<any>(null);

  // Shared filters
  const today = new Date().toISOString().slice(0, 10);
  const month = new Date(new Date().setDate(1)).toISOString().slice(0, 10);
  const [from, setFrom] = useState(month);
  const [to,   setTo]   = useState(today);

  // Catalogs
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [hornos,     setHornos]     = useState<Horno[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);

  // Per-tab filters
  const [sucursalId,   setSucursalId]   = useState("");
  const [status,       setStatus]       = useState("");
  const [serviceType,  setServiceType]  = useState("");
  const [hornoId,      setHornoId]      = useState("");
  const [salespersonId,setSalespersonId]= useState("");

  // Load catalogs once
  useEffect(() => {
    fetch("/api/sucursales").then(r => r.ok ? r.json() : []).then(setSucursales).catch(() => {});
    fetch("/api/hornos").then(r => r.ok ? r.json() : []).then(setHornos).catch(() => {});
    fetch("/api/vendedores").then(r => r.ok ? r.json() : []).then(setVendedores).catch(() => {});
  }, []);

  const loadReport = useCallback(async () => {
    setLoading(true);
    setData(null);
    try {
      const params = new URLSearchParams({ tipo: tab, from, to });
      if (sucursalId)    params.set("sucursalId",    sucursalId);
      if (status)        params.set("status",        status);
      if (serviceType)   params.set("serviceType",   serviceType);
      if (hornoId)       params.set("hornoId",       hornoId);
      if (salespersonId) params.set("salespersonId", salespersonId);
      const res = await fetch(`/api/reportes?${params}`);
      if (res.ok) setData(await res.json());
    } finally { setLoading(false); }
  }, [tab, from, to, sucursalId, status, serviceType, hornoId, salespersonId]);

  // Auto-load on tab/filter change
  useEffect(() => { loadReport(); }, [loadReport]);

  // Reset per-tab filters when tab changes
  useEffect(() => {
    setStatus("");
    setServiceType("");
    setHornoId("");
    setSalespersonId("");
  }, [tab]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">

      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <span className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1 block">Análisis</span>
          <h2 className="text-4xl font-black tracking-tighter aura-gradient bg-clip-text text-transparent">
            Reportes
          </h2>
          <p className="text-slate-500 text-sm mt-1">Analiza el desempeño por período, sucursal y categoría.</p>
        </div>
        <button onClick={loadReport} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 text-xs font-bold uppercase tracking-widest">
          <RefreshCcw size={14} className={loading ? "animate-spin" : ""} /> Actualizar
        </button>
      </header>

      {/* Report type tabs */}
      <div className="flex gap-1 bg-white/5 rounded-2xl p-1 border border-white/10 w-fit flex-wrap">
        {REPORT_TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              tab === t.id ? "bg-white/15 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}>
            <t.icon size={15} className={tab === t.id ? t.color : ""} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
          <Filter size={13} /> Filtros
        </div>
        <DateRangeFilter from={from} to={to} onChange={(f, t) => { setFrom(f); setTo(t); }} />
        <div className="flex flex-wrap gap-3">
          {/* Sucursal filter (all tabs) */}
          <select value={sucursalId} onChange={e => setSucursalId(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white min-w-[160px]">
            <option value="">Todas las sucursales</option>
            {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>

          {/* Servicios filters */}
          {tab === "servicios" && <>
            <select value={status} onChange={e => setStatus(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white">
              <option value="">Todos los estados</option>
              {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select value={serviceType} onChange={e => setServiceType(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white">
              <option value="">Todos los tipos</option>
              <option value="IMMEDIATE">Cremación Inmediata</option>
              <option value="PREVISION">Previsión Activada</option>
            </select>
          </>}

          {/* Cremaciones filters */}
          {tab === "cremaciones" && (
            <select value={hornoId} onChange={e => setHornoId(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white">
              <option value="">Todos los hornos</option>
              {hornos.map(h => <option key={h.id} value={h.id}>{h.nombre} ({h.codigo})</option>)}
            </select>
          )}

          {/* Comisiones filters */}
          {tab === "comisiones" && (
            <select value={salespersonId} onChange={e => setSalespersonId(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white min-w-[180px]">
              <option value="">Todos los vendedores</option>
              {vendedores.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-brand-gold-500" size={36} />
        </div>
      )}

      {/* ── SERVICIOS ── */}
      {!loading && data && tab === "servicios" && (
        <div className="space-y-6">
          {/* KPI row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total órdenes",  value: data.total,                       color: "text-white" },
              { label: "Ingresos",       value: fmt$(data.totalRevenue ?? 0),      color: "text-green-400" },
              { label: "Completados",    value: data.byStatus?.COMPLETED ?? 0,    color: "text-emerald-400" },
              { label: "En proceso",     value: (data.total ?? 0) - (data.byStatus?.COMPLETED ?? 0), color: "text-brand-gold-500" },
            ].map(s => (
              <div key={s.label} className="glass-card rounded-2xl p-4 text-center">
                <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* By status breakdown */}
          {data.byStatus && Object.keys(data.byStatus).length > 0 && (
            <div className="glass-card rounded-2xl p-5 space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Por estado</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(data.byStatus as Record<string, number>).map(([k, v]) => (
                  <div key={k} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border ${STATUS_COLORS[k] ?? "bg-white/5 text-slate-400 border-white/10"}`}>
                    <span>{STATUS_LABELS[k] ?? k}</span>
                    <span className="bg-white/10 px-1.5 py-0.5 rounded-full">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Export + table */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <p className="text-sm font-bold">{data.orders?.length ?? 0} órdenes</p>
              <button onClick={() => exportCSV(
                (data.orders ?? []).map((o: any) => ({
                  Folio: o.folio, Estado: STATUS_LABELS[o.status] ?? o.status,
                  Tipo: o.serviceType, Mascota: o.pet?.name, Dueño: o.owner?.name,
                  Sucursal: o.sucursal?.nombre, Total: o.totalCost,
                  Certificado: o.sesionCremacion?.numeroCertificado ?? "",
                  Fecha: fmtDate(o.createdAt),
                })), `servicios_${from}_${to}.csv`)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-400 hover:text-white border border-white/10">
                <Download size={13} /> Exportar CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-slate-500 uppercase tracking-widest">
                    <th className="text-left px-5 py-3">Folio</th>
                    <th className="text-left px-3 py-3">Mascota</th>
                    <th className="text-left px-3 py-3">Dueño</th>
                    <th className="text-left px-3 py-3">Estado</th>
                    <th className="text-left px-3 py-3">Tipo</th>
                    <th className="text-left px-3 py-3">Sucursal</th>
                    <th className="text-right px-5 py-3">Total</th>
                    <th className="text-left px-3 py-3">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.orders ?? []).map((o: any) => (
                    <tr key={o.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3 font-mono font-bold text-brand-gold-500">{o.folio}</td>
                      <td className="px-3 py-3">{o.pet?.name ?? "—"}</td>
                      <td className="px-3 py-3 text-slate-400">{o.owner?.name ?? "—"}</td>
                      <td className="px-3 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[o.status] ?? ""}`}>
                          {STATUS_LABELS[o.status] ?? o.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-400">{o.serviceType === "IMMEDIATE" ? "Inmediata" : "Previsión"}</td>
                      <td className="px-3 py-3 text-slate-400">{o.sucursal?.nombre ?? "—"}</td>
                      <td className="px-5 py-3 text-right font-bold text-green-400">{fmt$(Number(o.totalCost) || 0)}</td>
                      <td className="px-3 py-3 text-slate-400">{fmtDate(o.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(data.orders ?? []).length === 0 && (
                <div className="py-12 text-center text-slate-500 text-sm">Sin resultados para este período.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── INGRESOS ── */}
      {!loading && data && tab === "ingresos" && (
        <div className="space-y-6">
          {/* KPI */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total ingresos",   value: fmt$(data.total          ?? 0), color: "text-green-400" },
              { label: "Servicios",        value: fmt$(data.totalServicios ?? 0), color: "text-brand-gold-500" },
              { label: "Previsión cobrada",value: fmt$(data.totalPrevision ?? 0), color: "text-purple-400" },
            ].map(s => (
              <div key={s.label} className="glass-card rounded-2xl p-5 text-center">
                <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          {(data.monthlyData ?? []).length > 0 && (
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">Ingresos por mes</p>
                <button onClick={() => exportCSV(data.monthlyData ?? [], `ingresos_${from}_${to}.csv`)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-400 hover:text-white border border-white/10">
                  <Download size={13} /> Exportar CSV
                </button>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={data.monthlyData}>
                  <defs>
                    <linearGradient id="gServ" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#c5a059" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#c5a059" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gPrev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#a78bfa" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} />
                  <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}k`} tick={{ fill: "#64748b", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }}
                    formatter={(v: number) => fmt$(v)}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="servicios" name="Servicios" stroke="#c5a059" fill="url(#gServ)" strokeWidth={2} />
                  <Area type="monotone" dataKey="prevision" name="Previsión" stroke="#a78bfa" fill="url(#gPrev)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {(data.monthlyData ?? []).length === 0 && (
            <div className="glass-card rounded-2xl py-16 text-center text-slate-500 text-sm">
              Sin datos de ingresos en este período.
            </div>
          )}
        </div>
      )}

      {/* ── CREMACIONES ── */}
      {!loading && data && tab === "cremaciones" && (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total sesiones",   value: data.total       ?? 0, color: "text-white" },
              { label: "Completadas",      value: data.completadas ?? 0, color: "text-emerald-400" },
              { label: "En curso",         value: data.enCurso     ?? 0, color: "text-orange-400" },
              { label: "Duración promedio",value: `${data.avgMinutes ?? 0} min`, color: "text-brand-gold-500" },
            ].map(s => (
              <div key={s.label} className="glass-card rounded-2xl p-4 text-center">
                <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* By horno chart */}
          {data.byHorno && Object.keys(data.byHorno).length > 0 && (
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <p className="text-sm font-bold">Sesiones por horno</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={Object.entries(data.byHorno as Record<string, number>).map(([n, v]) => ({ name: n, sesiones: v }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="sesiones" name="Sesiones" fill="#f97316" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Table */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <p className="text-sm font-bold">{data.sesiones?.length ?? 0} sesiones</p>
              <button onClick={() => exportCSV(
                (data.sesiones ?? []).map((s: any) => ({
                  Certificado: s.numeroCertificado,
                  Horno: s.horno?.nombre,
                  Sucursal: s.horno?.sucursal?.nombre ?? "—",
                  Mascota: s.serviceOrder?.pet?.name,
                  Especie: s.serviceOrder?.pet?.species,
                  Dueño: s.serviceOrder?.owner?.name,
                  Operador: s.operadorNombre,
                  Inicio: fmtDate(s.fechaInicio),
                  Fin: s.fechaFin ? fmtDate(s.fechaFin) : "En curso",
                  Duración: s.fechaFin ? duracion(s.fechaInicio, s.fechaFin) : "—",
                })), `cremaciones_${from}_${to}.csv`)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-400 hover:text-white border border-white/10">
                <Download size={13} /> Exportar CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-slate-500 uppercase tracking-widest">
                    <th className="text-left px-5 py-3">Certificado</th>
                    <th className="text-left px-3 py-3">Mascota</th>
                    <th className="text-left px-3 py-3">Horno</th>
                    <th className="text-left px-3 py-3">Operador</th>
                    <th className="text-left px-3 py-3">Inicio</th>
                    <th className="text-left px-3 py-3">Fin</th>
                    <th className="text-right px-5 py-3">Duración</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.sesiones ?? []).map((s: any) => (
                    <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3 font-mono font-bold text-orange-400">{s.numeroCertificado}</td>
                      <td className="px-3 py-3 font-medium">
                        {s.serviceOrder?.pet?.name ?? "—"}
                        <span className="text-slate-500 ml-1">{s.serviceOrder?.pet?.species}</span>
                      </td>
                      <td className="px-3 py-3 text-slate-400">{s.horno?.nombre}</td>
                      <td className="px-3 py-3 text-slate-400">{s.operadorNombre}</td>
                      <td className="px-3 py-3 text-slate-400">{fmtDate(s.fechaInicio)}</td>
                      <td className="px-3 py-3">
                        {s.fechaFin
                          ? <span className="text-emerald-400">{fmtDate(s.fechaFin)}</span>
                          : <span className="text-orange-400 animate-pulse">En curso</span>}
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-brand-gold-500">
                        {s.fechaFin ? duracion(s.fechaInicio, s.fechaFin) : duracion(s.fechaInicio)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(data.sesiones ?? []).length === 0 && (
                <div className="py-12 text-center text-slate-500 text-sm">Sin cremaciones en este período.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── COMISIONES ── */}
      {!loading && data && tab === "comisiones" && (
        <div className="space-y-6">
          {/* Totales */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Total vendido",        value: fmt$(data.grandTotal    ?? 0), color: "text-brand-gold-500" },
              { label: "Comisiones por pagar", value: fmt$(data.grandComision ?? 0), color: "text-purple-400" },
            ].map(s => (
              <div key={s.label} className="glass-card rounded-2xl p-5 text-center">
                <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Per-vendedor cards */}
          {(data.vendedores ?? []).length === 0 ? (
            <div className="glass-card rounded-2xl py-16 text-center text-slate-500 text-sm">
              Sin contratos en este período.
            </div>
          ) : (data.vendedores ?? []).map((v: any) => (
            <div key={v.id} className="glass-card rounded-2xl overflow-hidden">
              {/* Card header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 font-black">
                    {v.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold">{v.name}</p>
                    <p className="text-xs text-slate-500">
                      {v.level} · {(v.commissionRate * 100).toFixed(0)}% comisión
                      {v.sucursal && <span className="ml-2 text-purple-400">{v.sucursal.nombre}</span>}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">{v.totalContracts} contratos</p>
                  <p className="font-bold text-purple-400">{fmt$(v.comision)}</p>
                </div>
              </div>

              {/* Summary row */}
              <div className="grid grid-cols-3 gap-px bg-white/5">
                {[
                  { label: "Vendido",  value: fmt$(v.totalVenta),   color: "text-brand-gold-500" },
                  { label: "Cobrado",  value: fmt$(v.totalCobrado), color: "text-green-400" },
                  { label: "Comisión", value: fmt$(v.comision),     color: "text-purple-400" },
                ].map(s => (
                  <div key={s.label} className="bg-black/20 px-4 py-3 text-center">
                    <p className={`font-black text-lg ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Contracts table */}
              {v.contracts.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/5 text-slate-500 uppercase tracking-widest">
                        <th className="text-left px-5 py-2">Cliente</th>
                        <th className="text-left px-3 py-2">Plan</th>
                        <th className="text-left px-3 py-2">Estado</th>
                        <th className="text-right px-3 py-2">Precio plan</th>
                        <th className="text-right px-5 py-2">Cobrado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {v.contracts.map((c: any) => (
                        <tr key={c.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="px-5 py-2">{c.ownerName ?? "—"}</td>
                          <td className="px-3 py-2 text-slate-400">{c.planName ?? "—"}</td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              c.status === "COMPLETED" ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"
                            }`}>{c.status}</span>
                          </td>
                          <td className="px-3 py-2 text-right text-brand-gold-500">{fmt$(c.planPrice)}</td>
                          <td className="px-5 py-2 text-right text-green-400">{fmt$(c.cobrado)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Export */}
              <div className="px-5 py-3 border-t border-white/5">
                <button onClick={() => exportCSV(v.contracts.map((c: any) => ({
                  Vendedor: v.name, Cliente: c.ownerName, Plan: c.planName,
                  "Precio plan": c.planPrice, Cobrado: c.cobrado,
                  "Comisión (est)": (c.planPrice * v.commissionRate).toFixed(2),
                  Estado: c.status, Fecha: fmtDate(c.startDate),
                })), `comisiones_${v.name}_${from}_${to}.csv`)}
                  className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors">
                  <Download size={12} /> Exportar contratos de {v.name}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
