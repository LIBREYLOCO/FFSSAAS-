import jsPDF from "jspdf";

// ─── Helper: carga el logo desde /logo.png (client-side) ────────────────────
const fetchLogoDataUrl = async (): Promise<string | null> => {
    try {
        const res = await fetch("/logo.png");
        if (!res.ok) return null;
        const blob = await res.blob();
        return await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
        });
    } catch {
        return null;
    }
};

// ─── Helper: aplica encabezado AURA con logo ─────────────────────────────────
const applyBranding = (doc: jsPDF, title: string, logoDataUrl: string | null) => {
    const pageW = doc.internal.pageSize.getWidth();

    // Fondo oscuro
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageW, 46, "F");

    // Logo centrado
    if (logoDataUrl) {
        try {
            doc.addImage(logoDataUrl, "PNG", pageW / 2 - 20, 3, 40, 30);
        } catch {
            doc.setTextColor(212, 175, 55);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(22);
            doc.text("AURA", pageW / 2, 22, { align: "center" });
        }
    } else {
        doc.setTextColor(212, 175, 55);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.text("AURA", pageW / 2, 22, { align: "center" });
    }

    // Título del documento en blanco
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(15);
    doc.setFont("helvetica", "bolditalic");
    doc.text(title, pageW / 2, 40, { align: "center" });

    // Línea dorada separadora
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.5);
    doc.line(20, 46, pageW - 20, 46);
};

// ─── Certificado de Homenaje ─────────────────────────────────────────────────
export const generateServiceCertificate = async (order: any) => {
    const logo = await fetchLogoDataUrl();
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const gold: [number, number, number] = [212, 175, 55];

    applyBranding(doc, "CERTIFICADO DE HOMENAJE", logo);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Por la presente se certifica que se ha llevado a cabo el ritual de", pageW / 2, 60, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(
        order.serviceType === "IMMEDIATE" ? "CREMACIÓN INDIVIDUAL INMEDIATA" : "PROCESO DE PREVISIÓN AURA",
        pageW / 2, 70, { align: "center" }
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("para nuestra querida mascota:", pageW / 2, 85, { align: "center" });

    // Foto de la mascota (evidencia)
    if (order.petPhoto) {
        try {
            doc.setDrawColor(...gold);
            doc.setLineWidth(0.5);
            doc.rect(75, 90, 60, 45);
            doc.addImage(order.petPhoto, "JPEG", 76, 91, 58, 43);
        } catch {}
    }

    const petNameY = order.petPhoto ? 150 : 110;

    doc.setFontSize(24);
    doc.setFont("helvetica", "bolditalic");
    doc.setTextColor(184, 134, 11);
    doc.text(order.pet?.name || "Sin nombre", pageW / 2, petNameY, { align: "center" });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`${order.pet?.species || ""} • ${order.pet?.breed || "Raza única"}`, pageW / 2, petNameY + 10, { align: "center" });

    doc.setDrawColor(...gold);
    doc.line(40, petNameY + 22, 170, petNameY + 22);

    doc.setFontSize(10);
    doc.text(`Propietario: ${order.owner?.name || "N/A"}`, pageW / 2, petNameY + 32, { align: "center" });
    doc.text(`Fecha del Servicio: ${new Date(order.createdAt).toLocaleDateString("es-MX")}`, pageW / 2, petNameY + 42, { align: "center" });
    doc.text(`Folio Interno: ${order.folio}`, pageW / 2, petNameY + 52, { align: "center" });

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Este documento certifica un proceso manejado con los más altos estándares de ética y respeto.", pageW / 2, 272, { align: "center" });
    doc.text("Aura Forever Friends • Memorial Partners", pageW / 2, 279, { align: "center" });

    doc.save(`Certificado_AURA_${order.folio}.pdf`);
};

// ─── Recibo de Recolección ───────────────────────────────────────────────────
export const generatePickupReceipt = async (order: any) => {
    const logo = await fetchLogoDataUrl();
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const gold: [number, number, number] = [212, 175, 55];

    applyBranding(doc, "RECIBO DE RECOLECCIÓN", logo);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`FOLIO: ${order.folio}`, pageW - 20, 55, { align: "right" });
    doc.text(`FECHA: ${new Date().toLocaleDateString("es-MX")}`, pageW - 20, 61, { align: "right" });

    // Datos de la mascota
    doc.setFillColor(245, 245, 245);
    doc.rect(20, 67, pageW - 40, 40, "F");
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text("DATOS DE LA MASCOTA", 25, 77);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    doc.text(`Nombre: ${order.pet?.name}`, 25, 87);
    doc.text(`Especie / Raza: ${order.pet?.species} / ${order.pet?.breed || "N/A"}`, 25, 94);
    doc.text(`Peso aprox: ${order.pet?.weightKg || "N/A"} kg`, pageW / 2 + 10, 87);
    doc.text(`Tipo de Servicio: ${order.serviceType === "IMMEDIATE" ? "Inmediato" : "Previsión"}`, pageW / 2 + 10, 94);

    // Datos de recolección
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    doc.text("DATOS DE RECOLECCIÓN", 25, 118);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    doc.text(`Propietario: ${order.owner?.name}`, 25, 128);
    doc.text(`Teléfono: ${order.owner?.phone || "N/A"}`, 25, 135);
    doc.text(`Dirección: ${order.owner?.address || "Domicilio Particular"}`, 25, 142);

    // Línea dorada
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.4);
    doc.line(20, 152, pageW - 20, 152);

    // Texto de confirmación
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(30, 30, 30);
    const confirmText = "Por medio de la presente, el personal autorizado de AURA confirma la recepción de la mascota arriba mencionada para el inicio del proceso ritual solicitado.";
    const splitConfirm = doc.splitTextToSize(confirmText, pageW - 50);
    doc.text(splitConfirm, 25, 162);

    // Foto de evidencia
    if (order.petPhoto) {
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        doc.text("Evidencia fotográfica capturada en sitio:", 25, 183);
        doc.addImage(order.petPhoto, "JPEG", 25, 188, 55, 38);
    }

    // Firmas
    const signY = 242;
    doc.setDrawColor(30, 30, 30);
    doc.setLineWidth(0.3);
    doc.line(25, signY, 90, signY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(30, 30, 30);
    doc.text("Firma de Conformidad (Familiar)", 57, signY + 6, { align: "center" });

    doc.line(pageW - 90, signY, pageW - 25, signY);
    doc.text("Personal AURA / Conductor", pageW - 57, signY + 6, { align: "center" });

    // Footer
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.3);
    doc.line(20, 278, pageW - 20, 278);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("Aura Forever Friends • Homenajes con Dignidad", pageW / 2, 283, { align: "center" });

    doc.save(`Recibo_Recoleccion_${order.folio}.pdf`);
};

// ─── Acta de Entrega de Cenizas ───────────────────────────────────────────────
export const generateAshDeliveryReceipt = async (order: any) => {
    const logo = await fetchLogoDataUrl();
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const gold: [number, number, number] = [212, 175, 55];

    applyBranding(doc, "ACTA DE ENTREGA DE CENIZAS", logo);

    const today = new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" });

    doc.setTextColor(30, 30, 30);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`FOLIO: ${order.folio}`, pageW - 20, 55, { align: "right" });
    doc.text(`FECHA DE ENTREGA: ${today}`, pageW - 20, 62, { align: "right" });

    // Declaración formal
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const declaration = `En la ciudad de México, siendo el día ${today}, el personal de AURA Forever Friends hace formal entrega de los restos del proceso de cremación de la mascota que a continuación se describe, al propietario registrado en el presente folio.`;
    const splitDecl = doc.splitTextToSize(declaration, pageW - 45);
    doc.text(splitDecl, 25, 70);

    // Datos de la mascota
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.4);
    doc.line(20, 88, pageW - 20, 88);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    doc.text("DATOS DE LA MASCOTA", 25, 97);

    doc.setFillColor(248, 248, 248);
    doc.rect(20, 101, pageW - 40, 38, "F");
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    doc.text(`Nombre:`, 26, 111);
    doc.setFont("helvetica", "bold");
    doc.text(order.pet?.name || "N/A", 60, 111);
    doc.setFont("helvetica", "normal");
    doc.text(`Especie:`, 26, 119);
    doc.text(`${order.pet?.species || "N/A"} — ${order.pet?.breed || "Raza única"}`, 60, 119);
    doc.text(`Peso aprox:`, 26, 127);
    doc.text(`${order.pet?.weightKg || "N/A"} kg`, 60, 127);
    doc.text(`Fecha de servicio:`, 26, 135);
    doc.text(new Date(order.createdAt).toLocaleDateString("es-MX"), 60, 135);

    // Datos del propietario
    doc.setLineWidth(0.4);
    doc.line(20, 146, pageW - 20, 146);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    doc.text("DATOS DEL PROPIETARIO", 25, 155);

    doc.setFillColor(248, 248, 248);
    doc.rect(20, 159, pageW - 40, 28, "F");
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    doc.text(`Nombre:`, 26, 169);
    doc.setFont("helvetica", "bold");
    doc.text(order.owner?.name || "N/A", 60, 169);
    doc.setFont("helvetica", "normal");
    doc.text(`Teléfono:`, 26, 178);
    doc.text(order.owner?.phone || "N/A", 60, 178);

    // Foto de entrega
    if (order.deliveryPhoto) {
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        doc.text("Evidencia fotográfica de la entrega:", 25, 197);
        doc.addImage(order.deliveryPhoto, "JPEG", 25, 200, 55, 38);
    }

    // Declaración final
    doc.setLineWidth(0.4);
    doc.setDrawColor(...gold);
    const declY = order.deliveryPhoto ? 247 : 198;
    doc.line(20, declY, pageW - 20, declY);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    const finalText = "El propietario recibe las cenizas a su entera satisfacción, dando por concluido el proceso de cremación con los estándares de calidad y dignidad de Aura Forever Friends.";
    const splitFinal = doc.splitTextToSize(finalText, pageW - 45);
    doc.text(splitFinal, 25, declY + 9);

    // Firmas
    const signY = declY + 28;
    doc.setDrawColor(30, 30, 30);
    doc.setLineWidth(0.3);

    doc.line(25, signY, 90, signY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(30, 30, 30);
    doc.text("Firma del Propietario / Familiar", 57, signY + 6, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(order.owner?.name || "", 57, signY + 12, { align: "center" });

    doc.line(pageW - 90, signY, pageW - 25, signY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(30, 30, 30);
    doc.text("Responsable de Entrega AURA", pageW - 57, signY + 6, { align: "center" });
    doc.text("Sello / Firma:", pageW - 57, signY + 13, { align: "center" });

    // Footer
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.3);
    doc.line(20, 279, pageW - 20, 279);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`Aura Forever Friends • Homenajes con Dignidad • Folio: ${order.folio}`, pageW / 2, 284, { align: "center" });

    doc.save(`Entrega_Cenizas_${order.folio}.pdf`);
};

export const generateContractPDF = (contract: any) => {
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();

    // Simple legacy branding (sync)
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageW, 46, "F");
    doc.setTextColor(212, 175, 55);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("AURA", pageW / 2, 22, { align: "center" });
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text("CONTRATO DE PREVISIÓN", pageW / 2, 39, { align: "center" });
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.5);
    doc.line(20, 46, pageW - 20, 46);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Contrato No: ${contract.id}`, 20, 60);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Cliente: ${contract.owner?.name}`, 20, 75);
    doc.text(`Plan Contratado: ${contract.plan?.name}`, 20, 82);
    doc.text(`Fecha de Apertura: ${new Date(contract.startDate).toLocaleDateString()}`, 20, 89);

    doc.setFont("helvetica", "bold");
    doc.text("CLÁUSULAS DEL SERVICIO", 20, 105);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const clauses = "1. El presente contrato garantiza los servicios de homenaje y cremación para la mascota designada. 2. Los pagos deberán realizarse puntualmente según el plan elegido. 3. En caso de siniestro, el titular deberá contactar a la línea de ayuda Aura 24/7.";
    const splitClauses = doc.splitTextToSize(clauses, 170);
    doc.text(splitClauses, 20, 115);

    doc.line(120, 250, 180, 250);
    doc.text("Firma del Titular", 150, 255, { align: "center" });

    doc.save(`Contrato_AURA_${contract.id}.pdf`);
};
