import React, { useState, useEffect } from 'react';
import { FaFilePdf, FaDownload, FaEye, FaFolder } from 'react-icons/fa';
import { getPDFs } from '../services/api';
import './DocumentSection.css';

const DocumentSection = () => {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewingPdf, setViewingPdf] = useState(null);

  useEffect(() => {
    fetchPDFs();
  }, []);

  const fetchPDFs = async () => {
    try {
      setLoading(true);
      const response = await getPDFs();
      if (response.success) {
        setPdfs(response.data);
      }
    } catch (error) {
      console.error('Error al cargar PDFs:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'all', label: 'Todos los documentos', icon: <FaFolder /> },
    { value: 'ambiental', label: 'Ambiental', icon: <FaFolder /> },
    { value: 'tecnico', label: 'Técnico', icon: <FaFolder /> },
    { value: 'legal', label: 'Legal', icon: <FaFolder /> }
  ];

  const filteredPdfs = selectedCategory === 'all'
    ? pdfs
    : pdfs.filter(pdf => pdf.category === selectedCategory);

  const getCategoryBadge = (category) => {
    const badges = {
      ambiental: { bg: '#4caf50', text: 'Ambiental' },
      tecnico: { bg: '#2196f3', text: 'Técnico' },
      legal: { bg: '#ff9800', text: 'Legal' }
    };
    return badges[category] || { bg: '#757575', text: category };
  };

  const handleView = (pdf) => {
    setViewingPdf(pdf);
  };

  const handleCloseViewer = () => {
    setViewingPdf(null);
  };

  return (
    <section className="document-section section">
      <div className="container">
        <div className="section-title">
          <h2>Documentos Oficiales</h2>
          <p className="section-subtitle">
            Accede a toda la documentación oficial del proyecto del Pozo de Minerva
          </p>
        </div>

        {/* Filtros por categoría */}
        <div className="category-filters">
          {categories.map((cat) => (
            <button
              key={cat.value}
              className={`category-btn ${selectedCategory === cat.value ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.value)}
            >
              {cat.icon}
              <span>{cat.label}</span>
              {cat.value === 'all' && <span className="badge">{pdfs.length}</span>}
            </button>
          ))}
        </div>

        {/* Lista de PDFs */}
        {loading ? (
          <div className="loading-message">Cargando documentos...</div>
        ) : filteredPdfs.length === 0 ? (
          <div className="empty-message">No hay documentos en esta categoría</div>
        ) : (
          <div className="pdfs-grid">
            {filteredPdfs.map((pdf) => {
              const categoryBadge = getCategoryBadge(pdf.category);
              return (
                <div key={pdf.id} className="pdf-card">
                  {/* Badge de categoría */}
                  <div
                    className="category-badge"
                    style={{ backgroundColor: categoryBadge.bg }}
                  >
                    {categoryBadge.text}
                  </div>

                  {/* Icono */}
                  <div className="pdf-icon">
                    <FaFilePdf />
                  </div>

                  {/* Contenido */}
                  <div className="pdf-content">
                    <h3 className="pdf-title">{pdf.title}</h3>
                    <p className="pdf-description">{pdf.description}</p>

                    {/* Metadatos */}
                    <div className="pdf-meta">
                      {pdf.date && (
                        <span className="meta-item">
                          📅 {new Date(pdf.date).toLocaleDateString('es-GT', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      )}
                      {pdf.pages && <span className="meta-item">📄 {pdf.pages} páginas</span>}
                      {pdf.size && <span className="meta-item">💾 {pdf.size}</span>}
                    </div>

                    {/* Acciones */}
                    <div className="pdf-actions">
                      <button
                        className="btn-action btn-view"
                        onClick={() => handleView(pdf)}
                      >
                        <FaEye /> Ver en línea
                      </button>
                      <a
                        href={`/pdfs/${pdf.filename}`}
                        download
                        className="btn-action btn-download"
                      >
                        <FaDownload /> Descargar
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Nota importante */}
        <div className="document-note">
          <h4>📢 Nota Importante</h4>
          <p>
            Todos estos documentos son de carácter público y están disponibles para
            consulta ciudadana. Si encuentras alguna inconsistencia o tienes preguntas,
            por favor{' '}
            <a href="/contacto">contáctanos</a> o utiliza el{' '}
            <a href="#comentarios">sistema de comentarios</a>.
          </p>
        </div>
      </div>

      {/* Visor de PDF (Modal) */}
      {viewingPdf && (
        <div className="pdf-viewer-modal" onClick={handleCloseViewer}>
          <div className="pdf-viewer-container" onClick={(e) => e.stopPropagation()}>
            <div className="pdf-viewer-header">
              <h3>{viewingPdf.title}</h3>
              <button className="close-viewer-btn" onClick={handleCloseViewer}>
                ✕
              </button>
            </div>
            <div className="pdf-viewer-body">
              <iframe
                src={`/pdfs/${viewingPdf.filename}`}
                title={viewingPdf.title}
                width="100%"
                height="100%"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default DocumentSection;
