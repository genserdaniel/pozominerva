const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

let cachedContext = null;

/**
 * Carga el PDF de contexto y lo convierte a texto
 * El PDF debe estar en client/public/pdfs/contexto-chat.pdf
 */
async function loadPDFContext() {
  if (cachedContext) {
    return cachedContext;
  }

  try {
    const pdfPath = path.join(__dirname, '../../client/public/pdfs/contexto-chat.pdf');

    // Verificar si el archivo existe
    if (!fs.existsSync(pdfPath)) {
      console.warn('⚠️ PDF de contexto no encontrado en:', pdfPath);
      console.warn('⚠️ Usando contexto por defecto');
      return getDefaultContext();
    }

    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer);

    // Límite aumentado a ~500,000 caracteres (~125,000 tokens)
    // Esto deja espacio para el system prompt, mensaje del usuario y respuesta
    // Modelo gpt-4o-mini tiene límite de 128,000 tokens total
    const MAX_CHARS = 500000;
    const fullText = data.text;
    cachedContext = fullText.length > MAX_CHARS
      ? fullText.substring(0, MAX_CHARS) + '\n\n[... Contenido truncado por límite de tamaño ...]'
      : fullText;

    console.log('✅ PDF de contexto cargado exitosamente');
    console.log(`📄 Páginas: ${data.numpages}, Caracteres originales: ${fullText.length}, Caracteres usados: ${cachedContext.length}`);
    console.log(`📊 Tokens estimados del PDF: ~${Math.floor(cachedContext.length / 4)}`);

    if (fullText.length > MAX_CHARS) {
      console.warn(`⚠️ PDF truncado: Se usarán los primeros ${MAX_CHARS} caracteres (~${Math.floor(MAX_CHARS / 4)} tokens)`);
    }

    return cachedContext;
  } catch (error) {
    console.error('❌ Error al cargar PDF de contexto:', error.message);
    console.log('⚠️ Usando contexto por defecto');
    return getDefaultContext();
  }
}

/**
 * Contexto por defecto si no se encuentra el PDF
 */
function getDefaultContext() {
  return `
INFORMACIÓN DEL PROYECTO POZO DE MINERVA

UBICACIÓN:
- Dirección: 18-75 Bulevar San Nicolás, Zona 4, Mixco
- Área de influencia: Colonias San Nicolás (CSN-1, CSN-2, CSN-3), Vistas del Naranjo, Montserrat, y áreas circundantes

CARACTERÍSTICAS DEL PROYECTO:
- Tipo: Pozo mecánico profundo
- Profundidad: ~457 metros (1,500 pies)
- Diámetro de perforación: 17.5 pulgadas
- Entubado: 12 pulgadas (197 pies liso + 1,303 pies ranurado)
- Población objetivo: ~11,650 personas
- Infraestructura: Caseta de máquinas, cuarto de cloración, conexión a red municipal

CLASIFICACIÓN AMBIENTAL:
- Categoría actual: B2 (bajo impacto) - MARN
- Fecha de aprobación: 03-Feb-2025
- Expediente: EAI-S-01579-2024

CINCO RAZONES PARA PREOCUPACIÓN:

1. CLASIFICACIÓN AMBIENTAL DISCUTIBLE (B2 vs B1)
   - Un pozo tan profundo puede tener impacto "moderado" (B1)
   - B1 requiere mayor participación ciudadana
   - El cono de abatimiento puede afectar pozos vecinos

2. PERMISOS SECTORIALES FALTANTES
   - Se requiere aval sanitario del MSPAS
   - La resolución MARN NO autoriza aprovechamiento de aguas
   - Faltan validaciones técnicas previas a construcción

3. CONDICIONES ESTRICTAS DEL MARN
   - Manejo de lodos según Acuerdo 236-2006
   - Bitácora de niveles freáticos obligatoria
   - Análisis fisicoquímicos semestrales
   - Prohibición de depositar materiales en cauces
   - Cualquier incumplimiento habilita suspensión

4. CONTRATACIÓN PÚBLICA
   - Proceso sujeto a control de Contraloría y Guatecompras
   - Posibles impugnaciones por bases restrictivas
   - Se requiere actualización de estudios técnicos

5. UBICACIÓN URBANA SENSIBLE
   - Corredor vial principal (Bulevar San Nicolás)
   - Cercanía a áreas residenciales densas
   - Riesgo de ruido, vibración, polvo
   - Afectación al tránsito vehicular
   - Posible daño a instalaciones existentes

ACCIONES CIUDADANAS DISPONIBLES:
1. Solicitar revisión de categoría al MARN (B2 → B1)
2. Requerir aval sanitario del MSPAS
3. Vigilancia de obra y denuncias técnicas
4. Auditoría social de la licitación
5. Solicitar plan de manejo de tránsito/ruido a la Municipalidad

DERECHOS CIUDADANOS:
- Acceso a información pública
- Participación en procesos ambientales
- Denuncia de incumplimientos
- Solicitud de medidas cautelares
- Impugnación de procesos de compra

IMPORTANTE:
Este proyecto PUEDE ser beneficioso si se ejecuta correctamente, con todas las salvaguardas legales y técnicas. La preocupación vecinal es LEGÍTIMA y debe canalizarse por vías legales y administrativas apropiadas.
  `.trim();
}

/**
 * Limpiar caché (útil para desarrollo)
 */
function clearCache() {
  cachedContext = null;
}

module.exports = {
  loadPDFContext,
  clearCache,
  getDefaultContext
};
