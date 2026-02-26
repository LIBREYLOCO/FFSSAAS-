const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const USERS = [
    { email: 'stdmexico@me.com', name: 'Master Admin', role: 'ADMIN', password: 'Libreyloco72$$' },
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

const CLIENTS = [
    { name: 'Fernanda López Soto', email: 'fernanda.lopez@gmail.com', phone: '5551234001', address: 'Av. Insurgentes 450, CDMX', source: 'Redes Sociales' },
    { name: 'Roberto Martínez Cruz', email: 'roberto.mc@hotmail.com', phone: '5551234002', address: 'Calle Roble 12, Guadalajara', source: 'Veterinaria' },
    { name: 'Claudia Ruiz Mora', email: 'claudia.ruiz@gmail.com', phone: '5551234003', address: 'Blvd. Juárez 88, Monterrey', source: 'Recomendación' },
    { name: 'Ernesto Sánchez Ávila', email: 'ernesto.sa@yahoo.com', phone: '5551234004', address: 'Paseo del Sol 200, Querétaro', source: 'Google' },
    { name: 'Patricia Flores Vega', email: 'patricia.flores@gmail.com', phone: '5551234005', address: 'Col. Del Valle 33, CDMX', source: 'Veterinaria' },
    { name: 'Diego Morales Reyes', email: 'diego.mr@gmail.com', phone: '5551234006', address: 'Av. Reforma 910, CDMX', source: 'Facebook' },
    { name: 'Valentina Castro Luna', email: 'vale.castro@icloud.com', phone: '5551234007', address: 'Calle Pino 5, Puebla', source: 'Instagram' },
    { name: 'Alejandro Nieto Bravo', email: 'alex.nieto@gmail.com', phone: '5551234008', address: 'Lomas de Chapultepec 77, CDMX', source: 'Recomendación' },
    { name: 'Mariana Gutiérrez Ponce', email: 'mariana.gp@gmail.com', phone: '5551234009', address: 'Av. Universidad 120, CDMX', source: 'Google' },
    { name: 'Ricardo Ibarra Salinas', email: 'ricardo.is@hotmail.com', phone: '5551234010', address: 'Calle Nogal 66, León', source: 'Redes Sociales' },
];

const VETERINARIAS = [
    { businessName: 'Clínica Veterinaria San Francisco', taxId: 'CSF130401AB1', address: 'Av. San Francisco 120, CDMX', contactName: 'Dra. Irene Campos', phone: '5551110001' },
    { businessName: 'Hospital Pet Care Plus', taxId: 'HPC190801CD2', address: 'Blvd. Hidalgo 88, Guadalajara', contactName: 'Dr. Ramón Estrada', phone: '5551110002' },
    { businessName: 'Veterinaria Animal Friends', taxId: 'VAF150302EF3', address: 'Calle Cedros 44, Monterrey', contactName: 'Dra. Cecilia Luna', phone: '5551110003' },
    { businessName: 'Centro Médico Pawsitive', taxId: 'CMP200501GH4', address: 'Paseo Reforma 500, CDMX', contactName: 'Dr. Javier Ríos', phone: '5551110004' },
    { businessName: 'Veterinaria Mi Mascota', taxId: 'VMM170901IJ5', address: 'Av. Juárez 33, Puebla', contactName: 'Dra. Laura Vega', phone: '5551110005' },
    { businessName: 'Clínica Canina del Norte', taxId: 'CCN180601KL6', address: 'Blvd. Torres 201, Monterrey', contactName: 'Dr. Arturo Mora', phone: '5551110006' },
    { businessName: 'Hospital Veterinario Peludos', taxId: 'HVP210301MN7', address: 'Calle Roble 77, Querétaro', contactName: 'Dra. Patricia Solis', phone: '5551110007' },
    { businessName: 'VetStar Clínica Premium', taxId: 'VST220101OP8', address: 'Av. del Bosque 15, CDMX', contactName: 'Dr. Fernando Nuñez', phone: '5551110008' },
    { businessName: 'Clínica Zoe & Friends', taxId: 'CZF160701QR9', address: 'Plaza Central 8, León', contactName: 'Dra. Mónica Parra', phone: '5551110009' },
    { businessName: 'Hospital Huellitas Felices', taxId: 'HHF140201ST0', address: 'Av. Insurgentes Sur 333, CDMX', contactName: 'Dr. Carlos Bravo', phone: '5551110010' },
];

const MASCOTAS = [
    { name: 'Max', species: 'Perro', breed: 'Golden Retriever', weightKg: 28.5, color: 'Dorado', ownerIdx: 0 },
    { name: 'Luna', species: 'Gato', breed: 'Siamés', weightKg: 4.2, color: 'Crema/Café', ownerIdx: 1 },
    { name: 'Rocky', species: 'Perro', breed: 'Labrador', weightKg: 32.0, color: 'Negro', ownerIdx: 2 },
    { name: 'Mia', species: 'Gato', breed: 'Persa', weightKg: 3.8, color: 'Blanco', ownerIdx: 3 },
    { name: 'Betu', species: 'Perro', breed: 'Beagle', weightKg: 12.5, color: 'Tricolor', ownerIdx: 0 },
    { name: 'Nala', species: 'Perro', breed: 'Husky Siberiano', weightKg: 22.0, color: 'Gris/Blanco', ownerIdx: 4 },
    { name: 'Oliver', species: 'Gato', breed: 'Maine Coon', weightKg: 6.5, color: 'Anaranjado', ownerIdx: 5 },
    { name: 'Coco', species: 'Perro', breed: 'Chihuahua', weightKg: 2.1, color: 'Café', ownerIdx: 6 },
    { name: 'Nina', species: 'Perro', breed: 'Poodle', weightKg: 5.5, color: 'Blanco', ownerIdx: 7 },
    { name: 'Thor', species: 'Perro', breed: 'Pastor Alemán', weightKg: 35.0, color: 'Negro/Café', ownerIdx: 8 },
    { name: 'Mochi', species: 'Gato', breed: 'Angora', weightKg: 4.0, color: 'Blanco', ownerIdx: 9 },
    { name: 'Simba', species: 'Perro', breed: 'Shih Tzu', weightKg: 6.8, color: 'Dorado/Blanco', ownerIdx: 1 },
    { name: 'Kira', species: 'Perro', breed: 'Border Collie', weightKg: 18.5, color: 'Negro/Blanco', ownerIdx: 2 },
    { name: 'Toby', species: 'Perro', breed: 'Dachshund', weightKg: 8.0, color: 'Café', ownerIdx: 3 },
    { name: 'Lola', species: 'Gato', breed: 'Bengalí', weightKg: 4.8, color: 'Moteado', ownerIdx: 4 },
    { name: 'Buddy', species: 'Perro', breed: 'Boxer', weightKg: 29.0, color: 'Atigrado', ownerIdx: 5 },
    { name: 'Cleo', species: 'Gato', breed: 'Ragdoll', weightKg: 5.2, color: 'Gris/Blanco', ownerIdx: 6 },
    { name: 'Pancho', species: 'Perro', breed: 'French Bulldog', weightKg: 11.0, color: 'Blanco/Negro', ownerIdx: 7 },
    { name: 'Dulce', species: 'Gato', breed: 'Scottish Fold', weightKg: 3.5, color: 'Gris', ownerIdx: 8 },
    { name: 'Príncipe', species: 'Perro', breed: 'Pomerania', weightKg: 3.2, color: 'Naranja', ownerIdx: 9 },
];

async function loadDemoData() {
    console.log('🌱 Cargando datos demo...\n');

    // 1. Usuarios / Empleados
    for (const u of USERS) {
        const user = await prisma.user.upsert({
            where: { email: u.email },
            update: { name: u.name, role: u.role, password: u.password },
            create: u,
        });
        console.log(`✅ Usuario: ${user.name} (${user.role})`);
    }

    // 2. Veterinarias (id fijo para poder hacer upsert)
    const createdVets = [];
    for (let i = 0; i < VETERINARIAS.length; i++) {
        const v = VETERINARIAS[i];
        const vet = await prisma.veterinaryClinic.upsert({
            where: { id: `demo-vet-${i}` },
            update: { businessName: v.businessName, taxId: v.taxId, address: v.address, contactName: v.contactName, phone: v.phone },
            create: { id: `demo-vet-${i}`, ...v },
        });
        createdVets.push(vet);
        console.log(`✅ Veterinaria: ${vet.businessName}`);
    }

    // 3. Clientes (Owners) por id fijo
    const createdOwners = [];
    for (let i = 0; i < CLIENTS.length; i++) {
        const c = CLIENTS[i];
        const owner = await prisma.owner.upsert({
            where: { id: `demo-owner-${i}` },
            update: c,
            create: { id: `demo-owner-${i}`, ...c },
        });
        createdOwners.push(owner);
        console.log(`✅ Cliente: ${owner.name}`);
    }

    // 4. Mascotas por id fijo
    for (let i = 0; i < MASCOTAS.length; i++) {
        const m = MASCOTAS[i];
        const owner = createdOwners[m.ownerIdx];
        const pet = await prisma.pet.upsert({
            where: { id: `demo-pet-${i}` },
            update: { name: m.name, species: m.species, breed: m.breed, weightKg: m.weightKg, color: m.color },
            create: { id: `demo-pet-${i}`, name: m.name, species: m.species, breed: m.breed, weightKg: m.weightKg, color: m.color, ownerId: owner.id },
        });
        console.log(`✅ Mascota: ${pet.name} (${m.species} - ${m.breed})`);
    }

    console.log('\n🎉 ¡Datos demo cargados exitosamente!');
}

async function clearDemoData() {
    console.log('🗑️  Limpiando datos demo...');
    await prisma.serviceOrderProduct.deleteMany({});
    await prisma.trackingLog.deleteMany({});
    await prisma.serviceOrder.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.previsionContract.deleteMany({});
    await prisma.pet.deleteMany({ where: { id: { startsWith: 'demo-pet-' } } });
    await prisma.owner.deleteMany({ where: { id: { startsWith: 'demo-owner-' } } });
    await prisma.veterinaryClinic.deleteMany({ where: { id: { startsWith: 'demo-vet-' } } });
    await prisma.user.deleteMany({ where: { email: { in: USERS.slice(1).map(u => u.email) } } });
    await prisma.accessLog.deleteMany({});
    console.log('✅ Datos demo eliminados.');
}

async function main() {
    const action = process.argv[2] || 'load';
    if (action === 'clear') {
        await clearDemoData();
    } else {
        await loadDemoData();
    }
}

main()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
