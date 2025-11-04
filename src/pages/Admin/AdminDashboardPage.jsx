import React, { useState, useEffect } from 'react';
import { FaUsers, FaCalendarAlt, FaUserCheck, FaClipboardList, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import { dashboardService } from '../../services/dashboardService'; // Importamos el nuevo servicio

// (Asegúrate de tener un CSS para .spinner, puedes usar el de GruposPequenosPage o SesionesPage)
// .spinner { animation: spin 1s linear infinite; }
// @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    totalPersonas: 0,
    eventosActivos: 0,
    asistenciasHoy: 0,
    totalMatriculas: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dashboardService.getAdminStats();
        setStats(data);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar las estadísticas. Revise la conexión con la API.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Estado de Carga
  if (loading) {
    return (
        <div className="dashboard-page">
          <h1>Panel de Administración</h1>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', fontSize: '1.2rem', color: '#7f8c8d' }}>
            <FaSpinner style={{ animation: 'spin 1s linear infinite' }} size={40} />
            <p style={{ marginLeft: '20px' }}>Cargando estadísticas...</p>
          </div>
        </div>
    );
  }

  // Estado de Error
  if (error) {
    return (
        <div className="dashboard-page">
          <h1>Panel de Administración</h1>
          <div className="alert alert-danger" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '20px',
            borderRadius: '8px'
          }}>
            <FaExclamationTriangle size={30} />
            {error}
          </div>
        </div>
    );
  }

  // Estado Exitoso
  return (
      <div className="dashboard-page">
        <h1>Panel de Administración</h1>
        <div className="dashboard-stats">

          <div className="stat-card">
            <FaUsers size={40} style={{ color: '#3498db' }} />
            <h3>Total Personas</h3>
            <p>{stats.totalPersonas}</p>
          </div>

          <div className="stat-card">
            <FaCalendarAlt size={40} style={{ color: '#2ecc71' }} />
            <h3>Eventos Activos Hoy</h3>
            <p>{stats.eventosActivos}</p>
          </div>

          <div className="stat-card">
            <FaUserCheck size={40} style={{ color: '#f39c12' }} />
            <h3>Asistencias Hoy</h3>
            <p>{stats.asistenciasHoy}</p>
          </div>

          <div className="stat-card">
            <FaClipboardList size={40} style={{ color: '#e74c3c' }} />
            <h3>Total Matrículas</h3>
            <p>{stats.totalMatriculas}</p>
          </div>

        </div>
      </div>
  );
};

export default AdminDashboardPage;