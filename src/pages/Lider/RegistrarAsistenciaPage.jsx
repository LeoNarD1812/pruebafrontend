import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { asistenciaService } from '../../services/asistenciaService';
import {
    FaQrcode, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaSearch, FaTimes,
    FaListAlt, FaUserCheck, FaUserClock, FaUserTimes, FaUserTag
} from 'react-icons/fa';

// Función para formatear la hora
const formatTime = (timeString) => {
    if (!timeString) return '';
    if (typeof timeString === 'string' && timeString.includes(':')) {
        return timeString.length === 5 ? timeString : timeString.substring(0, 5);
    }
    return timeString;
};

// --- MODAL DE LISTA DE ASISTENCIA (SIN CAMBIOS) ---
const ListaAsistenciaModal = ({ sesion, liderId, onClose }) => {
    // ... (El código de este modal que te envié en el paso anterior está bien)
    // --- (Inicio del código del Modal) ---
    const [listaLlamado, setListaLlamado] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        cargarLista();
    }, []);

    const cargarLista = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await asistenciaService.getListaLlamado(sesion.idEventoEspecifico, liderId);
            setListaLlamado(data || []);
        } catch (err) {
            setError(err.message || 'Error al cargar la lista de participantes.');
        } finally {
            setLoading(false);
        }
    };

    const handleMarcarAsistencia = async (personaId, estado) => {
        let observacion = `Marcado por líder como: ${estado}`;
        if (estado === 'JUSTIFICADO') {
            const motivo = prompt('Por favor, ingrese el motivo de la justificación:');
            if (!motivo) return;
            observacion = `JUSTIFICADO: ${motivo}`;
        }

        const payload = {
            eventoEspecificoId: sesion.idEventoEspecifico,
            personaId: personaId,
            liderId: liderId,
            estado: estado,
            observacion: observacion
        };

        try {
            await asistenciaService.marcarAsistenciaManual(payload);
            await cargarLista();
        } catch (err) {
            setError(err.message || 'No se pudo marcar la asistencia.');
        }
    };

    const getEstadoActual = (participante) => {
        switch (participante.estadoAsistencia) {
            case 'PRESENTE':
                return <span className="badge" style={{ background: 'var(--success-color)', color: 'white' }}>Presente</span>;
            case 'TARDE':
                return <span className="badge" style={{ background: 'var(--warning-color)', color: 'white' }}>Tarde</span>;
            case 'AUSENTE':
                return <span className="badge" style={{ background: 'var(--error-color)', color: 'white' }}>Ausente</span>;
            case 'JUSTIFICADO':
                return <span className="badge" style={{ background: '#3498db', color: 'white' }}>Justificado</span>;
            default:
                return <span className="badge" style={{ background: '#95a5a6', color: 'white' }}>Pendiente</span>;
        }
    };

    const filteredList = (listaLlamado || []).filter(p =>
        p.nombreCompleto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.codigoEstudiante?.includes(searchTerm) ||
        p.documento?.includes(searchTerm)
    );

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Lista de Asistencia - {sesion.nombreSesion}</h2>
                    <button onClick={onClose} className="close-modal"><FaTimes /></button>
                </div>
                <div className="modal-body">
                    <div className="search-box" style={{ marginBottom: '20px' }}>
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar participante..."
                            className="form-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {error && <div className="alert alert-danger">{error}</div>}
                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center' }}>...Cargando lista...</div>
                    ) : (
                        <div className="table-responsive" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                            <table className="data-table">
                                <thead>
                                <tr>
                                    <th>Participante</th>
                                    <th>Grupo</th>
                                    <th>Estado Actual</th>
                                    <th>Marcar Asistencia</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredList.map(p => (
                                    <tr key={p.personaId}>
                                        <td>
                                            <div><strong>{p.nombreCompleto}</strong></div>
                                            <small>{p.codigoEstudiante || p.documento}</small>
                                        </td>
                                        <td>{p.grupoPequenoNombre}</td>
                                        <td>{getEstadoActual(p)}</td>
                                        <td className="actions-cell" style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                            <button title="Presente" className="btn btn-sm btn-success" onClick={() => handleMarcarAsistencia(p.personaId, 'PRESENTE')} disabled={p.estadoAsistencia === 'PRESENTE'}><FaUserCheck /></button>
                                            <button title="Tarde" className="btn btn-sm btn-warning" onClick={() => handleMarcarAsistencia(p.personaId, 'TARDE')} disabled={p.estadoAsistencia === 'TARDE'}><FaUserClock /></button>
                                            <button title="Ausente" className="btn btn-sm btn-danger" onClick={() => handleMarcarAsistencia(p.personaId, 'AUSENTE')} disabled={p.estadoAsistencia === 'AUSENTE'}><FaUserTimes /></button>
                                            <button title="Justificado" className="btn btn-sm btn-info" onClick={() => handleMarcarAsistencia(p.personaId, 'JUSTIFICADO')} disabled={p.estadoAsistencia === 'JUSTIFICADO'}><FaUserTag /></button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
                </div>
            </div>
        </div>
    );
    // --- (Fin del código del Modal) ---
};


// --- COMPONENTE PRINCIPAL (MODIFICADO) ---
const RegistrarAsistenciaPage = () => {
    const { user } = useAuth();
    const [sesionesHoy, setSesionesHoy] = useState([]);
    const [selectedSesion, setSelectedSesion] = useState(null);
    const [qrData, setQrData] = useState(null);
    const [showListaModal, setShowListaModal] = useState(false);
    const [loadingSesiones, setLoadingSesiones] = useState(true);
    const [loadingQR, setLoadingQR] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cargarSesiones = async () => {
            if (!user) return; // Salir si el usuario aún no está cargado
            try {
                setLoadingSesiones(true);
                const data = await asistenciaService.getSesionesDeHoy();

                // --- INICIO DE LA CORRECCIÓN ---
                const ahora = new Date();

                const sesionesValidas = (data || []).filter(sesion => {
                    if (!sesion.horaFin || !sesion.fecha) return false;

                    try {
                        const fechaISO = sesion.fecha.split('T')[0];
                        const horaFinISO = `${fechaISO}T${sesion.horaFin}`;
                        const horaLimite = new Date(horaFinISO);
                        horaLimite.setMinutes(horaLimite.getMinutes() + 10);

                        return ahora < horaLimite;
                    } catch (e) {
                        console.error("Error parseando la fecha/hora de la sesión:", sesion, e);
                        return false;
                    }
                });
                // --- FIN DE LA CORRECCIÓN ---

                setSesionesHoy(sesionesValidas);

            } catch (err) {
                setError("Error al cargar las sesiones de hoy.");
            } finally {
                setLoadingSesiones(false);
            }
        };

        cargarSesiones();
    }, [user]); // Depende del usuario para asegurarse de que 'user' no sea null

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
            const errorMsg = err.message || "No se pudo generar el QR.";
            setError(`Error: ${errorMsg}`);
        } finally {
            setLoadingQR(false);
        }
    };

    const handleVerLista = (sesion) => {
        if (!user || !user.personaId) {
            setError("No se pudo identificar tu ID de líder. Vuelve a iniciar sesión.");
            return;
        }
        setSelectedSesion(sesion);
        setShowListaModal(true);
    };

    const handleCloseListaModal = () => {
        setShowListaModal(false);
        setSelectedSesion(null);
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="header-title">
                    <FaQrcode className="page-icon" />
                    <div>
                        <h1>Registrar Asistencia (Líder)</h1>
                        <p>Genera el código QR o toma asistencia manual para la sesión de hoy.</p>
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
                    <h2>Sesiones Válidas para Hoy</h2>
                </div>

                {loadingSesiones ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>
                        <FaSpinner style={{ animation: 'spin 1s linear infinite' }} size={30} />
                        <p>Buscando sesiones...</p>
                    </div>
                ) : sesionesHoy.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>
                        <FaSearch size={30} style={{ color: '#95a5a6' }} />
                        <p>No tienes sesiones activas o válidas en este momento.</p>
                        <small>(Las sesiones finalizadas hace más de 10 minutos no se muestran)</small>
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
                                    <td className="actions-cell" style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => handleGenerarQR(sesion)}
                                            disabled={loadingQR}
                                        >
                                            <FaQrcode /> Generar QR
                                        </button>
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => handleVerLista(sesion)}
                                            disabled={loadingQR}
                                        >
                                            <FaListAlt /> Tomar Lista
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal para mostrar el QR (Sin cambios) */}
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

            {/* Modal para la Lista (Ahora se muestra condicionalmente) */}
            {showListaModal && selectedSesion && (
                <ListaAsistenciaModal
                    sesion={selectedSesion}
                    liderId={user.personaId}
                    onClose={handleCloseListaModal}
                />
            )}
        </div>
    );
};

export default RegistrarAsistenciaPage;