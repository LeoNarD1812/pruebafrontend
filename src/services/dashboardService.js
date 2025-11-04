import api from '../api/axiosConfig';
import { grupoPequenoService } from './grupoPequenoService';
import { asistenciaService } from './asistenciaService';

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
    },
    async getLiderStats(liderId) {
        try {
            // 1. Obtener los grupos del líder
            const misGrupos = await grupoPequenoService.findByLider(liderId);

            // 2. Obtener las asistencias del líder
            const misAsistencias = await asistenciaService.getAsistenciasPorPersona(liderId);

            // 3. Calcular totales
            let totalParticipantes = 0;
            // (Esta parte es una aproximación, idealmente el backend debería sumar esto)
            // (Vamos a re-usar la lógica de 'MisGruposPage' para cargar el conteo)
            const gruposConConteo = await Promise.all(
                misGrupos.map(async (grupo) => {
                    const participantes = await api.get(`/grupo-participantes/grupo/${grupo.idGrupoPequeno}`);
                    return participantes.data.filter(p => p.estado === 'ACTIVO').length;
                })
            );
            totalParticipantes = gruposConConteo.reduce((sum, count) => sum + count, 0);


            // 4. Calcular asistencias
            const presentes = misAsistencias.filter(a => a.estado === 'PRESENTE' || a.estado === 'TARDE').length;
            const porcentaje = misAsistencias.length > 0 ? (presentes / misAsistencias.length) * 100 : 0;

            return {
                totalGrupos: misGrupos.length,
                totalParticipantes: totalParticipantes,
                asistenciasRegistradas: misAsistencias.length,
                asistenciaPromedio: porcentaje.toFixed(0)
            };

        } catch (error) {
            console.error("Error al obtener estadísticas de líder:", error);
            return {
                totalGrupos: 0,
                totalParticipantes: 0,
                asistenciasRegistradas: 0,
                asistenciaPromedio: 0,
            };
        }
    }
};