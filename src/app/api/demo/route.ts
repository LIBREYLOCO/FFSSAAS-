import { NextResponse } from "next/server";
import prisma from "@/lib/db";

const USERS_DEMO = [
    { email: 'carlos.ops@aura.lat', name: 'Carlos Mendoza', role: 'ADMIN', password: 'aura2026' },
    { email: 'lucia.ventas@aura.lat', name: 'Lucía Herrera', role: 'VENDEDOR', password: 'aura2026' },
    { email: 'marco.ventas@aura.lat', name: 'Marco Pérez', role: 'VENDEDOR', password: 'aura2026' },
    { email: 'sofia.ventas@aura.lat', name: 'Sofía Ramírez', role: 'VENDEDOR', password: 'aura2026' },
    { email: 'ana.ventas@aura.lat', name: 'Ana González', role: 'VENDEDOR', password: 'aura2026' },
    { email: 'jose.chofer@aura.lat', name: 'José Luis Castillo', role: 'DRIVER', password: 'aura2026' },
    { email: 'pedro.chofer@aura.lat', name: 'Pedro Vázquez', role: 'DRIVER', password: 'aura2026' },
    { email: 'miguel.op@aura.lat', name: 'Miguel Ángel Torres', role: 'OPERADOR', password: 'aura2026' },
    { email: 'rosa.recep@aura.lat', name: 'Rosa Elena Fuentes', role: 'RECEPCION', password: 'aura2026' },
];

const VETS_DEMO = [
    { id: 'demo-vet-0', businessName: 'Clínica Veterinaria San Francisco', taxId: 'CSF130401AB1', address: 'Av. San Francisco 120, CDMX', contactName: 'Dra. Irene Campos', phone: '5551110001' },
    { id: 'demo-vet-1', businessName: 'Hospital Pet Care Plus', taxId: 'HPC190801CD2', address: 'Blvd. Hidalgo 88, Guadalajara', contactName: 'Dr. Ramón Estrada', phone: '5551110002' },
    { id: 'demo-vet-2', businessName: 'Veterinaria Animal Friends', taxId: 'VAF150302EF3', address: 'Calle Cedros 44, Monterrey', contactName: 'Dra. Cecilia Luna', phone: '5551110003' },
    { id: 'demo-vet-3', businessName: 'Centro Médico Pawsitive', taxId: 'CMP200501GH4', address: 'Paseo Reforma 500, CDMX', contactName: 'Dr. Javier Ríos', phone: '5551110004' },
    { id: 'demo-vet-4', businessName: 'Veterinaria Mi Mascota', taxId: 'VMM170901IJ5', address: 'Av. Juárez 33, Puebla', contactName: 'Dra. Laura Vega', phone: '5551110005' },
    { id: 'demo-vet-5', businessName: 'Clínica Canina del Norte', taxId: 'CCN180601KL6', address: 'Blvd. Torres 201, Monterrey', contactName: 'Dr. Arturo Mora', phone: '5551110006' },
    { id: 'demo-vet-6', businessName: 'Hospital Veterinario Peludos', taxId: 'HVP210301MN7', address: 'Calle Roble 77, Querétaro', contactName: 'Dra. Patricia Solis', phone: '5551110007' },
    { id: 'demo-vet-7', businessName: 'VetStar Clínica Premium', taxId: 'VST220101OP8', address: 'Av. del Bosque 15, CDMX', contactName: 'Dr. Fernando Nuñez', phone: '5551110008' },
    { id: 'demo-vet-8', businessName: 'Clínica Zoe & Friends', taxId: 'CZF160701QR9', address: 'Plaza Central 8, León', contactName: 'Dra. Mónica Parra', phone: '5551110009' },
    { id: 'demo-vet-9', businessName: 'Hospital Huellitas Felices', taxId: 'HHF140201ST0', address: 'Av. Insurgentes Sur 333, CDMX', contactName: 'Dr. Carlos Bravo', phone: '5551110010' },
];

const CLIENTS_DEMO = [
    { id: 'demo-owner-0', name: 'Fernanda López Soto', email: 'fernanda.lopez@gmail.com', phone: '5551234001', address: 'Av. Insurgentes 450, CDMX', source: 'Redes Sociales' },
    { id: 'demo-owner-1', name: 'Roberto Martínez Cruz', email: 'roberto.mc@hotmail.com', phone: '5551234002', address: 'Calle Roble 12, Guadalajara', source: 'Veterinaria' },
    { id: 'demo-owner-2', name: 'Claudia Ruiz Mora', email: 'claudia.ruiz@gmail.com', phone: '5551234003', address: 'Blvd. Juárez 88, Monterrey', source: 'Recomendación' },
    { id: 'demo-owner-3', name: 'Ernesto Sánchez Ávila', email: 'ernesto.sa@yahoo.com', phone: '5551234004', address: 'Paseo del Sol 200, Querétaro', source: 'Google' },
    { id: 'demo-owner-4', name: 'Patricia Flores Vega', email: 'patricia.flores@gmail.com', phone: '5551234005', address: 'Col. Del Valle 33, CDMX', source: 'Veterinaria' },
    { id: 'demo-owner-5', name: 'Diego Morales Reyes', email: 'diego.mr@gmail.com', phone: '5551234006', address: 'Av. Reforma 910, CDMX', source: 'Facebook' },
    { id: 'demo-owner-6', name: 'Valentina Castro Luna', email: 'vale.castro@icloud.com', phone: '5551234007', address: 'Calle Pino 5, Puebla', source: 'Instagram' },
    { id: 'demo-owner-7', name: 'Alejandro Nieto Bravo', email: 'alex.nieto@gmail.com', phone: '5551234008', address: 'Lomas de Chapultepec 77, CDMX', source: 'Recomendación' },
    { id: 'demo-owner-8', name: 'Mariana Gutiérrez Ponce', email: 'mariana.gp@gmail.com', phone: '5551234009', address: 'Av. Universidad 120, CDMX', source: 'Google' },
    { id: 'demo-owner-9', name: 'Ricardo Ibarra Salinas', email: 'ricardo.is@hotmail.com', phone: '5551234010', address: 'Calle Nogal 66, León', source: 'Redes Sociales' },
];

const PETS_DEMO = [
    { id: 'demo-pet-0', name: 'Max', species: 'Perro', breed: 'Golden Retriever', weightKg: 28.5, color: 'Dorado', ownerIdx: 0 },
    { id: 'demo-pet-1', name: 'Luna', species: 'Gato', breed: 'Siamés', weightKg: 4.2, color: 'Crema/Café', ownerIdx: 1 },
    { id: 'demo-pet-2', name: 'Rocky', species: 'Perro', breed: 'Labrador', weightKg: 32.0, color: 'Negro', ownerIdx: 2 },
    { id: 'demo-pet-3', name: 'Mia', species: 'Gato', breed: 'Persa', weightKg: 3.8, color: 'Blanco', ownerIdx: 3 },
    { id: 'demo-pet-4', name: 'Betu', species: 'Perro', breed: 'Beagle', weightKg: 12.5, color: 'Tricolor', ownerIdx: 0 },
    { id: 'demo-pet-5', name: 'Nala', species: 'Perro', breed: 'Husky Siberiano', weightKg: 22.0, color: 'Gris/Blanco', ownerIdx: 4 },
    { id: 'demo-pet-6', name: 'Oliver', species: 'Gato', breed: 'Maine Coon', weightKg: 6.5, color: 'Anaranjado', ownerIdx: 5 },
    { id: 'demo-pet-7', name: 'Coco', species: 'Perro', breed: 'Chihuahua', weightKg: 2.1, color: 'Café', ownerIdx: 6 },
    { id: 'demo-pet-8', name: 'Nina', species: 'Perro', breed: 'Poodle', weightKg: 5.5, color: 'Blanco', ownerIdx: 7 },
    { id: 'demo-pet-9', name: 'Thor', species: 'Perro', breed: 'Pastor Alemán', weightKg: 35.0, color: 'Negro/Café', ownerIdx: 8 },
    { id: 'demo-pet-10', name: 'Mochi', species: 'Gato', breed: 'Angora', weightKg: 4.0, color: 'Blanco', ownerIdx: 9 },
    { id: 'demo-pet-11', name: 'Simba', species: 'Perro', breed: 'Shih Tzu', weightKg: 6.8, color: 'Dorado/Blanco', ownerIdx: 1 },
    { id: 'demo-pet-12', name: 'Kira', species: 'Perro', breed: 'Border Collie', weightKg: 18.5, color: 'Negro/Blanco', ownerIdx: 2 },
    { id: 'demo-pet-13', name: 'Toby', species: 'Perro', breed: 'Dachshund', weightKg: 8.0, color: 'Café', ownerIdx: 3 },
    { id: 'demo-pet-14', name: 'Lola', species: 'Gato', breed: 'Bengalí', weightKg: 4.8, color: 'Moteado', ownerIdx: 4 },
    { id: 'demo-pet-15', name: 'Buddy', species: 'Perro', breed: 'Boxer', weightKg: 29.0, color: 'Atigrado', ownerIdx: 5 },
    { id: 'demo-pet-16', name: 'Cleo', species: 'Gato', breed: 'Ragdoll', weightKg: 5.2, color: 'Gris/Blanco', ownerIdx: 6 },
    { id: 'demo-pet-17', name: 'Pancho', species: 'Perro', breed: 'French Bulldog', weightKg: 11.0, color: 'Blanco/Negro', ownerIdx: 7 },
    { id: 'demo-pet-18', name: 'Dulce', species: 'Gato', breed: 'Scottish Fold', weightKg: 3.5, color: 'Gris', ownerIdx: 8 },
    { id: 'demo-pet-19', name: 'Príncipe', species: 'Perro', breed: 'Pomerania', weightKg: 3.2, color: 'Naranja', ownerIdx: 9 },
];

export async function POST(request: Request) {
    const { action } = await request.json();

    try {
        if (action === "load") {
            // Empleados
            for (const u of USERS_DEMO) {
                await prisma.user.upsert({
                    where: { email: u.email },
                    update: { name: u.name, role: u.role },
                    create: u,
                });
            }
            // Veterinarias
            for (const v of VETS_DEMO) {
                await prisma.veterinaryClinic.upsert({
                    where: { id: v.id },
                    update: { businessName: v.businessName, taxId: v.taxId, address: v.address, contactName: v.contactName, phone: v.phone },
                    create: v,
                });
            }
            // Clientes
            for (const c of CLIENTS_DEMO) {
                await prisma.owner.upsert({
                    where: { id: c.id },
                    update: { name: c.name, email: c.email, phone: c.phone, address: c.address, source: c.source },
                    create: c,
                });
            }
            // Mascotas
            for (const p of PETS_DEMO) {
                const ownerId = CLIENTS_DEMO[p.ownerIdx].id;
                await prisma.pet.upsert({
                    where: { id: p.id },
                    update: { name: p.name, species: p.species, breed: p.breed, weightKg: p.weightKg, color: p.color },
                    create: { id: p.id, name: p.name, species: p.species, breed: p.breed, weightKg: p.weightKg, color: p.color, ownerId },
                });
            }
            return NextResponse.json({ success: true, message: "✅ Datos demo cargados: 9 empleados, 10 veterinarias, 10 clientes, 20 mascotas." });
        }

        if (action === "clear") {
            await prisma.serviceOrderProduct.deleteMany({});
            await prisma.trackingLog.deleteMany({});
            await prisma.serviceOrder.deleteMany({});
            await prisma.payment.deleteMany({});
            await prisma.previsionContract.deleteMany({});
            await prisma.pet.deleteMany({ where: { id: { startsWith: 'demo-pet-' } } });
            await prisma.owner.deleteMany({ where: { id: { startsWith: 'demo-owner-' } } });
            await prisma.veterinaryClinic.deleteMany({ where: { id: { startsWith: 'demo-vet-' } } });
            await prisma.user.deleteMany({ where: { email: { in: USERS_DEMO.map(u => u.email) } } });
            await prisma.accessLog.deleteMany({});
            return NextResponse.json({ success: true, message: "🗑️ Datos demo eliminados correctamente." });
        }

        return NextResponse.json({ success: false, message: "Acción no válida" }, { status: 400 });
    } catch (err) {
        console.error("Demo API error:", err);
        return NextResponse.json({ success: false, message: "Error al procesar la acción demo." }, { status: 500 });
    }
}
