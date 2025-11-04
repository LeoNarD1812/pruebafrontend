import api from '../api/axiosConfig'; // <-- CORREGIDO: Subir un nivel (..) e ir a la carpeta 'api'

export const eventoEspecificoService = {
    crearRecurrencia: async (recurrenceData) => {
        try {
            const response = await api.post('/eventos-especificos/recurrencia', recurrenceData);
            //                                ^ Quitar /api/
            return response.data;
        } catch (error) {
            console.error('Error al crear eventos recurrentes:', error);
            throw error;
        }
    },

    crearEvento: async (eventoData) => {
        const response = await api.post('/eventos-especificos', eventoData);
        //                            ^ Quitar /api/
        return response.data;
    },

    obtenerPorEventoGeneral: async (eventoGeneralId) => {
        const response = await api.get(`/eventos-especificos/evento-general/${eventoGeneralId}`);
        //                            ^ Quitar /api/
        return response.data;
    }
};