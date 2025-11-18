import api from '../api/axiosConfig';

export const periodoService = {
    getAll: () => api.get('/periodos'),
    getById: (id) => api.get(`/periodos/${id}`),
    create: (periodoData) => api.post('/periodos', periodoData),
    update: (id, periodoData) => api.put(`/periodos/${id}`, periodoData),
    delete: (id) => api.delete(`/periodos/${id}`)
};

export default periodoService;
