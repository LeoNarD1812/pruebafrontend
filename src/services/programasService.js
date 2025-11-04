import api from '../api/axiosConfig';

export const programasService = {
    getAll: () => api.get('/programas'),
    getById: (id) => api.get(`/programas/${id}`),
    create: (programaData) => api.post('/programas', programaData),
    update: (id, programaData) => api.put(`/programas/${id}`, programaData),
    delete: (id) => api.delete(`/programas/${id}`)
};

export default programasService;
