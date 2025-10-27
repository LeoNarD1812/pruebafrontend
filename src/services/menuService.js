import api from '../api/axiosConfig';

export const menuService = {
    async getMenuByUser(username) {
        try {
            const response = await api.post('/accesos/menu', username, {
                headers: {
                    'Content-Type': 'text/plain'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error al obtener menú:', error);
            throw error;
        }
    }
};