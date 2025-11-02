// Colonias de la zona 4 de Mixco, Guatemala
export const colonias = [
  // Colonias San Nicolás
  { value: 'Bosques de San Nicolás', label: 'Bosques de San Nicolás', category: 'San Nicolás' },
  { value: 'Condado San Nicolás I', label: 'Condado San Nicolás I', category: 'San Nicolás' },
  { value: 'Condado San Nicolás II', label: 'Condado San Nicolás II', category: 'San Nicolás' },
  { value: 'Condado San Nicolás III', label: 'Condado San Nicolás III', category: 'San Nicolás' },
  { value: 'El Cortijo de San Nicolás', label: 'El Cortijo de San Nicolás', category: 'San Nicolás' },

  // Área Naranjo-Montserrat
  { value: 'Vistas del Naranjo', label: 'Vistas del Naranjo', category: 'Naranjo' },
  { value: 'Colonia Montserrat I', label: 'Colonia Montserrat I', category: 'Montserrat' },
  { value: 'Colonia Montserrat II', label: 'Colonia Montserrat II', category: 'Montserrat' },
  { value: 'Colonia Montserrat', label: 'Colonia Montserrat', category: 'Montserrat' },
  { value: 'Colonia Valles del Naranjo', label: 'Colonia Valles del Naranjo', category: 'Naranjo' },
  { value: 'Colonia El Naranjo', label: 'Colonia El Naranjo', category: 'Naranjo' },
  { value: 'Villas Naranjo', label: 'Villas Naranjo', category: 'Naranjo' },
  { value: 'Condado Naranjo', label: 'Condado Naranjo', category: 'Naranjo' },
  { value: 'Aldea Naranjo', label: 'Aldea Naranjo', category: 'Naranjo' },

  // Área Minerva
  { value: 'Colinas de Minerva', label: 'Colinas de Minerva', category: 'Minerva' },
  { value: 'Planes de Minerva', label: 'Planes de Minerva', category: 'Minerva' },
  { value: 'Minerva Sur', label: 'Minerva Sur', category: 'Minerva' },
  { value: 'Jardines de Minerva', label: 'Jardines de Minerva', category: 'Minerva' },

  // Otras Colonias Establecidas
  { value: 'Colonia Primero de Mayo', label: 'Colonia Primero de Mayo', category: 'Otras' },
  { value: 'Colonia Monte Verde', label: 'Colonia Monte Verde', category: 'Otras' },
  { value: 'Colonia Monte Real', label: 'Colonia Monte Real', category: 'Otras' },
  { value: 'Colonia Valle del Sol', label: 'Colonia Valle del Sol', category: 'Otras' },
  { value: 'Villas de San José I', label: 'Villas de San José I', category: 'Otras' },
  { value: 'Valle Nuevo I', label: 'Valle Nuevo I', category: 'Otras' },
  { value: 'Residencial El Valle', label: 'Residencial El Valle', category: 'Otras' },
  { value: 'Residencial El Encinal', label: 'Residencial El Encinal', category: 'Otras' },
  { value: 'Residencial San Ignacio', label: 'Residencial San Ignacio', category: 'Otras' },
  { value: 'Residencial Villas del Rosario', label: 'Residencial Villas del Rosario', category: 'Otras' },
  { value: 'Condominio La Fontana', label: 'Condominio La Fontana', category: 'Otras' },
  { value: 'Jardines de Tulam Tzu', label: 'Jardines de Tulam Tzu', category: 'Otras' },
  { value: 'Villas Nimajay', label: 'Villas Nimajay', category: 'Otras' },
  { value: 'Aldea Lo de Fuentes', label: 'Aldea Lo de Fuentes', category: 'Otras' },
  { value: 'Colonia Pequeño Tinco', label: 'Colonia Pequeño Tinco', category: 'Otras' },
  { value: 'Otra', label: 'Otra (especificar en comentario)', category: 'Otras' }
];

// Agrupar colonias por categoría para select agrupado
export const coloniasAgrupadas = [
  {
    label: 'Colonias San Nicolás',
    options: colonias.filter(c => c.category === 'San Nicolás')
  },
  {
    label: 'Área Naranjo',
    options: colonias.filter(c => c.category === 'Naranjo')
  },
  {
    label: 'Área Montserrat',
    options: colonias.filter(c => c.category === 'Montserrat')
  },
  {
    label: 'Área Minerva',
    options: colonias.filter(c => c.category === 'Minerva')
  },
  {
    label: 'Otras Colonias',
    options: colonias.filter(c => c.category === 'Otras')
  }
];

export default colonias;
