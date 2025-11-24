import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { personaService } from '../../services/personaService';
import { TipoPersona } from '../../utils/constants.js';

const ProfileEditPage = () => {
    const { isAuthenticated } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            setError(null);
            setSuccessMessage(null);
            try {
                const token = authService.getToken();
                if (!token) {
                    throw new Error("No autenticado");
                }
                const data = await personaService.getMyProfile(token);
                setProfileData(data);
            } catch (err) {
                console.error("Error al cargar el perfil:", err);
                setError("Error al cargar el perfil: " + (err.response?.data?.message || err.message || ""));
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated()) {
            fetchProfile();
        }
    }, [isAuthenticated]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const token = authService.getToken();
            if (!token || !profileData?.idPersona) {
                throw new Error("No autenticado o perfil no cargado");
            }

            // Construir el objeto que coincide con la entidad Persona del backend
            const dataToSend = {
                idPersona: profileData.idPersona,
                nombreCompleto: profileData.nombreCompleto,
                documento: profileData.documento,
                correo: profileData.correo,
                celular: profileData.celular,
                correoInstitucional: profileData.correoInstitucional,
                codigoEstudiante: profileData.codigoEstudiante,
                pais: profileData.pais,
                religion: profileData.religion,
                fechaNacimiento: profileData.fechaNacimiento || null,
                tipoPersona: profileData.tipoPersona || TipoPersona.ESTUDIANTE,
            };

            // Llamar al servicio con el ID y los datos
            const updatedProfile = await personaService.update(profileData.idPersona, dataToSend, token);
            
            setProfileData(updatedProfile);
            setSuccessMessage("Perfil actualizado exitosamente!");
        } catch (err) {
            console.error("Error al actualizar el perfil:", err);
            setError("Error al actualizar el perfil: " + (err.response?.data?.detail || err.response?.data?.message || err.message || ""));
        } finally {
            setLoading(false);
        }
    };

    if (loading && !profileData) { // Mostrar spinner solo en la carga inicial
        return (
            <div className="main-content">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Cargando perfil...</p>
                </div>
            </div>
        );
    }

    if (error && !successMessage) { // No mostrar error si hay un mensaje de éxito
        return (
            <div className="main-content">
                <div className="alert alert-danger">
                    <span className="alert-icon">⚠️</span>
                    <p>{error}</p>
                    <button
                        className="alert-close"
                        onClick={() => setError(null)}
                    >
                        &times;
                    </button>
                </div>
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className="main-content">
                <div className="alert alert-warning">
                    <span className="alert-icon">⚠️</span>
                    <p>No se pudo cargar la información del perfil.</p>
                </div>
            </div>
        );
    }

    const isInvitado = profileData.tipoPersona === TipoPersona.INVITADO;

    return (
        <div className="main-content">
            <div className="profile-edit-container">
                <div className="profile-header">
                    <h1 className="profile-title">Editar Perfil</h1>
                    <p className="profile-subtitle">Actualiza tu información personal</p>
                </div>

                {successMessage && (
                    <div className="alert alert-success">
                        <span className="alert-icon">✓</span>
                        <p>{successMessage}</p>
                        <button
                            className="alert-close"
                            onClick={() => setSuccessMessage(null)}
                        >
                            &times;
                        </button>
                    </div>
                )}

                <div className="profile-card">
                    <form onSubmit={handleSubmit} className="profile-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="nombreCompleto">Nombre Completo</label>
                                <input
                                    type="text"
                                    name="nombreCompleto"
                                    id="nombreCompleto"
                                    value={profileData.nombreCompleto || ''}
                                    onChange={handleChange}
                                    className="form-input"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="documento">Documento</label>
                                <input
                                    type="text"
                                    name="documento"
                                    id="documento"
                                    value={profileData.documento || ''}
                                    onChange={handleChange}
                                    className="form-input"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="correo">Correo Personal</label>
                                <input
                                    type="email"
                                    name="correo"
                                    id="correo"
                                    value={profileData.correo || ''}
                                    onChange={handleChange}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="celular">Celular</label>
                                <input
                                    type="text"
                                    name="celular"
                                    id="celular"
                                    value={profileData.celular || ''}
                                    onChange={handleChange}
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="correoInstitucional">Correo Institucional</label>
                                <input
                                    type="email"
                                    name="correoInstitucional"
                                    id="correoInstitucional"
                                    value={profileData.correoInstitucional || ''}
                                    onChange={handleChange}
                                    className={`form-input ${isInvitado ? 'disabled-input' : ''}`}
                                    disabled={isInvitado}
                                />
                                {isInvitado && <p className="form-help">Los invitados no pueden editar este campo.</p>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="codigoEstudiante">Código Estudiante</label>
                                <input
                                    type="text"
                                    name="codigoEstudiante"
                                    id="codigoEstudiante"
                                    value={profileData.codigoEstudiante || ''}
                                    onChange={handleChange}
                                    className={`form-input ${isInvitado ? 'disabled-input' : ''}`}
                                    disabled={isInvitado}
                                />
                                {isInvitado && <p className="form-help">Los invitados no pueden editar este campo.</p>}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="pais">País</label>
                                <input
                                    type="text"
                                    name="pais"
                                    id="pais"
                                    value={profileData.pais || ''}
                                    onChange={handleChange}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="religion">Religión</label>
                                <input
                                    type="text"
                                    name="religion"
                                    id="religion"
                                    value={profileData.religion || ''}
                                    onChange={handleChange}
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="fechaNacimiento">Fecha de Nacimiento</label>
                            <input
                                type="date"
                                name="fechaNacimiento"
                                id="fechaNacimiento"
                                value={profileData.fechaNacimiento || ''}
                                onChange={handleChange}
                                className="form-input"
                            />
                        </div>

                        <div className="form-actions">
                            <button
                                type="submit"
                                className="btn btn-primary btn-lg"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <div className="spinner-small"></div>
                                        Guardando...
                                    </>
                                ) : (
                                    'Guardar Cambios'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileEditPage;
