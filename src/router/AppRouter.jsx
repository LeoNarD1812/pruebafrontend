import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { getRoleFromToken } from '../utils/jwtHelper';
import MainLayout from '../layouts/MainLayout';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import AdminDashboardPage from '../pages/Admin/AdminDashboardPage';
import ImportarExcelPage from '../pages/Admin/ImportarExcelPage';
import Matriculas from '../pages/Admin/Matriculas';
import SuperAdminDashboardPage from '../pages/SuperAdmin/SuperAdminDashboardPage';
import LiderDashboardPage from '../pages/Lider/LiderDashboardPage';
import IntegranteDashboardPage from '../pages/Integrante/IntegranteDashboardPage';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Cargando...</div>;
  }
  
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Cargando...</div>;
  }
  
  // Si está autenticado, redirigir usando NavigateToDashboard
  if (isAuthenticated()) {
    return <NavigateToDashboard />;
  }
  
  return children;
};

const NavigateToDashboard = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // Obtener el rol del token JWT
  const token = authService.getToken();
  const role = token ? getRoleFromToken(token) : null;
  
  // Redirigir según el rol del usuario
  switch (role) {
    case 'ADMIN':
      return <Navigate to="/dashboard/admin" />;
    case 'LIDER':
      return <Navigate to="/dashboard/lider" />;
    case 'INTEGRANTE':
      return <Navigate to="/dashboard/integrante" />;
    case 'SUPERADMIN':
      return <Navigate to="/superadmin" />;
    default:
      // Por defecto redirigir a dashboard de integrante
      return <Navigate to="/dashboard/integrante" />;
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

        {/* Rutas protegidas */}
        <Route
          path="/"
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
          
          {/* Rutas del Admin */}
          <Route path="/admin/importar-excel" element={<ImportarExcelPage />} />
          <Route path="/matriculas/importar" element={<ImportarExcelPage />} />
          <Route path="/admin/matriculas" element={<Matriculas />} />
          <Route path="/matriculas" element={<Matriculas />} />
          
          {/* Ruta /dashboard redirige según el rol */}
          <Route path="/dashboard" element={<NavigateToDashboard />} />
        </Route>

        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
