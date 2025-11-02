/**
 * Servicio para rastrear usuarios que están escribiendo
 */

// Map para almacenar usuarios escribiendo: { 'userName-colonia': timestamp }
const typingUsers = new Map();

// Tiempo después del cual se considera que el usuario dejó de escribir (5 segundos)
const TYPING_TIMEOUT = 5000;

/**
 * Marcar que un usuario está escribiendo
 */
function setUserTyping(userName, userColonia) {
  const key = `${userName}-${userColonia}`;
  typingUsers.set(key, {
    userName,
    userColonia,
    timestamp: Date.now()
  });
}

/**
 * Marcar que un usuario dejó de escribir
 */
function removeUserTyping(userName, userColonia) {
  const key = `${userName}-${userColonia}`;
  typingUsers.delete(key);
}

/**
 * Obtener lista de usuarios escribiendo actualmente
 * Filtra usuarios que llevan más de TYPING_TIMEOUT sin actualizar
 */
function getTypingUsers() {
  const now = Date.now();
  const activeUsers = [];

  // Limpiar usuarios inactivos y construir lista de activos
  for (const [key, userData] of typingUsers.entries()) {
    if (now - userData.timestamp > TYPING_TIMEOUT) {
      // Usuario lleva mucho tiempo sin actualizar, eliminarlo
      typingUsers.delete(key);
    } else {
      activeUsers.push({
        userName: userData.userName,
        userColonia: userData.userColonia
      });
    }
  }

  return activeUsers;
}

/**
 * Limpiar usuarios inactivos periódicamente
 */
setInterval(() => {
  getTypingUsers(); // Esto limpiará automáticamente usuarios inactivos
}, TYPING_TIMEOUT);

module.exports = {
  setUserTyping,
  removeUserTyping,
  getTypingUsers
};
