import React, { useState, useEffect } from 'react';
import { FaDownload, FaUpload, FaFileExcel, FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaFileExport, FaFilter, FaCalendarAlt } from 'react-icons/fa';
import { importService } from '../../services/importService';
import { periodosService } from '../../services/periodosService';
import './admin-global.css';

const ImportarExcelPage = () => {
    const [sedes, setSedes] = useState([]);
    const [facultades, setFacultades] = useState([]);
    const [programas, setProgramas] = useState([]);
    const [periodos, setPeriodos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const [showFiltrosExport, setShowFiltrosExport] = useState(false);
    const [filtros, setFiltros] = useState({
        sedeId: '',
        facultadId: '',
        programaId: '',
        periodoId: '',
        tipoPersona: '',
    });
    const [filtrosExport, setFiltrosExport] = useState({
        sedeId: '',
        facultadId: '',
        programaId: '',
        periodoId: '',
        tipoPersona: '',
    });
    const [importResults, setImportResults] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        loadCatalogs();
    }, []);

    // Cargar catálogos dependientes para importación
    useEffect(() => {
        if (filtros.sedeId) {
            loadFacultades(filtros.sedeId);
        } else {
            setFacultades([]);
            setProgramas([]);
            setFiltros(prev => ({ ...prev, facultadId: '', programaId: '' }));
        }
    }, [filtros.sedeId]);

    useEffect(() => {
        if (filtros.facultadId) {
            loadProgramas(filtros.facultadId);
        } else {
            setProgramas([]);
            setFiltros(prev => ({ ...prev, programaId: '' }));
        }
    }, [filtros.facultadId]);

    // Cargar catálogos dependientes para exportación
    useEffect(() => {
        if (filtrosExport.sedeId) {
            loadFacultadesExport(filtrosExport.sedeId);
        } else {
            setFiltrosExport(prev => ({ ...prev, facultadId: '', programaId: '' }));
        }
    }, [filtrosExport.sedeId]);

    useEffect(() => {
        if (filtrosExport.facultadId) {
            loadProgramasExport(filtrosExport.facultadId);
        } else {
            setFiltrosExport(prev => ({ ...prev, programaId: '' }));
        }
    }, [filtrosExport.facultadId]);

    const loadCatalogs = async () => {
        try {
            const [sedesData, periodosData] = await Promise.all([
                importService.getSedes(),
                periodosService.getAll()
            ]);
            setSedes(sedesData);
            setPeriodos(periodosData.data);
        } catch (error) {
            console.error('Error cargando catálogos:', error);
        }
    };

    const loadFacultades = async (sedeId) => {
        try {
            const facultadesData = await importService.getFacultades(sedeId);
            setFacultades(facultadesData);
        } catch (error) {
            console.error('Error cargando facultades:', error);
        }
    };

    const loadProgramas = async (facultadId) => {
        try {
            const programasData = await importService.getProgramas(facultadId);
            setProgramas(programasData);
        } catch (error) {
            console.error('Error cargando programas:', error);
        }
    };

    const loadFacultadesExport = async (sedeId) => {
        try {
            const facultadesData = await importService.getFacultades(sedeId);
            // No actualizamos el estado de facultades principales para no interferir con importación
            return facultadesData;
        } catch (error) {
            console.error('Error cargando facultades para exportación:', error);
            return [];
        }
    };

    const loadProgramasExport = async (facultadId) => {
        try {
            const programasData = await importService.getProgramas(facultadId);
            // No actualizamos el estado de programas principales para no interferir con importación
            return programasData;
        } catch (error) {
            console.error('Error cargando programas para exportación:', error);
            return [];
        }
    };

    const handleFiltroChange = (e) => {
        setFiltros({
            ...filtros,
            [e.target.name]: e.target.value,
        });
    };

    const handleFiltroExportChange = (e) => {
        setFiltrosExport({
            ...filtrosExport,
            [e.target.name]: e.target.value,
        });
    };

    const handleDescargarPlantilla = async () => {
        setLoading(true);
        try {
            await importService.downloadTemplate();
        } catch (error) {
            console.error('Error descargando plantilla:', error);
            alert('Error al descargar la plantilla. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const handleAbrirFiltrosExport = () => {
        setShowFiltrosExport(true);
        // Copiar los filtros actuales a los filtros de exportación
        setFiltrosExport({ ...filtros });
    };

    const handleCerrarFiltrosExport = () => {
        setShowFiltrosExport(false);
        setFiltrosExport({
            sedeId: '',
            facultadId: '',
            programaId: '',
            periodoId: '',
            tipoPersona: '',
        });
    };

    const handleExportarDatos = async () => {
        setExportLoading(true);
        try {
            await importService.exportData(filtrosExport);
            handleCerrarFiltrosExport();
        } catch (error) {
            console.error('Error exportando datos:', error);
            alert('Error al exportar los datos. Intenta de nuevo.');
        } finally {
            setExportLoading(false);
        }
    };

    const handleExportarSinFiltros = async () => {
        setExportLoading(true);
        try {
            await importService.exportData({});
        } catch (error) {
            console.error('Error exportando datos:', error);
            alert('Error al exportar los datos. Intenta de nuevo.');
        } finally {
            setExportLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validar tipo de archivo
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ];

        if (!validTypes.includes(file.type)) {
            alert('Por favor selecciona un archivo Excel válido (.xlsx o .xls)');
            e.target.value = '';
            return;
        }

        // Validar tamaño (máximo 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            alert('El archivo es demasiado grande. El tamaño máximo es 5MB.');
            e.target.value = '';
            return;
        }

        setSelectedFile(file);
        setImportResults(null);
    };

    const handleImportar = async () => {
        if (!selectedFile) {
            alert('Por favor selecciona un archivo primero');
            return;
        }
        if (!filtros.periodoId) {
            alert('Por favor selecciona un periodo para la importación');
            return;
        }

        setLoading(true);
        setImportResults(null);

        try {
            const result = await importService.importExcel(selectedFile, filtros);

            setImportResults({
                exitosos: result.exitosos || 0,
                fallidos: result.fallidos || 0,
                totalRegistros: result.totalRegistros || 0,
                mensaje: result.mensaje || 'Importación completada',
                errores: result.errores || [],
                warnings: result.warnings || []
            });

            // Limpiar el archivo seleccionado
            setSelectedFile(null);
            document.getElementById('fileInput').value = '';
        } catch (error) {
            console.error('Error importando:', error);
            setImportResults({
                exitosos: 0,
                fallidos: 0,
                totalRegistros: 0,
                mensaje: error.message || 'Error al importar el archivo',
                errores: [error.message || 'Error desconocido'],
                warnings: []
            });
        } finally {
            setLoading(false);
        }
    };

    const limpiarResultados = () => {
        setImportResults(null);
        setSelectedFile(null);
        const fileInput = document.getElementById('fileInput');
        if (fileInput) fileInput.value = '';
    };

    // Estados para facultades y programas de exportación
    const [facultadesExport, setFacultadesExport] = useState([]);
    const [programasExport, setProgramasExport] = useState([]);

    // Efecto para cargar facultades de exportación
    useEffect(() => {
        const loadFacultadesForExport = async () => {
            if (filtrosExport.sedeId) {
                const data = await loadFacultadesExport(filtrosExport.sedeId);
                setFacultadesExport(data);
            } else {
                setFacultadesExport([]);
            }
        };
        loadFacultadesForExport();
    }, [filtrosExport.sedeId]);

    // Efecto para cargar programas de exportación
    useEffect(() => {
        const loadProgramasForExport = async () => {
            if (filtrosExport.facultadId) {
                const data = await loadProgramasExport(filtrosExport.facultadId);
                setProgramasExport(data);
            } else {
                setProgramasExport([]);
            }
        };
        loadProgramasForExport();
    }, [filtrosExport.facultadId]);

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header">
                <div className="header-title">
                    <FaFileExcel className="page-icon" />
                    <div>
                        <h1>Importar Excel</h1>
                        <p>Gestiona la importación de datos desde archivos Excel</p>
                    </div>
                </div>

                <div className="header-actions">
                    <div className="action-buttons">
                        <button
                            onClick={handleDescargarPlantilla}
                            className="btn btn-secondary"
                            disabled={loading}
                        >
                            <FaDownload /> Descargar Plantilla
                        </button>
                        <div className="export-dropdown">
                            <button
                                onClick={handleAbrirFiltrosExport}
                                className="btn btn-primary"
                                disabled={exportLoading}
                            >
                                <FaFileExport />
                                {exportLoading ? 'Exportando...' : 'Exportar Datos'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Filtros para Exportación */}
            {showFiltrosExport && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>
                                <FaFilter /> Configurar Filtros para Exportación
                            </h3>
                            <button
                                className="close-modal"
                                onClick={handleCerrarFiltrosExport}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="filtros-grid">
                                <div className="form-group">
                                    <label>Sede</label>
                                    <select
                                        name="sedeId"
                                        value={filtrosExport.sedeId}
                                        onChange={handleFiltroExportChange}
                                        className="form-select"
                                    >
                                        <option value="">Todas las Sedes</option>
                                        {sedes.map((s) => (
                                            <option key={s.idSede} value={s.idSede}>
                                                {s.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Facultad</label>
                                    <select
                                        name="facultadId"
                                        value={filtrosExport.facultadId}
                                        onChange={handleFiltroExportChange}
                                        className="form-select"
                                        disabled={!filtrosExport.sedeId}
                                    >
                                        <option value="">Todas las Facultades</option>
                                        {facultadesExport.map((f) => (
                                            <option key={f.idFacultad} value={f.idFacultad}>
                                                {f.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Programa</label>
                                    <select
                                        name="programaId"
                                        value={filtrosExport.programaId}
                                        onChange={handleFiltroExportChange}
                                        className="form-select"
                                        disabled={!filtrosExport.facultadId}
                                    >
                                        <option value="">Todos los Programas</option>
                                        {programasExport.map((p) => (
                                            <option key={p.idPrograma} value={p.idPrograma}>
                                                {p.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Periodo</label>
                                    <select
                                        name="periodoId"
                                        value={filtrosExport.periodoId}
                                        onChange={handleFiltroExportChange}
                                        className="form-select"
                                    >
                                        <option value="">Todos los Periodos</option>
                                        {periodos.map((p) => (
                                            <option key={p.idPeriodo} value={p.idPeriodo}>
                                                {p.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Tipo de Persona</label>
                                    <select
                                        name="tipoPersona"
                                        value={filtrosExport.tipoPersona}
                                        onChange={handleFiltroExportChange}
                                        className="form-select"
                                    >
                                        <option value="">Todos los Tipos</option>
                                        <option value="ESTUDIANTE">Estudiante</option>
                                        <option value="INVITADO">Invitado</option>
                                    </select>
                                </div>
                            </div>

                            <div className="filtros-summary">
                                <h4>Resumen de Filtros:</h4>
                                <p>
                                    {!filtrosExport.sedeId && !filtrosExport.facultadId &&
                                    !filtrosExport.programaId && !filtrosExport.periodoId && !filtrosExport.tipoPersona
                                        ? 'Exportando todos los datos sin filtros'
                                        : `Filtros aplicados: ${
                                            filtrosExport.sedeId ? 'Sede específica, ' : ''
                                        }${
                                            filtrosExport.facultadId ? 'Facultad específica, ' : ''
                                        }${
                                            filtrosExport.programaId ? 'Programa específico, ' : ''
                                        }${
                                            filtrosExport.periodoId ? 'Periodo específico, ' : ''
                                        }${
                                            filtrosExport.tipoPersona ? 'Tipo de persona específico' : ''
                                        }`.replace(/, $/, '')
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                onClick={handleExportarSinFiltros}
                                className="btn btn-secondary"
                                disabled={exportLoading}
                            >
                                Exportar Sin Filtros
                            </button>
                            <div className="modal-actions">
                                <button
                                    onClick={handleCerrarFiltrosExport}
                                    className="btn btn-secondary"
                                    disabled={exportLoading}
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleExportarDatos}
                                    className="btn btn-primary"
                                    disabled={exportLoading}
                                >
                                    <FaFileExport />
                                    {exportLoading ? 'Exportando...' : 'Exportar con Filtros'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Resultados de Importación */}
            {importResults && (
                <div className={`alert ${importResults.fallidos === 0 ? 'alert-success' : 'alert-warning'}`}>
                    {importResults.fallidos === 0 ? (
                        <FaCheckCircle className="result-icon" />
                    ) : (
                        <FaExclamationCircle className="result-icon" />
                    )}
                    <div className="result-message">
                        <h3>
                            {importResults.fallidos === 0
                                ? '¡Importación exitosa!'
                                : 'Importación completada con advertencias'
                            }
                        </h3>
                        <p>{importResults.mensaje}</p>
                        <div className="result-stats">
                            <span className="success-count">
                                ✓ {importResults.exitosos} exitosos
                            </span>
                            {importResults.fallidos > 0 && (
                                <span className="failed-count">
                                    ✗ {importResults.fallidos} fallidos
                                </span>
                            )}
                        </div>

                        {/* Mostrar errores si existen */}
                        {importResults.errores && importResults.errores.length > 0 && (
                            <div className="errors-list">
                                <strong>Errores:</strong>
                                <ul>
                                    {importResults.errores.slice(0, 5).map((error, idx) => (
                                        <li key={idx}>{error}</li>
                                    ))}
                                    {importResults.errores.length > 5 && (
                                        <li>... y {importResults.errores.length - 5} errores más</li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>
                    <button
                        className="close-modal"
                        onClick={limpiarResultados}
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Card Principal */}
            <div className="card">
                <div className="card-header">
                    <h2>Configuración de Importación</h2>
                </div>

                {/* Filtros */}
                <div className="filtros-section">
                    <h3>Filtros de Importación (Opcionales)</h3>
                    <div className="filtros-grid">
                        <div className="form-group">
                            <label>Sede</label>
                            <select
                                name="sedeId"
                                value={filtros.sedeId}
                                onChange={handleFiltroChange}
                                className="form-select"
                            >
                                <option value="">Todas las Sedes</option>
                                {sedes.map((s) => (
                                    <option key={s.idSede} value={s.idSede}>
                                        {s.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Facultad</label>
                            <select
                                name="facultadId"
                                value={filtros.facultadId}
                                onChange={handleFiltroChange}
                                className="form-select"
                                disabled={!filtros.sedeId}
                            >
                                <option value="">Todas las Facultades</option>
                                {facultades.map((f) => (
                                    <option key={f.idFacultad} value={f.idFacultad}>
                                        {f.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Programa</label>
                            <select
                                name="programaId"
                                value={filtros.programaId}
                                onChange={handleFiltroChange}
                                className="form-select"
                                disabled={!filtros.facultadId}
                            >
                                <option value="">Todos los Programas</option>
                                {programas.map((p) => (
                                    <option key={p.idPrograma} value={p.idPrograma}>
                                        {p.nombre}
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
                                required
                            >
                                <option value="">Seleccione un Periodo</option>
                                {periodos.map((p) => (
                                    <option key={p.idPeriodo} value={p.idPeriodo}>
                                        {p.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Tipo de Persona</label>
                            <select
                                name="tipoPersona"
                                value={filtros.tipoPersona}
                                onChange={handleFiltroChange}
                                className="form-select"
                            >
                                <option value="">Todos los Tipos</option>
                                <option value="ESTUDIANTE">Estudiante</option>
                                <option value="INVITADO">Invitado</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Sección de Carga de Archivo */}
                <div className="upload-section">
                    <h3>Subir Archivo Excel</h3>

                    {selectedFile ? (
                        <div className="file-selected">
                            <div className="file-info">
                                <FaFileExcel className="file-icon" />
                                <div className="file-details">
                                    <strong>{selectedFile.name}</strong>
                                    <span>{(selectedFile.size / 1024).toFixed(2)} KB</span>
                                </div>
                            </div>
                            <div className="file-actions">
                                <button
                                    onClick={handleImportar}
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <div className="spinner"></div>
                                            Procesando...
                                        </>
                                    ) : (
                                        <>
                                            <FaUpload /> Iniciar Importación
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={limpiarResultados}
                                    className="btn btn-secondary"
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="upload-zone">
                            <FaFileExcel className="upload-icon" />
                            <div className="upload-content">
                                <h4>Selecciona tu archivo Excel</h4>
                                <p>Arrastra y suelta o haz clic para seleccionar</p>
                                <label className="btn btn-primary">
                                    <FaUpload /> Seleccionar Archivo
                                    <input
                                        id="fileInput"
                                        type="file"
                                        accept=".xlsx,.xls"
                                        onChange={handleFileSelect}
                                        hidden
                                        disabled={loading}
                                    />
                                </label>
                                <small>Formatos soportados: .xlsx, .xls (máximo 5MB)</small>
                            </div>
                        </div>
                    )}
                </div>

                {loading && (
                    <div className="loading-overlay">
                        <div className="spinner"></div>
                        <p>Procesando archivo...</p>
                    </div>
                )}
            </div>

            {/* Instrucciones */}
            <div className="card">
                <div className="card-header">
                    <h3><FaInfoCircle /> Instrucciones de Uso</h3>
                </div>
                <div className="instructions-list">
                    <div className="instruction-item">
                        <span className="instruction-number">1</span>
                        <div>
                            <h4>Descarga la plantilla</h4>
                            <p>Haz clic en "Descargar Plantilla" para obtener el formato correcto</p>
                        </div>
                    </div>
                    <div className="instruction-item">
                        <span className="instruction-number">2</span>
                        <div>
                            <h4>Completa los datos</h4>
                            <p>Llena la plantilla con la información que deseas importar. Respeta el orden de las columnas.</p>
                        </div>
                    </div>
                    <div className="instruction-item">
                        <span className="instruction-number">3</span>
                        <div>
                            <h4>Configura los filtros (Opcional)</h4>
                            <p>Selecciona los filtros si deseas aplicar validaciones específicas durante la importación</p>
                        </div>
                    </div>
                    <div className="instruction-item">
                        <span className="instruction-number">4</span>
                        <div>
                            <h4>Sube el archivo</h4>
                            <p>Selecciona el archivo y haz clic en "Iniciar Importación"</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImportarExcelPage;
