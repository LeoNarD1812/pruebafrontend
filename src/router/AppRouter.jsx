import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { getRoleFromToken } from '../utils/jwtHelper';
import MainLayout from '../layouts/MainLayout';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import AdminDashboardPage from '../pages/Admin/AdminDashboardPage';
import ImportarExcelPage from '../pages/Admin/ImportarExcelPage';
import SuperAdminDashboardPage from '../pages/SuperAdmin/SuperAdminDashboardPage';
import LiderDashboardPage from '../pages/Lider/LiderDashboardPage';
import IntegranteDashboardPage from '../pages/Integrante/IntegranteDashboardPage';

// Importar las nuevas páginas de Eventos (AHORA DESDE /Admin)
import EventosGeneralesPage from '../pages/Admin/EventosGeneralesPage';
import SesionesPage from '../pages/Admin/SesionesPage';
import GruposGeneralesPage from '../pages/Admin/GruposGeneralesPage';
import GruposPequenosPage from '../pages/Admin/GruposPequenosPage';
import Matriculas from "../pages/Admin/Matriculas.jsx";
import Sedes from '../pages/Admin/Sedes.jsx';
import Facultades from '../pages/Admin/Facultades.jsx';
import Programas from '../pages/Admin/Programas.jsx';
import ReportesPage from '../pages/Admin/ReportesPage';
import RegistrarAsistenciaPage from '../pages/Lider/RegistrarAsistenciaPage';
import EscanearQRPage from '../pages/Integrante/EscanearQRPage';
import MisGruposPage from '../pages/Lider/MisGruposPage';
import VerAsistenciasPage from '../pages/Lider/VerAsistenciasPage';
import MisAsistenciasPage from '../pages/lider/MisAsistenciasPage';

const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '18px'
            }}>
                Cargando...
            </div>
        );
    }

    // Verificar autenticación (ya incluye validación de token válido)
    if (!isAuthenticated()) {
        // Limpiar cualquier dato residual
        authService.logout();
        return <Navigate to="/login" replace />;
    }

    return children;
};

const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '18px'
            }}>
                Cargando...
            </div>
        );
    }

    // Si está autenticado, redirigir usando NavigateToDashboard
    if (isAuthenticated()) {
        return <NavigateToDashboard />;
    }

    return children;
};

const NavigateToDashboard = () => {
    // Obtener el rol del token JWT directamente
    const token = authService.getToken();

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    const role = getRoleFromToken(token);

    // Redirigir según el rol del usuario
    switch (role) {
        case 'ADMIN':
            return <Navigate to="/dashboard/admin" replace />;
        case 'LIDER':
            return <Navigate to="/dashboard/lider" replace />;
        case 'INTEGRANTE':
            return <Navigate to="/dashboard/integrante" replace />;
        case 'SUPERADMIN':
            return <Navigate to="/superadmin" replace />;
        default:
            // Por defecto redirigir a dashboard de integrante
            return <Navigate to="/dashboard/integrante" replace />;
    }
};

const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Rutas públicas */}
                <Route
                    path="/login"
                    element={
                        <PublicRoute>
                            <LoginPage />
                        </PublicRoute>
                    }
                />
                <Route
                    path="/register"
                    element={
                        <PublicRoute>
                            <RegisterPage />
                        </PublicRoute>
                    }
                />

                {/* Ruta raíz protegida que redirige al dashboard */}
                <Route
                    path="/"
                    element={
                        <PrivateRoute>
                            <NavigateToDashboard />
                        </PrivateRoute>
                    }
                />

                {/* Rutas protegidas con layout */}
                <Route
                    element={
                        <PrivateRoute>
                            <MainLayout />
                        </PrivateRoute>
                    }
                >
                    {/* Dashboards por rol */}
                    <Route path="/dashboard/admin" element={<AdminDashboardPage />} />
                    <Route path="/dashboard/lider" element={<LiderDashboardPage />} />
                    <Route path="/dashboard/integrante" element={<IntegranteDashboardPage />} />
                    <Route path="/superadmin" element={<SuperAdminDashboardPage />} />

                    {/* Rutas del Admin (Gestión Académica) */}
                    <Route path="/matriculas/importar" element={<ImportarExcelPage />} />
                    <Route path="/matriculas" element={<Matriculas />} />
                    <Route path="/sedes" element={<Sedes />} />
                    <Route path="/facultades" element={<Facultades />} />
                    <Route path="/programas" element={<Programas />} />
                    <Route path="/eventos-generales" element={<EventosGeneralesPage />} />
                    <Route path="/eventos-especificos" element={<SesionesPage />} />
                    <Route path="/grupos-generales" element={<GruposGeneralesPage />} />
                    <Route path="/grupos-pequenos" element={<GruposPequenosPage />} />
                    <Route path="/reportes" element={<ReportesPage />} />
                    <Route path="/asistencias/reporte" element={<ReportesPage />} />

                    <Route path="/grupos-pequenos/lider" element={<MisGruposPage />} />
                    <Route path="/asistencias" element={<VerAsistenciasPage />} />
                    <Route path="/asistencias/persona" element={<MisAsistenciasPage />} />

                    <Route path="/asistencias/registrar" element={<RegistrarAsistenciaPage />} />

                    <Route path="/asistencias/escanear" element={<EscanearQRPage />} />

                    {/* Ruta /dashboard redirige según el rol */}
                    <Route path="/dashboard" element={<NavigateToDashboard />} />
                </Route>

                {/* Ruta por defecto */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;