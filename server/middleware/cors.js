const cors = require('cors');

// Configuración de CORS
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origin (como mobile apps o curl)
    if (!origin) return callback(null, true);

    // Lista de orígenes permitidos
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5000'
    ];

    // En producción, agregar el dominio real
    if (process.env.NODE_ENV === 'production' && process.env.FRONTEND_URL) {
      allowedOrigins.push(process.env.FRONTEND_URL);
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Permitir todos en desarrollo
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

module.exports = cors(corsOptions);
