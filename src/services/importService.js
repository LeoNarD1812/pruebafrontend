import api from '../api/axiosConfig';

export const importService = {
    async downloadTemplate() {
        try {
            const response = await api.get('/matriculas/descargar-plantilla', {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Plantilla_Importacion_Matriculas.xlsx');

            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            return { success: true };
        } catch (error) {
            console.error('Error descargando plantilla:', error);
            throw new Error('Error al descargar la plantilla. Verifica tu conexión.');
        }
    },

    async exportData(filtros = {}) {
        try {
            const params = new URLSearchParams();

            if (filtros.sedeId) params.append('sedeId', filtros.sedeId);
            if (filtros.facultadId) params.append('facultadId', filtros.facultadId);
            if (filtros.programaId) params.append('programaId', filtros.programaId);
            if (filtros.periodoId) params.append('periodoId', filtros.periodoId);
            if (filtros.tipoPersona) params.append('tipoPersona', filtros.tipoPersona);

            const response = await api.get(`/matriculas/exportar?${params.toString()}`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            const fecha = new Date().toISOString().split('T')[0].replace(/-/g, '');
            link.setAttribute('download', `Datos_Matriculas_${fecha}.xlsx`);

            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            return { success: true };
        } catch (error) {
            console.error('Error exportando datos:', error);
            throw new Error('Error al exportar los datos. Verifica tu conexión.');
        }
    },

    async importExcel(file, filtros = {}) {
        try {
            const formData = new FormData();
            formData.append('file', file);

            if (filtros.sedeId) formData.append('sedeId', filtros.sedeId);
            if (filtros.facultadId) formData.append('facultadId', filtros.facultadId);
            if (filtros.programaId) formData.append('programaId', filtros.programaId);
            if (filtros.periodoId) formData.append('periodoId', filtros.periodoId);
            if (filtros.tipoPersona) formData.append('tipoPersona', filtros.tipoPersona);

            const response = await api.post('/matriculas/importar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data;
        } catch (error) {
            console.error('Error importando Excel:', error);

            if (error.response?.data) {
                const errorData = error.response.data;

                if (errorData.errores && errorData.errores.length > 0) {
                    throw new Error(errorData.errores.join('\n'));
                }

                if (errorData.mensaje) {
                    throw new Error(errorData.mensaje);
                }
            }

            throw new Error('Error al importar el archivo. Verifica el formato y contenido.');
        }
    },

    async getSedes() {
        try {
            const response = await api.get('/sedes');
            return response.data;
        } catch (error) {
            console.error('Error obteniendo sedes:', error);
            return [];
        }
    },

    async getFacultades(sedeId = null) {
        try {
            const url = sedeId
                ? `/facultades?sedeId=${sedeId}`
                : '/facultades';
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            console.error('Error obteniendo facultades:', error);
            return [];
        }
    },

    async getProgramas(facultadId = null) {
        try {
            const url = facultadId
                ? `/programas?facultadId=${facultadId}`
                : '/programas';
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            console.error('Error obteniendo programas:', error);
            return [];
        }
    },
};