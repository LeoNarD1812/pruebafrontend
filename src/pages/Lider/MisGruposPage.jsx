import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
    FaUserFriends,
    FaUsersCog,
    FaSpinner,
    FaSearch,
    FaCrown,
    FaUserPlus,
    FaExclamationTriangle,
    FaSave,
    FaTimes,
    FaEdit,
    FaTrashAlt,
    FaFilter
} from 'react-icons/fa';
import { grupoPequenoService } from '../../services/grupoPequenoService';
import { grupoParticipanteService } from '../../services/grupoParticipanteService';

// --- Componente de Card ---
const GrupoCard = ({ grupo, onGestionar }) => {
    const capacityPercentage = Math.min(100, (grupo.participantesActuales / grupo.capacidadMaxima) * 100);
    const isFull = grupo.participantesActuales >= grupo.capacidadMaxima;
    const capacityColor = isFull ? 'var(--error-color)' : capacityPercentage >= 80 ? 'var(--warning-color)' : 'var(--success-color)';

    return (
        <div className="card grupo-card">
            <div className="card-header grupo-card-header">
                <div className="grupo-title-section">
                    <div className="grupo-icon-container">
                        <FaUserFriends className="grupo-icon" />
                    </div>
                    <div className="grupo-title-content">
                        <h3 className="grupo-title">{grupo.nombre}</h3>
                        <div className="grupo-meta">
                            <span className="grupo-general">{grupo.grupoGeneralNombre}</span>
                            <span className={`capacity-status ${isFull ? 'full' : 'available'}`}>
                                {isFull ? 'Completo' : 'Disponible'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card-content">
                <p className="grupo-description">{grupo.descripcion || 'Sin descripción'}</p>
            </div>

            <div className="card-body-info">
                <div className="info-item">
                    <div className="info-icon-container lider">
                        <FaCrown className="info-icon" />
                    </div>
                    <div className="info-text">
                        <span className="info-label">Líder del Grupo</span>
                        <strong className="info-value">{grupo.liderNombre}</strong>
                        <small className="info-subvalue">{grupo.liderCodigo}</small>
                    </div>
                </div>

                <div className="info-item">
                    <div className="info-icon-container">
                        <FaUsersCog className="info-icon" style={{ color: capacityColor }} />
                    </div>
                    <div className="info-text">
                        <span className="info-label">Participantes</span>
                        <strong className="info-value" style={{ color: capacityColor }}>
                            {grupo.participantesActuales} / {grupo.capacidadMaxima}
                        </strong>
                        <div className="capacity-bar">
                            <div
                                className="capacity-fill"
                                style={{ width: `${capacityPercentage}%`, backgroundColor: capacityColor }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card-footer grupo-card-footer">
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

// --- Modal de Gestión de Participantes Mejorado ---
const GestionParticipantesModal = ({ currentGrupo, onClose, onParticipanteChanged, setSuccess, setError }) => {
    const [participantesDisponibles, setParticipantesDisponibles] = useState([]);
    const [participantesActuales, setParticipantesActuales] = useState([]);
    const [searchTermParticipantes, setSearchTermParticipantes] = useState('');
    const [cicloFiltro, setCicloFiltro] = useState('');
    const ciclosDisponibles = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

    useEffect(() => {
        if (currentGrupo) {
            loadParticipantesActuales(currentGrupo.idGrupoPequeno);
            loadParticipantesDisponibles(currentGrupo.idGrupoPequeno, cicloFiltro);
        }
    }, [currentGrupo, cicloFiltro]);

    const loadParticipantesDisponibles = async (grupoPequenoId, ciclo) => {
        try {
            const grupoCompleto = await grupoPequenoService.findById(grupoPequenoId);
            const eventoGeneralId = grupoCompleto.eventoGeneralId;
            if (!eventoGeneralId) {
                setError('No se pudo determinar el evento general del grupo.');
                return;
            }
            const data = await grupoPequenoService.getParticipantesDisponibles(eventoGeneralId, ciclo);

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
            await loadParticipantesDisponibles(currentGrupo.idGrupoPequeno, cicloFiltro);
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
            await loadParticipantesDisponibles(currentGrupo.idGrupoPequeno, cicloFiltro);
            if (onParticipanteChanged) onParticipanteChanged();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Error al remover participante');
        }
    };

    // Filtrar participantes
    const filteredParticipantesActuales = participantesActuales.filter(participante =>
        participante.personaNombre?.toLowerCase().includes(searchTermParticipantes.toLowerCase()) ||
        participante.personaCodigo?.toLowerCase().includes(searchTermParticipantes.toLowerCase())
    );

    const filteredParticipantesDisponibles = participantesDisponibles.filter(participante =>
        participante.nombreCompleto?.toLowerCase().includes(searchTermParticipantes.toLowerCase()) ||
        participante.codigoEstudiante?.toLowerCase().includes(searchTermParticipantes.toLowerCase()) ||
        participante.documento?.toLowerCase().includes(searchTermParticipantes.toLowerCase()) ||
        participante.correo?.toLowerCase().includes(searchTermParticipantes.toLowerCase())
    );

    return (
        <div className="modal-overlay">
            <div className="modal-content large-modal">
                <div className="modal-header">
                    <h3>
                        <FaUsersCog className="modal-icon" /> Gestión de Participantes - {currentGrupo.nombre}
                    </h3>
                    <button onClick={onClose} className="close-modal">
                        <FaTimes />
                    </button>
                </div>

                <div className="modal-body">
                    {/* Header con información de capacidad y filtro */}
                    <div className="participantes-header">
                        <div className="capacity-info">
                            <strong>Capacidad: {participantesActuales.length} / {currentGrupo.capacidadMaxima}</strong>
                            {participantesActuales.length >= currentGrupo.capacidadMaxima && (
                                <span className="capacity-full-badge">¡Capacidad máxima!</span>
                            )}
                        </div>

                        <div className="filter-section">
                            <div className="search-box-small">
                                <FaSearch className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Buscar participante..."
                                    value={searchTermParticipantes}
                                    onChange={(e) => setSearchTermParticipantes(e.target.value)}
                                    className="form-input search-input-small"
                                />
                            </div>
                            <div className="filter-controls">
                                <label>Filtrar por Ciclo:</label>
                                <select
                                    value={cicloFiltro}
                                    onChange={(e) => setCicloFiltro(e.target.value)}
                                    className="form-select filter-select"
                                >
                                    <option value="">Todos los ciclos</option>
                                    {ciclosDisponibles.map(ciclo => (
                                        <option key={ciclo} value={ciclo}>Ciclo {ciclo}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Grid de dos columnas */}
                    <div className="participantes-grid-improved">
                        {/* Columna de Participantes Actuales */}
                        <div className="participantes-column">
                            <div className="column-header">
                                <h4>Participantes Actuales</h4>
                                <span className="participant-count">{filteredParticipantesActuales.length}</span>
                            </div>
                            <div className="participantes-list-container">
                                {filteredParticipantesActuales.length === 0 ? (
                                    <div className="empty-list">
                                        <FaUserFriends className="empty-icon" />
                                        <p>{searchTermParticipantes ? 'No se encontraron participantes que coincidan con la búsqueda' : 'No hay participantes en este grupo'}</p>
                                    </div>
                                ) : (
                                    <div className="participantes-scroll-list">
                                        {filteredParticipantesActuales.map(participante => (
                                            <div key={participante.idGrupoParticipante} className="participante-card">
                                                <div className="participante-avatar">
                                                    <FaUserFriends />
                                                </div>
                                                <div className="participante-details">
                                                    <strong className="participante-name">{participante.personaNombre}</strong>
                                                    <span className="participante-code">{participante.personaCodigo}</span>
                                                    <small className="participante-date">
                                                        Inscrito: {new Date(participante.fechaInscripcion).toLocaleDateString()}
                                                    </small>
                                                </div>
                                                <button
                                                    onClick={() => removerParticipante(participante.idGrupoParticipante)}
                                                    className="btn-remove"
                                                    title="Remover participante"
                                                >
                                                    <FaTrashAlt />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Columna de Participantes Disponibles */}
                        <div className="participantes-column">
                            <div className="column-header">
                                <h4>Participantes Disponibles</h4>
                                <span className="participant-count">{filteredParticipantesDisponibles.length}</span>
                            </div>
                            <div className="participantes-list-container">
                                {filteredParticipantesDisponibles.length === 0 ? (
                                    <div className="empty-list">
                                        <FaUserFriends className="empty-icon" />
                                        <p>{searchTermParticipantes ? 'No se encontraron participantes que coincidan con la búsqueda' : 'No hay participantes disponibles'}</p>
                                        <small>Prueba con otro ciclo o verifica los filtros</small>
                                    </div>
                                ) : (
                                    <div className="participantes-scroll-list">
                                        {filteredParticipantesDisponibles.map(participante => (
                                            <div key={participante.personaId} className="participante-card">
                                                <div className="participante-avatar">
                                                    <FaUserPlus />
                                                </div>
                                                <div className="participante-details">
                                                    <strong className="participante-name">{participante.nombreCompleto}</strong>
                                                    <span className="participante-code">
                                                        {participante.codigoEstudiante} - {participante.documento}
                                                    </span>
                                                    <small className="participante-email">{participante.correo}</small>
                                                </div>
                                                <button
                                                    onClick={() => agregarParticipante(participante.personaId)}
                                                    className="btn-add"
                                                    disabled={participantesActuales.length >= currentGrupo.capacidadMaxima}
                                                    title={
                                                        participantesActuales.length >= currentGrupo.capacidadMaxima
                                                            ? 'Capacidad máxima alcanzada'
                                                            : 'Agregar al grupo'
                                                    }
                                                >
                                                    <FaUserPlus />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button onClick={onClose} className="btn btn-primary">
                        Cerrar
                    </button>
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
    const [showFilters, setShowFilters] = useState(false);

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

    const clearFilters = () => {
        setSearchTerm('');
    };

    const filteredGrupos = misGrupos.filter(grupo =>
        grupo.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grupo.grupoGeneralNombre?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="page-container">
                <div className="loading-container">
                    <FaSpinner className="spinner" />
                    <p>Cargando tus grupos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            {error && <div className="alert alert-danger"><FaExclamationTriangle /> {error}</div>}
            {success && <div className="alert alert-success"><FaSave /> {success}</div>}

            <div className="page-header">
                <div className="header-title">
                    <div className="header-icon-container">
                        <FaUserFriends className="page-icon" />
                    </div>
                    <div className="header-text">
                        <h1>Mis Grupos Asignados</h1>
                        <p>Gestiona los participantes de los grupos que lideras.</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`btn btn-secondary ${showFilters ? 'active' : ''}`}
                    >
                        <FaFilter /> Filtros
                    </button>
                </div>
            </div>

            {/* Panel de Filtros */}
            {showFilters && (
                <div className="filters-panel">
                    <div className="filters-header">
                        <h3>Filtros de Búsqueda</h3>
                        <button onClick={clearFilters} className="btn btn-link">
                            Limpiar filtros
                        </button>
                    </div>
                    <div className="filters-content">
                        <div className="search-box">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Buscar grupo o general..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="form-input"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Contenedor de Cards */}
            <div className="card-container">
                <div className="section-header">
                    <h2 className="section-title">Mis Grupos</h2>
                    <span className="section-count">{filteredGrupos.length}</span>
                </div>

                <div className="cards-grid">
                    {filteredGrupos.length === 0 ? (
                        <div className="empty-state-card">
                            <FaUserFriends className="empty-icon" />
                            <p>{searchTerm ? 'No se encontraron grupos que coincidan con la búsqueda' : 'Aún no tienes grupos pequeños asignados.'}</p>
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