import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        user: '',
        password: '',
        confirmPassword: '',
        nombreCompleto: '',
        correo: '',
        documento: '',
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [success, setSuccess] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    // Validaciones en tiempo real
    const validateField = (name, value) => {
        const newErrors = { ...errors };

        switch (name) {
            case 'user':
                if (!value.trim()) {
                    newErrors.user = 'El usuario es obligatorio';
                } else if (value.length < 3) {
                    newErrors.user = 'El usuario debe tener al menos 3 caracteres';
                } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
                    newErrors.user = 'El usuario solo puede contener letras, números y guiones bajos';
                } else {
                    delete newErrors.user;
                }
                break;

            case 'nombreCompleto':
                if (!value.trim()) {
                    newErrors.nombreCompleto = 'El nombre completo es obligatorio';
                } else if (value.length < 2) {
                    newErrors.nombreCompleto = 'El nombre debe tener al menos 2 caracteres';
                } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
                    newErrors.nombreCompleto = 'El nombre solo puede contener letras y espacios';
                } else {
                    delete newErrors.nombreCompleto;
                }
                break;

            case 'correo':
                if (!value.trim()) {
                    newErrors.correo = 'El correo es obligatorio';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    newErrors.correo = 'Debe ser un correo válido';
                } else {
                    delete newErrors.correo;
                }
                break;

            case 'documento':
                if (!value.trim()) {
                    newErrors.documento = 'El documento es obligatorio';
                } else if (!/^\d{8,12}$/.test(value)) {
                    newErrors.documento = 'El documento debe tener entre 8 y 12 dígitos';
                } else {
                    delete newErrors.documento;
                }
                break;

            case 'password':
                if (!value) {
                    newErrors.password = 'La contraseña es obligatoria';
                } else if (value.length < 6) {
                    newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
                } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
                    newErrors.password = 'La contraseña debe contener al menos una mayúscula, una minúscula y un número';
                } else {
                    delete newErrors.password;
                }
                break;

            case 'confirmPassword':
                if (!value) {
                    newErrors.confirmPassword = 'Confirma tu contraseña';
                } else if (value !== formData.password) {
                    newErrors.confirmPassword = 'Las contraseñas no coinciden';
                } else {
                    delete newErrors.confirmPassword;
                }
                break;

            default:
                break;
        }

        setErrors(newErrors);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newFormData = {
            ...formData,
            [name]: value,
        };

        setFormData(newFormData);

        // Validar campo en tiempo real
        validateField(name, value);

        // Si se cambia la contraseña, revalidar confirmPassword
        if (name === 'password') {
            validateField('confirmPassword', formData.confirmPassword);
        }
    };

    const validateForm = () => {
        // Validar todos los campos
        Object.keys(formData).forEach(field => {
            validateField(field, formData[field]);
        });

        // Verificación inmediata
        const hasErrors = Object.keys(errors).length > 0;
        const allFieldsFilled = Object.values(formData).every(value => value.trim() !== '');
        return !hasErrors && allFieldsFilled;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        if (!validateForm()) {
            setErrors({ general: 'Por favor corrige los errores en el formulario' });
            return;
        }

        setLoading(true);

        try {
            // Preparar datos para el backend (sin confirmPassword)
            const { confirmPassword: _, ...userData } = formData;
            await register(userData);

            // Mostrar mensaje de éxito
            setSuccess(true);
            setErrors({});

            // Redirigir al login después de un breve delay para que el usuario vea el mensaje
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            console.error('Error de registro:', err);

            // Manejo de errores específicos del backend
            if (err.message) {
                if (err.message.includes('usuario')) {
                    setErrors({ general: 'El nombre de usuario ya está en uso' });
                } else if (err.message.includes('correo')) {
                    setErrors({ general: 'El correo electrónico ya está registrado' });
                } else if (err.message.includes('documento')) {
                    setErrors({ general: 'El número de documento ya está registrado' });
                } else {
                    setErrors({ general: err.message });
                }
            } else {
                setErrors({ general: 'Error al registrar usuario. Por favor, intente de nuevo.' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            {/* Nubes de fondo */}
            <div className="cloud cloud-1"></div>
            <div className="cloud cloud-2"></div>
            <div className="cloud cloud-3"></div>
            <div className="cloud cloud-4"></div>
            <div className="cloud cloud-5"></div>
            <div className="cloud cloud-6"></div>

            <div className="login-card register-card">
                <div className="login-header">
                    <div className="logo">
                        <i className="fas fa-church"></i>
                        <h1>SysAsistencia</h1>
                    </div>
                    <h2 className="login-title">Crear Cuenta</h2>
                    <p className="login-subtitle">Completa el formulario para registrarte</p>
                </div>

                {errors.general && <div className="login-error">{errors.general}</div>}

                {success && (
                    <div className="login-success">
                        <div className="success-icon">✅</div>
                        <div className="success-message">
                            <h3>¡Cuenta creada exitosamente!</h3>
                            <p>Tu cuenta ha sido registrada correctamente. Ahora puedes iniciar sesión con tus credenciales.</p>
                            <p className="redirect-message">Redirigiendo al login en unos segundos...</p>
                            <button
                                type="button"
                                className="go-to-login-btn"
                                onClick={() => navigate('/login')}
                            >
                                Ir al Login Ahora
                            </button>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form two-columns" style={{ opacity: success ? 0.6 : 1, pointerEvents: success ? 'none' : 'auto' }}>
                    <div className="form-group">
                        <label>Usuario *</label>
                        <div className="input-wrapper">
                            <span className="input-icon">👤</span>
                            <input
                                type="text"
                                name="user"
                                value={formData.user}
                                onChange={handleChange}
                                placeholder="Ingresa tu usuario"
                                className={errors.user ? 'error' : ''}
                            />
                        </div>
                        {errors.user && <span className="field-error">{errors.user}</span>}
                    </div>

                    <div className="form-group">
                        <label>Nombre Completo *</label>
                        <div className="input-wrapper">
                            <span className="input-icon">📝</span>
                            <input
                                type="text"
                                name="nombreCompleto"
                                value={formData.nombreCompleto}
                                onChange={handleChange}
                                placeholder="Ingresa tu nombre completo"
                                className={errors.nombreCompleto ? 'error' : ''}
                            />
                        </div>
                        {errors.nombreCompleto && <span className="field-error">{errors.nombreCompleto}</span>}
                    </div>

                    <div className="form-group">
                        <label>Correo Electrónico *</label>
                        <div className="input-wrapper">
                            <span className="input-icon">📧</span>
                            <input
                                type="email"
                                name="correo"
                                value={formData.correo}
                                onChange={handleChange}
                                placeholder="correo@ejemplo.com"
                                className={errors.correo ? 'error' : ''}
                            />
                        </div>
                        {errors.correo && <span className="field-error">{errors.correo}</span>}
                    </div>

                    <div className="form-group">
                        <label>Documento de Identidad *</label>
                        <div className="input-wrapper">
                            <span className="input-icon">🆔</span>
                            <input
                                type="text"
                                name="documento"
                                value={formData.documento}
                                onChange={handleChange}
                                placeholder="Ingresa tu DNI (8-12 dígitos)"
                                className={errors.documento ? 'error' : ''}
                                maxLength="12"
                            />
                        </div>
                        {errors.documento && <span className="field-error">{errors.documento}</span>}
                    </div>

                    <div className="form-group">
                        <label>Contraseña *</label>
                        <div className="input-wrapper">
                            <span className="input-icon">🔒</span>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Mínimo 6 caracteres"
                                className={errors.password ? 'error' : ''}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                        {errors.password && <span className="field-error">{errors.password}</span>}
                        <div className="password-requirements">
                            <small>Debe contener: mayúscula, minúscula y número</small>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Confirmar Contraseña *</label>
                        <div className="input-wrapper">
                            <span className="input-icon">🔒</span>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirma tu contraseña"
                                className={errors.confirmPassword ? 'error' : ''}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                        {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
                    </div>

                    {/* Contenedor del botón que ocupa ambas columnas y está centrado */}
                    <div className="form-group" style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center' }}>
                        <div className="button-container">
                            <button
                                type="submit"
                                className="login-button"
                                disabled={loading || success}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner"></span>
                                        Registrando...
                                    </>
                                ) : (
                                    "Registrarse"
                                )}
                            </button>
                        </div>
                    </div>
                </form>

                <p className="login-footer">
                    ¿Ya tienes cuenta? <a href="/login">Inicia sesión aquí</a>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;