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
    getParticipantesDisponibles: async (grupoGeneralId, ciclo) => {
        try {
            // Asume la ruta: /grupos-pequenos/disponibles/{id}
            let url = `/${ENDPOINT}/disponibles/${grupoGeneralId}`;
            if (ciclo) {
                url += `?ciclo=${ciclo}`;
            }
            const response = await api.get(url);
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

    getLideresDisponibles: async (eventoGeneralId, excludeGrupoId = null) => {
        try {
            let url = `/${ENDPOINT}/lideres-disponibles/${eventoGeneralId}`;
            if (excludeGrupoId) {
                url += `?excludeGrupoId=${excludeGrupoId}`;
            }
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            console.error(`Error al obtener líderes disponibles para el evento ${eventoGeneralId}:`, error);
            throw error;
        }
    }
};
