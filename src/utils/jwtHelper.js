export const decodeJWT = (token) => {
  try {
    // JWT tiene formato: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decodificar el payload (segunda parte)
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Error al decodificar el token JWT:', error);
    return null;
  }
};

export const getRoleFromToken = (token) => {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.role) {
    return null;
  }
  
  // El role puede venir como "ROLE_ADMIN,ROLE_USER" o solo "ADMIN"
  const roles = decoded.role.split(',');
  
  // Retornar el primer rol (debería haber solo uno en este sistema)
  return roles[0].replace('ROLE_', '');
};









