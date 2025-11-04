import React, { useState, useEffect } from 'react';
import { FaChartBar, FaFilter, FaSpinner, FaFileExcel, FaExclamationTriangle } from 'react-icons/fa';
import { reporteService } from '../../services/reporteService';

// Estilos básicos para la barra de porcentaje
const PorcentajeBar = ({ porcentaje }) => {
    let color = '#2ecc71'; // Verde (buena asistencia)
    if (porcentaje < 70) color = '#f39c12'; // Naranja
    if (porcentaje < 40) color = '#e74c3c'; // Rojo

    return (
        <div style={{
            width: '100%',
            backgroundColor: '#ecf0f1',
            borderRadius: '5px',
            overflow: 'hidden'
        }}>
            <div style={{
                width: `${porcentaje}%`,
                backgroundColor: color,
                padding: '2px 5px',
                color: 'white',
                textAlign: 'right',
                fontWeight: 'bold',
                minWidth: '35px' // Para que se vea el % incluso si es bajo
            }}>
                {porcentaje.toFixed(1)}%
            </div>
        </div>
    );
};

const ReportesPage = () => {
    const [eventos, setEventos] = useState([]);
    const [selectedEventoId, setSelectedEventoId] = useState('');
    const [reporteData, setReporteData] = useState([]);

    const [loadingEventos, setLoadingEventos] = useState(true);
    const [loadingReporte, setLoadingReporte] = useState(false);
    const [error, setError] = useState(null);

    // Cargar la lista de eventos generales al montar la página
    useEffect(() => {
        const loadEventos = async () => {
            try {
                setLoadingEventos(true);
                const data = await reporteService.getEventosGenerales();
                setEventos(data || []);
            } catch (err) {
                setError('Error al cargar la lista de eventos.');
            } finally {
                setLoadingEventos(false);
            }
        };
        loadEventos();
    }, []);

    // Función para cargar el reporte cuando se presiona el botón
    const handleCargarReporte = async () => {
        if (!selectedEventoId) {
            setError('Por favor, seleccione un evento general para generar el reporte.');
            setReporteData([]);
            return;
        }

        try {
            setError(null);
            setLoadingReporte(true);
            const data = await reporteService.getReporteAsistencia(selectedEventoId);
            setReporteData(data || []);

            if (!data || data.length === 0) {
                setError('No se encontraron datos de asistencia para este evento.');
            }

        } catch (err) {
            setError('Error al generar el reporte: ' + (err.message || 'Error de conexión'));
        } finally {
            setLoadingReporte(false);
        }
    };

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header">
                <div className="header-title">
                    <FaChartBar className="page-icon" />
                    <div>
                        <h1>Reportes de Asistencia</h1>
                        <p>Visualiza el consolidado de asistencias por evento general.</p>
                    </div>
                </div>
                <div className="header-actions">
                    {/* (Opcional) Botón de exportar
                    <button className="btn btn-secondary" disabled>
                        <FaFileExcel /> Exportar
                    </button>
                    */}
                </div>
            </div>

            {/* Panel de Filtros */}
            <div className="card">
                <div className="card-header">
                    <h2>Seleccionar Evento</h2>
                </div>
                <div className="filtros-section" style={{ padding: '25px' }}>
                    <div className="filtros-grid" style={{ gridTemplateColumns: '3fr 1fr' }}>
                        <div className="form-group">
                            <label htmlFor="eventoSelect">Evento General *</label>
                            <select
                                id="eventoSelect"
                                className="form-select"
                                value={selectedEventoId}
                                onChange={(e) => setSelectedEventoId(e.target.value)}
                                disabled={loadingEventos}
                            >
                                <option value="">
                                    {loadingEventos ? 'Cargando eventos...' : '--- Seleccione un evento ---'}
                                </option>
                                {eventos.map(evento => (
                                    <option key={evento.idEventoGeneral} value={evento.idEventoGeneral}>
                                        {evento.nombre} ({evento.periodoNombre || 'Sin periodo'})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group" style={{ alignSelf: 'flex-end' }}>
                            <button
                                className="btn btn-primary"
                                onClick={handleCargarReporte}
                                disabled={loadingReporte || !selectedEventoId}
                                style={{ width: '100%' }}
                            >
                                {loadingReporte ? (
                                    <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                                ) : (
                                    <FaFilter />
                                )}
                                {' '}Generar Reporte
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mensaje de Error */}
            {error && (
                <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaExclamationTriangle /> {error}
                </div>
            )}

            {/* Tabla de Reporte */}
            <div className="card">
                <div className="card-header">
                    <h2>Resultados del Reporte</h2>
                </div>
                <div className="table-container">
                    {loadingReporte ? (
                        <div style={{ padding: '50px', textAlign: 'center', color: '#7f8c8d' }}>
                            <FaSpinner style={{ animation: 'spin 1s linear infinite' }} size={30} />
                            <p>Cargando reporte...</p>
                        </div>
                    ) : reporteData.length === 0 ? (
                        <div style={{ padding: '50px', textAlign: 'center', color: '#95a5a6' }}>
                            <p>Seleccione un evento y presione "Generar Reporte" para ver los resultados.</p>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                            <tr>
                                <th>Participante</th>
                                <th>Código</th>
                                <th>% Asistencia</th>
                                <th>Total Sesiones</th>
                                <th>Presente</th>
                                <th>Tarde</th>
                                <th>Ausente</th>
                                <th>Justificado</th>
                            </tr>
                            </thead>
                            <tbody>
                            {reporteData.map(item => (
                                <tr key={item.personaId}>
                                    <td>{item.nombreCompleto}</td>
                                    <td>{item.codigoEstudiante}</td>
                                    <td style={{ minWidth: '150px' }}>
                                        <PorcentajeBar porcentaje={item.porcentajeAsistencia} />
                                    </td>
                                    <td>{item.totalSesiones}</td>
                                    <td>{item.asistenciasPresente}</td>
                                    <td>{item.asistenciasTarde}</td>
                                    <td>{item.asistenciasAusente}</td>
                                    <td>{item.asistenciasJustificado}</td>
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

export default ReportesPage;