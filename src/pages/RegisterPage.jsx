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

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        setLoading(true);

        try {
            const { confirmPassword, ...userData } = formData;
            await register(userData);
            navigate('/login');
        } catch (err) {
            setError(err.message || 'Error al registrar usuario. Por favor, intente de nuevo.');
            console.error('Error de registro:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Crear Cuenta</h1>
                    <p>Completa el formulario para registrarte</p>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Usuario</label>
                        <input
                            type="text"
                            name="user"
                            value={formData.user}
                            onChange={handleChange}
                            placeholder="Ingresa tu usuario"
                            required
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label>Nombre Completo</label>
                        <input
                            type="text"
                            name="nombreCompleto"
                            value={formData.nombreCompleto}
                            onChange={handleChange}
                            placeholder="Ingresa tu nombre completo"
                            required
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label>Correo Electrónico</label>
                        <input
                            type="email"
                            name="correo"
                            value={formData.correo}
                            onChange={handleChange}
                            placeholder="correo@ejemplo.com"
                            required
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label>Documento de Identidad</label>
                        <input
                            type="text"
                            name="documento"
                            value={formData.documento}
                            onChange={handleChange}
                            placeholder="Ingresa tu DNI"
                            required
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label>Contraseña</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Mínimo 6 caracteres"
                            required
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label>Confirmar Contraseña</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirma tu contraseña"
                            required
                            className="form-input"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Registrando...' : 'Registrarse'}
                    </button>
                </form>

                <p className="auth-footer">
                    ¿Ya tienes cuenta? <a href="/login">Inicia sesión aquí</a>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;