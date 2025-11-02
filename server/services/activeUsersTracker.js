/**
 * Servicio para rastrear usuarios activos en el chat
 * Un usuario se considera activo si ha enviado un heartbeat en los últimos 30 segundos
 */

// Map para almacenar usuarios activos: key = "userName|userColonia", value = timestamp
const activeUsers = new Map();

// Tiempo de expiración: 30 segundos
const EXPIRATION_TIME = 30000;

/**
 * Registrar actividad de un usuario (heartbeat)
 */
function setUserActive(userName, userColonia) {
  const key = `${userName}|${userColonia}`;
  activeUsers.set(key, Date.now());
}

/**
 * Remover usuario activo manualmente
 */
function removeUserActive(userName, userColonia) {
  const key = `${userName}|${userColonia}`;
  activeUsers.delete(key);
}

/**
 * Limpiar usuarios inactivos (sin heartbeat por más de 30 segundos)
 */
function cleanInactiveUsers() {
  const now = Date.now();
  const inactiveKeys = [];

  for (const [key, timestamp] of activeUsers.entries()) {
    if (now - timestamp > EXPIRATION_TIME) {
      inactiveKeys.push(key);
    }
  }

  inactiveKeys.forEach(key => activeUsers.delete(key));

  if (inactiveKeys.length > 0) {
    console.log(`🧹 Limpiados ${inactiveKeys.length} usuario(s) inactivo(s)`);
  }
}

/**
 * Obtener lista de usuarios activos
 */
function getActiveUsers() {
  // Limpiar usuarios inactivos antes de retornar
  cleanInactiveUsers();

  const users = [];
  for (const [key, timestamp] of activeUsers.entries()) {
    const [userName, userColonia] = key.split('|');
    users.push({ userName, userColonia });
  }

  return users;
}

/**
 * Obtener cantidad de usuarios activos
 */
function getActiveUsersCount() {
  cleanInactiveUsers();
  return activeUsers.size;
}

// Limpiar usuarios inactivos cada 10 segundos
setInterval(cleanInactiveUsers, 10000);

module.exports = {
  setUserActive,
  removeUserActive,
  getActiveUsers,
  getActiveUsersCount
};
