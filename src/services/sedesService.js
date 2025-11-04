import api from '../api/axiosConfig';

export const sedesService = {
    getAll: () => api.get('/sedes'),
    getById: (id) => api.get(`/sedes/${id}`),
    create: (sedeData) => api.post('/sedes', sedeData),
    update: (id, sedeData) => api.put(`/sedes/${id}`, sedeData),
    delete: (id) => api.delete(`/sedes/${id}`)
};

export default sedesService;
