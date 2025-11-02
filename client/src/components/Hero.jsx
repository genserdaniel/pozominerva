import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      {/* Video de fondo en loop */}
      <div className="hero-video-container">
        <video
          className="hero-video"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/videos/banner-video.mp4" type="video/mp4" />
          Tu navegador no soporta videos HTML5.
        </video>
        {/* Overlay para mejorar legibilidad del texto */}
        <div className="hero-overlay"></div>
      </div>

      {/* Contenido superpuesto */}
      <div className="hero-content">
        <div className="container">
          <div className="hero-text">
            <h1 className="hero-title">
              Agua Responsable para Mixco
            </h1>
            <p className="hero-subtitle">
              Pedimos suspender y revisar el pozo de 18-75, Bulevar San Nicolás,
              hasta garantizar salud, seguridad y cumplimiento total de la ley
            </p>
            <div className="hero-actions">
              <Link to="/participa" className="btn btn-primary btn-lg">
                Quiero Participar
              </Link>
              <Link to="/cinco-razones" className="btn btn-outline-light btn-lg">
                Conoce las 5 Razones
              </Link>
            </div>

            {/* Estadística destacada */}
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="stat-number">~11,650</div>
                <div className="stat-label">Personas afectadas</div>
              </div>
              <div className="hero-stat">
                <div className="stat-number">457 m</div>
                <div className="stat-label">Profundidad del pozo</div>
              </div>
              <div className="hero-stat">
                <div className="stat-number">B2</div>
                <div className="stat-label">Clasificación ambiental</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Flecha scroll down */}
      <div className="hero-scroll-indicator">
        <a href="#about" className="scroll-arrow">
          <span></span>
          <span></span>
          <span></span>
        </a>
      </div>
    </section>
  );
};

export default Hero;
