const express = require('express');
const router = express.Router();

// Metadatos de los 5 PDFs oficiales del proyecto
const pdfs = [
  {
    id: 1,
    title: 'Resolución Ambiental MARN (B2)',
    filename: 'resolucion-ambiental-marn.pdf',
    description: 'Resolución EAI-S-01579-2024 con categoría B2 y condiciones de construcción y operación. Incluye obligaciones de manejo de lodos, residuos, bitácoras y análisis semestrales.',
    category: 'ambiental',
    date: '2025-02-03',
    size: 'TBD',
    pages: 'TBD'
  },
  {
    id: 2,
    title: 'Estudio/Sondeo Hidrogeológico',
    filename: 'estudio-hidrogeologico.pdf',
    description: 'Estudio técnico que recomienda profundidad de 1,500 pies, método de perforación y monitoreo continuo. Detalla acuíferos en rocas volcánicas fracturadas y riesgos de sobreexplotación.',
    category: 'tecnico',
    date: 'TBD',
    size: 'TBD',
    pages: 'TBD'
  },
  {
    id: 3,
    title: 'Estudio de Factibilidad',
    filename: 'estudio-factibilidad.pdf',
    description: 'Dimensiona la escala del sistema para ~11,650 beneficiarios. Localiza el proyecto en 18-75 Bulevar San Nicolás, zona 4 de Mixco.',
    category: 'tecnico',
    date: 'TBD',
    size: 'TBD',
    pages: 'TBD'
  },
  {
    id: 4,
    title: 'Especificaciones Técnicas y Planos',
    filename: 'especificaciones-tecnicas.pdf',
    description: 'Describe caseta, cloración, conexión a red, pruebas de bombeo (48 h), registro eléctrico y validación de estudios. Incluye planos arquitectónicos y de ingeniería.',
    category: 'tecnico',
    date: 'TBD',
    size: 'TBD',
    pages: 'TBD'
  },
  {
    id: 5,
    title: 'Dictamen Jurídico y Nombramiento de Supervisor',
    filename: 'dictamen-juridico-supervisor.pdf',
    description: 'Dictamen jurídico 12-2025 A.J. favorable para continuar licitación y resolución del Concejo Municipal (6 de junio) con nombramiento de supervisor del proyecto.',
    category: 'legal',
    date: '2025-06-06',
    size: 'TBD',
    pages: 'TBD'
  }
];

// GET /api/pdfs - Obtener metadatos de todos los PDFs
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: pdfs,
    total: pdfs.length
  });
});

// GET /api/pdfs/:id - Obtener metadatos de un PDF específico
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const pdf = pdfs.find(p => p.id === id);

  if (!pdf) {
    return res.status(404).json({
      success: false,
      message: 'PDF no encontrado'
    });
  }

  res.json({
    success: true,
    data: pdf
  });
});

// GET /api/pdfs/category/:category - Filtrar por categoría
router.get('/category/:category', (req, res) => {
  const { category } = req.params;
  const filtered = pdfs.filter(p => p.category === category);

  res.json({
    success: true,
    data: filtered,
    total: filtered.length
  });
});

module.exports = router;
