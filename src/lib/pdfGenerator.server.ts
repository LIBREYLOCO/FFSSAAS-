import path from "path";
import fs from "fs";

// ─── Helper: carga el logo desde public/logo.png como base64 ──────────────────
const loadLogoBase64 = (): string | null => {
    try {
        const logoPath = path.join(process.cwd(), "public", "logo.png");
        return fs.readFileSync(logoPath).toString("base64");
    } catch {
        return null;
    }
};

// ─── Helper: aplica encabezado AURA con logo en documentos ───────────────────
const applyAuraServerHeader = (doc: any, title: string, logoBase64: string | null) => {
    const pageWidth = doc.internal.pageSize.getWidth();

    // Fondo oscuro
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 46, "F");

    // Logo centrado
    if (logoBase64) {
        try {
            doc.addImage(`data:image/png;base64,${logoBase64}`, "PNG", pageWidth / 2 - 20, 3, 40, 30);
        } catch {
            doc.setTextColor(212, 175, 55);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(22);
            doc.text("AURA", pageWidth / 2, 22, { align: "center" });
        }
    } else {
        doc.setTextColor(212, 175, 55);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.text("AURA", pageWidth / 2, 22, { align: "center" });
    }

    // Título en blanco
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bolditalic");
    doc.text(title.toUpperCase(), pageWidth / 2, 40, { align: "center" });

    // Línea dorada
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.5);
    doc.line(20, 46, pageWidth - 20, 46);
};

// ─── Certificado de Cremación ────────────────────────────────────────────────

interface CertificateData {
    sesion: {
        numeroCertificado: string;
        operadorNombre: string;
        fechaInicio: string;
        fechaFin?: string | null;
        observaciones?: string | null;
    };
    horno: {
        nombre: string;
        codigo: string;
    };
    pet: {
        name: string;
        species: string;
        breed?: string | null;
        weightKg: number | string;
        deathDate?: string | null;
    };
    owner: {
        name: string;
        phone?: string | null;
    };
    serviceOrder: {
        folio: string;
    };
    empresa: {
        nombre: string;
        legalRepresentative?: string;
    };
}

/** Genera el PDF del certificado de cremación y retorna ArrayBuffer (compatible con servidor). */
export const generateCremationCertificate = async (data: CertificateData): Promise<ArrayBuffer> => {
    const { jsPDF } = await import("jspdf");

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginX = 20;
    const gold: [number, number, number] = [212, 175, 55];
    const dark: [number, number, number] = [30, 30, 30];
    const gray: [number, number, number] = [100, 100, 100];

    // ── Encabezado con logo ──────────────────────────────────────────────────
    const logoBase64 = loadLogoBase64();
    applyAuraServerHeader(doc, "Certificado de Cremación", logoBase64);

    // Subencabezado: empresa + número de certificado + fecha
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...gray);
    doc.text(data.empresa.nombre.toUpperCase(), marginX, 53);
    doc.text(`No. ${data.sesion.numeroCertificado}`, pageWidth / 2, 53, { align: "center" });
    doc.text(`Emisión: ${new Date().toLocaleDateString("es-MX")}`, pageWidth - marginX, 53, { align: "right" });

    // ── Sección: Datos de la mascota ────────────────────────────────────────
    let y = 63;
    const sectionLabel = (text: string, yPos: number) => {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...gold);
        doc.text(text.toUpperCase(), marginX, yPos);
        doc.setDrawColor(...gold);
        doc.setLineWidth(0.3);
        doc.line(marginX, yPos + 2, pageWidth - marginX, yPos + 2);
    };

    const field = (label: string, value: string, xPos: number, yPos: number) => {
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...dark);
        doc.text(label, xPos, yPos);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...gray);
        doc.text(value || "—", xPos + 35, yPos);
    };

    sectionLabel("Datos de la Mascota", y);
    y += 9;
    field("Nombre:", data.pet.name, marginX, y);
    field("Especie:", data.pet.species, pageWidth / 2, y);
    y += 7;
    field("Raza:", data.pet.breed || "No especificada", marginX, y);
    field("Peso:", `${data.pet.weightKg} kg`, pageWidth / 2, y);
    y += 7;
    field("Fecha de fallecimiento:", data.pet.deathDate
        ? new Date(data.pet.deathDate).toLocaleDateString("es-MX")
        : "No registrada", marginX, y);

    // ── Sección: Datos del propietario ──────────────────────────────────────
    y += 14;
    sectionLabel("Datos del Propietario", y);
    y += 9;
    field("Nombre:", data.owner.name, marginX, y);
    field("Teléfono:", data.owner.phone || "No registrado", pageWidth / 2, y);

    // ── Sección: Datos del proceso de cremación ─────────────────────────────
    y += 14;
    sectionLabel("Proceso de Cremación", y);
    y += 9;
    field("Horno:", `${data.horno.nombre} (${data.horno.codigo})`, marginX, y);
    field("Operador:", data.sesion.operadorNombre, pageWidth / 2, y);
    y += 7;
    field("Inicio:", new Date(data.sesion.fechaInicio).toLocaleString("es-MX"), marginX, y);
    field("Fin:", data.sesion.fechaFin
        ? new Date(data.sesion.fechaFin).toLocaleString("es-MX")
        : "En proceso", pageWidth / 2, y);
    if (data.sesion.observaciones) {
        y += 7;
        field("Observaciones:", data.sesion.observaciones, marginX, y);
    }

    // ── Declaración legal ───────────────────────────────────────────────────
    y += 18;
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...gray);
    const declaration = `El presente certificado acredita que los restos de la mascota referida fueron sometidos al proceso de cremación individual bajo los estándares de calidad y dignidad de ${data.empresa.nombre}. Este documento tiene validez como constancia del servicio prestado.`;
    const splitDecl = doc.splitTextToSize(declaration, pageWidth - marginX * 2);
    doc.text(splitDecl, marginX, y);

    // ── Firmas ──────────────────────────────────────────────────────────────
    const yFirmas = 230;
    doc.setDrawColor(...dark);
    doc.setLineWidth(0.3);

    doc.line(marginX, yFirmas, marginX + 70, yFirmas);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...dark);
    doc.text("OPERADOR / TÉCNICO", marginX + 5, yFirmas + 5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...gray);
    doc.text(data.sesion.operadorNombre, marginX + 5, yFirmas + 10);

    doc.line(pageWidth - marginX - 70, yFirmas, pageWidth - marginX, yFirmas);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...dark);
    doc.text("RESPONSABLE / SELLO", pageWidth - marginX - 60, yFirmas + 5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...gray);
    doc.text(data.empresa.legalRepresentative || data.empresa.nombre, pageWidth - marginX - 60, yFirmas + 10);

    // ── Footer ──────────────────────────────────────────────────────────────
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.3);
    doc.line(marginX, 260, pageWidth - marginX, 260);
    doc.setFontSize(7);
    doc.setTextColor(...gray);
    doc.text(`Folio de servicio: ${data.serviceOrder.folio}  ·  Certificado: ${data.sesion.numeroCertificado}  ·  ${data.empresa.nombre}`, pageWidth / 2, 265, { align: "center" });

    return doc.output("arraybuffer");
};
