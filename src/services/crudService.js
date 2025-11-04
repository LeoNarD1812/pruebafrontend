import api from '../api/axiosConfig';

/**
 * Servicio CRUD genérico para interactuar con la API.
 * @param {string} endpointBase - El camino base del controlador (ej: 'eventos-generales').
 */
export const crudService = (endpointBase) => {
    const baseMethods = {
        findAll: async () => {
            try {
                const response = await api.get(`/${endpointBase}`);
                return response.data;
            } catch (error) {
                console.error(`Error al obtener todos los ${endpointBase}:`, error);
                throw error;
            }
        },

        findById: async (id) => {
            try {
                const response = await api.get(`/${endpointBase}/${id}`);
                return response.data;
            } catch (error) {
                console.error(`Error al obtener ${endpointBase} con ID ${id}:`, error);
                throw error;
            }
        },

        save: async (data) => {
            try {
                const response = await api.post(`/${endpointBase}`, data);
                return response.data;
            } catch (error) {
                console.error(`Error al guardar ${endpointBase}:`, error);
                throw error;
            }
        },

        update: async (id, data) => {
            try {
                const response = await api.put(`/${endpointBase}/${id}`, data);
                return response.data;
            } catch (error) {
                console.error(`Error al actualizar ${endpointBase} con ID ${id}:`, error);
                throw error;
            }
        },

        delete: async (id) => {
            try {
                const response = await api.delete(`/${endpointBase}/${id}`);
                return response.data;
            } catch (error) {
                console.error(`Error al eliminar ${endpointBase} con ID ${id}:`, error);
                throw error;
            }
        },
    };

    // NO HAY EXTENSIONES CONDICIONALES AQUÍ.
    return baseMethods;
};