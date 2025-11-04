import { useAuth } from '../hooks/useAuth';
import { FaUser, FaSignOutAlt, FaChurch } from 'react-icons/fa';
import './components.css';

const Navbar = () => {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <FaChurch />
                <span>SysAsistencia</span>
            </div>

            <div className="navbar-menu">
                {user && (
                    <div className="navbar-user">
                        <FaUser />
                        <span>{user.persona?.nombreCompleto || user.user}</span>
                        <button onClick={handleLogout} className="btn btn-danger">
                            <FaSignOutAlt />
                            Cerrar Sesión
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;