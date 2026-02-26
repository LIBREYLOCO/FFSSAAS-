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
