import React, { useState, useEffect } from 'react';
import { crudService } from '../../services/crudService';
import './admin-global2.css';

const eventoGeneralService = crudService('eventos-generales');

const SesionForm = ({ onSave, onClose, sesion }) => {
    const isEditing = !!sesion;
    const [isRecurrence, setIsRecurrence] = useState(!isEditing); // Default a recurrencia para creación

    // El formData debe contener todos los campos necesarios para ambas lógicas (Única y Recurrencia)
    const [formData, setFormData] = useState({
        idEventoGeneral: '',
        nombreSesion: '',
        fecha: '', // Para sesión única
        horaInicio: '',
        horaFin: '',
        toleranciaMinutos: '15',
        // --- Recurrence Fields (Coinciden con RecurrenceRequestDTO.java) ---
        fechaInicioRecurrencia: '',
        fechaFinRecurrencia: '',
        diasSemana: [], // Lista de números: [1, 3, 5] (Lunes, Miércoles, Viernes)
    });
    const [eventosGenerales, setEventosGenerales] = useState([]);

    const daysOfWeek = [
        { name: 'Lun', value: 1 },
        { name: 'Mar', value: 2 },
        { name: 'Mié', value: 3 },
        { name: 'Jue', value: 4 },
        { name: 'Vie', value: 5 },
        { name: 'Sáb', value: 6 },
        { name: 'Dom', value: 7 },
    ];

    useEffect(() => {
        const loadEventosGenerales = async () => {
            try {
                const data = await eventoGeneralService.findAll();
                setEventosGenerales(data);
            } catch (error) {
                console.error("Error loading general events:", error);
            }
        };
        loadEventosGenerales();

        if (sesion) {
            // Modo edición
            setIsRecurrence(false);
            setFormData({
                idEventoGeneral: sesion.idEventoGeneral || '',
                nombreSesion: sesion.nombreSesion || '',
                fecha: sesion.fecha ? new Date(sesion.fecha).toISOString().split('T')[0] : '',
                horaInicio: sesion.horaInicio || '',
                horaFin: sesion.horaFin || '',
                toleranciaMinutos: sesion.toleranciaMinutos || '15',
                // Limpiar campos de recurrencia en edición
                fechaInicioRecurrencia: '',
                fechaFinRecurrencia: '',
                diasSemana: [],
            });
        }
    }, [sesion]);

    const handleChange = (e) => {
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
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // 🚨 PASO CLAVE: Limpiar los datos irrelevantes antes de enviar
        const dataToSave = {
            ...formData,
            isRecurrence: isRecurrence // Usado por SesionesPage para elegir el endpoint
        };

        if (isRecurrence && !isEditing) {
            // Eliminar campos de sesión única
            delete dataToSave.fecha;
        } else {
            // Eliminar campos de recurrencia (para edición o creación única)
            delete dataToSave.fechaInicioRecurrencia;
            delete dataToSave.fechaFinRecurrencia;
            delete dataToSave.diasSemana;
        }

        onSave(dataToSave);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <form onSubmit={handleSubmit}>
                    <div className="modal-header">
                        <h2>{isEditing ? 'Editar' : (isRecurrence ? 'Crear Sesiones Recurrentes' : 'Crear Sesión Única')}</h2>
                        <button type="button" onClick={onClose} className="close-button">&times;</button>
                    </div>
                    <div className="modal-body">
                        {/* 1. Evento General y Nombre de Sesión (Siempre visibles) */}
                        <div className="form-group">
                            <label htmlFor="idEventoGeneral">Evento General</label>
                            <select
                                id="idEventoGeneral"
                                name="idEventoGeneral"
                                value={formData.idEventoGeneral}
                                onChange={handleChange}
                                required
                                disabled={isEditing}
                            >
                                <option value="">Seleccione un evento</option>
                                {eventosGenerales.map(evento => (
                                    <option key={evento.idEventoGeneral} value={evento.idEventoGeneral}>
                                        {evento.nombreEvento}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="nombreSesion">Nombre Base de la Sesión</label>
                            <input
                                type="text"
                                id="nombreSesion"
                                name="nombreSesion"
                                value={formData.nombreSesion}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* 2. Interruptor de Recurrencia (Solo en Creación) */}
                        {!isEditing && (
                            <div className="form-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={isRecurrence}
                                        onChange={(e) => setIsRecurrence(e.target.checked)}
                                    />
                                    {' '}Crear sesiones recurrentes
                                </label>
                            </div>
                        )}

                        {/* 3. Campos Condicionales */}
                        {isRecurrence && !isEditing ? (
                            // MODO RECURRENCIA
                            <>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="fechaInicioRecurrencia">Fecha Inicio Recurrencia</label>
                                        <input
                                            type="date"
                                            id="fechaInicioRecurrencia"
                                            name="fechaInicioRecurrencia"
                                            value={formData.fechaInicioRecurrencia}
                                            onChange={handleChange}
                                            required={isRecurrence}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="fechaFinRecurrencia">Fecha Fin Recurrencia</label>
                                        <input
                                            type="date"
                                            id="fechaFinRecurrencia"
                                            name="fechaFinRecurrencia"
                                            value={formData.fechaFinRecurrencia}
                                            onChange={handleChange}
                                            required={isRecurrence}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Días de la Semana (Se repite cada semana)</label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        {daysOfWeek.map(day => (
                                            <label key={day.value}>
                                                <input
                                                    type="checkbox"
                                                    name="diasSemana"
                                                    value={day.value}
                                                    checked={formData.diasSemana.includes(day.value)}
                                                    onChange={handleChange}
                                                    required={formData.diasSemana.length === 0 && isRecurrence}
                                                />
                                                {day.name}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : (
                            // MODO SESIÓN ÚNICA / EDICIÓN
                            <div className="form-group">
                                <label htmlFor="fecha">Fecha</label>
                                <input
                                    type="date"
                                    id="fecha"
                                    name="fecha"
                                    value={formData.fecha}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        )}

                        {/* 4. Hora y Tolerancia (Siempre presentes) */}
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="horaInicio">Hora Inicio</label>
                                <input
                                    type="time"
                                    id="horaInicio"
                                    name="horaInicio"
                                    value={formData.horaInicio}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="horaFin">Hora Fin</label>
                                <input
                                    type="time"
                                    id="horaFin"
                                    name="horaFin"
                                    value={formData.horaFin}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="toleranciaMinutos">Tolerancia (minutos)</label>
                            <input
                                type="number"
                                id="toleranciaMinutos"
                                name="toleranciaMinutos"
                                value={formData.toleranciaMinutos}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="submit" className="btn-primary">
                            {isEditing ? 'Guardar Cambios' : (isRecurrence ? 'Crear Sesiones' : 'Crear Sesión')}
                        </button>
                        <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SesionForm;