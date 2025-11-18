import api from '../api/axiosConfig';

export const periodosService = {
    getAll: async () => {
        try {
            const response = await api.get('/periodos');
            return response.data;
        } catch (error) {
            console.error('Error fetching periodos:', error);
            throw error;
        }
    },
    getById: async (id) => {
        try {
            const response = await api.get(`/periodos/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching periodo with id ${id}:`, error);
            throw error;
        }
    },
    create: async (periodo) => {
        try {
            const response = await api.post('/periodos', periodo);
            return response.data;
        } catch (error) {
            console.error('Error creating periodo:', error);
            throw error;
        }
    },
    update: async (id, periodo) => {
        try {
            const response = await api.put(`/periodos/${id}`, periodo);
            return response.data;
        } catch (error) {
            console.error(`Error updating periodo with id ${id}:`, error);
            throw error;
        }
    },
    delete: async (id) => {
        try {
            const response = await api.delete(`/periodos/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting periodo with id ${id}:`, error);
            throw error;
        }
    }
};