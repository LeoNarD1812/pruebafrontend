import React, { useState, useEffect } from 'react';
import { FaUsers, FaPlus, FaEdit, FaTrashAlt, FaSearch, FaTimes, FaSync, FaInfoCircle, FaUserFriends, FaCalendarAlt } from 'react-icons/fa';
import { crudService } from '../../services/crudService';
import { formatDateTime } from '../../utils/helpers';

// Inicializa los servicios
const grupoGeneralService = crudService('grupos-generales');
const eventoGeneralService = crudService('eventos-generales');

const GruposGeneralesPage = () => {
    const [grupos, setGrupos] = useState([]);
    const [filteredGrupos, setFilteredGrupos] = useState([]);
    const [eventosGenerales, setEventosGenerales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentGrupo, setCurrentGrupo] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);

    // Estado del formulario
    const [formData, setFormData] = useState({
        eventoGeneralId: '',
        nombre: '',
        descripcion: ''
    });

    useEffect(() => {
        loadGrupos();
        loadEventosGenerales();
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredGrupos(grupos);
        } else {
            const filtered = grupos.filter(grupo =>
                grupo.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                grupo.eventoGeneralNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                grupo.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredGrupos(filtered);
        }
    }, [searchTerm, grupos]);

    const loadGrupos = async () => {
        try {
            setLoading(true);
            const data = await grupoGeneralService.findAll();
            console.log('Grupos cargados:', data);
            setGrupos(data);
            setFilteredGrupos(data);
            setError(null);
        } catch (err) {
            console.error("Error loading grupos:", err);
            setError("Error al cargar grupos generales: " + (err.message || 'Verifique la conexión'));
        } finally {
            setLoading(false);
        }
    };

    const loadEventosGenerales = async () => {
        try {
            const data = await eventoGeneralService.findAll();
            setEventosGenerales(data);
        } catch (error) {
            console.error("Error loading eventos generales:", error);
            setError("Error al cargar eventos generales");
        }
    };

    const handleSave = async (grupoData) => {
        try {
            const payload = {
                eventoGeneralId: parseInt(grupoData.eventoGeneralId, 10),
                nombre: grupoData.nombre,
                descripcion: grupoData.descripcion || null
            };

            console.log('🔄 Enviando payload:', payload);

            if (currentGrupo) {
                await grupoGeneralService.update(currentGrupo.idGrupoGeneral, payload);
            } else {
                await grupoGeneralService.save(payload);
            }

            await loadGrupos();
            closeModal();
            setError(null);
        } catch (error) {
            console.error("❌ Error saving grupo:", error);
            let errorMessage = "Error al guardar el grupo: ";

            if (error.response) {
                errorMessage += `Error ${error.response.status}: `;
                if (error.response.data) {
                    if (error.response.data.message) {
                        errorMessage += error.response.data.message;
                    } else {
                        errorMessage += JSON.stringify(error.response.data);
                    }
                } else {
                    errorMessage += error.response.statusText;
                }
            } else if (error.request) {
                errorMessage += "No se pudo conectar con el servidor";
            } else {
                errorMessage += error.message;
            }

            setError(errorMessage);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro de eliminar este grupo general? Esta acción es irreversible y afectará a todos los grupos pequeños asociados.')) {
            try {
                await grupoGeneralService.delete(id);
                await loadGrupos();
                setError(null);
            } catch (error) {
                console.error("Error deleting grupo:", error);
                setError("Error al eliminar el grupo: " + error.message);
            }
        }
    };

    const openCreateModal = () => {
        setCurrentGrupo(null);
        setFormData({
            eventoGeneralId: '',
            nombre: '',
            descripcion: ''
        });
        setIsModalOpen(true);
    };

    const openEditModal = (grupo) => {
        setCurrentGrupo(grupo);
        setFormData({
            eventoGeneralId: grupo.eventoGeneralId || '',
            nombre: grupo.nombre || '',
            descripcion: grupo.descripcion || ''
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setCurrentGrupo(null);
        setIsModalOpen(false);
        setError(null);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();

        // Validaciones
        if (!formData.eventoGeneralId) {
            setError("El evento general es requerido");
            return;
        }
        if (!formData.nombre || formData.nombre.trim() === '') {
            setError("El nombre del grupo es requerido");
            return;
        }

        handleSave(formData);
    };

    const renderFormContent = () => {
        return (
            <form onSubmit={handleFormSubmit}>
                <div className="modal-header">
                    <h2>
                        {currentGrupo ? 'Editar Grupo General' : 'Crear Grupo General'}
                    </h2>
                    <button type="button" onClick={closeModal} className="close-modal">
                        <FaTimes />
                    </button>
                </div>

                <div className="modal-body">
                    {error && <div className="alert alert-danger">{error}</div>}

                    <div className="form-group">
                        <label htmlFor="eventoGeneralId">Evento General *</label>
                        <select
                            id="eventoGeneralId"
                            name="eventoGeneralId"
                            value={formData.eventoGeneralId}
                            onChange={handleFormChange}
                            required
                            className="form-select"
                        >
                            <option value="">Seleccione un evento</option>
                            {eventosGenerales.map(evento => (
                                <option key={evento.idEventoGeneral} value={evento.idEventoGeneral}>
                                    {evento.nombre}
                                    {/* Mostrar periodoNombre en lugar de cicloAcademico */}
                                    {evento.periodoNombre && ` - ${evento.periodoNombre}`}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="nombre">Nombre del Grupo *</label>
                        <input
                            type="text"
                            id="nombre"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleFormChange}
                            required
                            placeholder="Ej: Grupo A, Grupo de Matemáticas, Equipo de Investigación..."
                            maxLength="100"
                            className="form-input"
                        />
                        <small className="form-help">Máximo 100 caracteres</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="descripcion">Descripción</label>
                        <textarea
                            id="descripcion"
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleFormChange}
                            placeholder="Descripción opcional del grupo general..."
                            rows="3"
                            className="form-textarea"
                        />
                        <small className="form-help">Información adicional sobre el propósito o características del grupo</small>
                    </div>
                </div>

                <div className="modal-footer">
                    <button type="submit" className="btn btn-primary">
                        {currentGrupo ? 'Guardar Cambios' : 'Crear Grupo'}
                    </button>
                    <button type="button" onClick={closeModal} className="btn btn-secondary">
                        Cancelar
                    </button>
                </div>
            </form>
        );
    };

    const renderCards = () => {
        if (filteredGrupos.length === 0) {
            return (
                <div className="empty-state">
                    <FaUsers className="empty-icon" />
                    <h3>No hay grupos generales</h3>
                    <p>
                        {searchTerm
                            ? 'No se encontraron grupos que coincidan con tu búsqueda.'
                            : 'Comienza creando tu primer grupo general.'
                        }
                    </p>
                    {!searchTerm && (
                        <button onClick={openCreateModal} className="btn btn-primary">
                            <FaPlus /> Crear Primer Grupo
                        </button>
                    )}
                </div>
            );
        }

        return (
            <div className="cards-grid">
                {filteredGrupos.map((grupo) => (
                    <GrupoCard
                        key={grupo.idGrupoGeneral}
                        grupo={grupo}
                        onEdit={openEditModal}
                        onDelete={handleDelete}
                    />
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="page-container">
                <FaUsers className="spinner" /> Cargando grupos generales...
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="header-title">
                    <FaUsers className="page-icon" />
                    <div>
                        <h1>Grupos Generales</h1>
                        <p>Organización de la estructura de grupos mayores dentro de un evento.</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button onClick={openCreateModal} className="btn btn-primary">
                        <FaPlus /> Crear Nuevo Grupo General
                    </button>
                    <button onClick={loadGrupos} className="btn btn-secondary" title="Recargar">
                        <FaSync />
                    </button>
                </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="card">
                <div className="card-header">
                    <h2>Grupos Generales ({filteredGrupos.length})</h2>
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar grupo..."
                            className="form-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {renderCards()}
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        {renderFormContent()}
                    </div>
                </div>
            )}
        </div>
    );
};

// Componente Card para cada grupo - Estilo similar a EventosGeneralesPage
const GrupoCard = ({ grupo, onEdit, onDelete }) => {
    const [showFullDescription, setShowFullDescription] = useState(false);

    const toggleDescription = () => {
        setShowFullDescription(!showFullDescription);
    };

    const description = grupo.descripcion || 'Sin descripción disponible';
    const shouldTruncate = description.length > 120;
    const displayDescription = showFullDescription ? description : description.substring(0, 120) + (shouldTruncate ? '...' : '');

    return (
        <div className="card">
            {/* Header */}
            <div className="card-header">
                <div className="grupo-title-section">
                    <FaUsers className="grupo-icon" />
                    <h3 className="grupo-title">{grupo.nombre}</h3>
                </div>
                <div className="grupo-stats">
                    <span className="badge">
                        <FaUserFriends className="stat-icon" />
                        {grupo.cantidadGruposPequenos || 0} grupos
                    </span>
                    <span className="badge">
                        <FaUsers className="stat-icon" />
                        {grupo.totalParticipantes || 0} participantes
                    </span>
                </div>
            </div>

            {/* Descripción */}
            {grupo.descripcion && (
                <div className="card-content">
                    <p>
                        {displayDescription}
                        {shouldTruncate && (
                            <button
                                className="btn-link"
                                onClick={toggleDescription}
                            >
                                {showFullDescription ? ' ver menos' : ' ver más'}
                            </button>
                        )}
                    </p>
                </div>
            )}

            {/* Detalles del grupo */}
            <div className="card-content">
                <div className="detail-item">
                    <FaCalendarAlt className="detail-icon" />
                    <div className="detail-content">
                        <span className="label">Evento:</span>
                        <span className="value">{grupo.eventoGeneralNombre || 'No asignado'}</span>
                    </div>
                </div>


                {grupo.createdAt && (
                    <div className="detail-item">
                        <FaCalendarAlt className="detail-icon" />
                        <div className="detail-content">
                            <span className="label">Creado:</span>
                            <span className="value">{formatDateTime(grupo.createdAt)}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Acciones */}
            <div className="modal-footer">
                <button
                    className="btn btn-secondary"
                    onClick={() => onEdit(grupo)}
                    title="Editar grupo"
                >
                    <FaEdit /> Editar
                </button>
                <button
                    className="btn btn-danger"
                    onClick={() => onDelete(grupo.idGrupoGeneral)}
                    title="Eliminar grupo"
                >
                    <FaTrashAlt /> Eliminar
                </button>
            </div>
        </div>
    );
};

export default GruposGeneralesPage;