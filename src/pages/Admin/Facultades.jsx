import React, { useState, useEffect } from 'react';
import { FaUniversity, FaPlus, FaEdit, FaTrash, FaSync, FaTimes } from 'react-icons/fa';
import { facultadesService } from '../../services/facultadesService';
import { sedesService } from '../../services/sedesService';
import Modal from '../../components/Modal';

const Facultades = () => {
    const [facultades, setFacultades] = useState([]);
    const [sedes, setSedes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentFacultad, setCurrentFacultad] = useState(null);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [facultadesRes, sedesRes] = await Promise.all([
                facultadesService.getAll(),
                sedesService.getAll()
            ]);
            setFacultades(facultadesRes.data || []);
            setSedes(sedesRes.data || []);
        } catch (error) {
            console.error('Error cargando datos:', error);
            alert('Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (facultad = null) => {
        setCurrentFacultad(facultad);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentFacultad(null);
    };

    const handleSave = async (facultadData) => {
        try {
            if (currentFacultad) {
                await facultadesService.update(currentFacultad.idFacultad, facultadData);
            } else {
                await facultadesService.create(facultadData);
            }
            cargarDatos();
            handleCloseModal();
        } catch (error) {
            console.error('Error guardando facultad:', error);
            alert('Error al guardar la facultad');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta facultad?')) {
            try {
                await facultadesService.delete(id);
                cargarDatos();
            } catch (error) {
                console.error('Error eliminando facultad:', error);
                alert('Error al eliminar la facultad');
            }
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="header-title">
                    <FaUniversity className="page-icon" />
                    <div>
                        <h1>Gestión de Facultades</h1>
                        <p>Administra las facultades de la institución</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button onClick={() => handleOpenModal()} className="btn btn-primary">
                        <FaPlus /> Nueva Facultad
                    </button>
                    <button onClick={cargarDatos} className="btn btn-secondary" disabled={loading}>
                        <FaSync /> {loading ? 'Actualizando...' : 'Actualizar'}
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2>Lista de Facultades</h2>
                </div>
                <div className="table-container">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Cargando facultades...</p>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Descripción</th>
                                    <th>Sede</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(facultades || []).map((facultad) => (
                                    <tr key={facultad.idFacultad}>
                                        <td>{facultad.nombre}</td>
                                        <td>{facultad.descripcion}</td>
                                        <td>{facultad.sede?.nombre || 'N/A'}</td>
                                        <td>
                                            <button onClick={() => handleOpenModal(facultad)} className="btn btn-secondary">
                                                <FaEdit />
                                            </button>
                                            <button onClick={() => handleDelete(facultad.idFacultad)} className="btn btn-danger">
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
                    <FacultadForm currentFacultad={currentFacultad} sedes={sedes} onSave={handleSave} onClose={handleCloseModal} />
                </Modal>
            )}
        </div>
    );
};

const FacultadForm = ({ currentFacultad, sedes, onSave, onClose }) => {
    const [facultad, setFacultad] = useState(currentFacultad || { nombre: '', descripcion: '', sede: { idSede: '' } });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'idSede') {
            setFacultad({ ...facultad, sede: { idSede: value } });
        } else {
            setFacultad({ ...facultad, [name]: value });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(facultad);
    };

    return (
        <div className="modal-content">
            <div className="modal-header">
                <h3>{currentFacultad ? 'Editar Facultad' : 'Nueva Facultad'}</h3>
                <button onClick={onClose} className="close-modal"><FaTimes /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
                <div className="form-group">
                    <label>Nombre</label>
                    <input type="text" name="nombre" value={facultad.nombre} onChange={handleChange} required className="form-input" />
                </div>
                <div className="form-group">
                    <label>Descripción</label>
                    <input type="text" name="descripcion" value={facultad.descripcion} onChange={handleChange} className="form-input" />
                </div>
                <div className="form-group">
                    <label>Sede</label>
                    <select name="idSede" value={facultad.sede?.idSede || ''} onChange={handleChange} required className="form-select">
                        <option value="">Seleccione una sede</option>
                        {(sedes || []).map(sede => (
                            <option key={sede.idSede} value={sede.idSede}>{sede.nombre}</option>
                        ))}
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

export default Facultades;