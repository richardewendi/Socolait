import React, { useState } from 'react';
import { FaQrcode, FaKeyboard, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
// Assurez-vous que ces fichiers existent :
import Scanner from './Scanner.jsx'; 
import SaisieManuelle from './SaisieManuelle.jsx';

const ReleveCompteur = () => {
    const [mode, setMode] = useState('scan'); // 'scan' ou 'manuel'
    const [compteurId, setCompteurId] = useState(null);
    const [ancienIndex, setAncienIndex] = useState(null);
    const [nouvelIndex, setNouvelIndex] = useState('');
    const [consommation, setConsommation] = useState(null);

    // Fonction factice pour récupérer l'ancien index
    const fetchAncienIndex = (id) => {
        setCompteurId(id);
        setNouvelIndex(''); // Réinitialiser le nouvel index lors d'un changement de compteur
        setConsommation(null);
        
        // Simulation d'une API call
        if (id.includes('CPT-123')) {
            setAncienIndex(1500); 
            return 1500;
        } else if (id.includes('CPT-456')) {
            setAncienIndex(850);
            return 850;
        }
        // Si 'CPT-789 (Nouveau)', l'ancien index est 0
        setAncienIndex(0); 
        return 0;
    };

    const handleIndexChange = (e) => {
        const value = e.target.value;
        setNouvelIndex(value);

        if (value === '' || isNaN(parseInt(value))) {
            setConsommation(null);
            return;
        }

        const nouvel = parseInt(value);
        if (ancienIndex !== null) {
            setConsommation(nouvel - ancienIndex);
        }
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Vérification de validation finale
        if (nouvelIndex < ancienIndex) {
             alert("Erreur: Le nouvel index ne peut pas être inférieur à l'ancien.");
             return;
        }

        alert(`Relevé enregistré pour ${compteurId}:\nIndex Précédent: ${ancienIndex}\nNouvel Index: ${nouvelIndex}\nConsommation: ${consommation} m³`);
        // Ici, appel à l'API pour enregistrer le relevé
    };

    return (
        <div className="releve-container">
            <h2>Relevé de Compteur</h2>

            {/* Sélecteur de Mode */}
            <div className="mode-selector">
                <button 
                    className={`btn-mode ${mode === 'scan' ? 'active' : ''}`} 
                    onClick={() => setMode('scan')}
                >
                    <FaQrcode /> Mode Scan
                </button>
                <button 
                    className={`btn-mode ${mode === 'manuel' ? 'active' : ''}`} 
                    onClick={() => setMode('manuel')}
                >
                    <FaKeyboard /> Saisie Manuelle
                </button>
            </div>
            
            {/* 1. Identification du Compteur */}
            <div className="identification-section">
                <h3>1. Identification</h3>
                {mode === 'scan' ? (
                    <Scanner onScanSuccess={fetchAncienIndex} /> 
                ) : (
                    <SaisieManuelle onSelectCompteur={fetchAncienIndex} />
                )}
                
                {compteurId && (
                    <div className="id-status success">
                        <FaCheckCircle /> Compteur Identifié: **{compteurId}**
                    </div>
                )}
            </div>

            {/* 2. Saisie et Calcul du Relevé */}
            {compteurId && (
                <form onSubmit={handleSubmit} className="releve-form">
                    <h3>2. Saisie de l'Index</h3>

                    <div className="data-display">
                        <p>Index Précédent (Ancien Index) : <span>{ancienIndex}</span> m³</p>
                    </div>

                    <div className="input-group index-input-group">
                        <label htmlFor="nouvelIndex">Nouvel Index (Relevé Actuel):</label>
                        <input
                            id="nouvelIndex"
                            type="number"
                            value={nouvelIndex}
                            onChange={handleIndexChange}
                            min={ancienIndex}
                            required
                        />
                        <span>m³</span>
                    </div>

                    <div className="result-display">
                        <h4>Consommation Calculée:</h4>
                        {consommation !== null && nouvelIndex > ancienIndex ? (
                            <p className="consommation-value">{consommation} m³</p>
                        ) : nouvelIndex !== '' && ancienIndex !== null && parseInt(nouvelIndex) < ancienIndex ? (
                            <p className="error-message"><FaExclamationTriangle /> Index inférieur à l'ancien ! Vérifiez.</p>
                        ) : (
                            <p className="info-message">Entrez le nouvel index pour calculer.</p>
                        )}
                    </div>
                    
                    <button 
                        type="submit" 
                        className="btn-save" 
                        // Désactive le bouton si l'index est vide ou s'il y a une erreur de validation
                        disabled={nouvelIndex === '' || consommation === null || nouvelIndex < ancienIndex}
                    >
                        Enregistrer le Relevé
                    </button>
                </form>
            )}
        </div>
    );
};

export default ReleveCompteur;

// ATTENTION: TOUT LE CODE SUIVANT DOIT ÊTRE SUPPRIMÉ CAR IL CAUSE L'ERREUR "ALREADY DECLARED".
// VOS COMPOSANTS SCANNER ET SAISIEMANUELLE DOIVENT EXISTER DANS DES FICHIERS SÉPARÉS.

// --- FIN DU FICHIER ReleveCompteur.jsx ---