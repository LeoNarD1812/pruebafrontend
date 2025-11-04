import React, { useState, useEffect } from 'react';
import { FaCalendarDay, FaPlus, FaEdit, FaTrashAlt, FaSearch, FaTimes, FaSync, FaList, FaCalendarAlt } from 'react-icons/fa';
import { crudService } from '../../services/crudService';
import { formatDate } from '../../utils/helpers';
import api from '../../api/axiosConfig';
import { eventoEspecificoService } from '../../services/eventoEspecificoService'; // Asegúrate de usar el servicio correcto para crearRecurrencia

// Inicializa los servicios
// const eventoEspecificoService = crudService('eventos-especificos'); // Usaremos el que tiene los métodos de recurrencia
const eventoGeneralService = crudService('eventos-generales');

// Función formatTime si no existe en helpers
const formatTime = (timeString) => {
    if (!timeString) return '';
    // Si el tiempo ya está en formato HH:MM, devuélvelo tal cual
    if (typeof timeString === 'string' && timeString.includes(':')) {
        return timeString.length === 5 ? timeString : timeString.substring(0, 5);
    }
    return timeString;
};

const SesionesPage = () => {
    const [sesiones, setSesiones] = useState([]);
    const [filteredSesiones, setFilteredSesiones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSesion, setCurrentSesion] = useState(null);
    const [eventosGenerales, setEventosGenerales] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('calendar'); // 'calendar' o 'list'
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Estado del formulario (Añadiendo lugar y descripcion, y valor por defecto de tolerancia)
    const [isRecurrence, setIsRecurrence] = useState(true);
    const [formData, setFormData] = useState({
        idEventoGeneral: '',
        nombreSesion: '',
        fecha: '',
        horaInicio: '',
        horaFin: '',
        toleranciaMinutos: 15, // Valor por defecto
        fechaInicioRecurrencia: '',
        fechaFinRecurrencia: '',
        diasSemana: [1, 3, 5],
        lugar: '', // Nuevo
        descripcion: '', // Nuevo
    });

    const daysOfWeek = [
        { name: 'Lun', value: 1 },
        { name: 'Mar', value: 2 },
        { name: 'Mié', value: 3 },
        { name: 'Jue', value: 4 },
        { name: 'Vie', value: 5 },
        { name: 'Sáb', value: 6 },
        { name: 'Dom', value: 7 }, // Corregido: 7 para Domingo (1=Mon a 7=Sun en Java DayOfWeek)
    ];

    useEffect(() => {
        loadSesiones();
        loadEventosGenerales();
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredSesiones(sesiones);
        } else {
            const filtered = sesiones.filter(sesion =>
                sesion.nombreSesion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (sesion.eventoGeneralNombre?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                formatDate(sesion.fecha)?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredSesiones(filtered);
        }
    }, [searchTerm, sesiones]);

    // Cargar automáticamente las fechas cuando se selecciona un evento general
    useEffect(() => {
        if (formData.idEventoGeneral && eventosGenerales.length > 0) {
            const eventoGeneral = eventosGenerales.find(eg =>
                eg.idEventoGeneral === parseInt(formData.idEventoGeneral, 10)
            );

            if (eventoGeneral) {
                setFormData(prev => ({
                    ...prev,
                    fechaInicioRecurrencia: eventoGeneral.fechaInicio || '',
                    fechaFinRecurrencia: eventoGeneral.fechaFin || '',
                    // El lugar y descripción se hereda del evento general si no se especifica, pero lo precargamos si existe.
                    lugar: prev.lugar || eventoGeneral.lugar || '',
                    descripcion: prev.descripcion || eventoGeneral.descripcion || ''
                }));
            }
        }
    }, [formData.idEventoGeneral, eventosGenerales]);

    const loadSesiones = async () => {
        try {
            setLoading(true);
            const data = await crudService('eventos-especificos').findAll(); // Uso crudService para findAll
            console.log('Sesiones cargadas:', data);
            setSesiones(data);
            setFilteredSesiones(data);
            setError(null);
        } catch (err) {
            console.error("Error loading sesiones:", err);
            setError("Error al cargar sesiones: " + (err.message || 'Verifique la conexión'));
        } finally {
            setLoading(false);
        }
    };

    const loadEventosGenerales = async () => {
        try {
            const data = await eventoGeneralService.findAll();
            setEventosGenerales(data);
        } catch (error) {
            console.error("Error loading general events:", error);
            setError("Error al cargar eventos generales");
        }
    };

    const handleSave = async (sesionData) => {
        try {
            let payload;

            if (currentSesion) {
                // Lógica de Edición
                payload = {
                    nombreSesion: sesionData.nombreSesion,
                    fecha: sesionData.fecha,
                    horaInicio: sesionData.horaInicio,
                    horaFin: sesionData.horaFin,
                    lugar: sesionData.lugar || null,
                    descripcion: sesionData.descripcion || null,
                    toleranciaMinutos: sesionData.toleranciaMinutos ? parseInt(sesionData.toleranciaMinutos, 10) : 15,
                    estado: sesionData.estado || 'PROGRAMADO',
                };
                await crudService('eventos-especificos').update(currentSesion.idEventoEspecifico, payload);
            } else {
                // Lógica de Creación (Única o Recurrente)
                if (isRecurrence) {
                    payload = {
                        idEventoGeneral: parseInt(sesionData.idEventoGeneral, 10),
                        nombreSesion: sesionData.nombreSesion,
                        fechaInicioRecurrencia: sesionData.fechaInicioRecurrencia,
                        fechaFinRecurrencia: sesionData.fechaFinRecurrencia,
                        horaInicio: sesionData.horaInicio,
                        horaFin: sesionData.horaFin,
                        toleranciaMinutos: sesionData.toleranciaMinutos ? parseInt(sesionData.toleranciaMinutos, 10) : 15,
                        diasSemana: sesionData.diasSemana.map(d => parseInt(d, 10)),
                        lugar: sesionData.lugar || undefined, // undefined para que el backend herede si es nulo/vacío
                        descripcion: sesionData.descripcion || undefined,
                    };
                    await eventoEspecificoService.crearRecurrencia(payload);
                } else {
                    payload = {
                        eventoGeneralId: parseInt(sesionData.idEventoGeneral, 10),
                        nombreSesion: sesionData.nombreSesion,
                        fecha: sesionData.fecha,
                        horaInicio: sesionData.horaInicio,
                        horaFin: sesionData.horaFin,
                        toleranciaMinutos: sesionData.toleranciaMinutos ? parseInt(sesionData.toleranciaMinutos, 10) : 15,
                        lugar: sesionData.lugar || undefined,
                        descripcion: sesionData.descripcion || undefined,
                    };
                    await eventoEspecificoService.crearEvento(payload);
                }
            }

            await loadSesiones();
            closeModal();
            setError(null);
        } catch (error) {
            console.error("❌ Error saving sesion:", error);
            let errorMessage = "Error al guardar la sesión: ";

            if (error.response) {
                errorMessage += `Error ${error.response.status}: `;
                if (error.response.data && error.response.data.message) {
                    errorMessage += error.response.data.message;
                } else if (error.response.data) {
                    errorMessage += JSON.stringify(error.response.data);
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
        if (window.confirm('¿Está seguro de eliminar esta sesión? Esta acción es irreversible.')) {
            try {
                await crudService('eventos-especificos').delete(id);
                await loadSesiones();
                setError(null);
            } catch (error) {
                console.error("Error deleting sesion:", error);
                setError("Error al eliminar la sesión: " + error.message);
            }
        }
    };

    const openCreateModal = () => {
        setCurrentSesion(null);
        setIsRecurrence(true);
        setFormData({
            idEventoGeneral: '',
            nombreSesion: '',
            fecha: '',
            horaInicio: '',
            horaFin: '',
            toleranciaMinutos: 15,
            fechaInicioRecurrencia: '',
            fechaFinRecurrencia: '',
            diasSemana: [1, 3, 5],
            lugar: '',
            descripcion: '',
        });
        setIsModalOpen(true);
    };

    const openEditModal = (sesion) => {
        setCurrentSesion(sesion);
        setIsRecurrence(false);
        setFormData({
            idEventoGeneral: sesion.eventoGeneralId || '',
            nombreSesion: sesion.nombreSesion || '',
            fecha: sesion.fecha ? new Date(sesion.fecha).toISOString().split('T')[0] : '',
            horaInicio: sesion.horaInicio || '',
            horaFin: sesion.horaFin || '',
            toleranciaMinutos: sesion.toleranciaMinutos || 15,
            lugar: sesion.lugar || '',
            descripcion: sesion.descripcion || '',
            fechaInicioRecurrencia: '',
            fechaFinRecurrencia: '',
            diasSemana: [],
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setCurrentSesion(null);
        setIsModalOpen(false);
        setError(null);
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox' && name === 'diasSemana') {
            const dayValue = parseInt(value, 10);
            setFormData(prev => ({
                ...prev,
                diasSemana: checked
                    ? [...prev.diasSemana, dayValue]
                    : prev.diasSemana.filter(d => d !== dayValue)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleRecurrenceChange = (e) => {
        setIsRecurrence(e.target.checked);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();

        // Validaciones mínimas
        if (!formData.idEventoGeneral || !formData.nombreSesion || !formData.horaInicio || !formData.horaFin) {
            setError('Faltan campos obligatorios (*)');
            return;
        }

        if (!currentSesion && !isRecurrence && !formData.fecha) {
            setError('La fecha es obligatoria para una sesión única');
            return;
        }

        if (!currentSesion && isRecurrence && formData.diasSemana.length === 0) {
            setError('Debe seleccionar al menos un día de la semana para la recurrencia');
            return;
        }

        handleSave(formData);
    };

    const getEventoGeneralNombre = (idEventoGeneral) => {
        const evento = eventosGenerales.find(eg =>
            eg.idEventoGeneral === idEventoGeneral
        );
        return evento ? evento.nombre : 'N/A';
    };

    const getStatusBadge = (estado) => {
        const status = estado?.toUpperCase() || 'PROGRAMADO';
        const statusConfig = {
            'PROGRAMADO': { class: 'status-scheduled', label: 'Programado' },
            'EN_CURSO': { class: 'status-in-progress', label: 'En Curso' },
            'FINALIZADO': { class: 'status-finished', label: 'Finalizado' },
            'CANCELADO': { class: 'status-cancelled', label: 'Cancelado' }
        };

        const config = statusConfig[status] || statusConfig.PROGRAMADO;
        return <span className={`badge ${config.class}`}>{config.label}</span>;
    };

    // Funciones para el calendario - CORREGIDO DÍAS
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const days = [];
        const startingDay = firstDay.getDay(); // 0=Dom, 1=Lun

        // Ajuste para que la semana empiece en lunes (0=Dom, 1=Lun...)
        const adjustedStart = startingDay === 0 ? 6 : startingDay - 1; // 0 para lunes, 6 para domingo

        // Días del mes anterior
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = adjustedStart - 1; i >= 0; i--) {
            days.push({
                date: new Date(year, month - 1, prevMonthLastDay - i),
                isCurrentMonth: false,
                sessions: []
            });
        }

        // Días del mes actual
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const currentDate = new Date(year, month, i);
            const dateString = currentDate.toISOString().split('T')[0];
            const daySessions = filteredSesiones.filter(sesion => {
                if (!sesion.fecha) return false;
                const sesionDateString = sesion.fecha.split('T')[0];
                return sesionDateString === dateString;
            });

            days.push({
                date: currentDate,
                isCurrentMonth: true,
                sessions: daySessions
            });
        }

        // Días del siguiente mes para completar 6 semanas (42 días)
        const totalCells = 42;
        const remainingDays = totalCells - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            days.push({
                date: new Date(year, month + 1, i),
                isCurrentMonth: false,
                sessions: []
            });
        }

        return days;
    };

    const navigateMonth = (direction) => {
        setCurrentMonth(prev => {
            const newMonth = new Date(prev);
            newMonth.setMonth(prev.getMonth() + direction);
            return newMonth;
        });
    };

    const goToToday = () => {
        setCurrentMonth(new Date());
    };

    const renderCalendar = () => {
        const days = getDaysInMonth(currentMonth);
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

        return (
            <div className="calendar-container">
                <div className="calendar-header">
                    <div className="calendar-navigation">
                        <button onClick={() => navigateMonth(-1)} className="btn btn-secondary">
                            ‹
                        </button>
                        <h3>
                            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </h3>
                        <button onClick={() => navigateMonth(1)} className="btn btn-secondary">
                            ›
                        </button>
                        <button onClick={goToToday} className="btn btn-secondary today-btn">
                            Hoy
                        </button>
                    </div>
                </div>

                <div className="calendar-grid">
                    {/* Encabezados de días */}
                    {dayNames.map(day => (
                        <div key={day} className="calendar-day-header">
                            {day}
                        </div>
                    ))}

                    {/* Días del calendario */}
                    {days.map((day, index) => {
                        const isToday = day.date.toDateString() === new Date().toDateString();
                        return (
                            <div
                                key={index}
                                className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${
                                    isToday ? 'today' : ''
                                }`}
                            >
                                <div className="calendar-date">
                                    {day.date.getDate()}
                                </div>
                                <div className="calendar-sessions">
                                    {day.sessions.slice(0, 3).map((sesion, idx) => (
                                        <div
                                            key={`${sesion.idEventoEspecifico}-${idx}`}
                                            className="calendar-session-item"
                                            onClick={() => openEditModal(sesion)}
                                        >
                                            <div className="session-time">
                                                {formatTime(sesion.horaInicio)}
                                            </div>
                                            <div className="session-title">
                                                {sesion.nombreSesion}
                                            </div>
                                        </div>
                                    ))}
                                    {day.sessions.length > 3 && (
                                        <div className="calendar-more-sessions">
                                            +{day.sessions.length - 3} más
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderListView = () => {
        return (
            <div className="table-responsive">
                <table className="data-table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre Sesión</th>
                        <th>Evento General</th>
                        <th>Fecha</th>
                        <th>Horario</th>
                        <th>Lugar</th>
                        <th>Tolerancia</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredSesiones.length === 0 ? (
                        <tr>
                            <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>
                                {searchTerm ? 'No se encontraron sesiones que coincidan con la búsqueda.' : 'No hay sesiones registradas.'}
                            </td>
                        </tr>
                    ) : (
                        filteredSesiones.map((sesion) => (
                            <tr key={sesion.idEventoEspecifico}>
                                <td>{sesion.idEventoEspecifico}</td>
                                <td>
                                    <div><strong>{sesion.nombreSesion}</strong></div>
                                    {sesion.descripcion && <small>{sesion.descripcion}</small>}
                                </td>
                                <td>{getEventoGeneralNombre(sesion.eventoGeneralId)}</td>
                                <td>{formatDate(sesion.fecha)}</td>
                                <td>{formatTime(sesion.horaInicio)} - {formatTime(sesion.horaFin)}</td>
                                <td>{sesion.lugar || 'No especificado'}</td>
                                <td>{sesion.toleranciaMinutos || '15'} min</td>
                                <td>{getStatusBadge(sesion.estado)}</td>
                                <td>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => openEditModal(sesion)}
                                        title="Editar sesión"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => handleDelete(sesion.idEventoEspecifico)}
                                        title="Eliminar sesión"
                                    >
                                        <FaTrashAlt />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderFormContent = () => {
        return (
            <form onSubmit={handleFormSubmit}>
                <div className="modal-header">
                    <h2>
                        {currentSesion
                            ? 'Editar Sesión'
                            : (isRecurrence ? 'Crear Sesiones Recurrentes' : 'Crear Sesión Única')
                        }
                    </h2>
                    <button type="button" onClick={closeModal} className="close-modal">
                        <FaTimes />
                    </button>
                </div>

                <div className="modal-body">
                    {error && <div className="alert alert-danger">{error}</div>}

                    <div className="form-group">
                        <label htmlFor="idEventoGeneral">Evento General *</label>
                        <select
                            id="idEventoGeneral"
                            name="idEventoGeneral"
                            value={formData.idEventoGeneral}
                            onChange={handleFormChange}
                            required
                            disabled={!!currentSesion}
                            className="form-select"
                        >
                            <option value="">Seleccione un evento</option>
                            {eventosGenerales.map(evento => (
                                <option key={evento.idEventoGeneral} value={evento.idEventoGeneral}>
                                    {evento.nombre} ({formatDate(evento.fechaInicio)} - {formatDate(evento.fechaFin)})
                                    {evento.periodoNombre && ` - Período: ${evento.periodoNombre}`}
                                </option>
                            ))}
                        </select>
                        <small className="form-help">Seleccionar el evento principal.</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="nombreSesion">Nombre de la Sesión *</label>
                        <input
                            type="text"
                            id="nombreSesion"
                            name="nombreSesion"
                            value={formData.nombreSesion}
                            onChange={handleFormChange}
                            required
                            placeholder="Ej: Clase de Matemáticas, Laboratorio de Física..."
                            className="form-input"
                        />
                    </div>

                    {!currentSesion && (
                        <div className="form-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={isRecurrence}
                                    onChange={handleRecurrenceChange}
                                />
                                {' '}Crear sesiones recurrentes
                            </label>
                        </div>
                    )}

                    {isRecurrence && !currentSesion ? (
                        <>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="fechaInicioRecurrencia">Fecha Inicio Recurrencia *</label>
                                    <input
                                        type="date"
                                        id="fechaInicioRecurrencia"
                                        name="fechaInicioRecurrencia"
                                        value={formData.fechaInicioRecurrencia}
                                        onChange={handleFormChange}
                                        required
                                        disabled
                                        className="form-input"
                                    />
                                    <small className="form-help">Se obtiene automáticamente del evento general seleccionado</small>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="fechaFinRecurrencia">Fecha Fin Recurrencia *</label>
                                    <input
                                        type="date"
                                        id="fechaFinRecurrencia"
                                        name="fechaFinRecurrencia"
                                        value={formData.fechaFinRecurrencia}
                                        onChange={handleFormChange}
                                        required
                                        disabled
                                        className="form-input"
                                    />
                                    <small className="form-help">Se obtiene automáticamente del evento general seleccionado</small>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Días de la Semana *</label>
                                <div className="days-grid">
                                    {daysOfWeek.map(day => (
                                        <label key={day.value} className="day-checkbox">
                                            <input
                                                type="checkbox"
                                                name="diasSemana"
                                                value={day.value}
                                                checked={formData.diasSemana.includes(day.value)}
                                                onChange={handleFormChange}
                                            />
                                            {day.name}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="form-group">
                            <label htmlFor="fecha">Fecha *</label>
                            <input
                                type="date"
                                id="fecha"
                                name="fecha"
                                value={formData.fecha}
                                onChange={handleFormChange}
                                required
                                className="form-input"
                            />
                        </div>
                    )}

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="horaInicio">Hora Inicio *</label>
                            <input
                                type="time"
                                id="horaInicio"
                                name="horaInicio"
                                value={formData.horaInicio}
                                onChange={handleFormChange}
                                required
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="horaFin">Hora Fin *</label>
                            <input
                                type="time"
                                id="horaFin"
                                name="horaFin"
                                value={formData.horaFin}
                                onChange={handleFormChange}
                                required
                                className="form-input"
                            />
                        </div>
                    </div>

                    {/* Nuevos campos opcionales: Lugar y Descripción */}
                    <div className="form-group">
                        <label htmlFor="lugar">Lugar</label>
                        <input
                            type="text"
                            id="lugar"
                            name="lugar"
                            value={formData.lugar || ''}
                            onChange={handleFormChange}
                            placeholder="Ej: Aula A101 (Se hereda del Evento General si se deja vacío en Recurrencia)"
                            maxLength="200"
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="descripcion">Descripción</label>
                        <textarea
                            id="descripcion"
                            name="descripcion"
                            value={formData.descripcion || ''}
                            onChange={handleFormChange}
                            placeholder="Descripción opcional de la sesión (Se hereda del Evento General si se deja vacío en Recurrencia)..."
                            rows="2"
                            maxLength="500"
                            className="form-textarea"
                        />
                    </div>
                    {/* Fin Nuevos campos opcionales */}

                    <div className="form-group">
                        <label htmlFor="toleranciaMinutos">Tolerancia (minutos)</label>
                        <input
                            type="number"
                            id="toleranciaMinutos"
                            name="toleranciaMinutos"
                            value={formData.toleranciaMinutos}
                            onChange={handleFormChange}
                            min="0"
                            max="60"
                            placeholder="15 (valor por defecto)"
                            className="form-input"
                        />
                        <small className="form-help">Si se deja vacío, se usará 15 minutos por defecto</small>
                    </div>
                </div>

                <div className="modal-footer">
                    <button type="submit" className="btn btn-primary">
                        {currentSesion
                            ? 'Guardar Cambios'
                            : (isRecurrence ? 'Crear Sesiones' : 'Crear Sesión')
                        }
                    </button>
                    <button type="button" onClick={closeModal} className="btn btn-secondary">
                        Cancelar
                    </button>
                </div>
            </form>
        );
    };

    if (loading) {
        return (
            <div className="page-container">
                <FaCalendarDay className="spinner" /> Cargando sesiones...
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="header-title">
                    <FaCalendarDay className="page-icon" />
                    <div>
                        <h1>Sesiones (Eventos Específicos)</h1>
                        <p>Gestión de las sesiones individuales dentro de los eventos generales.</p>
                    </div>
                </div>
                <div className="header-actions">
                    <div className="view-toggle">
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`btn-toggle ${viewMode === 'calendar' ? 'active' : ''}`}
                            title="Vista calendario"
                        >
                            <FaCalendarAlt />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`btn-toggle ${viewMode === 'list' ? 'active' : ''}`}
                            title="Vista lista"
                        >
                            <FaList />
                        </button>
                    </div>
                    <button onClick={openCreateModal} className="btn btn-primary">
                        <FaPlus /> Crear Sesión
                    </button>
                    <button onClick={loadSesiones} className="btn btn-secondary" title="Recargar">
                        <FaSync />
                    </button>
                </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="card">
                <div className="card-header">
                    <h2>
                        {viewMode === 'calendar'
                            ? `Calendario de Sesiones (${filteredSesiones.length})`
                            : `Lista de Sesiones (${filteredSesiones.length})`
                        }
                    </h2>
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar sesión..."
                            className="form-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {viewMode === 'calendar' ? renderCalendar() : renderListView()}
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

export default SesionesPage;