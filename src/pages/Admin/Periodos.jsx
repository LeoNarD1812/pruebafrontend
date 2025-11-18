import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaPlus, FaEdit, FaTrash, FaSync, FaTimes } from 'react-icons/fa';
import { periodoService } from '../../services/periodoService';
import Modal from '../../components/Modal';

const Periodos = () => {
    const [periodos, setPeriodos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPeriodo, setCurrentPeriodo] = useState(null);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const periodosRes = await periodoService.getAll();
            setPeriodos(periodosRes.data || []);
        } catch (error) {
            console.error('Error cargando datos:', error);
            alert('Error al cargar los datos de períodos');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (periodo = null) => {
        setCurrentPeriodo(periodo);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentPeriodo(null);
    };

    const handleSave = async (periodoData) => {
        try {
            if (currentPeriodo) {
                await periodoService.update(currentPeriodo.idPeriodo, periodoData);
            } else {
                await periodoService.create(periodoData);
            }
            cargarDatos();
            handleCloseModal();
        } catch (error) {
            console.error('Error guardando período:', error);
            alert('Error al guardar el período');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este período?')) {
            try {
                await periodoService.delete(id);
                cargarDatos();
            } catch (error) {
                console.error('Error eliminando período:', error);
                alert('Error al eliminar el período');
            }
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="header-title">
                    <FaCalendarAlt className="page-icon" />
                    <div>
                        <h1>Gestión de Períodos</h1>
                        <p>Administra los períodos académicos de la institución</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button onClick={() => handleOpenModal()} className="btn btn-primary">
                        <FaPlus /> Nuevo Período
                    </button>
                    <button onClick={cargarDatos} className="btn btn-secondary" disabled={loading}>
                        <FaSync /> {loading ? 'Actualizando...' : 'Actualizar'}
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2>Lista de Períodos</h2>
                </div>
                <div className="table-container">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Cargando períodos...</p>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Descripción</th>
                                    <th>Fecha Inicio</th>
                                    <th>Fecha Fin</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(periodos || []).map((periodo) => (
                                    <tr key={periodo.idPeriodo}>
                                        <td>{periodo.nombre}</td>
                                        <td>{periodo.descripcion}</td>
                                        <td>{periodo.fechaInicio}</td>
                                        <td>{periodo.fechaFin}</td>
                                        <td>{periodo.estado}</td>
                                        <td>
                                            <button onClick={() => handleOpenModal(periodo)} className="btn btn-secondary">
                                                <FaEdit />
                                            </button>
                                            <button onClick={() => handleDelete(periodo.idPeriodo)} className="btn btn-danger">
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <Modal onClose={handleCloseModal}>
                    <PeriodoForm currentPeriodo={currentPeriodo} onSave={handleSave} onClose={handleCloseModal} />
                </Modal>
            )}
        </div>
    );
};

const PeriodoForm = ({ currentPeriodo, onSave, onClose }) => {
    const [periodo, setPeriodo] = useState(currentPeriodo || { nombre: '', descripcion: '', fechaInicio: '', fechaFin: '', estado: 'ACTIVO' });

    useEffect(() => {
        // Formatear fechas para el input type="date"
        if (currentPeriodo) {
            setPeriodo({
                ...currentPeriodo,
                fechaInicio: currentPeriodo.fechaInicio ? new Date(currentPeriodo.fechaInicio).toISOString().split('T')[0] : '',
                fechaFin: currentPeriodo.fechaFin ? new Date(currentPeriodo.fechaFin).toISOString().split('T')[0] : '',
            });
        }
    }, [currentPeriodo]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPeriodo({ ...periodo, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(periodo);
    };

    return (
        <div className="modal-content">
            <div className="modal-header">
                <h3>{currentPeriodo ? 'Editar Período' : 'Nuevo Período'}</h3>
                <button onClick={onClose} className="close-modal"><FaTimes /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
                <div className="form-group">
                    <label>Nombre</label>
                    <input type="text" name="nombre" value={periodo.nombre} onChange={handleChange} required className="form-input" />
                </div>
                <div className="form-group">
                    <label>Descripción</label>
                    <input type="text" name="descripcion" value={periodo.descripcion} onChange={handleChange} className="form-input" />
                </div>
                <div className="form-group">
                    <label>Fecha Inicio</label>
                    <input type="date" name="fechaInicio" value={periodo.fechaInicio} onChange={handleChange} required className="form-input" />
                </div>
                <div className="form-group">
                    <label>Fecha Fin</label>
                    <input type="date" name="fechaFin" value={periodo.fechaFin} onChange={handleChange} required className="form-input" />
                </div>
                <div className="form-group">
                    <label>Estado</label>
                    <select name="estado" value={periodo.estado} onChange={handleChange} className="form-select">
                        <option value="ACTIVO">ACTIVO</option>
                        <option value="INACTIVO">INACTIVO</option>
                        <option value="FINALIZADO">FINALIZADO</option>
                    </select>
                </div>
                <div className="modal-footer">
                    <button type="button" onClick={onClose} className="btn btn-secondary">Cancelar</button>
                    <button type="submit" className="btn btn-primary">Guardar</button>
                </div>
            </form>
        </div>
    );
};

export default Periodos;
