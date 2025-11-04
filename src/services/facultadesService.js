import api from '../api/axiosConfig';

export const facultadesService = {
    getAll: () => api.get('/facultades'),
    getById: (id) => api.get(`/facultades/${id}`),
    create: (facultadData) => api.post('/facultades', facultadData),
    update: (id, facultadData) => api.put(`/facultades/${id}`, facultadData),
    delete: (id) => api.delete(`/facultades/${id}`)
};

export default facultadesService;
