import api from '../api/axiosConfig';
import { crudService } from './crudService';

const ENDPOINT = 'grupos-pequenos';
const baseMethods = crudService(ENDPOINT);

/**
 * Servicio dedicado para la gestión de Grupos Pequeños.
 */
export const grupoPequenoService = {
    ...baseMethods, // Incluye findAll, findById, save, update, delete

    // Método Específico necesario en loadParticipantesDisponibles
    getParticipantesDisponibles: async (grupoGeneralId) => {
        try {
            // Asume la ruta: /grupos-pequenos/disponibles/{id}
            const response = await api.get(`/${ENDPOINT}/disponibles/${grupoGeneralId}`);
            return response.data;
        } catch (error) {
            console.error(`Error al obtener participantes disponibles para el grupo general ${grupoGeneralId}:`, error);
            throw error;
        }
    },
    /**
     * LÍDER: Obtiene los grupos pequeños asignados a un líder específico.
     * Llama a: GET /grupos-pequenos/lider/{liderId}
     */
    findByLider: async (liderId) => {
        try {
            const response = await api.get(`/${ENDPOINT}/lider/${liderId}`);
            return response.data;
        } catch (error) {
            console.error(`Error al obtener grupos para el líder ${liderId}:`, error);
            throw error;
        }
    },

};