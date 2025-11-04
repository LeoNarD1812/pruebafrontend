import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { dashboardService } from '../../services/dashboardService';
import { FaUserFriends, FaUserCheck, FaUsers, FaChartLine, FaSpinner } from 'react-icons/fa';

const LiderDashboardPage = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalGrupos: 0,
        totalParticipantes: 0,
        asistenciasRegistradas: 0,
        asistenciaPromedio: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            if (user?.personaId) {
                try {
                    setLoading(true);
                    const data = await dashboardService.getLiderStats(user.personaId);
                    setStats(data);
                } catch (error) {
                    console.error("Error en dashboard de líder", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchStats();
    }, [user]);

    if (loading) {
        return (
            <div className="dashboard-page" style={{ textAlign: 'center', paddingTop: '50px' }}>
                <FaSpinner className="spinner" size={40} />
                <p>Cargando dashboard...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <h1>Panel de Líder</h1>
            <div className="dashboard-stats">
                <div className="stat-card">
                    <FaUserFriends size={40} style={{ color: '#3498db' }} />
                    <h3>Mis Grupos</h3>
                    <p>{stats.totalGrupos}</p>
                </div>
                <div className="stat-card">
                    <FaUsers size={40} style={{ color: '#9b59b6' }} />
                    <h3>Participantes</h3>
                    <p>{stats.totalParticipantes}</p>
                </div>
                <div className="stat-card">
                    <FaUserCheck size={40} style={{ color: '#2ecc71' }} />
                    <h3>Mis Asistencias</h3>
                    <p>{stats.asistenciasRegistradas}</p>
                </div>
                <div className="stat-card">
                    <FaChartLine size={40} style={{ color: '#f39c12' }} />
                    <h3>Asistencia Promedio</h3>
                    <p>{stats.asistenciaPromedio}%</p>
                </div>
            </div>
        </div>
    );
};

export default LiderDashboardPage;