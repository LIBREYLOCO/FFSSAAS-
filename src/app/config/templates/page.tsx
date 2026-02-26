"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, Eye, FileText, Settings, X, Save, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentTemplate, setCurrentTemplate] = useState<any>(null);

    const [formData, setFormData] = useState({
        name: "",
        category: "PREVISION",
        content: ""
    });

    const categories = ["PREVISION", "INMEDIATO", "INVENTARIO", "ANEXO"];

    const availableVariables = [
        { key: "{{CLIENTE_NOMBRE}}", desc: "Nombre completo del titular" },
        { key: "{{CLIENTE_DIRECCION}}", desc: "Dirección del titular" },
        { key: "{{PLAN_NOMBRE}}", desc: "Nombre del plan/servicio" },
        { key: "{{PLAN_PRECIO}}", desc: "Precio total (formateado)" },
        { key: "{{FECHA_ACTUAL}}", desc: "Fecha de generación (DD/MM/YYYY)" },
        { key: "{{EMPRESA_NOMBRE}}", desc: "Razón Social" },
        { key: "{{REPRESENTANTE}}", desc: "Representante legal" }
    ];

    const loadTemplates = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/templates");
            const data = await res.json();
            setTemplates(data.filter((t: any) => t.isActive));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTemplates();
    }, []);

    const handleOpenEdit = (template?: any) => {
        if (template) {
            setCurrentTemplate(template);
            setFormData({
                name: template.name,
                category: template.category,
                content: template.content
            });
        } else {
            setCurrentTemplate(null);
            setFormData({
                name: "",
                category: "PREVISION",
                content: ""
            });
        }
        setIsEditing(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.content) return alert("El nombre y el contenido son obligatorios");

        try {
            const isUpdate = !!currentTemplate;
            const url = isUpdate ? `/api/templates/${currentTemplate.id}` : "/api/templates";
            const method = isUpdate ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setIsEditing(false);
                loadTemplates();
            } else {
                alert("Error al guardar plantilla");
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar esta plantilla? (Ya no aparecerá en nuevas ventas)")) return;

        try {
            const res = await fetch(`/api/templates/${id}`, { method: "DELETE" });
            if (res.ok) {
                loadTemplates();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const insertVariable = (variable: string) => {
        setFormData(prev => ({
            ...prev,
            content: prev.content + variable
        }));
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold italic tracking-tight flex items-center gap-3">
                        <FileText className="text-brand-gold-500" /> Plantillas de Contrato
                    </h2>
                    <p className="text-slate-400 mt-1">
                        Crea documentos dinámicos y formatos legales con auto-llenado.
                    </p>
                </div>
                <button
                    onClick={() => handleOpenEdit()}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={20} />
                    Nueva Plantilla
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-40 glass-card rounded-3xl animate-pulse" />)
                ) : templates.length === 0 ? (
                    <div className="col-span-full py-12 text-center glass-card rounded-3xl">
                        <p className="text-slate-500">No hay plantillas creadas. Crea una para usarla en Ventas.</p>
                    </div>
                ) : (
                    templates.map((template) => (
                        <div key={template.id} className="glass-card p-6 rounded-3xl group flex flex-col justify-between h-48">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <span className={cn(
                                        "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest",
                                        "bg-white/5 border border-white/10 text-brand-gold-500"
                                    )}>
                                        {template.category}
                                    </span>
                                </div>
                                <h3 className="font-bold text-lg line-clamp-2">{template.name}</h3>
                                <p className="text-xs text-slate-500 mt-2">
                                    Última modificación: {new Date(template.updatedAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleOpenEdit(template)}
                                    className="p-2 hover:bg-white/10 rounded-xl text-slate-300 transition-colors"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(template.id)}
                                    className="p-2 hover:bg-red-500/20 rounded-xl text-red-400 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <AnimatePresence>
                {isEditing && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="glass-card w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden rounded-[2rem]"
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/40">
                                <div>
                                    <h3 className="text-xl font-bold aura-gradient bg-clip-text text-transparent">
                                        {currentTemplate ? "Editar Plantilla" : "Nueva Plantilla Dinámica"}
                                    </h3>
                                </div>
                                <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-white/10 rounded-full text-slate-400">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex flex-1 overflow-hidden">
                                {/* Panel Izquierdo: Editor */}
                                <div className="flex-1 flex flex-col p-6 overflow-y-auto custom-scrollbar border-r border-white/10">
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Nombre de la Plantilla</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="Ej. Contrato de Previsión Estándar"
                                                className="aura-input w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Categoría / Uso</label>
                                            <select
                                                value={formData.category}
                                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                className="aura-input w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm appearance-none"
                                            >
                                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2 flex-1 flex flex-col">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex justify-between">
                                            <span>Contenido del Contrato (HTML Permitido)</span>
                                            <span className="text-brand-gold-500">Inserta variables con el panel derecho</span>
                                        </label>
                                        <textarea
                                            value={formData.content}
                                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                                            className="aura-input w-full flex-1 bg-black/40 border border-white/10 rounded-xl p-4 text-sm font-mono custom-scrollbar resize-none"
                                            placeholder="Escribe el cuerpo del contrato aquí. Puedes usar etiquetas HTML básicas como <b>texto</b>, <br>, <h1>, etc..."
                                        />
                                    </div>
                                </div>

                                {/* Panel Derecho: Variables */}
                                <div className="w-80 bg-black/20 p-6 overflow-y-auto custom-scrollbar flex flex-col">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-brand-gold-500 mb-4 flex items-center gap-2">
                                        <AlertCircle size={14} /> Variables Disponibles
                                    </h4>
                                    <p className="text-xs text-slate-400 mb-6">
                                        Haz clic en una variable para insertarla en el texto del contrato. El sistema la reemplazará en tiempo real.
                                    </p>

                                    <div className="space-y-3">
                                        {availableVariables.map(v => (
                                            <button
                                                key={v.key}
                                                onClick={() => insertVariable(v.key)}
                                                className="w-full text-left p-3 rounded-xl bg-white/5 border border-white/5 hover:border-brand-gold-500/50 hover:bg-brand-gold-500/10 transition-all group"
                                            >
                                                <div className="font-mono text-xs text-brand-gold-500 group-hover:font-bold">{v.key}</div>
                                                <div className="text-[10px] text-slate-400 mt-1">{v.desc}</div>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="mt-auto pt-6">
                                        <button
                                            onClick={handleSave}
                                            className="btn-primary w-full py-3 rounded-xl flex items-center justify-center gap-2 font-bold"
                                        >
                                            <Save size={18} /> Guardar Plantilla
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
