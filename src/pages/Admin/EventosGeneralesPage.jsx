import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaPlus, FaEdit, FaTrashAlt, FaSearch, FaSpinner, FaMapMarkerAlt, FaCalendar, FaGraduationCap, FaClock, FaSync, FaTimes, FaInfoCircle, FaUsers } from 'react-icons/fa';
import { eventoGeneralService } from '../../services/eventoGeneralService';
import { crudService } from '../../services/crudService';
import { formatDate } from '../../utils/helpers';
import { periodosService } from '../../services/periodosService'; // Importar periodosService

const programaService = crudService('programas');

const EventosGeneralesPage = () => {
    const [eventos, setEventos] = useState([]);
    const [programas, setProgramas] = useState([]);
    const [periodos, setPeriodos] = useState([]); // Nuevo estado para períodos
    const [filteredEventos, setFilteredEventos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEvento, setCurrentEvento] = useState(null);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroPrograma, setFiltroPrograma] = useState('');
    const [filtroPeriodo, setFiltroPeriodo] = useState(''); // Nuevo estado para el filtro de período

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
                // Reemplazar cicloAcademico con periodoNombre en la búsqueda
                evento.periodoNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                evento.programaNombre?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredEventos(eventosFiltrados);
    }, [searchTerm, filtroPrograma, filtroPeriodo, eventos]); // Incluir filtroPeriodo

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const [eventosData, programasData, periodosData] = await Promise.all([ // Cargar períodos
                eventoGeneralService.findAll(),
                programaService.findAll(),
                periodosService.getAll(),
            ]);
            setEventos(eventosData || []);
            setProgramas(programasData || []);
            setPeriodos(periodosData.data || []); // Asumiendo que periodosService.getAll() retorna { data: [...] }
            setError(null);
        } catch (err) {
            console.error('Error cargando datos iniciales:', err);
            setError('Error al cargar datos: ' + (err.message || 'Verifique la conexión'));
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (formData) => {
        try {
            // Convertir IDs a números
            formData.programaId = parseInt(formData.programaId, 10);
            formData.periodoId = parseInt(formData.periodoId, 10); // Nuevo

            if (!formData.idEventoGeneral) {
                formData.estado = 'ACTIVO';
            }
            // Eliminar cicloAcademico si existe, ya que fue reemplazado por periodoId
            delete formData.cicloAcademico;

            if (formData.idEventoGeneral) {
                await eventoGeneralService.update(formData.idEventoGeneral, formData);
            } else {
                await eventoGeneralService.save(formData);
            }
            setIsModalOpen(false);
            setError(null);
            loadInitialData();
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
                loadInitialData();
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
            periodoId: '', // Reemplaza cicloAcademico
            programaId: '',
        });
        setIsModalOpen(true);
    };

    const openEditModal = (evento) => {
        setCurrentEvento({
            ...evento,
            programaId: evento.programaId ? String(evento.programaId) : '',
            periodoId: evento.periodoId ? String(evento.periodoId) : '', // Nuevo
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentEvento(null);
    };

    const renderCards = () => {
        if (filteredEventos.length === 0) {
            return (
                <div className="empty-state">
                    <FaCalendarAlt className="empty-icon" />
                    <h3>No hay eventos generales</h3>
                    <p>
                        {searchTerm || filtroPrograma || filtroPeriodo
                            ? 'No se encontraron eventos que coincidan con tu búsqueda o filtros.'
                            : 'Comienza creando tu primer evento general.'
                        }
                    </p>
                    {!(searchTerm || filtroPrograma || filtroPeriodo) && (
                        <button onClick={openCreateModal} className="btn btn-primary">
                            <FaPlus /> Crear Primer Evento
                        </button>
                    )}
                </div>
            );
        }

        return (
            <div className="cards-grid">
                {filteredEventos.map((evento) => (
                    <div key={evento.idEventoGeneral} className="card">
                        <div className="card-header">
                            <div className="card-title">
                                <FaCalendarAlt className="card-icon" />
                                <h3>{evento.nombre}</h3>
                            </div>
                            <div className="card-actions">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => openEditModal(evento)}
                                    title="Editar evento"
                                >
                                    <FaEdit />
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => handleDelete(evento.idEventoGeneral)}
                                    title="Eliminar evento"
                                >
                                    <FaTrashAlt />
                                </button>
                            </div>
                        </div>

                        <div className="card-content">
                            {evento.descripcion && (
                                <div className="card-description">
                                    <FaInfoCircle className="description-icon" />
                                    <p>{evento.descripcion}</p>
                                </div>
                            )}

                            <div className="card-details">
                                <div className="detail-item">
                                    <FaMapMarkerAlt className="detail-icon" />
                                    <div className="detail-info">
                                        <span className="detail-label">Lugar:</span>
                                        <span className="detail-value">{evento.lugar || 'No especificado'}</span>
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <FaCalendar className="detail-icon" />
                                    <div className="detail-info">
                                        <span className="detail-label">Fechas:</span>
                                        <span className="detail-value">
                                            {formatDate(evento.fechaInicio)} - {formatDate(evento.fechaFin)}
                                        </span>
                                    </div>
                                </div>

                                {/* Reemplazar cicloAcademico por Periodo */}
                                <div className="detail-item">
                                    <FaClock className="detail-icon" />
                                    <div className="detail-info">
                                        <span className="detail-label">Período:</span>
                                        <span className="detail-value">{evento.periodoNombre || 'No asignado'}</span>
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <FaGraduationCap className="detail-icon" />
                                    <div className="detail-info">
                                        <span className="detail-label">Programa:</span>
                                        <span className="detail-value">{evento.programaNombre || 'No asignado'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card-stats">
                            <div className="stat-item">
                                <div className="stat-icon date">
                                    <FaCalendar />
                                </div>
                                <div className="stat-info">
                                    <span className="stat-value">{formatDate(evento.createdAt)}</span>
                                    <span className="stat-label">Creado</span>
                                </div>
                            </div>
                            <div className="stat-item">
                                <div className={`stat-icon status ${evento.estado?.toLowerCase() || 'activo'}`}>
                                    <FaClock />
                                </div>
                                <div className="stat-info">
                                    <span className="stat-value">{evento.estado || 'ACTIVO'}</span>
                                    <span className="stat-label">Estado</span>
                                </div>
                            </div>
                        </div>

                    </div>
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="page-container">
                <FaCalendarAlt className="spinner" /> Cargando eventos...
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="header-title">
                    <FaCalendarAlt className="page-icon" />
                    <div>
                        <h1>Eventos Generales</h1>
                        <p>Gestión de eventos principales y sus detalles.</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button onClick={openCreateModal} className="btn btn-primary">
                        <FaPlus /> Crear Nuevo Evento
                    </button>
                    <button onClick={loadInitialData} className="btn btn-secondary" title="Recargar">
                        <FaSync />
                    </button>
                </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="card">
                <div className="card-header">
                    <h2>Eventos Generales ({filteredEventos.length})</h2>
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar evento..."
                            className="form-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Nuevo Filtro por Período */}
                    <div className="form-group" style={{ marginRight: '10px' }}>
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

                    <div className="form-group">
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

                {renderCards()}
            </div>

            {isModalOpen && (
                <EventoGeneralForm
                    evento={currentEvento}
                    onClose={closeModal}
                    onSave={handleSave}
                    programas={programas}
                    periodos={periodos} // Pasar períodos al formulario
                />
            )}
        </div>
    );
};

// Se actualiza el componente de formulario
const EventoGeneralForm = ({ evento, onClose, onSave, programas, periodos }) => {
    const [formData, setFormData] = useState(evento);
    const [loadingProgramas, setLoadingProgramas] = useState(false); // Mantener para el spinner si se necesitara
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validaciones: Se cambia cicloAcademico por periodoId
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

                <form onSubmit={handleSubmit} className="modal-body">
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

                    {/* NUEVO CAMPO: Periodo */}
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
                        {loadingProgramas ? (
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