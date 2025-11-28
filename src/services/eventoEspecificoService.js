import api from '../api/axiosConfig';
import { crudService } from './crudService';

const ENDPOINT = 'eventos-especificos';
const baseMethods = crudService(ENDPOINT);

export const eventoEspecificoService = {
    ...baseMethods,

    crearRecurrencia: async (recurrenceData) => {
        try {
            const response = await api.post(`/${ENDPOINT}/recurrencia`, recurrenceData);
            return response.data;
        } catch (error) {
            console.error('Error al crear eventos recurrentes:', error);
            throw error;
        }
    },

    obtenerPorEventoGeneral: async (eventoGeneralId) => {
        try {
            const response = await api.get(`/${ENDPOINT}/evento-general/${eventoGeneralId}`);
            return response.data;
        } catch (error) {
            console.error(`Error al obtener sesiones para el evento general ${eventoGeneralId}:`, error);
            throw error;
        }
    },

    findMySesiones: async () => {
        try {
            const response = await api.get(`/${ENDPOINT}/mis-sesiones`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener mis sesiones:', error);
            throw error;
        }
    }
};
