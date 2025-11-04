import { crudService } from './crudService';

const ENDPOINT = 'eventos-generales';
const baseMethods = crudService(ENDPOINT);

/**
 * Servicio dedicado para la gestión de Eventos Generales.
 * Usa crudService para las operaciones base.
 */
export const eventoGeneralService = {
    ...baseMethods, // Incluye findAll, findById, save, update, delete

    // Si fuera necesario agregar métodos específicos en el futuro, se añadirían aquí.
    // Ejemplo:
    // findByPeriodoYPrograma: (periodoId, programaId) => api.get(`/eventos-generales/periodo/${periodoId}/programa/${programaId}`),
};