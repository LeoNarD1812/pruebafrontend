import React, { useState, useEffect } from 'react';
import { FaClipboardList, FaSearch, FaFilter, FaSync, FaUsers, FaUniversity, FaGraduationCap, FaUserTag, FaChevronLeft, FaChevronRight, FaCalendarAlt } from 'react-icons/fa';
import { importService } from '../../services/importService';
import { matriculasService } from '../../services/matriculasService';
import { periodosService } from '../../services/periodosService';
import './admin-global.css';

const Matriculas = () => {
    const [matriculas, setMatriculas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtros, setFiltros] = useState({
        sedeId: '',
        facultadId: '',
        programaId: '',
        periodoId: '',
        tipoPersona: '',
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [sedes, setSedes] = useState([]);
    const [facultades, setFacultades] = useState([]);
    const [programas, setProgramas] = useState([]);
    const [periodos, setPeriodos] = useState([]);

    // Estados para paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(25);

    useEffect(() => {
        cargarDatosIniciales();
    }, []);

    const cargarDatosIniciales = async () => {
        try {
            setLoading(true);
            const [sedesData, periodosData] = await Promise.all([
                importService.getSedes(),
                periodosService.getAll()
            ]);
            setSedes(sedesData || []);
            setPeriodos(periodosData.data || []);
            await cargarMatriculas();
        } catch (error) {
            console.error('Error cargando datos iniciales:', error);
            alert('Error al cargar los datos iniciales');
        } finally {
            setLoading(false);
        }
    };

    const cargarFacultades = async (sedeId) => {
        try {
            const facultadesData = await importService.getFacultades(sedeId);
            setFacultades(facultadesData || []);
        } catch (error) {
            console.error('Error cargando facultades:', error);
        }
    };

    const cargarProgramas = async (facultadId) => {
        try {
            const programasData = await importService.getProgramas(facultadId);
            setProgramas(programasData || []);
        } catch (error) {
            console.error('Error cargando programas:', error);
        }
    };

    const cargarMatriculas = async () => {
        try {
            setLoading(true);
            const response = await matriculasService.getAll();
            setMatriculas(response.data || []);
            setCurrentPage(1); // Resetear a primera página al cargar nuevos datos
        } catch (error) {
            console.error('Error cargando matrículas:', error);
            alert('Error al cargar las matrículas');
        } finally {
            setLoading(false);
        }
    };

    const aplicarFiltros = async () => {
        try {
            setLoading(true);

            // Si hay filtros activos, usar el endpoint de filtros
            if (filtros.sedeId || filtros.facultadId || filtros.programaId || filtros.periodoId || filtros.tipoPersona) {
                const response = await matriculasService.getByFiltros(filtros);
                setMatriculas(response.data || []);
            } else {
                // Si no hay filtros, cargar todas
                await cargarMatriculas();
            }
            setCurrentPage(1); // Resetear a primera página al aplicar filtros
        } catch (error) {
            console.error('Error aplicando filtros:', error);
            alert('Error al aplicar los filtros');
        } finally {
            setLoading(false);
        }
    };

    const limpiarFiltros = () => {
        setFiltros({
            sedeId: '',
            facultadId: '',
            programaId: '',
            periodoId: '',
            tipoPersona: '',
        });
        setSearchTerm('');
        setCurrentPage(1); // Resetear a primera página al limpiar filtros
        cargarMatriculas();
    };

    const handleFiltroChange = async (e) => {
        const { name, value } = e.target;
        const nuevosFiltros = {
            ...filtros,
            [name]: value
        };

        setFiltros(nuevosFiltros);

        // Cargar datos dependientes
        if (name === 'sedeId' && value) {
            await cargarFacultades(value);
            setFiltros(prev => ({ ...prev, facultadId: '', programaId: '' }));
        } else if (name === 'facultadId' && value) {
            await cargarProgramas(value);
            setFiltros(prev => ({ ...prev, programaId: '' }));
        } else if (name === 'sedeId' && !value) {
            setFacultades([]);
            setProgramas([]);
        } else if (name === 'facultadId' && !value) {
            setProgramas([]);
        }
    };

    // Filtrar matrículas por término de búsqueda
    const matriculasFiltradas = (matriculas || []).filter(matricula =>
        matricula.nombreCompleto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        matricula.codigoEstudiante?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        matricula.documento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        matricula.sede?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        matricula.facultad?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        matricula.programa?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Lógica de paginación
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = matriculasFiltradas.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(matriculasFiltradas.length / itemsPerPage);

    // Cambiar página
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Página anterior
    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Página siguiente
    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    // Generar números de página para mostrar
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            // Mostrar todas las páginas si son pocas
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            // Mostrar páginas con elipsis
            if (currentPage <= 3) {
                pageNumbers.push(1, 2, 3, 4, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pageNumbers.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pageNumbers.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }

        return pageNumbers;
    };

    // Estadísticas
    const totalMatriculas = matriculas.length;
    const estudiantes = (matriculas || []).filter(m => m.tipoPersona === 'ESTUDIANTE').length;
    const invitados = (matriculas || []).filter(m => m.tipoPersona === 'INVITADO').length;

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header">
                <div className="header-title">
                    <FaClipboardList className="page-icon" />
                    <div>
                        <h1>Gestión de Matrículas</h1>
                        <p>Consulta y gestiona las matrículas del sistema</p>
                    </div>
                </div>

                <div className="header-actions">
                    <button
                        onClick={cargarMatriculas}
                        className="btn btn-secondary"
                        disabled={loading}
                    >
                        <FaSync /> {loading ? 'Actualizando...' : 'Actualizar'}
                    </button>
                </div>
            </div>

            {/* Tarjetas de Estadísticas */}
            <div className="stats-cards">
                <div className="stat-card total">
                    <div className="stat-icon">
                        <FaUsers />
                    </div>
                    <div className="stat-info">
                        <h3>{totalMatriculas}</h3>
                        <p>Total Matrículas</p>
                    </div>
                </div>

                <div className="stat-card estudiantes">
                    <div className="stat-icon">
                        <FaGraduationCap />
                    </div>
                    <div className="stat-info">
                        <h3>{estudiantes}</h3>
                        <p>Estudiantes</p>
                    </div>
                </div>

                <div className="stat-card invitados">
                    <div className="stat-icon">
                        <FaUserTag />
                    </div>
                    <div className="stat-info">
                        <h3>{invitados}</h3>
                        <p>Invitados</p>
                    </div>
                </div>
            </div>

            {/* Card Principal */}
            <div className="card">
                <div className="card-header">
                    <h2>Filtros y Búsqueda</h2>
                </div>

                <div className="filtros-section">
                    <div className="filtros-grid">
                        <div className="form-group">
                            <label><FaUniversity /> Sede</label>
                            <select
                                name="sedeId"
                                value={filtros.sedeId}
                                onChange={handleFiltroChange}
                                className="form-select"
                                disabled={loading}
                            >
                                <option value="">Todas las Sedes</option>
                                {(sedes || []).map((sede) => (
                                    <option key={sede.idSede} value={sede.idSede}>
                                        {sede.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label><FaUniversity /> Facultad</label>
                            <select
                                name="facultadId"
                                value={filtros.facultadId}
                                onChange={handleFiltroChange}
                                className="form-select"
                                disabled={loading || !filtros.sedeId}
                            >
                                <option value="">Todas las Facultades</option>
                                {(facultades || []).map((facultad) => (
                                    <option key={facultad.idFacultad} value={facultad.idFacultad}>
                                        {facultad.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label><FaGraduationCap /> Programa</label>
                            <select
                                name="programaId"
                                value={filtros.programaId}
                                onChange={handleFiltroChange}
                                className="form-select"
                                disabled={loading || !filtros.facultadId}
                            >
                                <option value="">Todos los Programas</option>
                                {(programas || []).map((programa) => (
                                    <option key={programa.idPrograma} value={programa.idPrograma}>
                                        {programa.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label><FaCalendarAlt /> Periodo</label>
                            <select
                                name="periodoId"
                                value={filtros.periodoId}
                                onChange={handleFiltroChange}
                                className="form-select"
                                disabled={loading}
                            >
                                <option value="">Todos los Periodos</option>
                                {(periodos || []).map((periodo) => (
                                    <option key={periodo.idPeriodo} value={periodo.idPeriodo}>
                                        {periodo.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label><FaUserTag /> Tipo Persona</label>
                            <select
                                name="tipoPersona"
                                value={filtros.tipoPersona}
                                onChange={handleFiltroChange}
                                className="form-select"
                                disabled={loading}
                            >
                                <option value="">Todos los Tipos</option>
                                <option value="ESTUDIANTE">Estudiante</option>
                                <option value="INVITADO">Invitado</option>
                            </select>
                        </div>
                    </div>
                    <div className="filtros-actions">
                        <button onClick={aplicarFiltros} className="btn btn-primary" disabled={loading}>
                            <FaFilter /> Aplicar Filtros
                        </button>
                        <button onClick={limpiarFiltros} className="btn btn-secondary" disabled={loading}>
                            Limpiar
                        </button>
                    </div>
                </div>

                <div className="search-section">
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, código, documento, sede, facultad o programa..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            disabled={loading}
                            className="form-input"
                        />
                    </div>
                </div>
            </div>

            {/* Tabla de Matrículas */}
            <div className="card">
                <div className="card-header">
                    <h2>Lista de Matrículas</h2>
                </div>

                <div className="table-container">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Cargando matrículas...</p>
                        </div>
                    ) : (
                        <>
                            {matriculasFiltradas.length === 0 ? (
                                <div className="empty-state">
                                    <FaClipboardList className="empty-icon" />
                                    <h3>No se encontraron matrículas</h3>
                                    <p>
                                        {matriculas.length === 0
                                            ? 'No hay matrículas registradas en el sistema.'
                                            : 'No hay resultados que coincidan con tu búsqueda o filtros.'
                                        }
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <table className="data-table">
                                        <thead>
                                        <tr>
                                            <th>Código</th>
                                            <th>Nombre Completo</th>
                                            <th>Documento</th>
                                            <th>Sede</th>
                                            <th>Facultad</th>
                                            <th>Programa</th>
                                            <th>Periodo</th>
                                            <th>Tipo</th>
                                            <th>Estado</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {currentItems.map((matricula) => (
                                            <tr key={matricula.idMatricula}>
                                                <td>{matricula.codigoEstudiante}</td>
                                                <td>{matricula.nombreCompleto}</td>
                                                <td>{matricula.documento}</td>
                                                <td>{matricula.sedeName || '-'}</td>
                                                <td>{matricula.facultadName || '-'}</td>
                                                <td>{matricula.programaName || '-'}</td>
                                                <td>{matricula.periodoNombre || '-'}</td>
                                                <td>
                                                    <span className={`badge ${matricula.tipoPersona?.toLowerCase()}`}>
                                                        {matricula.tipoPersona}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${matricula.estado?.toLowerCase() || 'activo'}`}>
                                                        {matricula.estado || 'ACTIVO'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>

                                    {/* Paginación */}
                                    {totalPages > 1 && (
                                        <div className="pagination-container">
                                            <div className="pagination-info">
                                                Página {currentPage} de {totalPages}
                                                ({matriculasFiltradas.length} registros totales)
                                            </div>
                                            <div className="pagination-controls">
                                                <button
                                                    onClick={goToPreviousPage}
                                                    disabled={currentPage === 1}
                                                    className="pagination-btn"
                                                >
                                                    <FaChevronLeft />
                                                </button>

                                                {getPageNumbers().map((pageNumber, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => typeof pageNumber === 'number' ? paginate(pageNumber) : null}
                                                        className={`pagination-btn ${currentPage === pageNumber ? 'active' : ''} ${typeof pageNumber !== 'number' ? 'disabled' : ''}`}
                                                        disabled={typeof pageNumber !== 'number'}
                                                    >
                                                        {pageNumber}
                                                    </button>
                                                ))}

                                                <button
                                                    onClick={goToNextPage}
                                                    disabled={currentPage === totalPages}
                                                    className="pagination-btn"
                                                >
                                                    <FaChevronRight />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Matriculas;