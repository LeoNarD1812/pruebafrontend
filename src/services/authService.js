import api from '../api/axiosConfig';

export const authService = {
    async login(username, password) {
        try {
            const response = await api.post('/users/login', {
                user: username,
                clave: password,
            });

            const { token, personaId } = response.data;

            // Extraer los datos del usuario de la respuesta
            const userData = {
                idUsuario: response.data.idUsuario,
                user: response.data.user,
                estado: response.data.estado,
                personaId: personaId,
            };

            if (token) {
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userData));
            }

            return { ...userData, token };
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    async register(userData) {
        try {
            // Preparar los datos según el DTO del backend
            const payload = {
                user: userData.user,
                nombreCompleto: userData.nombreCompleto,
                correo: userData.correo,
                documento: userData.documento,
                clave: userData.password,
                rol: 'INTEGRANTE', // Rol por defecto para nuevos usuarios
                estado: 'ACTIVO'
            };

            const response = await api.post('/users/register', payload);

            // Extraer los datos del usuario de la respuesta (sin guardar en localStorage)
            const newUserData = {
                idUsuario: response.data.idUsuario,
                user: response.data.user,
                estado: response.data.estado,
            };

            // NO guardar token ni datos del usuario - solo registrar
            // El usuario debe iniciar sesión manualmente después

            return newUserData;
        } catch (error) {
            console.error('Error en registro:', error);

            // Manejo específico de errores del backend
            if (error.response?.data) {
                const errorData = error.response.data;

                // Si es un error de validación de Spring Boot
                if (errorData.message && Array.isArray(errorData.message)) {
                    const validationErrors = errorData.message.join(', ');
                    throw new Error(`Error de validación: ${validationErrors}`);
                }

                // Si es un mensaje de error específico del backend
                if (errorData.message) {
                    // Manejo de errores específicos del backend actualizado
                    if (errorData.message.includes('usuario') && errorData.message.includes('ya existe')) {
                        throw new Error('El nombre de usuario ya está en uso');
                    } else if (errorData.message.includes('correo') && errorData.message.includes('ya está registrado')) {
                        throw new Error('El correo electrónico ya está registrado');
                    } else if (errorData.message.includes('documento') && errorData.message.includes('ya está registrado')) {
                        throw new Error('El número de documento ya está registrado');
                    } else if (errorData.message.includes('Rol no encontrado')) {
                        throw new Error('Error de configuración del sistema. Contacta al administrador');
                    } else {
                        throw new Error(errorData.message);
                    }
                }

                // Si es un error de constraint de base de datos
                if (errorData.error && errorData.error.includes('ConstraintViolationException')) {
                    if (errorData.message && errorData.message.includes('user')) {
                        throw new Error('El nombre de usuario ya está en uso');
                    } else if (errorData.message && errorData.message.includes('correo')) {
                        throw new Error('El correo electrónico ya está registrado');
                    } else if (errorData.message && errorData.message.includes('documento')) {
                        throw new Error('El número de documento ya está registrado');
                    }
                }

                throw new Error(errorData.message || 'Error al registrar usuario');
            }

            // Error de red o conexión
            if (error.code === 'NETWORK_ERROR' || !error.response) {
                throw new Error('Error de conexión. Verifica tu conexión a internet');
            }

            // Error de timeout
            if (error.code === 'ECONNABORTED') {
                throw new Error('Tiempo de espera agotado. Intenta de nuevo');
            }

            throw new Error(error.message || 'Error inesperado al registrar usuario');
        }
    },

    logout() {
        // Limpiar todos los datos de sesión
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    isAuthenticated() {
        const token = localStorage.getItem('token');
        if (!token) {
            return false;
        }

        // Verificar que el token tenga un formato básico válido (JWT tiene 3 partes)
        const parts = token.split('.');
        if (parts.length !== 3) {
            // Token inválido, limpiar
            this.logout();
            return false;
        }

        // Verificar que el token no esté expirado (si tiene exp)
        try {
            const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
            if (payload.exp && payload.exp * 1000 < Date.now()) {
                // Token expirado, limpiar
                this.logout();
                return false;
            }
        } catch (error) {
            // Error al decodificar el token, limpiar
            this.logout();
            return false;
        }

        return true;
    },

    getToken() {
        return localStorage.getItem('token');
    },
};