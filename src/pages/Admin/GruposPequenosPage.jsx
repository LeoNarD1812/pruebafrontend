import React, { useState, useEffect } from 'react';
import {
    FaUserFriends,
    FaPlus,
    FaEdit,
    FaTrashAlt,
    FaSearch,
    FaUsersCog,
    FaSpinner,
    FaTimes,
    FaSave,
    FaUserPlus,
    FaUserTie,
    FaExclamationTriangle,
    FaCrown,
    FaFilter
} from 'react-icons/fa';
import { crudService } from '../../services/crudService';
import { usuarioService } from '../../services/usuarioService';
import { grupoParticipanteService } from '../../services/grupoParticipanteService';
import { grupoPequenoService } from '../../services/grupoPequenoService';
import { grupoGeneralService } from '../../services/grupoGeneralService';

const GruposPequenosPage = () => {
    const [grupos, setGrupos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showParticipantesModal, setShowParticipantesModal] = useState(false);
    const [currentGrupo, setCurrentGrupo] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchTermParticipantes, setSearchTermParticipantes] = useState('');
    const [formData, setFormData] = useState({
        nombre: '',
        grupoGeneralId: '',
        liderId: '',
        capacidadMaxima: 20,
        descripcion: ''
    });
    const [participantesDisponibles, setParticipantesDisponibles] = useState([]);
    const [participantesActuales, setParticipantesActuales] = useState([]);
    const [gruposGenerales, setGruposGenerales] = useState([]);
    const [lideresDisponibles, setLideresDisponibles] = useState([]);
    const [loadingLideres, setLoadingLideres] = useState(false);
    const [cicloFiltro, setCicloFiltro] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const ciclosDisponibles = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

    useEffect(() => {
        loadGrupos();
        loadGruposGenerales();
    }, []);

    useEffect(() => {
        if (showParticipantesModal && currentGrupo) {
            loadParticipantesDisponibles(currentGrupo.idGrupoPequeno, cicloFiltro);
        }
    }, [cicloFiltro, showParticipantesModal, currentGrupo]);

    const loadGrupos = async () => {
        try {
            setLoading(true);
            const data = await grupoPequenoService.findAll();

            const gruposConParticipantes = await Promise.all(
                data.map(async (grupo) => {
                    try {
                        const participantes = await grupoParticipanteService.findByGrupoPequeno(grupo.idGrupoPequeno);
                        const participantesActivos = participantes.filter(p => p.estado === 'ACTIVO');
                        return {
                            ...grupo,
                            participantesActuales: participantesActivos.length
                        };
                    } catch (error) {
                        console.error(`Error cargando participantes para grupo ${grupo.idGrupoPequeno}:`, error);
                        return { ...grupo, participantesActuales: 0 };
                    }
                })
            );
            setGrupos(gruposConParticipantes);
            setError('');
        } catch (err) {
            setError('Error al cargar grupos pequeños.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadGruposGenerales = async () => {
        try {
            const data = await grupoGeneralService.findAll();
            setGruposGenerales(data);
        } catch (error) {
            console.error('Error cargando grupos generales:', error);
            setError('Error al cargar grupos generales');
        }
    };

    const loadLideresDisponibles = async (eventoGeneralId, excludeGrupoId = null) => {
        if (!eventoGeneralId) {
            setLideresDisponibles([]);
            return;
        }
        try {
            setLoadingLideres(true);
            const data = await grupoPequenoService.getLideresDisponibles(eventoGeneralId, excludeGrupoId);
            setLideresDisponibles(data);
        } catch (error) {
            console.error('Error cargando líderes disponibles:', error);
            setError('Error al cargar la lista de líderes: ' + (error.message || 'Error de conexión'));
        } finally {
            setLoadingLideres(false);
        }
    };

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
            console.error('Error cargando participantes disponibles:', error);
            setError('Error al cargar participantes disponibles: ' + error.message);
        }
    };

    const loadParticipantesActuales = async (grupoPequenoId) => {
        try {
            const data = await grupoParticipanteService.findByGrupoPequeno(grupoPequenoId);
            const activos = data.filter(p => p.estado === 'ACTIVO');
            setParticipantesActuales(activos);
        } catch (error) {
            console.error('Error cargando participantes actuales:', error);
            setError('Error al cargar participantes del grupo');
        }
    };

    const openCreateModal = async () => {
        setCurrentGrupo(null);
        setFormData({
            nombre: '',
            grupoGeneralId: '',
            liderId: '',
            capacidadMaxima: 20,
            descripcion: ''
        });
        setLideresDisponibles([]);
        setShowModal(true);
        setError('');
    };

    const openEditModal = async (grupo) => {
        setCurrentGrupo(grupo);
        setFormData({
            nombre: grupo.nombre,
            grupoGeneralId: grupo.grupoGeneralId,
            liderId: grupo.liderId,
            capacidadMaxima: grupo.capacidadMaxima,
            descripcion: grupo.descripcion || ''
        });

        const grupoGeneral = gruposGenerales.find(g => g.idGrupoGeneral === grupo.grupoGeneralId);
        if (grupoGeneral) {
            await loadLideresDisponibles(grupoGeneral.eventoGeneralId, grupo.idGrupoPequeno);
        }

        setLideresDisponibles(prevLideres => {
            const liderActualExiste = prevLideres.some(l => l.idPersona === grupo.liderId);
            if (!liderActualExiste && grupo.liderId) {
                return [
                    { idPersona: grupo.liderId, nombreCompleto: grupo.liderNombre, codigo: grupo.liderCodigo },
                    ...prevLideres
                ];
            }
            return prevLideres;
        });

        setShowModal(true);
        setError('');
    };

    const openGestionParticipantesModal = async (grupo) => {
        setCurrentGrupo(grupo);
        setCicloFiltro('');
        try {
            await loadParticipantesActuales(grupo.idGrupoPequeno);
            await loadParticipantesDisponibles(grupo.idGrupoPequeno, '');
            setShowParticipantesModal(true);
            setError('');
        } catch (error) {
            setError('Error al cargar datos para gestión de participantes');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                nombre: formData.nombre,
                grupoGeneralId: parseInt(formData.grupoGeneralId, 10),
                liderId: parseInt(formData.liderId, 10),
                capacidadMaxima: parseInt(formData.capacidadMaxima, 10),
                descripcion: formData.descripcion
            };

            if (currentGrupo) {
                await grupoPequenoService.update(currentGrupo.idGrupoPequeno, payload);
                setSuccess('Grupo actualizado exitosamente');
            } else {
                await grupoPequenoService.save(payload);
                setSuccess('Grupo creado exitosamente');
            }
            setShowModal(false);
            loadGrupos();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            const backendMessage = err.response?.data?.message || err.message;
            setError(`Error al ${currentGrupo ? 'actualizar' : 'crear'} el grupo: ${backendMessage}`);
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro de que desea eliminar este grupo? Esta acción no se puede deshacer.')) {
            try {
                await grupoPequenoService.delete(id);
                setSuccess('Grupo eliminado exitosamente');
                loadGrupos();
                setTimeout(() => setSuccess(''), 3000);
            } catch (err) {
                setError('Error al eliminar el grupo');
                console.error(err);
            }
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
            loadGrupos();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            const backendMessage = err.response?.data?.message || err.message;
            setError('Error al agregar participante: ' + backendMessage);
            console.error(err);
        }
    };

    const removerParticipante = async (participanteId) => {
        try {
            await grupoParticipanteService.removerParticipante(participanteId);
            setSuccess('Participante removido exitosamente');
            await loadParticipantesActuales(currentGrupo.idGrupoPequeno);
            await loadParticipantesDisponibles(currentGrupo.idGrupoPequeno, cicloFiltro);
            loadGrupos();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Error al remover participante');
            console.error(err);
        }
    };

    const handleGrupoGeneralChange = (e) => {
        const grupoGeneralId = e.target.value;
        setFormData({ ...formData, grupoGeneralId, liderId: '' });
        const grupoGeneral = gruposGenerales.find(g => g.idGrupoGeneral === parseInt(grupoGeneralId));
        if (grupoGeneral) {
            loadLideresDisponibles(grupoGeneral.eventoGeneralId, currentGrupo ? currentGrupo.idGrupoPequeno : null);
        } else {
            setLideresDisponibles([]);
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
    };

    const filteredGrupos = grupos.filter(grupo =>
        grupo.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grupo.grupoGeneralNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grupo.liderNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grupo.liderCodigo?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- Componente de Card para cada Grupo ---
    const GrupoCard = ({ grupo }) => {
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
                        className="btn btn-edit"
                        onClick={() => openEditModal(grupo)}
                        title="Editar grupo"
                    >
                        <FaEdit /> Editar
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => openGestionParticipantesModal(grupo)}
                        title="Gestionar participantes"
                    >
                        <FaUserPlus /> Participantes
                    </button>
                    <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(grupo.idGrupoPequeno)}
                        title="Eliminar grupo"
                    >
                        <FaTrashAlt />
                    </button>
                </div>
            </div>
        );
    };
    // --- Fin Componente de Card ---

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

    if (loading) {
        return (
            <div className="page-container">
                <div className="loading-container">
                    <FaSpinner className="spinner" />
                    <p>Cargando grupos pequeños...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            {/* Alertas */}
            {error && (
                <div className="alert alert-danger">
                    <FaExclamationTriangle /> {error}
                    <button onClick={() => setError('')} className="alert-close">×</button>
                </div>
            )}
            {success && (
                <div className="alert alert-success">
                    <FaSave /> {success}
                    <button onClick={() => setSuccess('')} className="alert-close">×</button>
                </div>
            )}

            {/* Header */}
            <div className="page-header">
                <div className="header-title">
                    <div className="header-icon-container">
                        <FaUserFriends className="page-icon" />
                    </div>
                    <div className="header-text">
                        <h1>Gestión de Grupos Pequeños</h1>
                        <p>Visualiza, crea y administra los grupos de crecimiento.</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`btn btn-secondary ${showFilters ? 'active' : ''}`}
                    >
                        <FaFilter /> Filtros
                    </button>
                    <button onClick={openCreateModal} className="btn btn-primary">
                        <FaPlus /> Nuevo Grupo
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
                                placeholder="Buscar grupo, líder o general..."
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
                    <h2 className="section-title">Grupos Activos</h2>
                    <span className="section-count">{filteredGrupos.length}</span>
                </div>

                {filteredGrupos.length === 0 ? (
                    <div className="empty-state-card">
                        <FaUserFriends className="empty-icon" />
                        <p>{searchTerm ? 'No se encontraron grupos que coincidan con la búsqueda' : 'No hay grupos pequeños registrados.'}</p>
                        <button onClick={openCreateModal} className="btn btn-secondary">
                            <FaPlus /> Crear el primer grupo
                        </button>
                    </div>
                ) : (
                    <div className="cards-grid">
                        {filteredGrupos.map((grupo) => (
                            <GrupoCard key={grupo.idGrupoPequeno} grupo={grupo} />
                        ))}
                    </div>
                )}
            </div>

            {/* Modal para Crear/Editar Grupo */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>
                                <FaCrown className="modal-icon" />
                                {currentGrupo ? 'Editar Grupo' : 'Crear Nuevo Grupo'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="close-modal">
                                <FaTimes />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-body">
                            <div className="form-group">
                                <label>Nombre del Grupo *</label>
                                <input
                                    type="text"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                                    required
                                    placeholder="Ingrese el nombre del grupo"
                                    maxLength="100"
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Grupo General *</label>
                                <select
                                    value={formData.grupoGeneralId}
                                    onChange={handleGrupoGeneralChange}
                                    required
                                    className="form-select"
                                >
                                    <option value="">Seleccionar grupo general</option>
                                    {gruposGenerales.map(grupo => (
                                        <option key={grupo.idGrupoGeneral} value={grupo.idGrupoGeneral}>
                                            {grupo.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Líder *</label>
                                {loadingLideres ? (
                                    <div className="loading-select">
                                        <FaSpinner className="spinner" /> Cargando líderes...
                                    </div>
                                ) : (
                                    <>
                                        <select
                                            value={formData.liderId}
                                            onChange={(e) => setFormData({...formData, liderId: e.target.value})}
                                            required
                                            className="form-select"
                                            disabled={!formData.grupoGeneralId}
                                        >
                                            <option value="">Seleccionar líder</option>
                                            {lideresDisponibles.map(lider => (
                                                <option key={lider.idPersona} value={lider.idPersona}>
                                                    {lider.nombreCompleto}
                                                    {lider.codigo && ` (${lider.codigo})`}
                                                </option>
                                            ))}
                                        </select>
                                        <small className="form-help">
                                            {lideresDisponibles.length === 0 && formData.grupoGeneralId
                                                ? 'No se encontraron líderes disponibles para este evento.'
                                                : 'Seleccione un grupo general para ver los líderes.'
                                            }
                                        </small>
                                    </>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Capacidad Máxima</label>
                                <input
                                    type="number"
                                    value={formData.capacidadMaxima}
                                    onChange={(e) => setFormData({...formData, capacidadMaxima: parseInt(e.target.value) || 20})}
                                    min="1"
                                    max="50"
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Descripción</label>
                                <textarea
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                                    rows="3"
                                    placeholder="Descripción opcional del grupo..."
                                    maxLength="500"
                                    className="form-textarea"
                                />
                            </div>

                            <div className="modal-footer">
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loadingLideres}
                                >
                                    {currentGrupo ? 'Actualizar' : 'Crear'} Grupo
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal para Gestión de Participantes */}
            {showParticipantesModal && currentGrupo && (
                <div className="modal-overlay">
                    <div className="modal-content large-modal">
                        <div className="modal-header">
                            <h3>
                                <FaUsersCog className="modal-icon" /> Gestión de Participantes - {currentGrupo.nombre}
                            </h3>
                            <button onClick={() => setShowParticipantesModal(false)} className="close-modal">
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
                            <button onClick={() => setShowParticipantesModal(false)} className="btn btn-primary">
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GruposPequenosPage;