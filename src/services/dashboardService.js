import api from '../api/axiosConfig';

// Función auxiliar para obtener la fecha de hoy en formato YYYY-MM-DD
const getTodayDateString = () => {
    const today = new Date();
    // Ajuste para la zona horaria local (importante si el servidor y el cliente están en zonas distintas)
    const offset = today.getTimezoneOffset();
    const adjustedToday = new Date(today.getTime() - (offset*60*1000));
    return adjustedToday.toISOString().split('T')[0];
};

export const dashboardService = {
    /**
     * Obtiene todas las estadísticas para el dashboard de admin en una sola llamada.
     */
    async getAdminStats() {
        try {
            const today = getTodayDateString();

            // 1. Definimos todas las llamadas que necesitamos
            const endpoints = [
                api.get('/personas'), // Para "Total Personas"
                api.get('/matriculas'), // Para "Total Matrículas"
                api.get(`/eventos-generales/activos?fecha=${today}`), // Para "Eventos Activos Hoy"
                api.get('/asistencias') // Para "Asistencias Hoy" (filtramos en el frontend)
            ];

            // 2. Ejecutamos todas las llamadas en paralelo
            const [
                personasRes,
                matriculasRes,
                eventosActivosRes,
                asistenciasRes
            ] = await Promise.all(endpoints);

            // 3. Procesamos los resultados

            // Filtramos las asistencias totales para obtener solo las de hoy
            const asistenciasHoy = asistenciasRes.data.filter(asistencia =>
                asistencia.fechaHoraRegistro && asistencia.fechaHoraRegistro.startsWith(today)
            );

            // 4. Devolvemos el objeto de estadísticas
            return {
                totalPersonas: personasRes.data?.length || 0,
                totalMatriculas: matriculasRes.data?.length || 0,
                eventosActivos: eventosActivosRes.data?.length || 0,
                asistenciasHoy: asistenciasHoy.length
            };

        } catch (error) {
            console.error("Error al obtener estadísticas del dashboard:", error);
            // Si una falla, devolvemos 0 para que la UI no se rompa
            return {
                totalPersonas: 0,
                totalMatriculas: 0,
                eventosActivos: 0,
                asistenciasHoy: 0,
            };
        }
    }
};