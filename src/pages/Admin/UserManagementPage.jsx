import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { authService } from '../../services/authService';
import { getRoleFromToken } from '../../utils/jwtHelper';
import { TipoPersona } from '../../utils/constants.js';

const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        user: '',
        clave: '',
        estado: 'ACTIVO',
        nombreCompleto: '',
        documento: '',
        correo: '',
        nombreRol: '',
        tipoPersona: TipoPersona.INVITADO
    });

    const currentUserRole = getRoleFromToken(authService.getToken());

    useEffect(() => {
        fetchUsersAndRoles();
    }, []);

    const fetchUsersAndRoles = async () => {
        setLoading(true);
        setError(null);
        try {
            const [usersData, rolesData] = await Promise.all([
                userService.getAllUsers(),
                userService.getAllRoles()
            ]);
            setUsers(usersData);
            setRoles(rolesData);
        } catch (err) {
            console.error("Error fetching users or roles:", err);
            setError("Error al cargar usuarios o roles: " + (err.response?.data?.message || err.message || ""));
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editingUser) {
            await handleUpdateUser();
        } else {
            await handleCreateUser();
        }
    };

    const handleCreateUser = async () => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const userToCreate = {
                user: formData.user,
                clave: formData.clave,
                estado: formData.estado,
                nombreCompleto: formData.nombreCompleto,
                documento: formData.documento,
                correo: formData.correo,
                rol: formData.nombreRol,
                tipoPersona: formData.nombreRol === 'INTEGRANTE' ? formData.tipoPersona : TipoPersona.INVITADO
            };
            await userService.createUser(userToCreate);
            setSuccessMessage("Usuario creado exitosamente!");
            fetchUsersAndRoles();
            closeModal();
        } catch (err) {
            console.error("Error creating user:", err);
            setError("Error al crear usuario: " + (err.response?.data?.message || err.message || ""));
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateUser = async () => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const userToUpdate = {
                user: formData.user,
                estado: formData.estado,
                nombreCompleto: formData.nombreCompleto,
                documento: formData.documento,
                correo: formData.correo,
                nombreRol: formData.nombreRol,
                tipoPersona: formData.nombreRol === 'INTEGRANTE' ? formData.tipoPersona : TipoPersona.INVITADO
            };
            if (formData.clave) {
                userToUpdate.clave = formData.clave;
            }
            await userService.updateUser(editingUser.idUsuario, userToUpdate);
            setSuccessMessage("Usuario actualizado exitosamente!");
            fetchUsersAndRoles();
            closeModal();
        } catch (err) {
            console.error("Error updating user:", err);
            setError("Error al actualizar usuario: " + (err.response?.data?.message || err.message || ""));
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
            return;
        }
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            await userService.deleteUser(id);
            setSuccessMessage("Usuario eliminado exitosamente!");
            fetchUsersAndRoles();
        } catch (err) {
            console.error("Error deleting user:", err);
            setError("Error al eliminar usuario: " + (err.response?.data?.message || err.message || ""));
        } finally {
            setLoading(false);
        }
    };

    const openModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                user: user.user,
                clave: '',
                estado: user.estado,
                nombreCompleto: user.nombreCompleto || '',
                documento: user.documento || '',
                correo: user.correo || '',
                nombreRol: user.nombreRol || '',
                tipoPersona: user.tipoPersona || TipoPersona.INVITADO
            });
        } else {
            setEditingUser(null);
            setFormData({
                user: '',
                clave: '',
                estado: 'ACTIVO',
                nombreCompleto: '',
                documento: '',
                correo: '',
                nombreRol: roles.length > 0 ? 'INTEGRANTE' : '',
                tipoPersona: TipoPersona.INVITADO
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
        setFormData({
            user: '',
            clave: '',
            estado: 'ACTIVO',
            nombreCompleto: '',
            documento: '',
            correo: '',
            nombreRol: '',
            tipoPersona: TipoPersona.INVITADO
        });
    };

    if (loading) {
        return (
            <div className="main-content">
                <div className="loading-container">
                    <p>Cargando gestión de usuarios...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="main-content">
                <div className="alert alert-danger">
                    <p>Error: {error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="header-title">
                    <div className="page-icon">👥</div>
                    <div>
                        <h1>Gestión de Usuarios</h1>
                        <p>Administra los usuarios y sus permisos en el sistema</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button onClick={() => openModal()} className="btn btn-primary">
                        <span>+</span> Crear Nuevo Usuario
                    </button>
                </div>
            </div>

            {successMessage && (
                <div className="alert alert-success">
                    <p>{successMessage}</p>
                </div>
            )}

            <div className="card">
                <div className="card-header">
                    <h2>Lista de Usuarios</h2>
                    <div className="badge">{users.length} usuarios</div>
                </div>
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                        <tr>
                            <th className="col-id">ID</th>
                            <th className="col-name">Usuario</th>
                            <th className="col-name">Nombre Completo</th>
                            <th className="col-type">Rol</th>
                            <th className="col-type">Tipo Persona</th>
                            <th className="col-type">Estado</th>
                            <th className="col-actions">Acciones</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map(user => (
                            <tr key={user.idUsuario}>
                                <td>{user.idUsuario}</td>
                                <td>{user.user}</td>
                                <td>{user.nombreCompleto}</td>
                                <td>
                                    <span className="badge">{user.nombreRol}</span>
                                </td>
                                <td>{user.tipoPersona}</td>
                                <td>
                                        <span className={`badge ${user.estado === 'ACTIVO' ? 'capacity-success' : 'capacity-danger'}`}>
                                            {user.estado}
                                        </span>
                                </td>
                                <td>
                                    <div className="btn-group">
                                        <button onClick={() => openModal(user)} className="btn btn-info btn-sm">
                                            Editar
                                        </button>
                                        {currentUserRole === 'SUPERADMIN' && user.user !== authService.getUser() && (
                                            <button onClick={() => handleDeleteUser(user.idUsuario)} className="btn btn-danger btn-sm">
                                                Eliminar
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    {users.length === 0 && (
                        <div className="empty-state">
                            <p>No hay usuarios registrados</p>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{editingUser ? 'Editar Usuario' : 'Crear Usuario'}</h2>
                            <button onClick={closeModal} className="close-modal">×</button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="user" className="form-label">Usuario</label>
                                        <input
                                            type="text"
                                            name="user"
                                            id="user"
                                            value={formData.user}
                                            onChange={handleInputChange}
                                            className="form-input"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="clave" className="form-label">Contraseña</label>
                                        <input
                                            type="password"
                                            name="clave"
                                            id="clave"
                                            value={formData.clave}
                                            onChange={handleInputChange}
                                            className="form-input"
                                            placeholder={editingUser ? "Dejar en blanco para mantener actual" : ""}
                                            required={!editingUser}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="nombreCompleto" className="form-label">Nombre Completo</label>
                                    <input
                                        type="text"
                                        name="nombreCompleto"
                                        id="nombreCompleto"
                                        value={formData.nombreCompleto}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="documento" className="form-label">Documento</label>
                                        <input
                                            type="text"
                                            name="documento"
                                            id="documento"
                                            value={formData.documento}
                                            onChange={handleInputChange}
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="correo" className="form-label">Correo</label>
                                        <input
                                            type="email"
                                            name="correo"
                                            id="correo"
                                            value={formData.correo}
                                            onChange={handleInputChange}
                                            className="form-input"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="nombreRol" className="form-label">Rol</label>
                                        <select
                                            name="nombreRol"
                                            id="nombreRol"
                                            value={formData.nombreRol}
                                            onChange={handleInputChange}
                                            className="form-select"
                                            required
                                        >
                                            <option value="">Seleccione un rol</option>
                                            {roles.map(role => (
                                                <option key={role.idRol} value={role.nombre}>{role.nombre}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="estado" className="form-label">Estado</label>
                                        <select
                                            name="estado"
                                            id="estado"
                                            value={formData.estado}
                                            onChange={handleInputChange}
                                            className="form-select"
                                            required
                                        >
                                            <option value="ACTIVO">ACTIVO</option>
                                            <option value="INACTIVO">INACTIVO</option>
                                        </select>
                                    </div>
                                </div>

                                {formData.nombreRol === 'INTEGRANTE' && (
                                    <div className="form-group">
                                        <label htmlFor="tipoPersona" className="form-label">Tipo de Persona</label>
                                        <select
                                            name="tipoPersona"
                                            id="tipoPersona"
                                            value={formData.tipoPersona}
                                            onChange={handleInputChange}
                                            className="form-select"
                                            required
                                        >
                                            <option value={TipoPersona.INVITADO}>INVITADO</option>
                                            <option value={TipoPersona.ESTUDIANTE}>ESTUDIANTE</option>
                                        </select>
                                    </div>
                                )}
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button type="button" onClick={closeModal} className="btn btn-secondary">
                                Cancelar
                            </button>
                            <button type="submit" onClick={handleSubmit} className="btn btn-primary">
                                {editingUser ? 'Actualizar' : 'Crear'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagementPage;