import React from 'react';
import Hero from '../components/Hero';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      {/* Hero con video banner */}
      <Hero />

      {/* Sección: ¿De qué se trata? */}
      <section className="section section-bg-light" id="about">
        <div className="container">
          <div className="section-title">
            <h2>¿De qué se trata este proyecto?</h2>
          </div>

          <div className="about-grid">
            <div className="about-content">
              <h3>Objetivo del sitio</h3>
              <p>
                <strong>Informar con evidencia oficial</strong>, facilitar la participación vecinal y
                articular acciones legales y administrativas para pedir la{' '}
                <strong>suspensión, revisión de categoría ambiental y reubicación/adecuación</strong>{' '}
                del pozo mientras se garantizan todas las salvaguardas.
              </p>
              <blockquote className="site-motto">
                "No estamos contra el agua; estamos a favor del agua responsable
                y del cumplimiento estricto de la ley"
              </blockquote>
            </div>

            <div className="about-stats-grid">
              <div className="stat-card">
                <div className="stat-icon">🏗️</div>
                <h4>Tipo de Proyecto</h4>
                <p>Pozo mecánico profundo de ~457 metros (1,500 pies)</p>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <h4>Población Objetivo</h4>
                <p>Aproximadamente 11,650 personas</p>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📍</div>
                <h4>Ubicación</h4>
                <p>18-75 Bulevar San Nicolás, Zona 4, Mixco</p>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🌳</div>
                <h4>Categoría Ambiental</h4>
                <p>B2 (bajo impacto) - en revisión</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección: Mensajes clave */}
      <section className="section key-messages-section">
        <div className="container">
          <div className="section-title">
            <h2>Mensajes Clave</h2>
          </div>

          <div className="key-messages">
            <div className="key-message">
              <div className="message-number">1</div>
              <div className="message-content">
                <h4>Proyecto de gran envergadura</h4>
                <p>
                  Pozo mecánico de ~457 m (1,500 pies), con tubería de 12" (197 pies lisa + 1,303 pies ranurada),
                  caseta de máquinas, cuarto de cloración y conexión a red, en 18-75 Bulevar San Nicolás,
                  para abastecer a ~11,650 personas.
                </p>
              </div>
            </div>

            <div className="key-message">
              <div className="message-number">2</div>
              <div className="message-content">
                <h4>Viabilidad ambiental condicionada</h4>
                <p>
                  La viabilidad ambiental otorgada por el MARN es categoría B2 (bajo impacto), con condiciones
                  estrictas de manejo de lodos, residuos, bitácora de niveles freáticos, pruebas y restricciones.
                  La resolución aclara que <strong>no autoriza el aprovechamiento de aguas</strong>.
                </p>
              </div>
            </div>

            <div className="key-message">
              <div className="message-number">3</div>
              <div className="message-content">
                <h4>Vías legales disponibles</h4>
                <p>
                  Existen vías legales y administrativas vigentes (ambientales, sanitarias y municipales)
                  y de contratación pública que podemos activar con participación ciudadana responsable.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección: Próximos pasos */}
      <section className="section section-bg-light">
        <div className="container">
          <div className="section-title">
            <h2>¿Qué puedes hacer?</h2>
            <p className="section-subtitle">
              Tu participación es fundamental para garantizar que este proyecto se ejecute
              con todas las salvaguardas legales y técnicas necesarias
            </p>
          </div>

          <div className="action-cards">
            <div className="action-card">
              <div className="action-icon">📄</div>
              <h4>Infórmate</h4>
              <p>Lee los documentos oficiales y conoce los detalles del proyecto</p>
              <a href="/documentos" className="btn btn-outline-primary">
                Ver Documentos
              </a>
            </div>

            <div className="action-card">
              <div className="action-icon">⚖️</div>
              <h4>Conoce tus derechos</h4>
              <p>Descubre las 5 razones legales para pedir suspensión y revisión</p>
              <a href="/cinco-razones" className="btn btn-outline-primary">
                Ver 5 Razones
              </a>
            </div>

            <div className="action-card">
              <div className="action-icon">✊</div>
              <h4>Participa</h4>
              <p>Únete a las acciones ciudadanas y firma para pedir transparencia</p>
              <a href="/participa" className="btn btn-primary">
                ¡Participa Ahora!
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
