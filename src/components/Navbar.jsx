import { useAuth } from '../hooks/useAuth';
import { FaUser, FaSignOutAlt, FaChurch } from 'react-icons/fa';

const Navbar = () => {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    return (
        <nav className="navbar">
            {/* Nubes animadas - Desactivadas temporalmente */}
            {/* <div className="cloud cloud-1"></div>
            <div className="cloud cloud-2"></div> */}

            <div className="navbar-brand">
                <div className="navbar-logo">
                    <FaChurch />
                    <span>SysAsistencia</span>
                </div>
            </div>

            <div className="navbar-menu">
                {user && (
                    <div className="navbar-user">
                        <div className="user-info">
                            <FaUser className="nav-icon" />
                            <span>{user.persona?.nombreCompleto || user.user}</span>
                        </div>
                        <button onClick={handleLogout} className="btn-logout">
                            <FaSignOutAlt />
                            <span>Cerrar Sesión</span>
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;





