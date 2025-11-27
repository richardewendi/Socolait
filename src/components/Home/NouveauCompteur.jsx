import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FaPlusCircle, FaMapMarkerAlt, FaTag, FaCalendarAlt, FaWater, FaBarcode, FaCamera, FaTimes } from 'react-icons/fa';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import Modal from '../UI/Modal';
import './NouveauCompteur.css'; // Import new CSS
import { API_BASE_URL } from '../../api';

const qrcodeRegionId = "html5qr-reader";

const NouveauCompteur = ({ onCompteurAdded, onCancel }) => {
    const [numeroCompteur, setNumeroCompteur] = useState('');
    const [codeBarre, setCodeBarre] = useState('');
    const [adresse, setAdresse] = useState('');
    const [indexInitial, setIndexInitial] = useState('');
    const [dateInstallation, setDateInstallation] = useState('');
    const [typeCompteur, setTypeCompteur] = useState('Eau froide');
    const [diametreNominal, setDiametreNominal] = useState('');
    const [loading, setLoading] = useState(false);
    const [scanError, setScanError] = useState(null);

    // Fullscreen scanner state
    const [isScannerFullscreen, setIsScannerFullscreen] = useState(false);
    
    // Modal state
    const [modalState, setModalState] = useState({ show: false, type: '', title: '', message: '' });

    const qrCodeScannerRef = useRef(null);
    const scannedRef = useRef(false); // New ref to track if a scan has been processed

    const stopScan = useCallback(() => {
        if (qrCodeScannerRef.current && qrCodeScannerRef.current.isScanning) {
            qrCodeScannerRef.current.stop().catch(err => {
                console.error("Erreur lors de l'arrêt du scanner:", err);
            });
        }
        // Delay setting fullscreen to false to avoid state transition conflicts
        setTimeout(() => {
            setIsScannerFullscreen(false);
            scannedRef.current = false; // Reset scan state
        }, 100); // Small delay
    }, []);

    const startScan = () => {
        console.log('startScan called');
        setScanError(null);
        setCodeBarre('');
        scannedRef.current = false; // Reset scan state when starting
        setIsScannerFullscreen(true); // Open fullscreen view
    };

    useEffect(() => {
        console.log('useEffect for scanner: isScannerFullscreen', isScannerFullscreen);
        if (!isScannerFullscreen) {
            console.log('Scanner not fullscreen, returning from useEffect');
            return;
        }

        console.log('Initializing Html5Qrcode scanner');
        const qrCodeScanner = new Html5Qrcode(qrcodeRegionId);
        qrCodeScannerRef.current = qrCodeScanner;

        const config = {
            fps: 10,
            qrbox: (viewfinderWidth, viewfinderHeight) => {
                const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
                const qrBoxSize = Math.floor(Math.max(50, minEdge * 0.8)); // Ensure minimum 50px
                return { width: qrBoxSize, height: qrBoxSize };
            },
            rememberLastUsedCamera: true,
            // Removed formatsToSupport for broader compatibility
        };

        const onScanSuccess = (decodedText, decodedResult) => {
            if (scannedRef.current) {
                return;
            }
            scannedRef.current = true;
            setCodeBarre(decodedText);
            stopScan();
        };

        qrCodeScanner.start({ facingMode: "environment" }, config, onScanSuccess)
        .catch(err => {
            setScanError('Impossible de démarrer le scanner. Vérifiez les autorisations de la caméra.'); // State update
            stopScan(); // State update
        });

        return () => { // Cleanup function
            if (qrCodeScannerRef.current && qrCodeScannerRef.current.isScanning) {
                qrCodeScannerRef.current.stop(); // Stops scanner, which might trigger pending callbacks
            }
        };
    }, [isScannerFullscreen, stopScan]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const nouveauCompteurData = {
            numero_compteur: numeroCompteur,
            code_barre: codeBarre,
            adresse_installation: adresse,
            type_compteur: typeCompteur,
            diametre_nominal: parseFloat(diametreNominal || 0),
            index_initial: parseFloat(indexInitial || 0),
            date_installation: dateInstallation,
            statut: 'actif'
        };

        try {
            const response = await fetch(`${API_BASE_URL}/compteurs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nouveauCompteurData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Erreur lors de l\'enregistrement.');
            }

            const data = await response.json();
            setModalState({ show: true, type: 'success', title: 'Succès', message: `Compteur "${data.numero_compteur}" enregistré !` });
        } catch (err) {
            setModalState({ show: true, type: 'error', title: 'Erreur', message: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleModalClose = () => {
        const isSuccess = modalState.type === 'success';
        setModalState({ show: false, type: '', title: '', message: '' });
        if (isSuccess) {
            // Delay navigation to allow modal state to fully close
            setTimeout(() => {
                onCompteurAdded();
            }, 50); 
        }
    };

    return (
        <>
            <Modal show={modalState.show} type={modalState.type} title={modalState.title} message={modalState.message} onConfirm={handleModalClose} onCancel={handleModalClose} />

            {isScannerFullscreen && (
                <div className="scanner-fullscreen">
                    <div id={qrcodeRegionId} style={{ width: "500px", height: "500px" }} />
                    <button onClick={stopScan} className="btn-close-scanner">
                        <FaTimes /> Fermer
                    </button>
                    {scanError && <p className="scanner-error">{scanError}</p>}
                </div>
            )}

            <div className="form-container">
                <h2><FaPlusCircle /> Enregistrer un Nouveau Compteur</h2>
                <form onSubmit={handleSubmit} className="new-compteur-form">
                    <div className="input-group">
                        <label><FaTag /> Numéro de compteur</label>
                        <input type="text" value={numeroCompteur} onChange={e => setNumeroCompteur(e.target.value)} required />
                    </div>

                    <div className="input-group">
                        <label><FaBarcode /> Code-barres</label>
                        <div className="input-with-button">
                            <input type="text" value={codeBarre} onChange={e => setCodeBarre(e.target.value)} placeholder="Cliquez pour scanner" required readOnly />
                            <button type="button" onClick={startScan} disabled={loading}>
                                <FaCamera /> Scanner
                            </button>
                        </div>
                    </div>

                    <div className="input-group">
                        <label><FaMapMarkerAlt /> Adresse d'Installation</label>
                        <input type="text" value={adresse} onChange={e => setAdresse(e.target.value)} required />
                    </div>

                    <div className="input-group">
                        <label><FaWater /> Type de Compteur</label>
                        <select value={typeCompteur} onChange={e => setTypeCompteur(e.target.value)}>
                            <option value="Mécanique">Mécanique</option>
                            <option value="Communicant">Communicant</option>
                            <option value="Ultrasons">Ultrasons</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label>Diamètre Nominal (mm)</label>
                        <input type="number" step="0.01" value={diametreNominal} onChange={e => setDiametreNominal(e.target.value)} required />
                    </div>

                    <div className="input-group">
                        <label><FaWater /> Index Initial (m³)</label>
                        <input type="number" step="0.01" value={indexInitial} onChange={e => setIndexInitial(e.target.value)} required />
                    </div>

                    <div className="input-group">
                        <label><FaCalendarAlt /> Date d'Installation</label>
                        <input type="date" value={dateInstallation} onChange={e => setDateInstallation(e.target.value)} required />
                    </div>

                    <div className="button-group">
                        <button type="button" onClick={onCancel} disabled={loading}>Annuler</button>
                        <button type="submit" disabled={loading}>{loading ? 'Enregistrement...' : 'Confirmer'}</button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default NouveauCompteur;
