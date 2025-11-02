-- Tabla de mensajes para chat grupal estilo WhatsApp
USE pozo;

CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(100) NOT NULL,
    user_colonia VARCHAR(150) NOT NULL,
    message_text TEXT,

    -- Soporte multimedia
    media_type ENUM('none', 'image', 'audio', 'video') DEFAULT 'none',
    media_url VARCHAR(500),
    media_filename VARCHAR(255),

    -- Sistema de respuestas
    reply_to_id INT DEFAULT NULL,

    -- Control de IA
    is_bot BOOLEAN DEFAULT FALSE,
    analyzed_by_bot BOOLEAN DEFAULT FALSE,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Índices para optimizar consultas
    INDEX idx_created_at (created_at DESC),
    INDEX idx_user (user_name, user_colonia),
    INDEX idx_bot_analyzed (analyzed_by_bot, created_at),
    INDEX idx_reply_to (reply_to_id),

    -- Foreign key para respuestas
    FOREIGN KEY (reply_to_id) REFERENCES messages(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Vista para obtener mensajes con información de respuesta
CREATE OR REPLACE VIEW messages_with_reply AS
SELECT
    m.id,
    m.user_name,
    m.user_colonia,
    m.message_text,
    m.media_type,
    m.media_url,
    m.media_filename,
    m.reply_to_id,
    m.is_bot,
    m.analyzed_by_bot,
    m.created_at,
    r.user_name AS reply_to_user_name,
    r.message_text AS reply_to_message_text,
    r.media_type AS reply_to_media_type
FROM messages m
LEFT JOIN messages r ON m.reply_to_id = r.id
ORDER BY m.created_at ASC;
