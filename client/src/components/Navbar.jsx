import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Detectar scroll para cambiar estilo del navbar
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navLinks = [
    { path: '/', label: 'Inicio' },
    { path: '/que-es', label: '¿Qué se construye?' },
    { path: '/cinco-razones', label: '5 Razones' },
    { path: '/documentos', label: 'Documentos' },
    { path: '/participa', label: 'Participa' },
    { path: '/faq', label: 'FAQ' },
    { path: '/noticias', label: 'Noticias' },
    { path: '/contacto', label: 'Contacto' }
  ];

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">💧</span>
          <span className="logo-text">Pozo de Minerva</span>
        </Link>

        {/* Menú hamburguesa (móvil) */}
        <button
          className={`navbar-toggle ${isOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Enlaces de navegación */}
        <ul className={`navbar-menu ${isOpen ? 'active' : ''}`}>
          {navLinks.map((link) => (
            <li key={link.path} className="navbar-item">
              <Link
                to={link.path}
                className={`navbar-link ${location.pathname === link.path ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Botón de acción */}
        <Link to="/participa" className="navbar-cta btn btn-primary">
          ¡Participa Ahora!
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
