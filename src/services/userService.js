import axios from 'axios';
import { authService } from './authService'; // Para obtener el token

const API_URL = 'http://localhost:8080/users'; // Asegúrate de que esta URL sea correcta para tu backend
const API_ROLES_URL = 'http://localhost:8080/roles'; // URL para obtener roles
const API_PROGRAMAS_URL = 'http://localhost:8080/programas'; // URL para obtener programas

export const userService = {
    getAllUsers: async () => {
        try {
            const token = authService.getToken();
            const response = await axios.get(API_URL, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching all users:', error);
            throw error;
        }
    },

    getUserById: async (id) => {
        try {
            const token = authService.getToken();
            const response = await axios.get(`${API_URL}/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching user with ID ${id}:`, error);
            throw error;
        }
    },

    createUser: async (userData) => {
        try {
            const token = authService.getToken();
            const response = await axios.post(`${API_URL}/create-with-role`, userData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    },

    updateUser: async (id, userData) => {
        try {
            const token = authService.getToken();
            const response = await axios.put(`${API_URL}/${id}`, userData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating user with ID ${id}:`, error);
            throw error;
        }
    },

    deleteUser: async (id) => {
        try {
            const token = authService.getToken();
            const response = await axios.delete(`${API_URL}/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error deleting user with ID ${id}:`, error);
            throw error;
        }
    },

    getAllRoles: async () => {
        try {
            const token = authService.getToken();
            const response = await axios.get(API_ROLES_URL, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching all roles:', error);
            throw error;
        }
    },

    getAllProgramas: async () => {
        try {
            const token = authService.getToken();
            const response = await axios.get(API_PROGRAMAS_URL, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching all programas:', error);
            throw error;
        }
    },

    getIntegrantes: async () => {
        try {
            const token = authService.getToken();
            const response = await axios.get(`${API_URL}/integrantes`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching integrantes:', error);
            throw error;
        }
    }
};