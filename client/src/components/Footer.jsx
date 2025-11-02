import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            {/* Columna 1: About */}
            <div className="footer-col">
              <h4>Pozo de Minerva</h4>
              <p>
                Información oficial y participación ciudadana sobre el proyecto
                de pozo mecánico en 18-75 Bulevar San Nicolás, Zona 4, Mixco.
              </p>
              <p className="footer-motto">
                <strong>"Agua responsable para todos"</strong>
              </p>
            </div>

            {/* Columna 2: Enlaces rápidos */}
            <div className="footer-col">
              <h4>Enlaces Rápidos</h4>
              <ul className="footer-links">
                <li><Link to="/">Inicio</Link></li>
                <li><Link to="/que-es">¿Qué se construye?</Link></li>
                <li><Link to="/cinco-razones">5 Razones</Link></li>
                <li><Link to="/documentos">Documentos</Link></li>
                <li><Link to="/participa">Participa</Link></li>
                <li><Link to="/faq">FAQ</Link></li>
              </ul>
            </div>

            {/* Columna 3: Contacto */}
            <div className="footer-col">
              <h4>Contacto</h4>
              <ul className="footer-contact">
                <li>
                  <FaMapMarkerAlt />
                  <span>Zona 4, Mixco, Guatemala</span>
                </li>
                <li>
                  <FaEnvelope />
                  <a href="mailto:info@pozominerva.org">info@pozominerva.org</a>
                </li>
                <li>
                  <FaPhone />
                  <a href="tel:+50212345678">+502 1234-5678</a>
                </li>
              </ul>

              {/* Redes sociales */}
              <div className="footer-social">
                <h5>Síguenos</h5>
                <div className="social-icons">
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                    <FaFacebook />
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                    <FaTwitter />
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <FaInstagram />
                  </a>
                </div>
              </div>
            </div>

            {/* Columna 4: Newsletter */}
            <div className="footer-col">
              <h4>Mantente Informado</h4>
              <p>Suscríbete para recibir actualizaciones sobre el proyecto</p>
              <form className="newsletter-form">
                <input
                  type="email"
                  placeholder="Tu correo electrónico"
                  required
                />
                <button type="submit" className="btn btn-secondary">
                  Suscribirse
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer bottom */}
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <p>
              &copy; {currentYear} Pozo de Minerva. Todos los derechos reservados.
            </p>
            <p className="footer-legal">
              Sitio de información ciudadana independiente. No estamos contra el agua;
              estamos a favor del agua responsable y el cumplimiento de la ley.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
