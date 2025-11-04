import React, { useState, useEffect } from 'react';
import { FaListAlt, FaSpinner, FaSearch } from 'react-icons/fa';
import { asistenciaService } from '../../services/asistenciaService';
import { formatDateTime } from '../../utils/helpers'; // Asumiendo que helpers está en ../utils/

const VerAsistenciasPage = () => {
    const [asistencias, setAsistencias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        cargarAsistencias();
    }, []);

    const cargarAsistencias = async () => {
        try {
            setLoading(true);
            const data = await asistenciaService.getAllAsistencias();
            setAsistencias(data || []);
        } catch (error) {
            console.error("Error cargando asistencias:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredAsistencias = asistencias.filter(a =>
        a.personaNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.personaCodigo?.includes(searchTerm) ||
        a.eventoNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.estado?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="header-title">
                    <FaListAlt className="page-icon" />
                    <div>
                        <h1>Ver Asistencias (Líder)</h1>
                        <p>Consulta el registro histórico de todas las asistencias.</p>
                    </div>
                </div>
                <div className="header-actions">
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar por persona, sesión o estado..."
                            className="form-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2>Registros de Asistencia ({filteredAsistencias.length})</h2>
                </div>
                <div className="table-container">
                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center' }}>
                            <FaSpinner className="spinner" size={30} />
                            <p>Cargando asistencias...</p>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                            <tr>
                                <th>Persona</th>
                                <th>Sesión</th>
                                <th>Fecha y Hora</th>
                                <th>Estado</th>
                                <th>Observación</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredAsistencias.map(a => (
                                <tr key={a.idAsistencia}>
                                    <td>{a.personaNombre} ({a.personaCodigo})</td>
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

export default VerAsistenciasPage;