import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useAuth } from '../../hooks/useAuth';
import { asistenciaService } from '../../services/asistenciaService';
import { FaQrcode, FaCheckCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';

const EscanearQRPage = () => {
    const { user } = useAuth(); // Obtenemos el usuario (con personaId)
    const [scanResult, setScanResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        if (scanResult || loading || error || success) {
            // Si ya hay un resultado, no inicies el escáner
            return;
        }

        // Configuración del escáner
        const scanner = new Html5QrcodeScanner(
            'qr-reader', // ID del div donde se renderizará
            {
                qrbox: { width: 250, height: 250 },
                fps: 10,
            },
            false // verbose
        );

        const onScanSuccess = (decodedText) => {
            scanner.clear().catch(err => console.error("Error al limpiar scanner", err));
            setScanResult(decodedText);
            handleRegistro(decodedText);
        };

        const onScanFailure = (err) => {
            // Ignorar errores comunes de "QR no encontrado"
        };

        scanner.render(onScanSuccess, onScanFailure);

        // Limpiar el escáner al desmontar el componente
        return () => {
            scanner.clear().catch(err => console.error("Error al limpiar scanner al desmontar", err));
        };
    }, [scanResult, loading, error, success]); // Volver a ejecutar si se resetea

    // Función para manejar el registro
    const handleRegistro = async (qrText) => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        let qrData;
        try {
            qrData = JSON.parse(qrText);
            if (!qrData.eventoEspecificoId || !qrData.timestamp) {
                throw new Error("Código QR no es válido para esta aplicación.");
            }
        } catch (err) {
            setError("Error: El código QR no es válido.");
            setLoading(false);
            return;
        }

        if (!user || !user.personaId) {
            setError("Error: No se pudo identificar tu usuario. Vuelve a iniciar sesión.");
            setLoading(false);
            return;
        }

        // Preparamos el payload
        const payload = {
            eventoEspecificoId: qrData.eventoEspecificoId,
            personaId: user.personaId,
            observacion: "Registrado por QR",
            latitud: null, // (Opcional: implementar geolocalización)
            longitud: null,
        };

        try {
            const resultado = await asistenciaService.registrarAsistencia(payload);
            setSuccess(`¡Asistencia registrada! Estado: ${resultado.estado}`);
        } catch (err) {
            setError(err.message || "No se pudo registrar la asistencia.");
        } finally {
            setLoading(false);
        }
    };

    const resetScanner = () => {
        setScanResult(null);
        setLoading(false);
        setError(null);
        setSuccess(null);
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="header-title">
                    <FaQrcode className="page-icon" />
                    <div>
                        <h1>Escanear Asistencia</h1>
                        <p>Apunta tu cámara al código QR generado por tu líder.</p>
                    </div>
                </div>
            </div>

            <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
                <div className="card-content" style={{ padding: '30px', textAlign: 'center' }}>

                    {/* ESTADO 1: ESCANEANDO */}
                    {!loading && !error && !success && (
                        <>
                            <h4>Escanear Código QR</h4>
                            <div id="qr-reader" style={{ width: '100%', border: '1px solid #eee' }}></div>
                        </>
                    )}

                    {/* ESTADO 2: CARGANDO */}
                    {loading && (
                        <div style={{ padding: '50px' }}>
                            <FaSpinner style={{ animation: 'spin 1s linear infinite' }} size={50} color="var(--primary-color)" />
                            <p style={{ fontSize: '1.2rem', color: 'var(--text-color)', marginTop: '20px' }}>
                                Registrando asistencia...
                            </p>
                        </div>
                    )}

                    {/* ESTADO 3: ÉXITO */}
                    {success && (
                        <div style={{ padding: '50px' }}>
                            <FaCheckCircle size={70} color="var(--success-color)" />
                            <h3 style={{ color: 'var(--success-color)', marginTop: '20px' }}>¡Listo!</h3>
                            <p style={{ fontSize: '1.1rem', color: 'var(--text-color)' }}>{success}</p>
                            <button className="btn btn-secondary" onClick={resetScanner}>
                                Escanear de nuevo
                            </button>
                        </div>
                    )}

                    {/* ESTADO 4: ERROR */}
                    {error && (
                        <div style={{ padding: '50px' }}>
                            <FaExclamationTriangle size={70} color="var(--error-color)" />
                            <h3 style={{ color: 'var(--error-color)', marginTop: '20px' }}>Error</h3>
                            <p style={{ fontSize: '1.1rem', color: 'var(--text-color)' }}>{error}</p>
                            <button className="btn btn-secondary" onClick={resetScanner}>
                                Intentar de nuevo
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default EscanearQRPage;