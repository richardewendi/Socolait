import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { FaArrowLeft, FaRedoAlt, FaCheck } from 'react-icons/fa'; 
import "../../styles/saisieManuelle.css";
import { API_BASE_URL } from "../../api";

const qrcodeRegionId = "html5qr-code-full-region";

function Scanner() {
  const [scannedCode, setScannedCode] = useState(null);
  const [compteur, setCompteur] = useState(null);
  const [nouvelIndex, setNouvelIndex] = useState("");
  const [scannerSize, setScannerSize] = useState({ width: 0, height: 0 });
  const [ancienIndex, setAncienIndex] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isScanning, setIsScanning] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const scanInProgress = useRef(false);
  const scannerContainerRef = useRef(null); // New ref

  const navigate = useNavigate();

  const processScannedBarcode = useCallback(async (barcode) => {
    if (scanInProgress.current) return;
    scanInProgress.current = true;
    setIsProcessing(true);
    setScannedCode(barcode);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/compteurs/barcode/${barcode}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Ce code-barres n'existe pas dans la base de données.");
        }
        throw new Error(`Erreur réseau : ${res.status}`);
      }
      const data = await res.json();
      setCompteur(data.compteur);
      setAncienIndex(data.compteur.nouvel_index ?? 0);
      setSuccess("");
    } catch (err) {
      setError(err.message || "Erreur lors de la recherche du compteur.");
      setCompteur(null);
    } finally {
      setIsProcessing(false);
    }
  }, [scanInProgress]);

  useEffect(() => {
    let html5QrcodeScanner;

    const startHtml5Qrcode = async () => {
      console.log("startHtml5Qrcode called. isScanning:", isScanning, "scanInProgress:", scanInProgress.current, "scannerContainerRef.current:", scannerContainerRef.current);
      if (!isScanning || scanInProgress.current || !scannerContainerRef.current) {
        if (html5QrcodeScanner && html5QrcodeScanner.isScanning) {
          html5QrcodeScanner.stop().catch(err => console.error("Error stopping scanner:", err));
        }
        return;
      }

      const containerWidth = scannerContainerRef.current.offsetWidth;
      console.log("Scanner container offsetWidth:", containerWidth);
      const calculatedQrboxSize = Math.min(300, Math.max(150, containerWidth * 0.8)); // Min 150, Max 300, or 80% of width
      console.log("Calculated qrbox size:", calculatedQrboxSize);

      const config = {
        fps: 10,
        qrbox: { width: calculatedQrboxSize, height: calculatedQrboxSize },
        rememberLastUsedCamera: true,
        formatsToSupport: [
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.QR_CODE,
        ]
      };

      html5QrcodeScanner = new Html5Qrcode(qrcodeRegionId);
      
      try {
        console.log("Attempting to start Html5Qrcode with config:", config);
        await html5QrcodeScanner.start(
          { facingMode: "environment" },
          config, // Pass the config object with dynamic qrbox
          (decodedText, decodedResult) => {
            console.log("Code-barres détecté :", decodedText);
            html5QrcodeScanner.stop().then(() => {
                setIsScanning(false);
                processScannedBarcode(decodedText);
            }).catch(stopErr => {
                console.error("Échec de l'arrêt de html5QrcodeScanner", stopErr);
                setIsScanning(false);
                processScannedBarcode(decodedText);
            });
          },
          (errorMessage) => {
            // Ignore non-critical errors
          }
        );
        console.log("Html5Qrcode started successfully.");
        setError("");
      } catch (err) {
        console.error("Html5QrcodeScanner start failed:", err);
        let errorMessage = "Erreur de caméra est survenue.";
        if (err.name === "NotAllowedError") {
          errorMessage = "L'accès à la caméra a été refusé. Veuillez vérifier les autorisations de votre navigateur.";
        } else if (err.name === "NotFoundError") {
          errorMessage = "Aucune caméra n'a été trouvée sur cet appareil.";
        } else if (err.name === "NotReadableError") {
            errorMessage = "La caméra est peut-être déjà utilisée par une autre application.";
        } else if (err.name === "OverconstrainedError") {
            errorMessage = "Les contraintes de la caméra n'ont pas pu être satisfaites.";
        }
        setError(errorMessage);
        setIsScanning(false);
      }
    };

    startHtml5Qrcode();

    return () => {
      if (html5QrcodeScanner && html5QrcodeScanner.isScanning) {
        html5QrcodeScanner.stop().catch(err => console.error("Error stopping scanner:", err));
      }
    };
  }, [isScanning, scanInProgress, processScannedBarcode, scannerContainerRef.current]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!compteur || !nouvelIndex) {
      setError("Les données du formulaire sont incomplètes.");
      return;
    }

    if (parseFloat(nouvelIndex) <= parseFloat(ancienIndex)) {
      setError("Le nouvel index doit être supérieur à l'ancien index.");
      return;
    }

    const payload = {
      id_compteur: compteur.id,
      nouvel_index: parseFloat(nouvelIndex),
      ancien_index: parseFloat(ancienIndex),
      operateur_id: 1, 
      notes,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/releves`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error("Erreur lors de l'ajout du relevé.");
      }
      setSuccess("Relevé ajouté avec succès !");
      setError("");
      setCompteur(null);
      setScannedCode(null);
      scanInProgress.current = false;
      setIsScanning(true);
    } catch (err) {
      setError(err.message || "Une erreur est survenue lors de l'ajout du relevé.");
      setSuccess("");
    }
  };

  const resetScanner = () => {
    scanInProgress.current = false;
    setIsScanning(true);
    setScannedCode(null);
    setCompteur(null);
    setError("");
    setSuccess("");
  };

  return (
    <div className="saisie-container">
      <h2>Scan de Code-Barres</h2>

      <button className="btn btn-secondary btn-retour" onClick={() => navigate("/")}>
        <FaArrowLeft /> Retour à l'accueil
      </button>

      {error && (
        <div className="message-error">
          {error}
          <button onClick={resetScanner} className="btn btn-secondary btn-retry-scan">
            <FaRedoAlt /> Réessayer de scanner
          </button>
        </div>
      )}
      {success && <div className="message-success">{success}</div>}

      {isScanning && (
        <div ref={scannerContainerRef} className="scanner-container"> {/* Added ref here */}
            <div id={qrcodeRegionId} style={{ width: "500px", height: "500px" }} /> {/* No inline style */}
            {!isProcessing && <p>Veuillez scanner le code-barres du compteur...</p>}
        </div>
      )}
      
      {isProcessing && scannedCode && <p>Traitement du code-barres : {scannedCode}...</p>}

      {compteur && (
        <div className="compteur-info">
          <h3>Compteur Identifié</h3>
          <p><strong>Numéro :</strong> {compteur.numero_compteur}</p>
          <p><strong>Code-Barres :</strong> {compteur.code_barre}</p>
          <p><strong>Statut :</strong> {compteur.statut}</p>
          <p><strong>Adresse d'Installation :</strong> {compteur.adresse_installation}</p>

          {compteur.statut !== 'actif' ? (
            <div className="message-error">
              Ce compteur est {compteur.statut}. Vous ne pouvez pas effectuer de relevé.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="form-releve">
              <label>
                Ancien index :
                <input
                  type="number"
                  value={ancienIndex === null ? 0 : ancienIndex}
                  onChange={(e) => setAncienIndex(e.target.value)}
                  required
                  readOnly
                  disabled={compteur.statut !== 'actif'}
                />
              </label>

              <label>
                Nouvel index :
                <input
                  type="number"
                  value={nouvelIndex}
                  onChange={(e) => setNouvelIndex(e.target.value)}
                  required
                  placeholder="Entrez le nouvel index"
                  disabled={compteur.statut !== 'actif'}
                />
              </label>

              <label>
                Notes :
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes (optionnel)"
                  disabled={compteur.statut !== 'actif'}
                />
              </label>

              <button type="submit" disabled={!nouvelIndex || compteur.statut !== 'actif'} className="btn btn-primary">
                <FaCheck /> Ajouter relevé
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export default Scanner;
