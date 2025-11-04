import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { asistenciaService } from '../../services/asistenciaService';
import { FaQrcode, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaSearch } from 'react-icons/fa';

// Función para formatear la hora (de SesionesPage)
const formatTime = (timeString) => {
    if (!timeString) return '';
    if (typeof timeString === 'string' && timeString.includes(':')) {
        return timeString.length === 5 ? timeString : timeString.substring(0, 5);
    }
    return timeString;
};

const RegistrarAsistenciaPage = () => {
    const { user } = useAuth(); // Obtenemos el usuario (que ahora tiene personaId)
    const [sesionesHoy, setSesionesHoy] = useState([]);
    const [selectedSesion, setSelectedSesion] = useState(null);
    const [qrData, setQrData] = useState(null); // Almacena { qrImageBase64, ... }

    const [loadingSesiones, setLoadingSesiones] = useState(true);
    const [loadingQR, setLoadingQR] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cargarSesiones = async () => {
            try {
                const data = await asistenciaService.getSesionesDeHoy();
                // Filtramos para que el líder vea solo sesiones de sus eventos/grupos
                // (NOTA: El backend debería hacer esto, pero por ahora filtramos por nombre de líder si está disponible)
                // Esta es una simplificación; idealmente, el backend debería devolver solo las sesiones del líder.
                setSesionesHoy(data || []);
            } catch (err) {
                setError("Error al cargar las sesiones de hoy.");
            } finally {
                setLoadingSesiones(false);
            }
        };
        cargarSesiones();
    }, []);

    const handleGenerarQR = async (sesion) => {
        if (!user || !user.personaId) {
            setError("No se pudo identificar tu ID de líder. Vuelve a iniciar sesión.");
            return;
        }

        setSelectedSesion(sesion);
        setLoadingQR(true);
        setError(null);
        setQrData(null);

        try {
            const data = await asistenciaService.generarQR(sesion.idEventoEspecifico, user.personaId);
            setQrData(data);
        } catch (err) {
            const errorMsg = err.mensaje || err.message || "No se pudo generar el QR.";
            setError(`Error: ${errorMsg}`);
        } finally {
            setLoadingQR(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="header-title">
                    <FaQrcode className="page-icon" />
                    <div>
                        <h1>Registrar Asistencia (Líder)</h1>
                        <p>Genera el código QR para la sesión de hoy.</p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaExclamationTriangle /> {error}
                </div>
            )}

            <div className="card">
                <div className="card-header">
                    <h2>Sesiones Programadas para Hoy</h2>
                </div>

                {loadingSesiones ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>
                        <FaSpinner style={{ animation: 'spin 1s linear infinite' }} size={30} />
                        <p>Buscando sesiones...</p>
                    </div>
                ) : sesionesHoy.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>
                        <FaSearch size={30} style={{ color: '#95a5a6' }} />
                        <p>No tienes sesiones programadas para hoy.</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                            <tr>
                                <th>Sesión</th>
                                <th>Evento General</th>
                                <th>Horario</th>
                                <th>Lugar</th>
                                <th>Acción</th>
                            </tr>
                            </thead>
                            <tbody>
                            {sesionesHoy.map(sesion => (
                                <tr key={sesion.idEventoEspecifico}>
                                    <td>{sesion.nombreSesion}</td>
                                    <td>{sesion.eventoGeneralNombre}</td>
                                    <td>{formatTime(sesion.horaInicio)} - {formatTime(sesion.horaFin)}</td>
                                    <td>{sesion.lugar || 'No especificado'}</td>
                                    <td>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => handleGenerarQR(sesion)}
                                            disabled={loadingQR}
                                        >
                                            <FaQrcode /> Generar QR
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal para mostrar el QR */}
            {(loadingQR || qrData) && (
                <div className="modal-overlay" onClick={() => { setQrData(null); setSelectedSesion(null); }}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px', textAlign: 'center' }}>
                        <div className="modal-header">
                            <h2>{selectedSesion?.nombreSesion}</h2>
                            <button onClick={() => { setQrData(null); setSelectedSesion(null); }} className="close-modal">
                                <FaTimes />
                            </button>
                        </div>
                        <div className="modal-body">
                            {loadingQR && (
                                <>
                                    <FaSpinner style={{ animation: 'spin 1s linear infinite' }} size={50} />
                                    <p>Generando código QR...</p>
                                </>
                            )}

                            {qrData && qrData.qrImageBase64 && (
                                <>
                                    <p>¡QR listo! Pide a tus integrantes que lo escaneen.</p>
                                    <img
                                        src={qrData.qrImageBase64}
                                        alt="Código QR de asistencia"
                                        style={{ width: '100%', maxWidth: '400px', border: '5px solid #ecf0f1' }}
                                    />
                                    <p style={{ color: 'var(--text-color-light)', fontSize: '0.9rem', marginTop: '10px' }}>
                                        Lugar: {qrData.qrData?.lugar || 'N/A'}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RegistrarAsistenciaPage;