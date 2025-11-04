import api from '../api/axiosConfig';

const ENDPOINT = 'grupo-participantes';

/**
 * Servicio dedicado para la gestión de Participantes de Grupos Pequeños.
 * Proporciona métodos específicos no incluidos en el crudService genérico.
 */
export const grupoParticipanteService = {

    // 1. Método Básico SAVE (Necesario para agregarParticipante)
    save: async (data) => {
        try {
            const response = await api.post(`/${ENDPOINT}`, data);
            return response.data;
        } catch (error) {
            console.error(`Error al guardar ${ENDPOINT}:`, error);
            throw error;
        }
    },

    // 2. Método Específico FIND BY GRUPO PEQUEÑO (Necesario en loadGrupos y loadParticipantesActuales)
    findByGrupoPequeno: async (grupoPequenoId) => {
        try {
            // Asume que el backend usa una ruta como /grupo-participantes/grupo/{id}
            const response = await api.get(`/${ENDPOINT}/grupo/${grupoPequenoId}`);
            return response.data;
        } catch (error) {
            console.error(`Error al obtener participantes para el grupo ${grupoPequenoId}:`, error);
            throw error;
        }
    },

    // 3. Método Específico REMOVER PARTICIPANTE (Necesario en removerParticipante)
    removerParticipante: async (participanteId) => {
        try {
            // Asume que el backend usa una ruta PUT para "remover" (cambiar estado)
            const response = await api.put(`/${ENDPOINT}/remover/${participanteId}`);
            return response.data;
        } catch (error) {
            console.error(`Error al remover participante ${participanteId}:`, error);
            throw error;
        }
    },
};