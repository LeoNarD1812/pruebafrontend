import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    // Limpiar sesión al entrar a la página de login
    useEffect(() => {
        authService.logout();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!username || !password) {
            setError('Por favor completa todos los campos.');
            return;
        }
        setLoading(true);

        try {
            await login(username, password);
            navigate('/dashboard');
        } catch (err) {
            setError('Credenciales incorrectas. Por favor, intente de nuevo.');
            console.error('Error de login:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Bienvenido</h1>
                    <p>Ingresa tus credenciales para continuar</p>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Usuario</label>
                        <input
                            type="text"
                            placeholder="Ingresa tu usuario"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>Contraseña</label>
                        <input
                            type="password"
                            placeholder="********"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-input"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Ingresando...' : 'Ingresar'}
                    </button>
                </form>

                <p className="auth-footer">
                    ¿No tienes cuenta? <a href="/register">Regístrate aquí</a>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;