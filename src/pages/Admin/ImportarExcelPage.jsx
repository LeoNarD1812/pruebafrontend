import React, { useState, useEffect } from 'react';
import { FaDownload, FaUpload, FaFilter, FaSearch, FaFileExcel, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const ImportarExcelPage = () => {
    const [sedes, setSedes] = useState([]);
    const [facultades, setFacultades] = useState([]);
    const [programas, setProgramas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filtros, setFiltros] = useState({
        sedeId: '',
        facultadId: '',
        programaId: '',
        tipoPersona: '',
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [importResults, setImportResults] = useState(null);

    useEffect(() => {
        loadCatalogs();
    }, []);

    const loadCatalogs = async () => {
        try {
            // Aquí irían las llamadas a tu API
            // Por ahora lo dejamos vacío
        } catch (error) {
            console.error('Error cargando catálogos:', error);
        }
    };

    const handleFiltroChange = (e) => {
        setFiltros({
            ...filtros,
            [e.target.name]: e.target.value,
        });
    };

    const handleExportar = async () => {
        setLoading(true);
        try {
            // Implementar exportación
            console.log('Exportando con filtros:', filtros);
            alert('Funcionalidad de exportación en desarrollo');
        } catch (error) {
            console.error('Error exportando:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImportar = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            console.log('Importando archivo:', file.name);
            
            // Simular resultado exitoso
            setTimeout(() => {
                setImportResults({
                    exitosos: 150,
                    fallidos: 5,
                    mensaje: `Se importaron exitosamente ${150} registros. ${5} registros fallaron.`
                });
                setLoading(false);
            }, 2000);
            
        } catch (error) {
            console.error('Error importando:', error);
            setImportResults({
                exitosos: 0,
                fallidos: 0,
                mensaje: 'Error al importar el archivo'
            });
        }
    };

    return (
        <div className="import-excel-container">
            <div className="page-header">
                <div className="header-title">
                    <FaFileExcel className="page-icon" />
                    <div>
                        <h1>Importar Excel</h1>
                        <p>Gestiona la importación de datos desde archivos Excel</p>
                    </div>
                </div>
                
                <div className="header-actions">
                    <button onClick={handleExportar} className="btn-export" disabled={loading}>
                        <FaDownload /> Descargar Plantilla
                    </button>
                </div>
            </div>

            {importResults && (
                <div className={`import-result ${importResults.fallidos === 0 ? 'success' : 'warning'}`}>
                    {importResults.fallidos === 0 ? (
                        <FaCheckCircle className="result-icon" />
                    ) : (
                        <FaExclamationCircle className="result-icon" />
                    )}
                    <div className="result-message">
                        <h3>{importResults.fallidos === 0 ? '¡Importación exitosa!' : 'Importación con advertencias'}</h3>
                        <p>{importResults.mensaje}</p>
                        <div className="result-stats">
                            <span className="success-count">✓ {importResults.exitosos} exitosos</span>
                            {importResults.fallidos > 0 && (
                                <span className="failed-count">✗ {importResults.fallidos} fallidos</span>
                            )}
                        </div>
                    </div>
                    <button 
                        className="close-result" 
                        onClick={() => setImportResults(null)}
                    >
                        ✕
                    </button>
                </div>
            )}

            <div className="import-card">
                <div className="card-header">
                    <h2>Configuración de Importación</h2>
                </div>

                <div className="filtros-section">
                    <h3>Filtros de Importación</h3>
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
                                    <option key={s.idSede} value={s.idSede}>{s.nombre}</option>
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
                            >
                                <option value="">Todas las Facultades</option>
                                {facultades.map((f) => (
                                    <option key={f.idFacultad} value={f.idFacultad}>{f.nombre}</option>
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
                            >
                                <option value="">Todos los Programas</option>
                                {programas.map((p) => (
                                    <option key={p.idPrograma} value={p.idPrograma}>{p.nombre}</option>
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

                <div className="upload-section">
                    <h3>Subir Archivo Excel</h3>
                    <div className="upload-zone">
                        <FaFileExcel className="upload-icon" />
                        <div className="upload-content">
                            <h4>Arrastra y suelta tu archivo Excel aquí</h4>
                            <p>o haz clic para seleccionar</p>
                            <label className="btn-import">
                                <FaUpload /> Seleccionar Archivo
                                <input 
                                    type="file" 
                                    accept=".xlsx,.xls" 
                                    onChange={handleImportar} 
                                    hidden 
                                />
                            </label>
                            <small>Formatos soportados: .xlsx, .xls</small>
                        </div>
                    </div>
                </div>

                {loading && (
                    <div className="loading-overlay">
                        <div className="spinner"></div>
                        <p>Importando datos...</p>
                    </div>
                )}
            </div>

            <div className="instructions-card">
                <h3>📋 Instrucciones de Uso</h3>
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
                            <p>Llena la plantilla con la información que deseas importar</p>
                        </div>
                    </div>
                    <div className="instruction-item">
                        <span className="instruction-number">3</span>
                        <div>
                            <h4>Configura los filtros</h4>
                            <p>Selecciona los filtros opcionales para categorizar los datos</p>
                        </div>
                    </div>
                    <div className="instruction-item">
                        <span className="instruction-number">4</span>
                        <div>
                            <h4>Sube el archivo</h4>
                            <p>Arrastra y suelta el archivo o haz clic para seleccionarlo</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImportarExcelPage;

