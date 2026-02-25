import jsPDF from "jspdf";

export const generateServiceCertificate = (order: any) => {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    // --- Branding ---
    doc.setFillColor(26, 26, 26); // Black background for header
    doc.rect(0, 0, 210, 40, "F");

    doc.setTextColor(212, 175, 55); // Gold
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.text("AURA", 105, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("FOREVER FRIENDS • HOMENAJES CON DIGNIDAD", 105, 30, { align: "center" });

    // --- Title ---
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bolditalic");
    doc.text("CERTIFICADO DE HOMENAJE", 105, 60, { align: "center" });

    // --- Body ---
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Por la presente se certifica que se ha llevado a cabo el ritual de`, 105, 80, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(order.serviceType === 'IMMEDIATE' ? 'CREMACIÓN INDIVIDUAL INMEDIATA' : 'PROCESO DE PREVISIÓN AURA', 105, 90, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text("para nuestra querida mascota:", 105, 110, { align: "center" });

    doc.setFontSize(24);
    doc.setFont("helvetica", "bolditalic");
    doc.setTextColor(184, 134, 11); // Dark gold
    doc.text(order.pet?.name || "Sin nombre", 105, 125, { align: "center" });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`${order.pet?.species || ""} • ${order.pet?.breed || "Raza única"}`, 105, 135, { align: "center" });

    // --- Details ---
    doc.setDrawColor(212, 175, 55);
    doc.line(40, 150, 170, 150);

    doc.setFontSize(10);
    doc.text(`Propietario: ${order.owner?.name || "N/A"}`, 105, 160, { align: "center" });
    doc.text(`Fecha del Servicio: ${new Date(order.createdAt).toLocaleDateString()}`, 105, 170, { align: "center" });
    doc.text(`Folio Interno: ${order.folio}`, 105, 180, { align: "center" });

    // --- Footer / Signature ---
    doc.setFontSize(8);
    doc.text("Este documento certifica un proceso manejado con los más altos estándares de ética y respeto.", 105, 260, { align: "center" });
    doc.text("Airapí • Memorial Partners", 105, 270, { align: "center" });

    // Save
    doc.save(`Certificado_AURA_${order.folio}.pdf`);
};

export const generateContractPDF = (contract: any) => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("CONTRATO DE PREVISIÓN AURA", 105, 20, { align: "center" });

    doc.setFontSize(10);
    doc.text(`ID de Contrato: ${contract.id}`, 20, 40);
    doc.text(`Cliente: ${contract.owner?.name}`, 20, 50);
    doc.text(`Plan: ${contract.plan?.name}`, 20, 60);
    doc.text(`Fecha de Inicio: ${new Date(contract.startDate).toLocaleDateString()}`, 20, 70);

    doc.text("CLÁUSULAS GENERALES", 20, 90);
    doc.setFontSize(8);
    const splitText = doc.splitTextToSize(
        "1. El presente contrato garantiza los servicios de homenaje y cremación para la mascota designada. 2. Los pagos deberán realizarse puntualmente según el plan elegido. 3. En caso de siniestro, el titular deberá contactar a la línea de ayuda Aura 24/7.",
        170
    );
    doc.text(splitText, 20, 100);

    doc.save(`Contrato_AURA_${contract.id}.pdf`);
};
