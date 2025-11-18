import axios from 'axios';

const API_URL = 'http://localhost:8080/personas'; // Asegúrate de que esta URL sea correcta para tu backend


export const personaService = {
    getMyProfile: async (token) => {
        try {
            const response = await axios.get(`${API_URL}/my-profile`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('Respuesta cruda del perfil:', response); // <-- Añade este log
            return response.data;
        } catch (error) {
            console.error('Error fetching my profile:', error);
            // console.error('Detalles del error:', error.response); // Esto podría dar más detalles si Axios lo tiene
            throw error;
        }
    },

    updateMyProfile: async (profileData, token) => {
        try {
            const response = await axios.put(`${API_URL}/my-profile`, profileData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error updating my profile:', error);
            throw error;
        }
    }
};