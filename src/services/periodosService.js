import api from '../api/axiosConfig';

export const periodosService = {
    getAll: () => api.get('/periodos'),
};

export default periodosService;
