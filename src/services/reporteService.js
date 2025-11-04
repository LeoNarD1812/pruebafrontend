import api from '../api/axiosConfig';
import { eventoGeneralService } from './eventoGeneralService'; // Reutilizamos el servicio de eventos

export const reporteService = {

    /**
     * Obtiene la lista de todos los eventos generales para poblar el filtro.
     */
    async getEventosGenerales() {
        try {
            // Usamos el servicio que ya existe
            return await eventoGeneralService.findAll();
        } catch (error) {
            console.error("Error al obtener eventos generales:", error);
            throw error;
        }
    },

    /**
     * Obtiene los datos del reporte de asistencia para un evento específico.
     * Llama a: GET /asistencias/reporte/{eventoGeneralId}
     */
    async getReporteAsistencia(eventoGeneralId) {
        try {
            const response = await api.get(`/asistencias/reporte/${eventoGeneralId}`);
            return response.data;
        } catch (error) {
            console.error(`Error al obtener reporte para evento ${eventoGeneralId}:`, error);
            throw error;
        }
    }
};