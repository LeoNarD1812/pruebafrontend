import api from '../api/axiosConfig';

export const matriculasService = {
    // Obtener todas las matrículas
    getAll: () => api.get('/matriculas'),

    // Obtener matrícula por ID
    getById: (id) => api.get(`/matriculas/${id}`),

    // Buscar por código de estudiante
    getByCodigoEstudiante: (codigo) => api.get(`/matriculas/estudiante/${codigo}`),

    // Filtrar matrículas
    getByFiltros: (filtros) => {
        const params = {};
        if (filtros.sedeId) params.sedeId = filtros.sedeId;
        if (filtros.facultadId) params.facultadId = filtros.facultadId;
        if (filtros.programaId) params.programaId = filtros.programaId;
        if (filtros.periodoId) params.periodoId = filtros.periodoId;
        if (filtros.tipoPersona) params.tipoPersona = filtros.tipoPersona;

        return api.get('/matriculas/filtrar', { params });
    },

    // Crear matrícula
    create: (matriculaData) => api.post('/matriculas', matriculaData),

    // Actualizar matrícula
    update: (id, matriculaData) => api.put(`/matriculas/${id}`, matriculaData),

    // Eliminar matrícula
    delete: (id) => api.delete(`/matriculas/${id}`)
};

export default matriculasService;