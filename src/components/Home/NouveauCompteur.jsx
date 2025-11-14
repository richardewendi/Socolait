import React, { useState, useRef, useEffect } from 'react';
import { FaPlusCircle, FaMapMarkerAlt, FaTag, FaCalendarAlt, FaWater, FaBarcode, FaCamera } from 'react-icons/fa';
import { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType } from '@zxing/library';

// Liste des formats autorisés
const hints = new Map();
hints.set(DecodeHintType.POSSIBLE_FORMATS, [
  BarcodeFormat.CODE_128,
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.UPC_A,
]);

const NouveauCompteur = ({ onCompteurAdded, onCancel }) => {
  const [numeroCompteur, setNumeroCompteur] = useState('');
  const [codeBarre, setCodeBarre] = useState('');
  const [adresse, setAdresse] = useState('');
  const [indexInitial, setIndexInitial] = useState('');
  const [dateInstallation, setDateInstallation] = useState('');
  const [typeCompteur, setTypeCompteur] = useState('Eau froide');
  const [diametreNominal, setDiametreNominal] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [scanActive, setScanActive] = useState(false);
  const [scanError, setScanError] = useState(null);

  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    setScanActive(false);
    setScanError(null);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  useEffect(() => {
    if (!scanActive || !videoRef.current) return;

    const executeScan = async () => {
      if (!codeReaderRef.current) {
        codeReaderRef.current = new BrowserMultiFormatReader();
      }
      try {
        const result = await codeReaderRef.current.decodeOnceFromVideoDevice(
          undefined,
          videoRef.current,
          hints
        );
        if (result && result.text) {
          setCodeBarre(result.text);
          setScanError(null);
        }
      } catch (err) {
        if (err.name === 'NotFoundError') setScanError("Aucune caméra trouvée.");
        else if (err.name === 'NotAllowedError' || err.name === 'SecurityError') setScanError("Accès caméra refusé.");
        else setScanError("Erreur de scan : " + (err.message || "Voir console"));
        console.error(err);
      } finally {
        stopCamera();
      }
    };

    executeScan();
  }, [scanActive, videoRef]);

  const startScan = () => {
    if (!scanActive) setScanActive(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const nouveauCompteurData = {
      numero_compteur: numeroCompteur,
      code_bar: codeBarre,
      adresse_installation: adresse,
      type_compteur: typeCompteur,
      diametre_nominale: parseFloat(diametreNominal || 0),
      index_initial: parseFloat(indexInitial || 0),
      date_installation: dateInstallation
    };

    try {
      const response = await fetch('http://localhost:3000/api/compteurs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nouveauCompteurData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || response.statusText);
      }

      const data = await response.json();
      alert(`Compteur "${data.code_bar}" enregistré avec succès !`);
      onCompteurAdded();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l’enregistrement : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2><FaPlusCircle /> Enregistrer un Nouveau Compteur</h2>
      <form onSubmit={handleSubmit} className="new-compteur-form">

        <div className="input-group">
          <label><FaTag /> Numéro de compteur</label>
          <input type="text" value={numeroCompteur} onChange={e => setNumeroCompteur(e.target.value)} required />
        </div>

        <div className="input-group">
          <label><FaBarcode /> Code-barres</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input type="text" value={codeBarre} onChange={e => setCodeBarre(e.target.value)} placeholder="Scannez le code-barres" required disabled={scanActive} />
            <button type="button" onClick={startScan} disabled={scanActive || loading} style={{ marginLeft: '8px' }}>
              <FaCamera /> {scanActive ? 'Scanning...' : 'Scanner'}
            </button>
          </div>
          {scanActive && <video ref={videoRef} style={{ width: '100%', maxWidth: '400px', margin: '8px auto', display: 'block' }} />}
          {scanError && <p style={{ color: 'red', marginTop: '5px' }}>Erreur de scan : {scanError}</p>}
          {scanActive && <button type="button" onClick={stopCamera} style={{ marginTop: '8px' }}>Arrêter le Scan</button>}
        </div>

        <div className="input-group">
          <label><FaMapMarkerAlt /> Adresse d'Installation</label>
          <input type="text" value={adresse} onChange={e => setAdresse(e.target.value)} required />
        </div>

        <div className="input-group">
          <label><FaWater /> Type de Compteur</label>
          <select value={typeCompteur} onChange={e => setTypeCompteur(e.target.value)}>
            <option value="Eau froide">Eau froide</option>
            <option value="Eau chaude">Eau chaude</option>
            <option value="Irrigation">Irrigation</option>
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
          <button type="submit" disabled={loading}>{loading ? 'Enregistrement...' : 'Confirmer l\'Enregistrement'}</button>
        </div>

      </form>
    </div>
  );
};

export default NouveauCompteur;
