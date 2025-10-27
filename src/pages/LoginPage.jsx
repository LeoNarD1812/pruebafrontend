import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

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
    <div className="login-container">
      {/* Nubes de fondo */}
      <div className="cloud cloud-1"></div>
      <div className="cloud cloud-2"></div>
      <div className="cloud cloud-3"></div>
      <div className="cloud cloud-4"></div>
      <div className="cloud cloud-5"></div>
      <div className="cloud cloud-6"></div>
      
      <div className="login-card">
        <div className="login-header">
          <div className="logo">
            <i className="fas fa-church"></i>
            <h1>Asistencia Escuela Sabatica</h1>
          </div>
          <h2 className="login-title">Bienvenido!</h2>
          <p className="login-subtitle">Ingresa tus credenciales para continuar</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Usuario</label>
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input
                type="text"
                placeholder="Ingresa tu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Ingresando...
              </>
            ) : (
              "Ingresar"
            )}
          </button>
        </form>

        <p className="login-footer">
          ¿No tienes cuenta? <a href="/register">Regístrate aquí</a>
        </p>
        
        <div className="bible-verse">
          <p>"Pero los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas; correrán, y no se cansarán; caminarán, y no se fatigarán."</p>
          <p>Isaías 40:31</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
