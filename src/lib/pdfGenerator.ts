/** Genera el PDF del certificado de cremación (MOCK para el cliente - esto debería llamarse vía API) */
export const generateCremationCertificate = async (_data: any): Promise<ArrayBuffer> => {
    throw new Error("generateCremationCertificate is server-only. Use the API endpoint /api/sesiones-cremacion/[id]/certificado instead.");
};

// ─── Branding & Helpers ──────────────────────────────────────────────────────

const GOLD: [number, number, number] = [212, 175, 55];
const DARK: [number, number, number] = [15, 23, 42];
const GRAY: [number, number, number] = [100, 100, 100];
const LIGHT_GRAY: [number, number, number] = [245, 245, 245];

/** Helper: aplica un encabezado premium con logo a los PDFs del cliente */
const applyAuraClientHeader = async (doc: any, title: string) => {
    const pageWidth = doc.internal.pageSize.getWidth();

    // Fondo oscuro
    doc.setFillColor(...DARK);
    doc.rect(0, 0, pageWidth, 46, "F");

    // Logo
    try {
        const logoRes = await fetch("/logo.png");
        if (logoRes.ok) {
            const blob = await logoRes.blob();
            const logoBase64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
            });
            doc.addImage(logoBase64, "PNG", pageWidth / 2 - 20, 3, 40, 30);
        } else {
            throw new Error();
        }
    } catch {
        doc.setTextColor(...GOLD);
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
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.5);
    doc.line(20, 46, pageWidth - 20, 46);
};

// ─── Recibos de Mensualidades ─────────────────────────────────────────────────

interface InstallmentReceiptsData {
    owner: { name: string; phone?: string | null };
    plan: { name: string; price: number; installmentsCount: number };
    contract: { id: string; startDate: string; downPayment: number; installmentAmount: number };
    system: { legalName: string; contactPhone?: string | null };
}

export const generateInstallmentReceiptsPDF = async (data: InstallmentReceiptsData) => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginX = 20;
    const green: [number, number, number] = [34, 120, 60];

    const startDate = new Date(data.contract.startDate);

    for (let i = 0; i < data.plan.installmentsCount; i++) {
        if (i > 0) doc.addPage();

        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i + 1);

        await applyAuraClientHeader(doc, "Recibo de Mensualidad");

        // Receipt info
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...GRAY);
        doc.text(`Recibo ${i + 1} de ${data.plan.installmentsCount}`, marginX, 55);
        doc.text(`Contrato: ${data.contract.id.slice(0, 8).toUpperCase()}`, pageWidth - marginX, 55, { align: "right" });

        // Client section
        let y = 68;
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...GOLD);
        doc.text("DATOS DEL CLIENTE", marginX, y);
        doc.setDrawColor(...GOLD);
        doc.setLineWidth(0.3);
        doc.line(marginX, y + 2, pageWidth - marginX, y + 2);

        y += 10;
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 30, 30);
        doc.text("Nombre:", marginX, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...GRAY);
        doc.text(data.owner.name, marginX + 30, y);

        y += 7;
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 30, 30);
        doc.text("Plan:", marginX, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...GRAY);
        doc.text(data.plan.name, marginX + 30, y);

        if (data.owner.phone) {
            y += 7;
            doc.setFont("helvetica", "bold");
            doc.setTextColor(30, 30, 30);
            doc.text("Teléfono:", marginX, y);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(...GRAY);
            doc.text(data.owner.phone, marginX + 30, y);
        }

        // Payment detail section
        y += 18;
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...GOLD);
        doc.text("DETALLE DEL PAGO", marginX, y);
        doc.setDrawColor(...GOLD);
        doc.setLineWidth(0.3);
        doc.line(marginX, y + 2, pageWidth - marginX, y + 2);

        y += 12;
        // Amount box
        doc.setFillColor(240, 248, 240);
        doc.roundedRect(marginX, y - 4, pageWidth - marginX * 2, 24, 3, 3, "F");

        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 30, 30);
        doc.text("Monto a Pagar:", marginX + 5, y + 6);

        doc.setFontSize(16);
        doc.setTextColor(...green);
        doc.text(
            `$${Number(data.contract.installmentAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })} MXN`,
            pageWidth - marginX - 5, y + 8, { align: "right" }
        );

        y += 32;
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 30, 30);
        doc.text("Fecha de Vencimiento:", marginX, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...GRAY);
        doc.text(
            dueDate.toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" }),
            marginX + 58, y
        );

        y += 7;
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 30, 30);
        doc.text("Fecha de Pago:", marginX, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...GRAY);
        doc.text("___________________________", marginX + 40, y);

        // Signature lines
        const yFirma = 210;
        doc.setDrawColor(30, 30, 30);
        doc.setLineWidth(0.3);

        doc.line(marginX, yFirma, marginX + 70, yFirma);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(30, 30, 30);
        doc.text("FIRMA DEL CLIENTE", marginX + 5, yFirma + 5);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...GRAY);
        doc.text(data.owner.name, marginX + 5, yFirma + 10);

        doc.line(pageWidth - marginX - 70, yFirma, pageWidth - marginX, yFirma);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(30, 30, 30);
        doc.text("SELLO / RECIBIDO", pageWidth - marginX - 60, yFirma + 5);

        // Footer
        doc.setDrawColor(...GOLD);
        doc.setLineWidth(0.3);
        doc.line(marginX, 258, pageWidth - marginX, 258);
        doc.setFontSize(7);
        doc.setTextColor(...GRAY);
        doc.text(
            `${data.system.legalName || "Aura Mascotas"} · Tel: ${data.system.contactPhone || ""} · Contrato: ${data.contract.id.slice(0, 8).toUpperCase()}`,
            pageWidth / 2, 263, { align: "center" }
        );
    }

    const safeOwnerName = data.owner.name.replace(/\s+/g, "_");
    doc.save(`Recibos_${safeOwnerName}_${data.plan.installmentsCount}cuotas.pdf`);
};

// ─── Contrato de Previsión ────────────────────────────────────────────────────

interface ContractData {
    owner: {
        name: string;
        address?: string;
        phone?: string;
        email?: string;
    };
    plan: {
        name: string;
        price: number;
        installmentsCount: number;
    };
    contract: {
        id: string;
        startDate: string;
        downPayment: number;
        installmentAmount: number;
    };
    system: {
        legalName: string;
        legalRepresentative: string;
        contactPhone: string;
    };
    template?: {
        name: string;
        content: string;
    };
}

export const generatePrevisionContractPDF = async (data: ContractData) => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginX = 20;

    await applyAuraClientHeader(doc, "Contrato de Previsión Funeraria");

    // Folio y Fecha info
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GRAY);
    doc.text(`ID de Contrato: ${data.contract.id}`, marginX, 55);
    doc.text(`Fecha: ${new Date(data.contract.startDate).toLocaleDateString()}`, pageWidth - marginX, 55, { align: "right" });

    // Si hay una plantilla dinámica seleccionada
    if (data.template?.content) {
        let dynamicContent = data.template.content;
        dynamicContent = dynamicContent.replace(/{{CLIENTE_NOMBRE}}/g, data.owner.name);
        dynamicContent = dynamicContent.replace(/{{CLIENTE_DIRECCION}}/g, data.owner.address || "No especificada");
        dynamicContent = dynamicContent.replace(/{{PLAN_NOMBRE}}/g, data.plan.name);
        dynamicContent = dynamicContent.replace(/{{PLAN_PRECIO}}/g, `$${data.plan.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`);
        dynamicContent = dynamicContent.replace(/{{FECHA_ACTUAL}}/g, new Date(data.contract.startDate).toLocaleDateString());
        dynamicContent = dynamicContent.replace(/{{EMPRESA_NOMBRE}}/g, data.system.legalName || "Aura Mascotas");
        dynamicContent = dynamicContent.replace(/{{REPRESENTANTE}}/g, data.system.legalRepresentative || "Representante de Ventas");

        const plainText = dynamicContent.replace(/<[^>]*>?/gm, '');
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(30, 30, 30);
        const splitDynamicText = doc.splitTextToSize(plainText, pageWidth - (marginX * 2));
        doc.text(splitDynamicText, marginX, 70);

    } else {
        // Fallback al contrato estático
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...GOLD);
        doc.text("DECLARACIONES", marginX, 70);

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(30, 30, 30);
        const declaracionesText = `
De una parte, la empresa denominada ${data.system.legalName || "Aura Mascotas"}, representada en este acto por ${data.system.legalRepresentative || "su representante legal"}, a quien en lo sucesivo se le denominará "EL PRESTADOR".

Y de otra parte, el/la C. ${data.owner.name}, con domicilio en ${data.owner.address || "Dato no proporcionado"}, a quien en lo sucesivo se le denominará "EL CONTRATANTE".

Ambas partes acuerdan sujetarse a las siguientes cláusulas relacionadas con el plan de previsión funeraria para mascotas denominado "${data.plan.name}".
        `.trim();
        const splitDeclaraciones = doc.splitTextToSize(declaracionesText, pageWidth - (marginX * 2));
        doc.text(splitDeclaraciones, marginX, 80);

        // Conceptos Economicos
        const yEcon = 125;
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...GOLD);
        doc.text("RESUMEN ECONÓMICO DEL PRESTADOR", marginX, yEcon);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(30, 30, 30);
        doc.text(`Costo Total del Plan:`, marginX + 10, yEcon + 10);
        doc.text(`$${data.plan.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`, marginX + 70, yEcon + 10);

        doc.text(`Pago Inicial (Enganche):`, marginX + 10, yEcon + 18);
        doc.text(`$${data.contract.downPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`, marginX + 70, yEcon + 18);

        const saldoPrestante = data.plan.price - data.contract.downPayment;
        doc.text(`Saldo Restante:`, marginX + 10, yEcon + 26);
        doc.text(`$${saldoPrestante.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`, marginX + 70, yEcon + 26);

        doc.text(`Esquema de Pagos:`, marginX + 10, yEcon + 34);
        doc.setFont("helvetica", "bold");
        doc.text(`${data.plan.installmentsCount} cuotas de $${data.contract.installmentAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`, marginX + 70, yEcon + 34);

        // Cláusulas Generales
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        const clausulasText = `
1. EL PRESTADOR se compromete a brindar los servicios integrados en el plan de previsión sin importar el tiempo transcurrido, sujeto al cumplimiento total del pago por parte del CONTRATANTE.
2. EL CONTRATANTE se compromete a realizar los pagos en las fechas acordadas. En caso de atraso mayor a 60 días, el contrato podrá suspender temporalmente los beneficios hasta su regularización.
3. Este contrato puede ser reasignado a cualquier mascota propiedad del CONTRATANTE al momento de necesitar el servicio.
        `.trim();
        const splitClausulas = doc.splitTextToSize(clausulasText, pageWidth - (marginX * 2));
        doc.text(splitClausulas, marginX, yEcon + 45);
    }

    // Firmas
    const yFirmas = 230;
    doc.setDrawColor(30, 30, 30);
    doc.line(marginX, yFirmas, marginX + 70, yFirmas);
    doc.setFont("helvetica", "bold");
    doc.text("EL CONTRATANTE", marginX + 15, yFirmas + 5);
    doc.setFont("helvetica", "normal");
    doc.text(data.owner.name, marginX + 15, yFirmas + 10);

    doc.line(pageWidth - marginX - 70, yFirmas, pageWidth - marginX, yFirmas);
    doc.setFont("helvetica", "bold");
    doc.text("EL PRESTADOR", pageWidth - marginX - 55, yFirmas + 5);
    doc.setFont("helvetica", "normal");
    doc.text(data.system.legalRepresentative || "Representante de Ventas", pageWidth - marginX - 60, yFirmas + 10);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(...GRAY);
    doc.text(`Generado por Aura Systems - Tel: ${data.system.contactPhone || ""}`, pageWidth / 2, 270, { align: "center" });

    const fileName = data.template?.name ? `${data.template.name.replace(/\s+/g, '_')}_${data.contract.id}.pdf` : `Contrato_Prevision_${data.contract.id}.pdf`;
    doc.save(fileName);
};

// ─── Reporte Genérico (con logo y tabla) ─────────────────────────────────────

export const generateReportPDF = async (
    title: string,
    columns: { key: string; label: string; width?: number }[],
    rows: Record<string, unknown>[],
    filename: string,
    empresa: string = "Aura Forever Friends"
): Promise<void> => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "letter" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 18;

    await applyAuraClientHeader(doc, title);

    // Subheader: records count
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GRAY);
    doc.text(`${rows.length} registros`, marginX, 55);
    doc.text(`Emisión: ${new Date().toLocaleDateString("es-MX", { dateStyle: "long" })}`, pageWidth - marginX, 55, { align: "right" });

    // ── Table ────────────────────────────────────────────────────────────────
    const tableTop = 60;
    const rowHeight = 7;
    const colWidths = columns.map(c => c.width ?? (pageWidth - marginX * 2) / columns.length);
    let currentX = marginX;

    // Header row background
    doc.setFillColor(30, 30, 30);
    doc.rect(marginX, tableTop, pageWidth - marginX * 2, rowHeight, "F");

    // Header labels
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...GOLD);
    columns.forEach((col, i) => {
        doc.text(col.label.toUpperCase(), currentX + 2, tableTop + 4.5);
        currentX += colWidths[i];
    });

    // Rows
    let y = tableTop + rowHeight;
    rows.forEach((row, rowIdx) => {
        if (y + rowHeight > pageHeight - 15) {
            doc.addPage();
            y = 20;
            doc.setFillColor(30, 30, 30);
            doc.rect(marginX, y, pageWidth - marginX * 2, rowHeight, "F");
            doc.setFontSize(7);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...GOLD);
            let hx = marginX;
            columns.forEach((col, i) => {
                doc.text(col.label.toUpperCase(), hx + 2, y + 4.5);
                hx += colWidths[i];
            });
            y += rowHeight;
        }

        if (rowIdx % 2 === 0) {
            doc.setFillColor(...LIGHT_GRAY);
            doc.rect(marginX, y, pageWidth - marginX * 2, rowHeight, "F");
        }

        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(30, 30, 30);

        let cx = marginX;
        columns.forEach((col, i) => {
            const cellVal = String(row[col.key] ?? "");
            const maxWidth = colWidths[i] - 4;
            let truncated = cellVal;
            if (doc.getTextWidth(cellVal) > maxWidth) {
                truncated = cellVal.substring(0, 15) + "...";
            }
            doc.text(truncated, cx + 2, y + 4.5);
            cx += colWidths[i];
        });

        y += rowHeight;
    });

    // Footer
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.3);
    doc.line(marginX, pageHeight - 12, pageWidth - marginX, pageHeight - 12);
    doc.setFontSize(6);
    doc.setTextColor(...GRAY);
    doc.text(`${empresa}  ·  Generado con Aura Systems`, pageWidth / 2, pageHeight - 7, { align: "center" });

    doc.save(filename);
};
