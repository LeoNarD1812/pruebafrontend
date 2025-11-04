import React, { useState, useEffect } from 'react';
import { FaUniversity, FaPlus, FaEdit, FaTrash, FaSync, FaTimes } from 'react-icons/fa';
import { sedesService } from '../../services/sedesService';
import Modal from '../../components/Modal';

const Sedes = () => {
    const [sedes, setSedes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSede, setCurrentSede] = useState(null);

    useEffect(() => {
        cargarSedes();
    }, []);

    const cargarSedes = async () => {
        try {
            setLoading(true);
            const response = await sedesService.getAll();
            setSedes(response.data);
        } catch (error) {
            console.error('Error cargando sedes:', error);
            alert('Error al cargar las sedes');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (sede = null) => {
        setCurrentSede(sede);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentSede(null);
    };

    const handleSave = async (sedeData) => {
        try {
            if (currentSede) {
                await sedesService.update(currentSede.idSede, sedeData);
            } else {
                await sedesService.create(sedeData);
            }
            cargarSedes();
            handleCloseModal();
        } catch (error) {
            console.error('Error guardando sede:', error);
            alert('Error al guardar la sede');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta sede?')) {
            try {
                await sedesService.delete(id);
                cargarSedes();
            } catch (error) {
                console.error('Error eliminando sede:', error);
                alert('Error al eliminar la sede');
            }
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="header-title">
                    <FaUniversity className="page-icon" />
                    <div>
                        <h1>Gestión de Sedes</h1>
                        <p>Administra las sedes de la institución</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button onClick={() => handleOpenModal()} className="btn btn-primary">
                        <FaPlus /> Nueva Sede
                    </button>
                    <button onClick={cargarSedes} className="btn btn-secondary" disabled={loading}>
                        <FaSync /> {loading ? 'Actualizando...' : 'Actualizar'}
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2>Lista de Sedes</h2>
                </div>
                <div className="table-container">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Cargando sedes...</p>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Descripción</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sedes.map((sede) => (
                                    <tr key={sede.idSede}>
                                        <td>{sede.nombre}</td>
                                        <td>{sede.descripcion}</td>
                                        <td>
                                            <button onClick={() => handleOpenModal(sede)} className="btn btn-secondary">
                                                <FaEdit />
                                            </button>
                                            <button onClick={() => handleDelete(sede.idSede)} className="btn btn-danger">
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
                    <SedeForm currentSede={currentSede} onSave={handleSave} onClose={handleCloseModal} />
                </Modal>
            )}
        </div>
    );
};

const SedeForm = ({ currentSede, onSave, onClose }) => {
    const [sede, setSede] = useState(currentSede || { nombre: '', descripcion: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSede({ ...sede, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(sede);
    };

    return (
        <div className="modal-content">
            <div className="modal-header">
                <h3>{currentSede ? 'Editar Sede' : 'Nueva Sede'}</h3>
                <button onClick={onClose} className="close-modal"><FaTimes /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
                <div className="form-group">
                    <label>Nombre</label>
                    <input type="text" name="nombre" value={sede.nombre} onChange={handleChange} required className="form-input" />
                </div>
                <div className="form-group">
                    <label>Descripción</label>
                    <input type="text" name="descripcion" value={sede.descripcion} onChange={handleChange} className="form-input" />
                </div>
                <div className="modal-footer">
                    <button type="button" onClick={onClose} className="btn btn-secondary">Cancelar</button>
                    <button type="submit" className="btn btn-primary">Guardar</button>
                </div>
            </form>
        </div>
    );
};

export default Sedes;