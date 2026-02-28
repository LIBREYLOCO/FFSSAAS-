import jsPDF from "jspdf";

// Helper for logo and branding basics
const applyBranding = (doc: jsPDF, title: string) => {
    // --- Header Background ---
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 45, "F");

    // --- Aura / Forever Friends Logo Text (Fallback if image fails) ---
    doc.setTextColor(212, 175, 55); // Gold
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text("AURA", 105, 18, { align: "center" });

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("FOREVER FRIENDS • HOMENAJES CON DIGNIDAD", 105, 26, { align: "center" });

    // --- Document Title ---
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bolditalic");
    doc.text(title, 105, 38, { align: "center" });

    // --- Accent Line ---
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.5);
    doc.line(20, 45, 190, 45);
};

export const generateServiceCertificate = (order: any) => {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    applyBranding(doc, "CERTIFICADO DE HOMENAJE");

    // --- Body ---
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Por la presente se certifica que se ha llevado a cabo el ritual de`, 105, 65, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(order.serviceType === 'IMMEDIATE' ? 'CREMACIÓN INDIVIDUAL INMEDIATA' : 'PROCESO DE PREVISIÓN AURA', 105, 75, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("para nuestra querida mascota:", 105, 90, { align: "center" });

    // --- Pet Photo (Evidence) ---
    if (order.petPhoto) {
        try {
            // Frame for the photo
            doc.setDrawColor(212, 175, 55);
            doc.setLineWidth(0.5);
            doc.rect(75, 95, 60, 45); // x, y, w, h
            doc.addImage(order.petPhoto, "JPEG", 76, 96, 58, 43);
        } catch (e) {
            console.error("Error adding pet photo to PDF:", e);
        }
    }

    const petNameY = order.petPhoto ? 155 : 115;

    doc.setFontSize(24);
    doc.setFont("helvetica", "bolditalic");
    doc.setTextColor(184, 134, 11); // Dark gold
    doc.text(order.pet?.name || "Sin nombre", 105, petNameY, { align: "center" });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`${order.pet?.species || ""} • ${order.pet?.breed || "Raza única"}`, 105, petNameY + 10, { align: "center" });

    // --- Details ---
    doc.setDrawColor(212, 175, 55);
    doc.line(40, petNameY + 25, 170, petNameY + 25);

    doc.setFontSize(10);
    doc.text(`Propietario: ${order.owner?.name || "N/A"}`, 105, petNameY + 35, { align: "center" });
    doc.text(`Fecha del Servicio: ${new Date(order.createdAt).toLocaleDateString()}`, 105, petNameY + 45, { align: "center" });
    doc.text(`Folio Interno: ${order.folio}`, 105, petNameY + 55, { align: "center" });

    // --- Footer / Signature ---
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Este documento certifica un proceso manejado con los más altos estándares de ética y respeto.", 105, 275, { align: "center" });
    doc.text("Airapí • Memorial Partners • Aura Forever Friends", 105, 282, { align: "center" });

    // Save
    doc.save(`Certificado_AURA_${order.folio}.pdf`);
};

export const generatePickupReceipt = (order: any) => {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    applyBranding(doc, "RECIBO DE RECOLECCIÓN");

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`FOLIO: ${order.folio}`, 190, 55, { align: "right" });
    doc.text(`FECHA: ${new Date().toLocaleDateString()}`, 190, 60, { align: "right" });

    // --- Pet Info Section ---
    doc.setFillColor(245, 245, 245);
    doc.rect(20, 65, 170, 40, "F");
    doc.setFontSize(12);
    doc.text("DATOS DE LA MASCOTA", 25, 75);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Nombre: ${order.pet?.name}`, 25, 85);
    doc.text(`Especie/Raza: ${order.pet?.species} / ${order.pet?.breed || "N/A"}`, 25, 92);
    doc.text(`Peso aprox: ${order.pet?.weightKg || "N/A"} kg`, 110, 85);
    doc.text(`Tipo de Servicio: ${order.serviceType === 'IMMEDIATE' ? 'Inmediato' : 'Previsión'}`, 110, 92);

    // --- Owner / Pickup Info ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("DATOS DE RECOLECCIÓN", 25, 115);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Propietario: ${order.owner?.name}`, 25, 125);
    doc.text(`Teléfono: ${order.owner?.phone || "N/A"}`, 25, 132);
    doc.text(`Ubicación: ${order.owner?.address || "Domicilio Particular"}`, 25, 139);

    // --- Receipt Confirmation ---
    doc.setFontSize(11);
    doc.setFont("helvetica", "bolditalic");
    const confirmationText = "Por medio de la presente, el personal autorizado de AURA confirma la recepción de la mascota arriba mencionada para el inicio del proceso ritual solicitado.";
    const splitConfirm = doc.splitTextToSize(confirmationText, 160);
    doc.text(splitConfirm, 25, 160);

    // --- Photo if exists ---
    if (order.petPhoto) {
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text("Evidencia fotográfica capturada en sitio:", 25, 180);
        doc.addImage(order.petPhoto, "JPEG", 25, 185, 50, 35);
    }

    // --- Signatures ---
    const signY = 240;
    doc.line(25, signY, 85, signY);
    doc.text("Firma de Conformidad (Familiar)", 55, signY + 5, { align: "center" });

    doc.line(125, signY, 185, signY);
    doc.text("Personal AURA / Conductor", 155, signY + 5, { align: "center" });

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Aura by Airapí • Homenajes con Dignidad", 105, 285, { align: "center" });

    doc.save(`Recibo_Recoleccion_${order.folio}.pdf`);
};

export const generateContractPDF = (contract: any) => {
    const doc = new jsPDF();

    applyBranding(doc, "CONTRATO DE PREVISIÓN");

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

    // --- Signature ---
    doc.line(120, 250, 180, 250);
    doc.text("Firma del Titular", 150, 255, { align: "center" });

    doc.save(`Contrato_AURA_${contract.id}.pdf`);
};
