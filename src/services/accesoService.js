import api from '../api/axiosConfig';

export const accesoService = {
  async getAccesosByUser(username) {
    try {
      const response = await api.post('/accesos/user', `"${username}"`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};
