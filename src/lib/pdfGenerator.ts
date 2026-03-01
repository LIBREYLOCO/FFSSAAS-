/** Genera el PDF del certificado de cremación (MOCK para el cliente - esto debería llamarse vía API) */
export const generateCremationCertificate = async (_data: any): Promise<ArrayBuffer> => {
    throw new Error("generateCremationCertificate is server-only. Use the API endpoint /api/sesiones-cremacion/[id]/certificado instead.");
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
    const gold: [number, number, number] = [212, 175, 55];
    const dark: [number, number, number] = [30, 30, 30];
    const gray: [number, number, number] = [100, 100, 100];
    const green: [number, number, number] = [34, 120, 60];

    const startDate = new Date(data.contract.startDate);

    for (let i = 0; i < data.plan.installmentsCount; i++) {
        if (i > 0) doc.addPage();

        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i + 1);

        // Header
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...gold);
        doc.text("AURA", marginX, 22);

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...gray);
        doc.text("FOREVER FRIENDS  ·  " + (data.system.legalName || ""), marginX, 27);

        doc.setDrawColor(...gold);
        doc.setLineWidth(0.5);
        doc.line(marginX, 31, pageWidth - marginX, 31);

        // Title
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...dark);
        doc.text("RECIBO DE MENSUALIDAD", pageWidth / 2, 42, { align: "center" });

        // Receipt number + contract ref
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...gray);
        doc.text(`Recibo ${i + 1} de ${data.plan.installmentsCount}`, marginX, 52);
        doc.text(`Contrato: ${data.contract.id.slice(0, 8).toUpperCase()}`, pageWidth - marginX, 52, { align: "right" });

        // Client section
        let y = 68;
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...gold);
        doc.text("DATOS DEL CLIENTE", marginX, y);
        doc.setDrawColor(...gold);
        doc.setLineWidth(0.3);
        doc.line(marginX, y + 2, pageWidth - marginX, y + 2);

        y += 10;
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...dark);
        doc.text("Nombre:", marginX, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...gray);
        doc.text(data.owner.name, marginX + 30, y);

        y += 7;
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...dark);
        doc.text("Plan:", marginX, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...gray);
        doc.text(data.plan.name, marginX + 30, y);

        if (data.owner.phone) {
            y += 7;
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...dark);
            doc.text("Teléfono:", marginX, y);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(...gray);
            doc.text(data.owner.phone, marginX + 30, y);
        }

        // Payment detail section
        y += 18;
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...gold);
        doc.text("DETALLE DEL PAGO", marginX, y);
        doc.setDrawColor(...gold);
        doc.setLineWidth(0.3);
        doc.line(marginX, y + 2, pageWidth - marginX, y + 2);

        y += 12;
        // Amount box
        doc.setFillColor(240, 248, 240);
        doc.roundedRect(marginX, y - 4, pageWidth - marginX * 2, 24, 3, 3, "F");

        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...dark);
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
        doc.setTextColor(...dark);
        doc.text("Fecha de Vencimiento:", marginX, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...gray);
        doc.text(
            dueDate.toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" }),
            marginX + 58, y
        );

        y += 7;
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...dark);
        doc.text("Fecha de Pago:", marginX, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...gray);
        doc.text("___________________________", marginX + 40, y);

        // Signature lines
        const yFirma = 210;
        doc.setDrawColor(...dark);
        doc.setLineWidth(0.3);

        doc.line(marginX, yFirma, marginX + 70, yFirma);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(...dark);
        doc.text("FIRMA DEL CLIENTE", marginX + 5, yFirma + 5);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...gray);
        doc.text(data.owner.name, marginX + 5, yFirma + 10);

        doc.line(pageWidth - marginX - 70, yFirma, pageWidth - marginX, yFirma);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(...dark);
        doc.text("SELLO / RECIBIDO", pageWidth - marginX - 60, yFirma + 5);

        // Footer
        doc.setDrawColor(...gold);
        doc.setLineWidth(0.3);
        doc.line(marginX, 258, pageWidth - marginX, 258);
        doc.setFontSize(7);
        doc.setTextColor(...gray);
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
    // Import jsPDF dynamically to avoid SSR issues
    const { jsPDF } = await import("jspdf");

    // Inicializar jspdf en formato Carta (Letter)
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "letter" // 215.9 x 279.4 mm
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const marginX = 20;

    // Logo Text/Brand
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(212, 175, 55); // Brand Gold
    doc.text("AURA", marginX, 25);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("FOREVER FRIENDS", marginX, 30);

    // Titulo del contrato
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("CONTRATO DE SERVICIOS PREVISORIOS FUNERARIOS PARA MASCOTAS", pageWidth / 2, 45, { align: "center" });

    // Folio y Fecha
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`ID de Contrato: ${data.contract.id}`, marginX, 60);
    doc.text(`Fecha: ${new Date(data.contract.startDate).toLocaleDateString()}`, pageWidth - marginX - 40, 60);

    // Si hay una plantilla dinámica seleccionada, usar su contenido en lugar del estático
    if (data.template?.content) {
        let dynamicContent = data.template.content;

        // Reemplazar variables mágicas
        dynamicContent = dynamicContent.replace(/{{CLIENTE_NOMBRE}}/g, data.owner.name);
        dynamicContent = dynamicContent.replace(/{{CLIENTE_DIRECCION}}/g, data.owner.address || "No especificada");
        dynamicContent = dynamicContent.replace(/{{PLAN_NOMBRE}}/g, data.plan.name);
        dynamicContent = dynamicContent.replace(/{{PLAN_PRECIO}}/g, `$${data.plan.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`);
        dynamicContent = dynamicContent.replace(/{{FECHA_ACTUAL}}/g, new Date(data.contract.startDate).toLocaleDateString());
        dynamicContent = dynamicContent.replace(/{{EMPRESA_NOMBRE}}/g, data.system.legalName || "Aura Mascotas");
        dynamicContent = dynamicContent.replace(/{{REPRESENTANTE}}/g, data.system.legalRepresentative || "Representante de Ventas");

        // Quitar etiquetas HTML básicas para modo texto (simplificado)
        const plainText = dynamicContent.replace(/<[^>]*>?/gm, '');

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const splitDynamicText = doc.splitTextToSize(plainText, pageWidth - (marginX * 2));
        doc.text(splitDynamicText, marginX, 75);

    } else {
        // Fallback al contrato estático si no hay plantilla (Legacy)
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("DECLARACIONES", marginX, 75);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const declaracionesText = `
De una parte, la empresa denominada ${data.system.legalName || "Aura Mascotas"}, representada en este acto por ${data.system.legalRepresentative || "su representante legal"}, a quien en lo sucesivo se le denominará "EL PRESTADOR".

Y de otra parte, el/la C. ${data.owner.name}, con domicilio en ${data.owner.address || "Dato no proporcionado"}, a quien en lo sucesivo se le denominará "EL CONTRATANTE".

Ambas partes acuerdan sujetarse a las siguientes cláusulas relacionadas con el plan de previsión funeraria para mascotas denominado "${data.plan.name}".
        `.trim();

        const splitDeclaraciones = doc.splitTextToSize(declaracionesText, pageWidth - (marginX * 2));
        doc.text(splitDeclaraciones, marginX, 85);

        // Conceptos Economicos
        const yEcon = 130;
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("RESUMEN ECONÓMICO DEL PRESTADOR", marginX, yEcon);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
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
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const clausulasText = `
1. EL PRESTADOR se compromete a brindar los servicios integrados en el plan de previsión sin importar el tiempo transcurrido, sujeto al cumplimiento total del pago por parte del CONTRATANTE.
2. EL CONTRATANTE se compromete a realizar los pagos en las fechas acordadas. En caso de atraso mayor a 60 días, el contrato podrá suspender temporalmente los beneficios hasta su regularización.
3. Este contrato puede ser reasignado a cualquier mascota propiedad del CONTRATANTE al momento de necesitar el servicio.
        `.trim();
        const splitClausulas = doc.splitTextToSize(clausulasText, pageWidth - (marginX * 2));
        doc.text(splitClausulas, marginX, yEcon + 50);
    }

    // Firmas (Siempre se muestran al final)
    const yFirmas = 230;

    // Linea Firma Cliente
    doc.line(marginX, yFirmas, marginX + 70, yFirmas);
    doc.setFont("helvetica", "bold");
    doc.text("EL CONTRATANTE", marginX + 15, yFirmas + 5);
    doc.setFont("helvetica", "normal");
    doc.text(data.owner.name, marginX + 15, yFirmas + 10);

    // Linea Firma Representante
    doc.line(pageWidth - marginX - 70, yFirmas, pageWidth - marginX, yFirmas);
    doc.setFont("helvetica", "bold");
    doc.text("EL PRESTADOR", pageWidth - marginX - 55, yFirmas + 5);
    doc.setFont("helvetica", "normal");
    doc.text(data.system.legalRepresentative || "Representante de Ventas", pageWidth - marginX - 60, yFirmas + 10);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generado por Aura Systems - Tel: ${data.system.contactPhone || ""}`, pageWidth / 2, 270, { align: "center" });

    // Descargar Archivo
    const fileName = data.template?.name ? `${data.template.name.replace(/\s+/g, '_')}_${data.contract.id}.pdf` : `Contrato_Prevision_${data.contract.id}.pdf`;
    doc.save(fileName);
};

// ─── Reporte Genérico (con logo y tabla) ─────────────────────────────────────

/**
 * Genera un PDF de reporte con encabezado AURA, logo de la empresa, título y tabla de datos.
 * @param title  Título del reporte (ej. "Reporte de Servicios")
 * @param columns  Array de { key, label, width? } para las columnas de la tabla
 * @param rows  Array de objetos con los datos
 * @param filename  Nombre del archivo PDF a descargar
 * @param empresa  Nombre de la empresa (obtenido de SystemConfig)
 */
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
    const gold: [number, number, number] = [212, 175, 55];
    const dark: [number, number, number] = [20, 20, 20];
    const lightGray: [number, number, number] = [245, 245, 245];
    const textGray: [number, number, number] = [100, 100, 100];

    // ── Logo / Header ────────────────────────────────────────────────────────
    try {
        const logoRes = await fetch("/logo.png");
        if (logoRes.ok) {
            const blob = await logoRes.blob();
            const reader = new FileReader();
            const logoData = await new Promise<string>((resolve) => {
                reader.onload = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
            });
            doc.addImage(logoData, "PNG", marginX, 8, 16, 16);
        }
    } catch { }

    // Brand name
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...gold);
    doc.text("AURA", marginX + 20, 15);

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textGray);
    doc.text("FOREVER FRIENDS  ·  " + empresa.toUpperCase(), marginX + 20, 19);

    // Date
    const dateStr = new Date().toLocaleDateString("es-MX", { dateStyle: "long" });
    doc.setFontSize(7);
    doc.text(dateStr, pageWidth - marginX, 15, { align: "right" });

    // Gold separator line
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.5);
    doc.line(marginX, 27, pageWidth - marginX, 27);

    // Title
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...dark);
    doc.text(title, marginX, 35);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textGray);
    doc.text(`${rows.length} registros`, marginX, 40);

    // ── Table ────────────────────────────────────────────────────────────────
    const tableTop = 46;
    const rowHeight = 7;
    const colWidths = columns.map(c => c.width ?? (pageWidth - marginX * 2) / columns.length);
    let currentX = marginX;

    // Header row background
    doc.setFillColor(30, 30, 30);
    doc.rect(marginX, tableTop, pageWidth - marginX * 2, rowHeight, "F");

    // Header labels
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...gold);
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
            // Repeat header on new page
            doc.setFillColor(...dark);
            doc.rect(marginX, y, pageWidth - marginX * 2, rowHeight, "F");
            doc.setFontSize(7);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...gold);
            let hx = marginX;
            columns.forEach((col, i) => {
                doc.text(col.label.toUpperCase(), hx + 2, y + 4.5);
                hx += colWidths[i];
            });
            y += rowHeight;
        }

        if (rowIdx % 2 === 0) {
            doc.setFillColor(...lightGray);
            doc.rect(marginX, y, pageWidth - marginX * 2, rowHeight, "F");
        }

        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(50, 50, 50);

        let cx = marginX;
        columns.forEach((col, i) => {
            const cellVal = String(row[col.key] ?? "");
            const maxWidth = colWidths[i] - 4;
            const truncated = doc.getTextWidth(cellVal) > maxWidth
                ? cellVal.substring(0, Math.floor(maxWidth / (doc.getTextWidth(cellVal) / cellVal.length))) + "…"
                : cellVal;
            doc.text(truncated, cx + 2, y + 4.5);
            cx += colWidths[i];
        });

        y += rowHeight;
    });

    // Bottom gold line + footer
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.3);
    doc.line(marginX, pageHeight - 12, pageWidth - marginX, pageHeight - 12);
    doc.setFontSize(6);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textGray);
    doc.text(`${empresa}  ·  Generado ${dateStr}`, pageWidth / 2, pageHeight - 7, { align: "center" });

    doc.save(filename);
};
