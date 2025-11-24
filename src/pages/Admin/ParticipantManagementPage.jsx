import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';

const ParticipantManagementPage = () => {
    const [participants, setParticipants] = useState([]);
    const [filteredParticipants, setFilteredParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para filtros
    const [filters, setFilters] = useState({
        searchTerm: '',
        estado: '',
        tipoPersona: '',
        periodo: '' // Nuevo estado para el filtro de periodo
    });

    useEffect(() => {
        fetchParticipants();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [participants, filters]);

    const fetchParticipants = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await userService.getIntegrantes();
            setParticipants(data);
        } catch (err) {
            console.error("Error fetching participants:", err);
            setError("Error al cargar los participantes: " + (err.response?.data?.message || err.message || ""));
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value
        }));
    };

    const applyFilters = () => {
        let filtered = [...participants];

        // Filtro por término de búsqueda
        if (filters.searchTerm) {
            const searchLower = filters.searchTerm.toLowerCase();
            filtered = filtered.filter(participant =>
                participant.nombreCompleto?.toLowerCase().includes(searchLower) ||
                participant.documento?.toLowerCase().includes(searchLower) ||
                participant.correo?.toLowerCase().includes(searchLower) ||
                participant.tipoPersona?.toLowerCase().includes(searchLower) ||
                participant.periodo?.toLowerCase().includes(searchLower) // Búsqueda también por periodo
            );
        }

        // Filtro por estado
        if (filters.estado) {
            filtered = filtered.filter(participant => participant.estado === filters.estado);
        }

        // Filtro por tipo de persona
        if (filters.tipoPersona) {
            filtered = filtered.filter(participant => participant.tipoPersona === filters.tipoPersona);
        }

        // Filtro por periodo
        if (filters.periodo) {
            filtered = filtered.filter(participant => participant.periodo === filters.periodo);
        }

        setFilteredParticipants(filtered);
    };

    const clearFilters = () => {
        setFilters({
            searchTerm: '',
            estado: '',
            tipoPersona: '',
            periodo: ''
        });
    };

    // Obtener valores únicos para los filtros
    const uniqueEstados = [...new Set(participants.map(participant => participant.estado))].filter(Boolean);
    const uniqueTiposPersona = [...new Set(participants.map(participant => participant.tipoPersona))].filter(Boolean);
    const uniquePeriodos = [...new Set(participants.map(participant => participant.periodo))].filter(Boolean).sort().reverse(); // Periodos ordenados descendente

    const hasActiveFilters = filters.searchTerm || filters.estado || filters.tipoPersona || filters.periodo;

    if (loading) {
        return (
            <div className="page-container">
                <div className="loading-container">
                    <p>Cargando participantes...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-container">
                <div className="alert alert-danger">
                    <p>Error: {error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            {/* Cabecera de la página */}
            <div className="page-header">
                <div className="header-title">
                    <div className="page-icon">👥</div>
                    <div>
                        <h1>Gestión de Participantes</h1>
                        <p>Administra los integrantes del sistema</p>
                    </div>
                </div>
                <div className="header-actions">
                    <div className="badge">{filteredParticipants.length} participantes</div>
                </div>
            </div>

            {/* Tarjetas de estadísticas */}
            <div className="stats-cards">
                <div className="stat-card total">
                    <div className="stat-icon">👥</div>
                    <div className="stat-info">
                        <h3>{participants.length}</h3>
                        <p>Total de Participantes</p>
                    </div>
                </div>
                <div className="stat-card estudiantes">
                    <div className="stat-icon">🎓</div>
                    <div className="stat-info">
                        <h3>{participants.filter(p => p.tipoPersona === 'ESTUDIANTE').length}</h3>
                        <p>Estudiantes</p>
                    </div>
                </div>
                <div className="stat-card invitados">
                    <div className="stat-icon">👋</div>
                    <div className="stat-info">
                        <h3>{participants.filter(p => p.tipoPersona === 'INVITADO').length}</h3>
                        <p>Invitados</p>
                    </div>
                </div>
            </div>

            {/* Sección de Filtros y Búsqueda */}
            <div className="card">
                <div className="filtros-section">
                    <div className="filtros-header">
                        <h3>
                            <span className="page-icon">🔍</span>
                            Filtros y Búsqueda
                        </h3>
                        <div className="filtros-actions">
                            {hasActiveFilters && (
                                <button onClick={clearFilters} className="btn btn-secondary btn-sm">
                                    Limpiar Filtros
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Barra de búsqueda */}
                    <div className="search-section">
                        <div className="search-box">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                name="searchTerm"
                                value={filters.searchTerm}
                                onChange={handleFilterChange}
                                placeholder="Buscar por nombre, documento, periodo..."
                                className="search-input"
                            />
                        </div>
                        <div className="badge">
                            {filteredParticipants.length} de {participants.length} participantes
                        </div>
                    </div>

                    {/* Filtros avanzados */}
                    <div className="filtros-grid">
                        <div className="form-group">
                            <label htmlFor="filter-estado" className="form-label">Estado</label>
                            <select
                                name="estado"
                                id="filter-estado"
                                value={filters.estado}
                                onChange={handleFilterChange}
                                className="form-select"
                            >
                                <option value="">Todos los estados</option>
                                {uniqueEstados.map(estado => (
                                    <option key={estado} value={estado}>{estado}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="filter-tipoPersona" className="form-label">Tipo de Persona</label>
                            <select
                                name="tipoPersona"
                                id="filter-tipoPersona"
                                value={filters.tipoPersona}
                                onChange={handleFilterChange}
                                className="form-select"
                            >
                                <option value="">Todos los tipos</option>
                                {uniqueTiposPersona.map(tipo => (
                                    <option key={tipo} value={tipo}>{tipo}</option>
                                ))}
                            </select>
                        </div>

                        {/* Nuevo filtro de Periodo */}
                        <div className="form-group">
                            <label htmlFor="filter-periodo" className="form-label">Periodo</label>
                            <select
                                name="periodo"
                                id="filter-periodo"
                                value={filters.periodo}
                                onChange={handleFilterChange}
                                className="form-select"
                            >
                                <option value="">Todos los periodos</option>
                                {uniquePeriodos.map(per => (
                                    <option key={per} value={per}>{per}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabla de Participantes */}
            <div className="card">
                <div className="card-header">
                    <h2>Lista de Participantes</h2>
                    <div className="badge">{filteredParticipants.length} participantes</div>
                </div>
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                        <tr>
                            <th className="col-id">ID</th>
                            <th className="col-name">Nombre Completo</th>
                            <th className="col-document">Documento</th>
                            <th className="col-name">Correo</th>
                            <th className="col-type">Periodo</th> {/* Nueva Columna */}
                            <th className="col-type">Tipo de Persona</th>
                            <th className="col-type">Estado</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredParticipants.map(participant => (
                            <tr key={participant.idUsuario}>
                                <td>{participant.idUsuario}</td>
                                <td>
                                    <div className="info-item">
                                        <div className="info-text">
                                            <div className="info-value">{participant.nombreCompleto}</div>
                                            {participant.codigoEstudiante && (
                                                <small className="text-muted" style={{ fontSize: '0.8em', color: '#666' }}>
                                                    Cód: {participant.codigoEstudiante}
                                                </small>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="info-item">
                                        <div className="info-text">
                                            <div className="info-value">{participant.documento}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="info-item">
                                        <div className="info-text">
                                            <div className="info-value">{participant.correo}</div>
                                        </div>
                                    </div>
                                </td>
                                {/* Nueva celda de Periodo */}
                                <td>
                                    {participant.periodo ? (
                                        <span className="badge" style={{ backgroundColor: '#e3f2fd', color: '#0d47a1' }}>
                                            {participant.periodo}
                                        </span>
                                    ) : (
                                        <span className="text-muted">-</span>
                                    )}
                                </td>
                                <td>
                                        <span className={`badge ${
                                            participant.tipoPersona === 'ESTUDIANTE'
                                                ? 'capacity-success'
                                                : 'capacity-warning'
                                        }`}>
                                            {participant.tipoPersona}
                                        </span>
                                </td>
                                <td>
                                        <span className={`badge ${
                                            participant.estado === 'ACTIVO'
                                                ? 'capacity-success'
                                                : 'capacity-danger'
                                        }`}>
                                            {participant.estado}
                                        </span>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    {filteredParticipants.length === 0 && (
                        <div className="empty-state">
                            {hasActiveFilters ? (
                                <p>No se encontraron participantes con los filtros aplicados</p>
                            ) : (
                                <p>No hay participantes registrados</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ParticipantManagementPage;