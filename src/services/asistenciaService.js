import api from '../api/axiosConfig';

// Función auxiliar para obtener la fecha de hoy en formato YYYY-MM-DD
const getTodayDateString = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const adjustedToday = new Date(today.getTime() - (offset * 60 * 1000));
    return adjustedToday.toISOString().split('T')[0];
};

export const asistenciaService = {

    /**
     * LÍDER: Obtiene las sesiones programadas para hoy
     * Llama a: GET /eventos-especificos/fecha?fecha=YYYY-MM-DD
     */
    async getSesionesDeHoy() {
        try {
            const today = getTodayDateString();
            const response = await api.get(`/eventos-especificos/fecha?fecha=${today}`);
            return response.data;
        } catch (error) {
            console.error("Error al obtener sesiones de hoy:", error);
            throw error;
        }
    },

    /**
     * LÍDER: Genera el código QR para una sesión
     * Llama a: GET /asistencias/generar-qr/{eventoId}/lider/{liderId}
     */
    async generarQR(eventoEspecificoId, liderId) {
        try {
            const response = await api.get(`/asistencias/generar-qr/${eventoEspecificoId}/lider/${liderId}`);
            // Retorna el objeto { qrImageBase64: "data:...", ... }
            return response.data;
        } catch (error) {
            console.error("Error al generar QR:", error);
            throw error.response?.data || error;
        }
    },

    /**
     * INTEGRANTE: Registra la asistencia usando el QR
     * Llama a: POST /asistencias/registrar-qr
     * Payload: { eventoEspecificoId, personaId, latitud, longitud }
     */
    async registrarAsistencia(payload) {
        try {
            const response = await api.post('/asistencias/registrar-qr', payload);
            return response.data; // Retorna la asistencia creada
        } catch (error) {
            console.error("Error al registrar asistencia:", error);
            // Lanza el mensaje de error del backend (ej: "Ya registraste tu asistencia")
            throw new Error(error.response?.data?.mensaje || 'Error al registrar la asistencia');
        }
    }
};