import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { FaUserFriends, FaUsersCog, FaSpinner, FaSearch, FaCrown, FaUserPlus, FaExclamationTriangle, FaSave, FaTimes, FaEdit, FaTrashAlt } from 'react-icons/fa';
import { grupoPequenoService } from '../../services/grupoPequenoService';
import { grupoParticipanteService } from '../../services/grupoParticipanteService';
import { usuarioService } from '../../services/usuarioService'; // Necesario para el modal

// --- Componente de Card ---
const GrupoCard = ({ grupo, onGestionar }) => {
    const capacityPercentage = Math.min(100, (grupo.participantesActuales / grupo.capacidadMaxima) * 100);
    const isFull = grupo.participantesActuales >= grupo.capacidadMaxima;
    const capacityColor = isFull ? 'var(--error-color)' : capacityPercentage >= 80 ? 'var(--warning-color)' : 'var(--success-color)';

    return (
        <div className="card">
            <div className="card-header">
                <FaUserFriends className="page-icon" />
                <h3 className="card-title">{grupo.nombre}</h3>
            </div>
            <div className="card-content">
                <p>{grupo.descripcion || 'Sin descripción.'}</p>
                <span className="badge">{grupo.grupoGeneralNombre}</span>
            </div>
            <div className="card-body-info">
                <div className="info-item">
                    <FaCrown className="info-icon lider-icon-card" />
                    <div className="info-text">
                        <span className="info-label">Líder</span>
                        <strong className="info-value">{grupo.liderNombre}</strong>
                        <small className="info-subvalue">{grupo.liderCodigo}</small>
                    </div>
                </div>
                <div className="info-item">
                    <FaUsersCog className="info-icon" style={{ color: capacityColor }} />
                    <div className="info-text">
                        <span className="info-label">Participantes</span>
                        <strong className="info-value" style={{ color: capacityColor }}>
                            {grupo.participantesActuales} / {grupo.capacidadMaxima}
                        </strong>
                        {/* (Omitimos la barra de capacidad por simplicidad en esta copia) */}
                    </div>
                </div>
            </div>
            <div className="modal-footer">
                <button
                    className="btn btn-primary"
                    onClick={() => onGestionar(grupo)}
                    title="Gestionar participantes"
                >
                    <FaUserPlus /> Participantes
                </button>
            </div>
        </div>
    );
};
// --- Fin Card ---

// --- Copia del Modal de Gestión de Participantes ---
const GestionParticipantesModal = ({ currentGrupo, onClose, onParticipanteChanged, setSuccess, setError }) => {
    const [participantesDisponibles, setParticipantesDisponibles] = useState([]);
    const [participantesActuales, setParticipantesActuales] = useState([]);

    useEffect(() => {
        loadParticipantesActuales(currentGrupo.idGrupoPequeno);
        loadParticipantesDisponibles(currentGrupo.idGrupoPequeno);
    }, [currentGrupo]);

    const loadParticipantesDisponibles = async (grupoPequenoId) => {
        try {
            const grupoCompleto = await grupoPequenoService.findById(grupoPequenoId);
            const eventoGeneralId = grupoCompleto.eventoGeneralId;
            if (!eventoGeneralId) {
                setError('No se pudo determinar el evento general del grupo.');
                return;
            }
            const data = await grupoPequenoService.getParticipantesDisponibles(eventoGeneralId);
            const participantesActualesRaw = await grupoParticipanteService.findByGrupoPequeno(grupoPequenoId);
            const idsParticipantesActivosEnEsteGrupo = participantesActualesRaw
                .filter(p => p.estado === 'ACTIVO')
                .map(p => p.personaId);

            const disponiblesParaAgregar = data.filter(persona => {
                const yaActivoEnEsteGrupo = idsParticipantesActivosEnEsteGrupo.includes(persona.personaId);
                return !persona.yaInscrito && !yaActivoEnEsteGrupo;
            });
            setParticipantesDisponibles(disponiblesParaAgregar);
        } catch (error) {
            setError('Error al cargar participantes disponibles: ' + error.message);
        }
    };

    const loadParticipantesActuales = async (grupoPequenoId) => {
        try {
            const data = await grupoParticipanteService.findByGrupoPequeno(grupoPequenoId);
            const activos = data.filter(p => p.estado === 'ACTIVO');
            setParticipantesActuales(activos);
        } catch (error) {
            setError('Error al cargar participantes del grupo');
        }
    };

    const agregarParticipante = async (personaId) => {
        try {
            const participanteData = {
                grupoPequenoId: currentGrupo.idGrupoPequeno,
                personaId: personaId
            };
            await grupoParticipanteService.save(participanteData);
            setSuccess('Participante agregado exitosamente');
            await loadParticipantesActuales(currentGrupo.idGrupoPequeno);
            await loadParticipantesDisponibles(currentGrupo.idGrupoPequeno);
            if (onParticipanteChanged) onParticipanteChanged();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            const backendMessage = err.response?.data?.message || err.message;
            setError('Error al agregar participante: ' + backendMessage);
        }
    };

    const removerParticipante = async (participanteId) => {
        try {
            await grupoParticipanteService.removerParticipante(participanteId);
            setSuccess('Participante removido exitosamente');
            await loadParticipantesActuales(currentGrupo.idGrupoPequeno);
            await loadParticipantesDisponibles(currentGrupo.idGrupoPequeno);
            if (onParticipanteChanged) onParticipanteChanged();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Error al remover participante');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content large-modal">
                <div className="modal-header">
                    <h3><FaUsersCog /> Gestión de Participantes - {currentGrupo.nombre}</h3>
                    <button onClick={onClose} className="close-modal"><FaTimes /></button>
                </div>
                <div className="modal-body">
                    <div className="capacity-alert">
                        <strong>Capacidad: {participantesActuales.length} / {currentGrupo.capacidadMaxima}</strong>
                        {participantesActuales.length >= currentGrupo.capacidadMaxima && (
                            <span className="alert-full"> ¡Capacidad máxima alcanzada!</span>
                        )}
                    </div>
                    <div className="participantes-grid">
                        <div className="participantes-section">
                            <h4>Participantes Actuales ({participantesActuales.length})</h4>
                            <div className="participantes-list">
                                {participantesActuales.map(p => (
                                    <div key={p.idGrupoParticipante} className="participante-item">
                                        <div className="participante-info">
                                            <strong>{p.personaNombre}</strong>
                                            <span>{p.personaCodigo}</span>
                                        </div>
                                        <button onClick={() => removerParticipante(p.idGrupoParticipante)} className="btn btn-danger btn-sm"><FaTrashAlt /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="participantes-section">
                            <h4>Participantes Disponibles ({participantesDisponibles.length})</h4>
                            <div className="participantes-list">
                                {participantesDisponibles.map(p => (
                                    <div key={p.personaId} className="participante-item">
                                        <div className="participante-info">
                                            <strong>{p.nombreCompleto}</strong>
                                            <span>{p.codigoEstudiante}</span>
                                        </div>
                                        <button onClick={() => agregarParticipante(p.personaId)} className="btn btn-success btn-sm" disabled={participantesActuales.length >= currentGrupo.capacidadMaxima}><FaUserPlus /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button onClick={onClose} className="btn btn-primary">Cerrar</button>
                </div>
            </div>
        </div>
    );
};
// --- Fin Modal ---


// --- Página Principal "Mis Grupos" ---
const MisGruposPage = () => {
    const { user } = useAuth();
    const [misGrupos, setMisGrupos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showParticipantesModal, setShowParticipantesModal] = useState(false);
    const [currentGrupo, setCurrentGrupo] = useState(null);

    useEffect(() => {
        if (user?.personaId) {
            loadGrupos();
        }
    }, [user]);

    const loadGrupos = async () => {
        try {
            setLoading(true);
            const data = await grupoPequenoService.findByLider(user.personaId);
            const gruposConParticipantes = await Promise.all(
                data.map(async (grupo) => {
                    const participantes = await grupoParticipanteService.findByGrupoPequeno(grupo.idGrupoPequeno);
                    const activos = participantes.filter(p => p.estado === 'ACTIVO');
                    return { ...grupo, participantesActuales: activos.length };
                })
            );
            setMisGrupos(gruposConParticipantes);
            setError('');
        } catch (err) {
            setError('Error al cargar tus grupos.');
        } finally {
            setLoading(false);
        }
    };

    const openGestionParticipantesModal = (grupo) => {
        setCurrentGrupo(grupo);
        setShowParticipantesModal(true);
        setError('');
    };

    const filteredGrupos = misGrupos.filter(grupo =>
        grupo.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grupo.grupoGeneralNombre?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="page-container" style={{ textAlign: 'center', paddingTop: '50px' }}>
                <FaSpinner className="spinner" size={40} />
                <p>Cargando tus grupos...</p>
            </div>
        );
    }

    return (
        <div className="page-container">
            {error && <div className="alert alert-danger"><FaExclamationTriangle /> {error}</div>}
            {success && <div className="alert alert-success"><FaSave /> {success}</div>}

            <div className="page-header">
                <div className="header-title">
                    <FaUserFriends className="page-icon" />
                    <div>
                        <h1>Mis Grupos Asignados</h1>
                        <p>Gestiona los participantes de los grupos que lideras.</p>
                    </div>
                </div>
                <div className="header-actions">
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar en mis grupos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="form-input"
                        />
                    </div>
                </div>
            </div>

            <div className="cards-grid">
                {filteredGrupos.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                        <FaUserFriends size={50} style={{ opacity: 0.5, marginBottom: '20px' }} />
                        <p>{searchTerm ? 'No se encontraron grupos' : 'Aún no tienes grupos pequeños asignados.'}</p>
                    </div>
                ) : (
                    filteredGrupos.map((grupo) => (
                        <GrupoCard
                            key={grupo.idGrupoPequeno}
                            grupo={grupo}
                            onGestionar={openGestionParticipantesModal}
                        />
                    ))
                )}
            </div>

            {showParticipantesModal && currentGrupo && (
                <GestionParticipantesModal
                    currentGrupo={currentGrupo}
                    onClose={() => setShowParticipantesModal(false)}
                    onParticipanteChanged={loadGrupos}
                    setSuccess={setSuccess}
                    setError={setError}
                />
            )}
        </div>
    );
};

export default MisGruposPage;