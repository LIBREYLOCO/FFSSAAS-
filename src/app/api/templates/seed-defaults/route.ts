import { NextResponse } from "next/server";
import prisma from "@/lib/db";

const DEFAULT_TEMPLATES = [
    {
        id: "tpl-prevision-default",
        name: "Contrato de Previsión Estándar",
        category: "PREVISION",
        content: `CONTRATO DE SERVICIOS FUNERARIOS DE PREVISIÓN PARA MASCOTAS

Número de Contrato: [Asignado al confirmar]
Empresa: {{EMPRESA_NOMBRE}}
Fecha de Celebración: {{FECHA_ACTUAL}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PARTES CONTRATANTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EL PRESTADOR: {{EMPRESA_NOMBRE}}, representado en este acto por {{REPRESENTANTE}}, empresa especializada en servicios de cremación individual, honras fúnebres y acompañamiento emocional para mascotas y sus familias.

EL CONTRATANTE: {{CLIENTE_NOMBRE}}, con domicilio en {{CLIENTE_DIRECCION}}.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OBJETO DEL CONTRATO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

El PRESTADOR se compromete formalmente a brindar al CONTRATANTE los servicios funerarios para mascota bajo el Plan denominado "{{PLAN_NOMBRE}}", por un valor total de {{PLAN_PRECIO}}, garantizando dignidad, respeto y transparencia en cada etapa del proceso.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SERVICIOS INCLUIDOS EN EL PLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Recolección de la mascota en domicilio del CONTRATANTE (CDMX y área metropolitana)
2. Traslado digno en vehículo especializado y refrigerado
3. Cremación individual certificada — sin mezcla de restos con otras mascotas
4. Certificado Oficial de Cremación con número de folio único
5. Entrega de cenizas en urna básica incluida
6. Bitácora fotográfica digital del proceso
7. Acompañamiento personalizado y asesoría al familiar durante el proceso

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONDICIONES ECONÓMICAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Precio Total del Plan: {{PLAN_PRECIO}}
Fecha de Inicio del Contrato: {{FECHA_ACTUAL}}
El esquema de pagos mensuales queda establecido en los recibos emitidos al momento de la contratación. Los pagos deberán realizarse de forma puntual para mantener la vigencia de los beneficios.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VIGENCIA Y CONDICIONES GENERALES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRIMERA (Vigencia): Este contrato tiene vigencia indefinida desde la fecha de firma hasta la utilización total del servicio. No tiene fecha de vencimiento.

SEGUNDA (Cesión de plan): El CONTRATANTE podrá ceder este plan a cualquier mascota de su propiedad al momento de requerir el servicio, sin costo adicional.

TERCERA (Mora en pagos): En caso de mora mayor a 60 días naturales consecutivos en los pagos, {{EMPRESA_NOMBRE}} podrá suspender temporalmente los beneficios del plan hasta que se regularice el adeudo, sin cancelar el contrato.

CUARTA (Calidad garantizada): El PRESTADOR garantiza la cremación individual de la mascota, sin mezcla de restos de otros animales, bajo los más altos estándares de dignidad, ética y respeto.

QUINTA (Notificación del servicio): El CONTRATANTE deberá notificar al PRESTADOR con al menos 2 horas de anticipación para coordinar el servicio de recolección de la mascota.

SEXTA (Transmisión de derechos): En caso de fallecimiento del CONTRATANTE, los derechos del presente contrato podrán ser transferidos a un familiar directo mediante notificación por escrito y presentación de documentación oficial.

SÉPTIMA (Responsabilidades): {{EMPRESA_NOMBRE}} no se hace responsable por el deterioro natural de la mascota en caso de demora atribuible al CONTRATANTE en la notificación del fallecimiento.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Leído íntegramente y firmado de conformidad por ambas partes en la Ciudad de México, a {{FECHA_ACTUAL}}.

EL CONTRATANTE: _________________________        EL PRESTADOR: _________________________
{{CLIENTE_NOMBRE}}                                {{REPRESENTANTE}}
                                                  {{EMPRESA_NOMBRE}}`
    },
    {
        id: "tpl-inmediato-default",
        name: "Orden de Servicio Inmediato",
        category: "INMEDIATO",
        content: `ORDEN DE SERVICIO INMEDIATO — CREMACIÓN DE MASCOTA

Folio: [Asignado al confirmar]
Empresa: {{EMPRESA_NOMBRE}}
Representante: {{REPRESENTANTE}}
Fecha de Emisión: {{FECHA_ACTUAL}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DATOS DEL TITULAR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Nombre Completo: {{CLIENTE_NOMBRE}}
Domicilio: {{CLIENTE_DIRECCION}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DESCRIPCIÓN DEL SERVICIO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Servicio Solicitado: {{PLAN_NOMBRE}}
Precio Total: {{PLAN_PRECIO}}
Tipo de Servicio: INMEDIATO — Atención prioritaria
Forma de Pago: Pago único al momento de la entrega de la mascota o al inicio del servicio.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DECLARACIÓN JURADA DEL TITULAR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Yo, {{CLIENTE_NOMBRE}}, en pleno uso de mis facultades, declaro bajo protesta de decir verdad:

1. Ser el legítimo propietario o tutor responsable de la mascota que entrego en este acto para su cremación individual.

2. Que la mascota ha fallecido de forma natural, por causas de salud, o ha sido sometida a eutanasia humanitaria practicada por un Médico Veterinario Zootecnista debidamente certificado.

3. Que autorizo expresamente a {{EMPRESA_NOMBRE}} a llevar a cabo el proceso completo de cremación individual de mi mascota de manera inmediata y de acuerdo con los protocolos establecidos por la empresa.

4. Que he recibido información completa sobre el proceso de cremación, los tiempos estimados de entrega, las condiciones del servicio y los accesorios disponibles.

5. Que comprendo que el proceso de cremación es irreversible y que una vez iniciado no podrá realizarse cambio alguno en las condiciones del servicio.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SERVICIOS INCLUIDOS EN EL PLAN INMEDIATO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Recepción de mascota en instalaciones o recolección a domicilio (zona metropolitana)
✓ Traslado digno en unidad refrigerada y especializada
✓ Cremación individual certificada en horno de última generación
✓ Certificado Oficial de Cremación con número de folio único e impresión de sello oficial
✓ Entrega de cenizas en urna de madera básica incluida
✓ Registro fotográfico digital del proceso (envío por WhatsApp o correo electrónico)
✓ Acompañamiento y orientación al familiar durante todo el proceso

Tiempo estimado de entrega de cenizas: 24 a 48 horas hábiles a partir del ingreso de la mascota.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
POLÍTICA DE PRIVACIDAD Y TRATAMIENTO DE DATOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{{EMPRESA_NOMBRE}} se compromete a resguardar y proteger los datos personales del TITULAR de conformidad con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP). La información proporcionada será utilizada exclusivamente para la prestación del servicio contratado.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Firmado en conformidad con todas las condiciones descritas anteriormente.

Ciudad de México, {{FECHA_ACTUAL}}.

EL TITULAR: _________________________          POR {{EMPRESA_NOMBRE}}:
{{CLIENTE_NOMBRE}}                             {{REPRESENTANTE}}`
    },
    {
        id: "tpl-anexo-default",
        name: "Anexo de Servicios y Accesorios",
        category: "ANEXO",
        content: `ANEXO DE SERVICIOS ADICIONALES Y ACCESORIOS CONMEMORATIVOS

Contrato Principal: [Número de Contrato]
Titular: {{CLIENTE_NOMBRE}}
Domicilio: {{CLIENTE_DIRECCION}}
Fecha de Emisión: {{FECHA_ACTUAL}}
Empresa: {{EMPRESA_NOMBRE}}
Representante: {{REPRESENTANTE}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INTRODUCCIÓN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

El presente documento constituye un Anexo complementario al Contrato Principal de Servicios Funerarios para Mascotas celebrado entre {{EMPRESA_NOMBRE}} y el TITULAR {{CLIENTE_NOMBRE}}. Este Anexo describe los productos y servicios adicionales acordados, los cuales se suman a los beneficios incluidos en el plan base contratado.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATÁLOGO DE PRODUCTOS Y SERVICIOS ADICIONALES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

URNAS Y CONTENEDORES ESPECIALES:
[ ] Urna de madera premium con grabado láser del nombre de la mascota
[ ] Urna de cerámica artesanal con fotografía personalizada
[ ] Urna metálica sellada de alta durabilidad
[ ] Caja conmemorativa de madera tallada con diseño personalizado

RELICARIOS Y JOYERÍA:
[ ] Relicario metálico con huella dactilar de la mascota
[ ] Medallón con cenizas incluidas — plata 925
[ ] Collar conmemorativo con cápsula de cenizas
[ ] Llavero memorial personalizado

PRODUCTOS CONMEMORATIVOS:
[ ] Marco de fotos conmemorativo con espacio para cenizas
[ ] Cuadro de huellas con nombre y fechas grabadas
[ ] Fotografía impresa del último momento (si aplica)
[ ] Libro de memorias personalizado

SERVICIOS ESPECIALES:
[ ] Servicio de entrega a domicilio de cenizas (urgente: misma jornada)
[ ] Incineración de accesorios de la mascota (correa, juguetes, etc.)
[ ] Jardín conmemorativo virtual — suscripción anual con álbum digital
[ ] Certificado premium enmarcado con sello y firma original
[ ] Servicio de capilla ardiente (1 a 3 horas para despedida familiar)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONDICIONES DE LOS PRODUCTOS ADICIONALES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. TIEMPO DE ENTREGA: Los productos adicionales serán entregados en un plazo de 3 a 15 días hábiles dependiendo del nivel de personalización requerido. Productos en stock: entrega inmediata junto con las cenizas.

2. FORMA DE PAGO: El pago de todos los accesorios y servicios adicionales debe realizarse al momento de la selección o al inicio del proceso, previo a la producción o reserva.

3. POLÍTICA DE DEVOLUCIONES: Los productos personalizados (grabados, fotografías, joyas con cenizas) no admiten devolución ni cambio una vez iniciada su producción, por tratarse de artículos únicos e irrepetibles.

4. GARANTÍA DE CALIDAD: {{EMPRESA_NOMBRE}} garantiza la calidad de todos los productos ofrecidos en este catálogo. En caso de defecto de fabricación, se reemplazará el artículo sin costo adicional.

5. PROVEEDORES CERTIFICADOS: Todos los productos son fabricados o adquiridos con proveedores nacionales e internacionales certificados, que cumplen con estándares éticos y de calidad.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONFORMIDAD Y FIRMA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

El TITULAR {{CLIENTE_NOMBRE}} confirma haber revisado, seleccionado y acordado los servicios y productos adicionales descritos en este Anexo, bajo plena conformidad y sin presión alguna.

Los productos marcados con [✓] han sido seleccionados y deberán ser liquidados conforme a lo acordado.

Ciudad de México, {{FECHA_ACTUAL}}.

EL TITULAR: _________________________          POR {{EMPRESA_NOMBRE}}:
{{CLIENTE_NOMBRE}}                             {{REPRESENTANTE}}`
    },
    {
        id: "tpl-inventario-default",
        name: "Control de Inventario de Servicio",
        category: "INVENTARIO",
        content: `DOCUMENTO DE INVENTARIO Y CONTROL DE SERVICIO

Folio de Control: [Asignado automáticamente]
Empresa: {{EMPRESA_NOMBRE}}
Responsable: {{REPRESENTANTE}}
Fecha de Elaboración: {{FECHA_ACTUAL}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DATOS DEL SERVICIO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Titular del Contrato: {{CLIENTE_NOMBRE}}
Domicilio: {{CLIENTE_DIRECCION}}
Plan / Servicio: {{PLAN_NOMBRE}}
Valor del Servicio: {{PLAN_PRECIO}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RELACIÓN DE MATERIALES Y PRODUCTOS UTILIZADOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ARTÍCULO                              CANTIDAD    ESTADO          OBSERVACIONES
──────────────────────────────────────────────────────────────────────────────
Urna básica de madera                 1           [ ] Entregada   _______________
Bolsa de cenizas certificada          1           [ ] Embolsada   _______________
Certificado oficial de cremación      1           [ ] Firmado     _______________
Copia del contrato (titular)          1           [ ] Entregada   _______________
Copia del contrato (archivo)          1           [ ] Archivada   _______________
Etiqueta de identificación            1           [ ] Colocada    _______________
Registro fotográfico digital          1           [ ] Enviado     _______________
Accesorios adicionales (si aplica)    -           [ ] Entregados  Ver Anexo
Recibo de pago                        1           [ ] Entregado   _______________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LISTA DE VERIFICACIÓN DEL PROCESO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RECEPCIÓN Y REGISTRO:
[ ] Mascota recibida y registrada en el sistema
[ ] Folio asignado e identificación colocada
[ ] Fotografía de recepción tomada
[ ] Peso y características registradas
[ ] Titular notificado de ingreso

PROCESO DE CREMACIÓN:
[ ] Horno asignado y verificado
[ ] Temperatura de operación alcanzada (mínimo 700°C)
[ ] Mascota ingresada al horno con identificación
[ ] Tiempo de cremación registrado: _____ horas
[ ] Operador responsable: _____________________

FINALIZACIÓN Y ENTREGA:
[ ] Cenizas enfriadas y separadas correctamente
[ ] Cenizas pesadas y registradas: _____ gramos
[ ] Embolsado y sellado completado
[ ] Urna o contenedor elegido por el titular listo
[ ] Certificado de cremación generado con folio único
[ ] Certificado firmado por el operador y el responsable
[ ] Notificación de entrega enviada al titular
[ ] Entrega realizada al titular o representante autorizado
[ ] Firma de recibido del titular obtenida
[ ] Expediente completo archivado

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OBSERVACIONES Y NOTAS INTERNAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

_______________________________________________________________________________
_______________________________________________________________________________
_______________________________________________________________________________
_______________________________________________________________________________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIRMAS DE CONTROL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Operador Responsable: _______________________   Fecha: _______________

Supervisor de Calidad: _______________________   Fecha: _______________

Entregado a / Recibido por: _______________________   Fecha: _______________
{{CLIENTE_NOMBRE}}

Representante {{EMPRESA_NOMBRE}}: _______________________
{{REPRESENTANTE}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NOTA LEGAL

Este documento tiene carácter de constancia interna del proceso y puede ser solicitado por el titular del contrato en cualquier momento dentro de los 5 años siguientes a la prestación del servicio. {{EMPRESA_NOMBRE}} conserva copia del mismo en su archivo de conformidad con las disposiciones legales aplicables.

Emitido a {{FECHA_ACTUAL}} — {{EMPRESA_NOMBRE}}`
    }
];

export async function POST() {
    try {
        let created = 0;
        for (const tpl of DEFAULT_TEMPLATES) {
            const exists = await prisma.contractTemplate.findUnique({ where: { id: tpl.id } });
            if (!exists) {
                await prisma.contractTemplate.create({ data: { ...tpl, isActive: true } });
                created++;
            }
        }
        return NextResponse.json({ message: `${created} plantilla(s) creada(s). ${DEFAULT_TEMPLATES.length - created} ya existía(n).`, created });
    } catch (error: any) {
        console.error("Error seeding templates:", error);
        return NextResponse.json({ error: error.message || "Error al crear plantillas" }, { status: 500 });
    }
}
