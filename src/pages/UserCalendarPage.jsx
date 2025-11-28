import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { eventoEspecificoService } from '../services/eventoEspecificoService';
import { crudService } from '../services/crudService';
import { FaCalendarAlt, FaSync, FaList, FaCalendarDay } from 'react-icons/fa';

// Configurar moment para español
import 'moment/locale/es';
moment.locale('es');

const localizer = momentLocalizer(moment);

// Inicializa el servicio de eventos generales
const eventoGeneralService = crudService('eventos-generales');

// Función para generar colores únicos por evento general
const generateEventColors = (eventosGenerales) => {
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
        '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
        '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2',
        '#F9E79F', '#ABEBC6', '#AED6F1', '#FAD7A0', '#E8DAEF'
    ];

    const eventColors = {};
    eventosGenerales.forEach((evento, index) => {
        eventColors[evento.idEventoGeneral] = colors[index % colors.length];
    });
    return eventColors;
};

// Función para obtener el estilo del evento basado en el evento general
const getEventStyle = (event, eventColors) => {
    const backgroundColor = eventColors[event.resource?.eventoGeneralId] || '#667eea';

    return {
        style: {
            backgroundColor: backgroundColor,
            borderRadius: '6px',
            border: 'none',
            color: 'white',
            fontSize: '12px',
            fontWeight: '600',
            padding: '2px 6px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
        }
    };
};

const UserCalendarPage = () => {
    const [events, setEvents] = useState([]);
    const [eventosGenerales, setEventosGenerales] = useState([]);
    const [eventColors, setEventColors] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('month');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                await Promise.all([
                    loadEvents(),
                    loadEventosGenerales()
                ]);
            } catch (err) {
                setError('Error al cargar los datos del calendario.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Actualizar colores cuando se carguen eventos generales
    useEffect(() => {
        if (eventosGenerales.length > 0) {
            setEventColors(generateEventColors(eventosGenerales));
        }
    }, [eventosGenerales]);

    const loadEvents = async () => {
        try {
            // Cambiar a la nueva función del servicio
            const data = await eventoEspecificoService.findMySesiones();
            const formattedEvents = data.map(evento => ({
                id: evento.idEventoEspecifico,
                title: evento.nombreSesion,
                start: new Date(evento.fecha + 'T' + evento.horaInicio),
                end: new Date(evento.fecha + 'T' + evento.horaFin),
                resource: evento, // Guardar el objeto completo para detalles
            }));
            setEvents(formattedEvents);
        } catch (err) {
            throw err;
        }
    };

    const loadEventosGenerales = async () => {
        try {
            const data = await eventoGeneralService.findAll();
            setEventosGenerales(data);
        } catch (error) {
            console.error("Error loading general events:", error);
            throw error;
        }
    };

    const handleSelectEvent = (event) => {
        setSelectedEvent(event);
        setIsModalOpen(true);
    };

    const handleRefresh = async () => {
        try {
            setLoading(true);
            await loadEvents();
            setError(null);
        } catch (err) {
            setError('Error al actualizar el calendario.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setSelectedEvent(null);
        setIsModalOpen(false);
    };

    const getEventoGeneralNombre = (idEventoGeneral) => {
        const evento = eventosGenerales.find(eg =>
            eg.idEventoGeneral === idEventoGeneral
        );
        return evento ? evento.nombre : 'N/A';
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        if (typeof timeString === 'string' && timeString.includes(':')) {
            return timeString.length === 5 ? timeString : timeString.substring(0, 5);
        }
        return timeString;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return moment(dateString).format('DD/MM/YYYY');
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

    const renderEventDetails = () => {
        if (!selectedEvent) return null;

        const evento = selectedEvent.resource;
        const eventColor = eventColors[evento.eventoGeneralId] || '#667eea';

        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <div className="modal-header">
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span
                                style={{
                                    width: '12px',
                                    height: '12px',
                                    backgroundColor: eventColor,
                                    borderRadius: '50%',
                                    display: 'inline-block'
                                }}
                            ></span>
                            Detalles de la Sesión
                        </h2>
                        <button onClick={closeModal} className="close-modal">
                            ×
                        </button>
                    </div>

                    <div className="modal-body-scrollable">
                        <div className="modal-form">
                            <div className="info-item">
                                <div className="info-text">
                                    <span className="info-label">NOMBRE DE LA SESIÓN</span>
                                    <span className="info-value">{evento.nombreSesion}</span>
                                </div>
                            </div>

                            <div className="info-item">
                                <div className="info-text">
                                    <span className="info-label">EVENTO GENERAL</span>
                                    <span className="info-value">
                                        {getEventoGeneralNombre(evento.eventoGeneralId)}
                                    </span>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="info-item">
                                    <div className="info-text">
                                        <span className="info-label">FECHA</span>
                                        <span className="info-value">{formatDate(evento.fecha)}</span>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <div className="info-text">
                                        <span className="info-label">HORARIO</span>
                                        <span className="info-value">
                                            {formatTime(evento.horaInicio)} - {formatTime(evento.horaFin)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {evento.lugar && (
                                <div className="info-item">
                                    <div className="info-text">
                                        <span className="info-label">LUGAR</span>
                                        <span className="info-value">{evento.lugar}</span>
                                    </div>
                                </div>
                            )}

                            {evento.descripcion && (
                                <div className="info-item">
                                    <div className="info-text">
                                        <span className="info-label">DESCRIPCIÓN</span>
                                        <span className="info-value" style={{ fontWeight: 'normal' }}>
                                            {evento.descripcion}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="form-row">
                                <div className="info-item">
                                    <div className="info-text">
                                        <span className="info-label">TOLERANCIA</span>
                                        <span className="info-value">{evento.toleranciaMinutos || 15} minutos</span>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <div className="info-text">
                                        <span className="info-label">ESTADO</span>
                                        <span className="info-value">
                                            {getStatusBadge(evento.estado)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button onClick={closeModal} className="btn btn-primary">
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderLegend = () => {
        if (eventosGenerales.length === 0) return null;

        return (
            <div className="calendar-legend">
                <h4>Leyenda de Eventos:</h4>
                <div className="legend-items">
                    {eventosGenerales.slice(0, 6).map(evento => (
                        <div key={evento.idEventoGeneral} className="legend-item">
                            <span
                                className="legend-color"
                                style={{ backgroundColor: eventColors[evento.idEventoGeneral] }}
                            ></span>
                            <span className="legend-label">{evento.nombre}</span>
                        </div>
                    ))}
                    {eventosGenerales.length > 6 && (
                        <div className="legend-item">
                            <span className="legend-more">+{eventosGenerales.length - 6} más</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const messages = {
        next: "Siguiente",
        previous: "Anterior",
        today: "Hoy",
        month: "Mes",
        week: "Semana",
        day: "Día",
        agenda: "Agenda",
        date: "Fecha",
        time: "Hora",
        event: "Evento",
        noEventsInRange: "No hay eventos programados para este período.",
        showMore: total => `+ Ver más (${total})`
    };

    if (loading) {
        return (
            <div className="page-container">
                <div className="loading-container">
                    <FaCalendarDay className="spinner" />
                    <p>Cargando calendario...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-container">
                <div className="alert alert-danger">{error}</div>
                <button onClick={handleRefresh} className="btn btn-primary">
                    <FaSync /> Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="header-title">
                    <FaCalendarAlt className="page-icon" />
                    <div>
                        <h1>Calendario de Sesiones</h1>
                        <p>Visualiza todas las sesiones programadas en el calendario</p>
                    </div>
                </div>
                <div className="header-actions">
                    <div className="view-toggle">
                        <button
                            onClick={() => setViewMode('month')}
                            className={`btn-toggle ${viewMode === 'month' ? 'active' : ''}`}
                            title="Vista mes"
                        >
                            Mes
                        </button>
                        <button
                            onClick={() => setViewMode('week')}
                            className={`btn-toggle ${viewMode === 'week' ? 'active' : ''}`}
                            title="Vista semana"
                        >
                            Semana
                        </button>
                        <button
                            onClick={() => setViewMode('agenda')}
                            className={`btn-toggle ${viewMode === 'agenda' ? 'active' : ''}`}
                            title="Vista agenda"
                        >
                            Agenda
                        </button>
                    </div>
                    <button onClick={handleRefresh} className="btn btn-secondary" title="Actualizar">
                        <FaSync />
                    </button>
                </div>
            </div>

            <div className="card" style={{ height: '70vh', minHeight: '600px' }}>
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%', padding: '10px' }}
                    views={['month', 'week', 'day', 'agenda']}
                    view={viewMode}
                    onView={setViewMode}
                    onSelectEvent={handleSelectEvent}
                    eventPropGetter={(event) => getEventStyle(event, eventColors)}
                    messages={messages}
                    popup
                    step={60}
                    showMultiDayTimes
                    drilldownView="agenda"
                />
            </div>

            {renderLegend()}
            {isModalOpen && renderEventDetails()}

            <style jsx>{`
                :global(.rbc-event) {
                    transition: all 0.2s ease;
                }
                
                :global(.rbc-event:hover) {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.3) !important;
                }
                
                :global(.rbc-today) {
                    background-color: #f0f9ff;
                }
                
                :global(.rbc-header) {
                    background: #f8f9fa;
                    padding: 10px;
                    font-weight: 600;
                    border-bottom: 2px solid #dee2e6;
                }
            `}</style>
        </div>
    );
};

export default UserCalendarPage;