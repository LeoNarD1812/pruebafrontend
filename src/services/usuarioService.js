import api from '../api/axiosConfig';

export const usuarioService = {
    // Implementación del método usado en GruposPequenosPage.jsx
    async getUsuariosPorRol(rolNombre) {
        try {
            // Llama al nuevo endpoint del backend
            const response = await api.get(`/users/rol/${rolNombre}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener usuarios por rol:', error);
            throw error;
        }
    },

    async getLideresDisponibles(excludeGrupoPequenoId = null) {
        try {
            const params = {};
            if (excludeGrupoPequenoId) {
                params.excludeGrupoPequenoId = excludeGrupoPequenoId;
            }
            const response = await api.get('/users/lideres-disponibles', { params });
            return response.data;
        } catch (error) {
            console.error('Error al obtener líderes disponibles:', error);
            throw error;
        }
    }
};

export default usuarioService;