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

    // ── Encabezado ──────────────────────────────────────────────────────────
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...gold);
    doc.text("AURA", marginX, 22);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...gray);
    doc.text("FOREVER FRIENDS  ·  " + data.empresa.nombre, marginX, 27);

    // Línea divisoria dorada
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.5);
    doc.line(marginX, 31, pageWidth - marginX, 31);

    // Título del documento
    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...dark);
    doc.text("CERTIFICADO DE CREMACIÓN", pageWidth / 2, 42, { align: "center" });

    // Número y fecha de emisión
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...gray);
    doc.text(`No. ${data.sesion.numeroCertificado}`, marginX, 52);
    doc.text(`Fecha de emisión: ${new Date().toLocaleDateString("es-MX")}`, pageWidth - marginX, 52, { align: "right" });

    // ── Sección: Datos de la mascota ────────────────────────────────────────
    let y = 65;
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
        dynamicContent = dynamicContent.replace(/{{PLAN_PRECIO}}/g, `$${data.plan.price.toLocaleString("en-US")} MXN`);
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
        doc.text(`$${data.plan.price.toLocaleString("en-US")} MXN`, marginX + 70, yEcon + 10);

        doc.text(`Pago Inicial (Enganche):`, marginX + 10, yEcon + 18);
        doc.text(`$${data.contract.downPayment.toLocaleString("en-US")} MXN`, marginX + 70, yEcon + 18);

        const saldoPrestante = data.plan.price - data.contract.downPayment;
        doc.text(`Saldo Restante:`, marginX + 10, yEcon + 26);
        doc.text(`$${saldoPrestante.toLocaleString("en-US")} MXN`, marginX + 70, yEcon + 26);

        doc.text(`Esquema de Pagos:`, marginX + 10, yEcon + 34);
        doc.setFont("helvetica", "bold");
        doc.text(`${data.plan.installmentsCount} cuotas de $${data.contract.installmentAmount.toLocaleString("en-US")} MXN`, marginX + 70, yEcon + 34);

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
