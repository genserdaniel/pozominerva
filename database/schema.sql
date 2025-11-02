-- Base de datos para Pozo de Minerva
CREATE DATABASE IF NOT EXISTS pozo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE pozo;

-- Tabla de comentarios
CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    colonia VARCHAR(150) NOT NULL,
    comentario TEXT NOT NULL,
    likes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_created_at (created_at DESC),
    INDEX idx_likes (likes DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de sesiones de chat (para rate limiting)
CREATE TABLE IF NOT EXISTS chat_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    message_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    INDEX idx_session_id (session_id),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar datos de ejemplo (opcional)
-- INSERT INTO comments (nombre, colonia, comentario, likes) VALUES
-- ('Juan Pérez', 'Bosques de San Nicolás', 'Estoy muy preocupado por el impacto ambiental de este proyecto en nuestra colonia.', 15),
-- ('María López', 'Condado San Nicolás II', 'Necesitamos más información y transparencia sobre los estudios ambientales.', 23),
-- ('Carlos Martínez', 'Vistas del Naranjo', 'Apoyo la revisión de la categoría ambiental a B1. La participación ciudadana es fundamental.', 31);
