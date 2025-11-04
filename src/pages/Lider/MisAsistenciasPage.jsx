import React, { useState, useEffect } from 'react';
import { FaUserCheck, FaSpinner, FaSearch } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { asistenciaService } from '../../services/asistenciaService';
import { formatDateTime } from '../../utils/helpers';

const MisAsistenciasPage = () => {
    const { user } = useAuth();
    const [misAsistencias, setMisAsistencias] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.personaId) {
            cargarMisAsistencias();
        }
    }, [user]);

    const cargarMisAsistencias = async () => {
        try {
            setLoading(true);
            const data = await asistenciaService.getAsistenciasPorPersona(user.personaId);
            setMisAsistencias(data || []);
        } catch (error) {
            console.error("Error cargando mis asistencias:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="header-title">
                    <FaUserCheck className="page-icon" />
                    <div>
                        <h1>Mi Historial de Asistencia</h1>
                        <p>Consulta tus asistencias registradas en todas las sesiones.</p>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2>Mis Registros ({misAsistencias.length})</h2>
                </div>
                <div className="table-container">
                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center' }}>
                            <FaSpinner className="spinner" size={30} />
                            <p>Cargando tu historial...</p>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                            <tr>
                                <th>Sesión</th>
                                <th>Fecha y Hora</th>
                                <th>Estado</th>
                                <th>Observación</th>
                            </tr>
                            </thead>
                            <tbody>
                            {misAsistencias.map(a => (
                                <tr key={a.idAsistencia}>
                                    <td>{a.eventoNombre}</td>
                                    <td>{formatDateTime(a.fechaHoraRegistro)}</td>
                                    <td><span className={`badge ${a.estado?.toLowerCase()}`}>{a.estado}</span></td>
                                    <td>{a.observacion}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MisAsistenciasPage;