import React, { useState, useEffect } from 'react';
import { FaGraduationCap, FaPlus, FaEdit, FaTrash, FaSync, FaTimes } from 'react-icons/fa';
import { programasService } from '../../services/programasService';
import { facultadesService } from '../../services/facultadesService';
import Modal from '../../components/Modal';

const Programas = () => {
    const [programas, setProgramas] = useState([]);
    const [facultades, setFacultades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPrograma, setCurrentPrograma] = useState(null);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [programasRes, facultadesRes] = await Promise.all([
                programasService.getAll(),
                facultadesService.getAll()
            ]);
            setProgramas(programasRes.data || []);
            setFacultades(facultadesRes.data || []);
        } catch (error) {
            console.error('Error cargando datos:', error);
            alert('Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (programa = null) => {
        setCurrentPrograma(programa);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentPrograma(null);
    };

    const handleSave = async (programaData) => {
        try {
            if (currentPrograma) {
                await programasService.update(currentPrograma.idPrograma, programaData);
            } else {
                await programasService.create(programaData);
            }
            cargarDatos();
            handleCloseModal();
        } catch (error) {
            console.error('Error guardando programa:', error);
            alert('Error al guardar el programa');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este programa?')) {
            try {
                await programasService.delete(id);
                cargarDatos();
            } catch (error) {
                console.error('Error eliminando programa:', error);
                alert('Error al eliminar el programa');
            }
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="header-title">
                    <FaGraduationCap className="page-icon" />
                    <div>
                        <h1>Gestión de Programas</h1>
                        <p>Administra los programas de la institución</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button onClick={() => handleOpenModal()} className="btn btn-primary">
                        <FaPlus /> Nuevo Programa
                    </button>
                    <button onClick={cargarDatos} className="btn btn-secondary" disabled={loading}>
                        <FaSync /> {loading ? 'Actualizando...' : 'Actualizar'}
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2>Lista de Programas</h2>
                </div>
                <div className="table-container">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Cargando programas...</p>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Descripción</th>
                                    <th>Facultad</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(programas || []).map((programa) => (
                                    <tr key={programa.idPrograma}>
                                        <td>{programa.nombre}</td>
                                        <td>{programa.descripcion}</td>
                                        <td>{programa.facultad?.nombre || 'N/A'}</td>
                                        <td>
                                            <button onClick={() => handleOpenModal(programa)} className="btn btn-secondary">
                                                <FaEdit />
                                            </button>
                                            <button onClick={() => handleDelete(programa.idPrograma)} className="btn btn-danger">
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
                    <ProgramaForm currentPrograma={currentPrograma} facultades={facultades} onSave={handleSave} onClose={handleCloseModal} />
                </Modal>
            )}
        </div>
    );
};

const ProgramaForm = ({ currentPrograma, facultades, onSave, onClose }) => {
    const [programa, setPrograma] = useState(currentPrograma || { nombre: '', descripcion: '', facultad: { idFacultad: '' } });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'idFacultad') {
            setPrograma({ ...programa, facultad: { idFacultad: value } });
        } else {
            setPrograma({ ...programa, [name]: value });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(programa);
    };

    return (
        <div className="modal-content">
            <div className="modal-header">
                <h3>{currentPrograma ? 'Editar Programa' : 'Nuevo Programa'}</h3>
                <button onClick={onClose} className="close-modal"><FaTimes /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
                <div className="form-group">
                    <label>Nombre</label>
                    <input type="text" name="nombre" value={programa.nombre} onChange={handleChange} required className="form-input" />
                </div>
                <div className="form-group">
                    <label>Descripción</label>
                    <input type="text" name="descripcion" value={programa.descripcion} onChange={handleChange} className="form-input" />
                </div>
                <div className="form-group">
                    <label>Facultad</label>
                    <select name="idFacultad" value={programa.facultad?.idFacultad || ''} onChange={handleChange} required className="form-select">
                        <option value="">Seleccione una facultad</option>
                        {(facultades || []).map(facultad => (
                            <option key={facultad.idFacultad} value={facultad.idFacultad}>{facultad.nombre}</option>
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

export default Programas;