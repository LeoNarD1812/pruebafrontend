import React, { useState, useEffect } from 'react';
import {
    FaUsers,
    FaPlus,
    FaEdit,
    FaTrashAlt,
    FaSearch,
    FaTimes,
    FaSync,
    FaInfoCircle,
    FaUserFriends,
    FaCalendarAlt,
    FaExclamationTriangle,
    FaSave
} from 'react-icons/fa';
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
    const [error, setError] = useState(''); // Cambiado a string
    const [success, setSuccess] = useState(''); // Añadido para mensajes de éxito

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
            setGrupos(data);
            setFilteredGrupos(data);
            setError(''); // Limpiar error
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

            if (currentGrupo) {
                await grupoGeneralService.update(currentGrupo.idGrupoGeneral, payload);
                setSuccess('Grupo general actualizado exitosamente');
            } else {
                await grupoGeneralService.save(payload);
                setSuccess('Grupo general creado exitosamente');
            }

            await loadGrupos();
            closeModal();
            setError(''); // Limpiar error
            setTimeout(() => setSuccess(''), 3000); // Limpiar éxito después de 3s
        } catch (error) {
            console.error("❌ Error saving grupo:", error);
            let errorMessage = "Error al guardar el grupo: ";

            if (error.response) {
                errorMessage += `Error ${error.response.status}: `;
                if (error.response.data) {
                    if (error.response.data.message) {
                        errorMessage += error.response.data.message;
                    } else {
                        errorMessage += JSON.response.data.message || JSON.stringify(error.response.data);
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
                setSuccess('Grupo general eliminado exitosamente');
                await loadGrupos();
                setError(''); // Limpiar error
                setTimeout(() => setSuccess(''), 3000); // Limpiar éxito después de 3s
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
        setError(''); // Limpiar error
    };

    const openEditModal = (grupo) => {
        setCurrentGrupo(grupo);
        setFormData({
            eventoGeneralId: grupo.eventoGeneralId || '',
            nombre: grupo.nombre || '',
            descripcion: grupo.descripcion || ''
        });
        setIsModalOpen(true);
        setError(''); // Limpiar error
    };

    const closeModal = () => {
        setCurrentGrupo(null);
        setIsModalOpen(false);
        setError(''); // Limpiar error
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

    // --- Componente de Card para cada Grupo General ---
    const GrupoGeneralCard = ({ grupo, onEdit, onDelete }) => {
        const [showFullDescription, setShowFullDescription] = useState(false);

        const toggleDescription = () => {
            setShowFullDescription(!showFullDescription);
        };

        const description = grupo.descripcion || 'Sin descripción disponible';
        const shouldTruncate = description.length > 120;
        const displayDescription = showFullDescription ? description : description.substring(0, 120) + (shouldTruncate ? '...' : '');

        return (
            <div className="card">
                <div className="card-header">
                    <FaUsers className="page-icon" /> {/* Icono principal del card */}
                    <h3 className="card-title">{grupo.nombre}</h3>
                </div>
                <div className="card-content">
                    <p>{displayDescription}</p>
                    {shouldTruncate && (
                        <button className="btn-link" onClick={toggleDescription}>
                            {showFullDescription ? ' ver menos' : ' ver más'}
                        </button>
                    )}
                </div>

                <div className="card-body-info">
                    <div className="info-item">
                        <FaCalendarAlt className="info-icon" />
                        <div className="info-text">
                            <span className="info-label">Evento General</span>
                            <strong className="info-value">{grupo.eventoGeneralNombre || 'N/A'}</strong>
                            {grupo.periodoNombre && <small className="info-subvalue">{grupo.periodoNombre}</small>}
                        </div>
                    </div>
                    <div className="info-item">
                        <FaUserFriends className="info-icon" />
                        <div className="info-text">
                            <span className="info-label">Grupos Pequeños</span>
                            <strong className="info-value">{grupo.cantidadGruposPequenos || 0}</strong>
                        </div>
                    </div>
                    <div className="info-item">
                        <FaUsers className="info-icon" />
                        <div className="info-text">
                            <span className="info-label">Participantes</span>
                            <strong className="info-value">{grupo.totalParticipantes || 0}</strong>
                        </div>
                    </div>
                </div>

                <div className="modal-footer"> {/* Usamos modal-footer para los botones de acción */}
                    <button
                        className="btn btn-secondary"
                        onClick={() => onEdit(grupo)}
                        title="Editar grupo general"
                    >
                        <FaEdit /> Editar
                    </button>
                    <button
                        className="btn btn-danger"
                        onClick={() => onDelete(grupo.idGrupoGeneral)}
                        title="Eliminar grupo general"
                    >
                        <FaTrashAlt /> Eliminar
                    </button>
                </div>
            </div>
        );
    };
    // --- Fin Componente de Card ---

    if (loading) {
        return (
            <div className="page-container">
                <div className="loading-container">
                    <FaSync className="spinner" />
                    <p>Cargando grupos generales...</p>
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

            {/* Header de la página */}
            <div className="page-header">
                <div className="header-title">
                    <FaUsers className="page-icon" />
                    <div>
                        <h1>Gestión de Grupos Generales</h1>
                        <p>Organiza la estructura de grupos mayores dentro de un evento.</p>
                    </div>
                </div>
                <div className="header-actions">
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar grupo general..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="form-input"
                        />
                    </div>
                    <button onClick={openCreateModal} className="btn btn-primary">
                        <FaPlus /> Nuevo Grupo General
                    </button>
                    <button onClick={loadGrupos} className="btn btn-secondary" title="Recargar">
                        <FaSync />
                    </button>
                </div>
            </div>

            {/* Contenedor de Cards */}
            <div className="card-container">
                <h2 className="section-title">Grupos Generales Activos ({filteredGrupos.length})</h2>

                {filteredGrupos.length === 0 ? (
                    <div className="empty-state-card">
                        <FaUsers size={50} style={{ opacity: 0.5 }} />
                        <p>{searchTerm ? 'No se encontraron grupos que coincidan con la búsqueda' : 'No hay grupos generales registrados.'}</p>
                        {!searchTerm && (
                            <button onClick={openCreateModal} className="btn btn-secondary">
                                <FaPlus /> Crear el primer grupo general
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="cards-grid">
                        {filteredGrupos.map((grupo) => (
                            <GrupoGeneralCard
                                key={grupo.idGrupoGeneral}
                                grupo={grupo}
                                onEdit={openEditModal}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modal para Crear/Editar Grupo General (se mantiene el estilo original) */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>
                                <FaUsers style={{ marginRight: '10px' }} />
                                {currentGrupo ? 'Editar Grupo General' : 'Crear Nuevo Grupo General'}
                            </h3>
                            <button type="button" onClick={closeModal} className="close-modal">
                                <FaTimes />
                            </button>
                        </div>
                        <form onSubmit={handleFormSubmit} className="modal-body">
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

                            <div className="modal-footer">
                                <button type="submit" className="btn btn-primary">
                                    {currentGrupo ? 'Guardar Cambios' : 'Crear Grupo'}
                                </button>
                                <button type="button" onClick={closeModal} className="btn btn-secondary">
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GruposGeneralesPage;