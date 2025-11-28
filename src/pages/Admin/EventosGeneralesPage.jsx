import React, { useState, useEffect } from 'react';
import {
    FaCalendarAlt,
    FaPlus,
    FaEdit,
    FaTrashAlt,
    FaSearch,
    FaSpinner,
    FaMapMarkerAlt,
    FaCalendar,
    FaGraduationCap,
    FaClock,
    FaSync,
    FaTimes,
    FaInfoCircle,
    FaUsers,
    FaExclamationTriangle,
    FaSave,
    FaFilter
} from 'react-icons/fa';
import { eventoGeneralService } from '../../services/eventoGeneralService';
import { crudService } from '../../services/crudService';
import { formatDate } from '../../utils/helpers';
import { periodosService } from '../../services/periodosService';

const programaService = crudService('programas');

const EventosGeneralesPage = () => {
    const [eventos, setEventos] = useState([]);
    const [programas, setProgramas] = useState([]);
    const [periodos, setPeriodos] = useState([]);
    const [filteredEventos, setFilteredEventos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEvento, setCurrentEvento] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroPrograma, setFiltroPrograma] = useState('');
    const [filtroPeriodo, setFiltroPeriodo] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        let eventosFiltrados = eventos;

        if (filtroPrograma) {
            eventosFiltrados = eventosFiltrados.filter(evento => evento.programaId === parseInt(filtroPrograma));
        }

        if (filtroPeriodo) {
            eventosFiltrados = eventosFiltrados.filter(evento => evento.periodoId === parseInt(filtroPeriodo));
        }

        if (searchTerm.trim() !== '') {
            eventosFiltrados = eventosFiltrados.filter(evento =>
                evento.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                evento.lugar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                evento.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                evento.periodoNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                evento.programaNombre?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredEventos(eventosFiltrados);
    }, [searchTerm, filtroPrograma, filtroPeriodo, eventos]);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const [eventosData, programasData, periodosData] = await Promise.all([
                eventoGeneralService.findAll(),
                programaService.findAll(),
                periodosService.getAll(),
            ]);
            setEventos(eventosData || []);
            setProgramas(programasData || []);
            setPeriodos(periodosData || []);
            setError('');
        } catch (err) {
            console.error('Error cargando datos iniciales:', err);
            setError('Error al cargar datos: ' + (err.message || 'Verifique la conexión'));
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (formData) => {
        try {
            formData.programaId = parseInt(formData.programaId, 10);
            formData.periodoId = parseInt(formData.periodoId, 10);

            if (!formData.idEventoGeneral) {
                formData.estado = 'ACTIVO';
            }
            delete formData.cicloAcademico;

            if (formData.idEventoGeneral) {
                await eventoGeneralService.update(formData.idEventoGeneral, formData);
                setSuccess('Evento actualizado exitosamente');
            } else {
                await eventoGeneralService.save(formData);
                setSuccess('Evento creado exitosamente');
            }
            setIsModalOpen(false);
            setError('');
            loadInitialData();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error completo al guardar:', err);
            setError('Error al guardar el evento: ' +
                (err.response?.data?.message || 'Verifique los datos e intente nuevamente.'));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este evento?')) {
            try {
                await eventoGeneralService.delete(id);
                setSuccess('Evento eliminado exitosamente');
                loadInitialData();
                setTimeout(() => setSuccess(''), 3000);
            } catch (err) {
                setError('Error al eliminar el evento: ' + (err.message || ''));
            }
        }
    };

    const openCreateModal = () => {
        setCurrentEvento({
            nombre: '',
            descripcion: '',
            lugar: '',
            fechaInicio: '',
            fechaFin: '',
            periodoId: '',
            programaId: '',
        });
        setIsModalOpen(true);
        setError('');
    };

    const openEditModal = (evento) => {
        setCurrentEvento({
            ...evento,
            programaId: evento.programaId ? String(evento.programaId) : '',
            periodoId: evento.periodoId ? String(evento.periodoId) : '',
        });
        setIsModalOpen(true);
        setError('');
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentEvento(null);
        setError('');
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFiltroPrograma('');
        setFiltroPeriodo('');
    };

    // --- Componente de Card para cada Evento General ---
    const EventoGeneralCard = ({ evento, onEdit, onDelete }) => {
        const [showFullDescription, setShowFullDescription] = useState(false);

        const toggleDescription = () => {
            setShowFullDescription(!showFullDescription);
        };

        const description = evento.descripcion || 'Sin descripción disponible';
        const shouldTruncate = description.length > 120;
        const displayDescription = showFullDescription ? description : description.substring(0, 120) + (shouldTruncate ? '...' : '');

        const estadoClass = evento.estado?.toLowerCase() || 'activo';

        return (
            <div className="card event-card">
                <div className="card-header event-card-header">
                    <div className="event-title-section">
                        <div className="event-icon-container">
                            <FaCalendarAlt className="event-icon" />
                        </div>
                        <div className="event-title-content">
                            <h3 className="event-title">{evento.nombre}</h3>
                            <div className="event-meta">
                                <span className={`event-status ${estadoClass}`}>{evento.estado || 'ACTIVO'}</span>
                                <span className="event-date">Creado: {formatDate(evento.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="card-actions">
                        <button
                            className="btn btn-icon btn-edit"
                            onClick={() => onEdit(evento)}
                            title="Editar evento"
                        >
                            <FaEdit />
                        </button>
                        <button
                            className="btn btn-icon btn-danger"
                            onClick={() => onDelete(evento.idEventoGeneral)}
                            title="Eliminar evento"
                        >
                            <FaTrashAlt />
                        </button>
                    </div>
                </div>

                {evento.descripcion && (
                    <div className="card-content event-description-section">
                        <div className="description-container">
                            <FaInfoCircle className="description-icon" />
                            <div className="description-text">
                                <p>{displayDescription}</p>
                                {shouldTruncate && (
                                    <button className="btn-link" onClick={toggleDescription}>
                                        {showFullDescription ? ' ver menos' : ' ver más'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="card-body-info">
                    {/* Fila 1: Lugar y Fechas */}
                    <div className="info-row">
                        <div className="info-item">
                            <div className="info-icon-container">
                                <FaMapMarkerAlt className="info-icon" />
                            </div>
                            <div className="info-text">
                                <span className="info-label">Lugar</span>
                                <strong className="info-value">{evento.lugar || 'No especificado'}</strong>
                            </div>
                        </div>
                        <div className="info-item">
                            <div className="info-icon-container">
                                <FaCalendar className="info-icon" />
                            </div>
                            <div className="info-text">
                                <span className="info-label">Fechas</span>
                                <strong className="info-value">{formatDate(evento.fechaInicio)} - {formatDate(evento.fechaFin)}</strong>
                            </div>
                        </div>
                    </div>

                    {/* Fila 2: Período y Programa */}
                    <div className="info-row">
                        <div className="info-item">
                            <div className="info-icon-container">
                                <FaClock className="info-icon" />
                            </div>
                            <div className="info-text">
                                <span className="info-label">Período</span>
                                <strong className="info-value">{evento.periodoNombre || 'N/A'}</strong>
                            </div>
                        </div>
                        <div className="info-item">
                            <div className="info-icon-container">
                                <FaGraduationCap className="info-icon" />
                            </div>
                            <div className="info-text">
                                <span className="info-label">Programa</span>
                                <strong className="info-value">{evento.programaNombre || 'N/A'}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };
    // --- Fin Componente de Card ---

    if (loading) {
        return (
            <div className="page-container">
                <div className="loading-container">
                    <FaSpinner className="spinner" />
                    <p>Cargando eventos generales...</p>
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
                    <div className="header-icon-container">
                        <FaCalendarAlt className="page-icon" />
                    </div>
                    <div className="header-text">
                        <h1>Gestión de Eventos Generales</h1>
                        <p>Administra los eventos principales de la institución.</p>
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
                        <FaPlus /> Nuevo Evento
                    </button>
                    <button onClick={loadInitialData} className="btn btn-icon" title="Recargar">
                        <FaSync />
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
                                placeholder="Buscar evento..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="form-input"
                            />
                        </div>
                        <div className="filter-group">
                            <div className="filter-item">
                                <label>Período</label>
                                <select
                                    className="form-select"
                                    value={filtroPeriodo}
                                    onChange={(e) => setFiltroPeriodo(e.target.value)}
                                >
                                    <option value="">Todos los Períodos</option>
                                    {(periodos || []).map(p => (
                                        <option key={p.idPeriodo} value={p.idPeriodo}>
                                            {p.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="filter-item">
                                <label>Programa</label>
                                <select
                                    className="form-select"
                                    value={filtroPrograma}
                                    onChange={(e) => setFiltroPrograma(e.target.value)}
                                >
                                    <option value="">Todos los Programas</option>
                                    {(programas || []).map(p => (
                                        <option key={p.idPrograma} value={p.idPrograma}>
                                            {p.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Contenedor de Cards */}
            <div className="card-container">
                <div className="section-header">
                    <h2 className="section-title">Eventos Activos</h2>
                    <span className="section-count">{filteredEventos.length}</span>
                </div>

                {filteredEventos.length === 0 ? (
                    <div className="empty-state-card">
                        <FaCalendarAlt className="empty-icon" />
                        <p>{searchTerm || filtroPrograma || filtroPeriodo ? 'No se encontraron eventos que coincidan con la búsqueda o filtros.' : 'No hay eventos generales registrados.'}</p>
                        {!(searchTerm || filtroPrograma || filtroPeriodo) && (
                            <button onClick={openCreateModal} className="btn btn-secondary">
                                <FaPlus /> Crear el primer evento
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="cards-grid">
                        {filteredEventos.map((evento) => (
                            <EventoGeneralCard
                                key={evento.idEventoGeneral}
                                evento={evento}
                                onEdit={openEditModal}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modal para Crear/Editar Evento General */}
            {isModalOpen && (
                <EventoGeneralForm
                    evento={currentEvento}
                    onClose={closeModal}
                    onSave={handleSave}
                    programas={programas}
                    periodos={periodos}
                    loading={loading}
                />
            )}
        </div>
    );
};

// Componente de formulario actualizado con scroll mejorado
const EventoGeneralForm = ({ evento, onClose, onSave, programas, periodos, loading }) => {
    const [formData, setFormData] = useState(evento);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.nombre || !formData.fechaInicio || !formData.fechaFin || !formData.periodoId || !formData.programaId) {
            setError('Todos los campos marcados con * son requeridos');
            return;
        }

        if (new Date(formData.fechaFin) < new Date(formData.fechaInicio)) {
            setError('La fecha fin no puede ser anterior a la fecha inicio');
            return;
        }

        onSave(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{evento.idEventoGeneral ? 'Editar Evento General' : 'Crear Evento General'}</h2>
                    <button type="button" onClick={onClose} className="close-modal">
                        <FaTimes />
                    </button>
                </div>

                <div className="modal-body-scrollable">
                    <form onSubmit={handleSubmit} className="modal-form">
                        {error && <div className="alert alert-danger">{error}</div>}

                        <div className="form-group">
                            <label htmlFor="nombre">Nombre del Evento *</label>
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                required
                                placeholder="Ej: Semana de Ingeniería 2024"
                                maxLength="100"
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="lugar">Lugar</label>
                            <input
                                type="text"
                                id="lugar"
                                name="lugar"
                                value={formData.lugar || ''}
                                onChange={handleChange}
                                placeholder="Ej: Auditorio Principal"
                                maxLength="200"
                                className="form-input"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="fechaInicio">Fecha Inicio *</label>
                                <input
                                    type="date"
                                    id="fechaInicio"
                                    name="fechaInicio"
                                    value={formData.fechaInicio}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="fechaFin">Fecha Fin *</label>
                                <input
                                    type="date"
                                    id="fechaFin"
                                    name="fechaFin"
                                    value={formData.fechaFin}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="periodoId">Período Académico *</label>
                            <select
                                id="periodoId"
                                name="periodoId"
                                value={formData.periodoId}
                                onChange={handleChange}
                                className="form-select"
                                required
                            >
                                <option value="">Seleccione un período</option>
                                {(periodos || []).map(p => (
                                    <option key={p.idPeriodo} value={p.idPeriodo}>
                                        {p.nombre} ({p.estado})
                                    </option>
                                ))}
                            </select>
                            <small className="form-help">Seleccione el período al que pertenece el evento.</small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="programaId">Programa de Estudio *</label>
                            {loading ? (
                                <div className="form-select-loading">
                                    <FaSpinner className="spinner" /> Cargando programas...
                                </div>
                            ) : (
                                <select
                                    id="programaId"
                                    name="programaId"
                                    value={formData.programaId}
                                    onChange={handleChange}
                                    className="form-select"
                                    required
                                >
                                    <option value="">Seleccione un programa</option>
                                    {(programas || []).map(p => (
                                        <option key={p.idPrograma} value={p.idPrograma}>
                                            {p.nombre}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="descripcion">Descripción</label>
                            <textarea
                                id="descripcion"
                                name="descripcion"
                                value={formData.descripcion || ''}
                                onChange={handleChange}
                                placeholder="Descripción opcional del evento..."
                                rows="3"
                                maxLength="500"
                                className="form-textarea"
                            />
                            <small className="form-help">Máximo 500 caracteres</small>
                        </div>
                    </form>
                </div>

                <div className="modal-footer">
                    <button type="submit" onClick={handleSubmit} className="btn btn-primary">
                        {evento.idEventoGeneral ? 'Guardar Cambios' : 'Crear Evento'}
                    </button>
                    <button type="button" onClick={onClose} className="btn btn-secondary">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventosGeneralesPage;