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
    FaCrown
} from 'react-icons/fa';
// Los servicios dedicados ya están importados correctamente
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

    useEffect(() => {
        loadGrupos();
        loadGruposGenerales();
    }, []);

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

    // ✅ --- SECCIÓN CORREGIDA ---
    const loadLideresDisponibles = async (excludeGrupoPequenoId = null) => {
        try {
            setLoadingLideres(true);

            // 1. Usar el endpoint correcto que devuelve PersonaDTO
            const data = await usuarioService.getLideresDisponibles(excludeGrupoPequenoId);

            // 2. Ya no se necesita el mapeo manual (data.map),
            //    porque 'data' ahora contiene idPersona, nombreCompleto, etc.
            setLideresDisponibles(data);

            if (data.length === 0) {
                setError('No se encontraron líderes disponibles. Asegúrese de que existan usuarios con el rol LIDER que no estén asignados a otro grupo.');
            }
        } catch (error) {
            console.error('Error cargando líderes disponibles:', error);
            setError('Error al cargar la lista de líderes: ' + (error.message || 'Error de conexión'));
        } finally {
            setLoadingLideres(false);
        }
    };
    // ✅ --- FIN DE SECCIÓN CORREGIDA ---

    const loadParticipantesDisponibles = async (grupoPequenoId) => {
        try {
            console.log("Paso 1: Abriendo modal para grupoPequenoId:", grupoPequenoId);

            const grupoCompleto = await grupoPequenoService.findById(grupoPequenoId);
            const eventoGeneralId = grupoCompleto.eventoGeneralId;

            if (!eventoGeneralId) {
                setError('No se pudo determinar el evento general del grupo.');
                return;
            }

            console.log("Paso 2: Encontrado eventoGeneralId:", eventoGeneralId, "(Postman usó ID 1)");

            const data = await grupoPequenoService.getParticipantesDisponibles(eventoGeneralId);

            console.log("Paso 3: Datos recibidos del API (data):", data); // Verifica si esto está vacío

            const participantesActualesRaw = await grupoParticipanteService.findByGrupoPequeno(grupoPequenoId);
            const idsParticipantesActivosEnEsteGrupo = participantesActualesRaw
                .filter(p => p.estado === 'ACTIVO')
                .map(p => p.personaId);

            console.log("Paso 4: IDs en este grupo (idsParticipantesActivosEnEsteGrupo):", idsParticipantesActivosEnEsteGrupo);

            const disponiblesParaAgregar = data.filter(persona => {
                const yaActivoEnEsteGrupo = idsParticipantesActivosEnEsteGrupo.includes(persona.personaId);

                // Log de por qué un participante es filtrado
                if (persona.yaInscrito) {
                    console.log(`Filtrado ${persona.nombreCompleto}: yaInscrito es true`);
                }
                if (yaActivoEnEsteGrupo) {
                    console.log(`Filtrado ${persona.nombreCompleto}: yaActivoEnEsteGrupo es true`);
                }

                return !persona.yaInscrito && !yaActivoEnEsteGrupo;
            });

            console.log("Paso 5: Participantes finales para mostrar (disponiblesParaAgregar):", disponiblesParaAgregar);
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
        await loadLideresDisponibles();
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
        await loadLideresDisponibles(grupo.idGrupoPequeno);
        setShowModal(true);
        setError('');
    };

    const openGestionParticipantesModal = async (grupo) => {
        setCurrentGrupo(grupo);
        try {
            // Recargar listas para el modal
            await loadParticipantesActuales(grupo.idGrupoPequeno);
            await loadParticipantesDisponibles(grupo.idGrupoPequeno);
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
                ...formData,
                grupoGeneralId: parseInt(formData.grupoGeneralId, 10),
                liderId: parseInt(formData.liderId, 10), // Esto ahora será el idPersona (correcto)
                capacidadMaxima: parseInt(formData.capacidadMaxima, 10),
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
            setError(`Error al ${currentGrupo ? 'actualizar' : 'crear'} el grupo: ${err.message}`);
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
            await loadParticipantesDisponibles(currentGrupo.idGrupoPequeno);
            loadGrupos();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            const backendMessage = err.response?.data?.message || err.message;
            const displayMessage = (backendMessage && backendMessage !== 'Request failed with status code 400')
                ? backendMessage
                : 'Verifique si el grupo está lleno o el participante ya está inscrito.';

            setError('Error al agregar participante: ' + displayMessage);
            console.error(err);
        }
    };

    const removerParticipante = async (participanteId) => {
        try {
            await grupoParticipanteService.removerParticipante(participanteId);
            setSuccess('Participante removido exitosamente');
            await loadParticipantesActuales(currentGrupo.idGrupoPequeno);
            await loadParticipantesDisponibles(currentGrupo.idGrupoPequeno);
            loadGrupos();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Error al remover participante');
            console.error(err);
        }
    };

    const filteredGrupos = grupos.filter(grupo =>
        grupo.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grupo.grupoGeneralNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grupo.liderNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grupo.liderCodigo?.toLowerCase().includes(searchTerm.toLowerCase())
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

    // --- Componente de Card para cada Grupo ---
    const GrupoCard = ({ grupo }) => {
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
                    <p>{grupo.descripcion}</p>
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
                            <div className="capacity-bar-small">
                                <div
                                    className="capacity-fill"
                                    style={{ width: `${capacityPercentage}%`, backgroundColor: capacityColor }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button
                        className="btn btn-secondary"
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
                    <FaUserFriends className="page-icon" />
                    <div>
                        <h1>Gestión de Grupos Pequeños</h1>
                        <p>Visualiza, crea y administra los grupos de crecimiento.</p>
                    </div>
                </div>
                <div className="header-actions">
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
                    <button onClick={openCreateModal} className="btn btn-primary">
                        <FaPlus /> Nuevo Grupo
                    </button>
                </div>
            </div>

            {/* Contenedor de Cards */}
            <div className="card-container">
                <h2 className="section-title">Grupos Activos ({filteredGrupos.length})</h2>

                {filteredGrupos.length === 0 ? (
                    <div className="empty-state-card">
                        <FaUserFriends size={50} style={{ opacity: 0.5 }} />
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
            {/* Fin Contenedor de Cards */}


            {/* Modal para Crear/Editar Grupo (Se mantiene el estilo original) */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>
                                <FaCrown style={{ marginRight: '10px', color: '#f39c12' }} />
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
                                    onChange={(e) => setFormData({...formData, grupoGeneralId: e.target.value})}
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
                                        >
                                            <option value="">Seleccionar líder</option>
                                            {/* ✅ CORREGIDO: Itera sobre los líderes (que ahora son PersonaDTO) */}
                                            {lideresDisponibles.map(lider => (
                                                <option key={lider.idPersona} value={lider.idPersona}>
                                                    {lider.nombreCompleto}
                                                    {lider.codigoEstudiante && ` (${lider.codigoEstudiante})`}
                                                </option>
                                            ))}
                                        </select>
                                        <small className="form-help">
                                            {lideresDisponibles.length === 0
                                                ? 'No se encontraron líderes disponibles con rol LÍDER. Contacte al administrador.'
                                                : `Se muestran ${lideresDisponibles.length} líder(es) disponible(s) con rol LÍDER`
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
                                    disabled={loadingLideres || (!currentGrupo && lideresDisponibles.length === 0)}
                                >
                                    {currentGrupo ? 'Actualizar' : 'Crear'} Grupo
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal para Gestión de Participantes (Se mantiene el estilo original) */}
            {showParticipantesModal && currentGrupo && (
                <div className="modal-overlay">
                    <div className="modal-content large-modal">
                        <div className="modal-header">
                            <h3>
                                <FaUsersCog /> Gestión de Participantes - {currentGrupo.nombre}
                            </h3>
                            <button onClick={() => setShowParticipantesModal(false)} className="close-modal">
                                <FaTimes />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="capacity-alert">
                                <strong>Capacidad: {participantesActuales.length} / {currentGrupo.capacidadMaxima}</strong>
                                {participantesActuales.length >= currentGrupo.capacidadMaxima && (
                                    <span className="alert-full">¡Capacidad máxima alcanzada!</span>
                                )}
                            </div>

                            <div className="participantes-grid">
                                <div className="participantes-section">
                                    <h4>Participantes Actuales ({participantesActuales.length})</h4>
                                    <div className="participantes-list">
                                        {participantesActuales.map(participante => (
                                            <div key={participante.idGrupoParticipante} className="participante-item">
                                                <div className="participante-info">
                                                    <strong>{participante.personaNombre}</strong>
                                                    <span>{participante.personaCodigo}</span>
                                                    <small>Inscrito: {new Date(participante.fechaInscripcion).toLocaleDateString()}</small>
                                                </div>
                                                <button
                                                    onClick={() => removerParticipante(participante.idGrupoParticipante)}
                                                    className="btn btn-danger btn-sm"
                                                    title="Remover participante"
                                                >
                                                    <FaTrashAlt />
                                                </button>
                                            </div>
                                        ))}
                                        {participantesActuales.length === 0 && (
                                            <div className="empty-state">
                                                No hay participantes en este grupo
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="participantes-section">
                                    <h4>Participantes Disponibles ({participantesDisponibles.length})</h4>
                                    <div className="participantes-list">
                                        {/* Iteramos sobre los participantes disponibles (que ya no están en otro grupo activo Y no están en este) */}
                                        {participantesDisponibles.map(participante => (
                                            <div key={participante.personaId} className="participante-item">
                                                <div className="participante-info">
                                                    <strong>{participante.nombreCompleto}</strong>
                                                    {/* Se añade el documento para mejor identificación */}
                                                    <span>{participante.codigoEstudiante} - {participante.documento}</span>
                                                    <small>{participante.correo}</small>
                                                </div>
                                                <button
                                                    onClick={() => agregarParticipante(participante.personaId)}
                                                    className="btn btn-success btn-sm"
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
                                        {participantesDisponibles.length === 0 && (
                                            <div className="empty-state">
                                                No hay participantes disponibles que cumplan el perfil (Integrante/Estudiante) y no estén ya inscritos en un grupo activo de este evento.
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