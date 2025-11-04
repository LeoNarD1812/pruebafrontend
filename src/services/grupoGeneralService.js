
import { crudService } from './crudService';

const ENDPOINT = 'grupos-generales';
const baseMethods = crudService(ENDPOINT);

/**
 * Servicio dedicado para la gestión de Grupos Generales.
 * Usa crudService para las operaciones base.
 */
export const grupoGeneralService = {
    ...baseMethods, // Incluye findAll, findById, save, update, delete
};