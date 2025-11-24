import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCheck } from 'react-icons/fa'; // Added icons
import "../../styles/saisieManuelle.css";

function SaisieManuelle() {
  const [compteurs, setCompteurs] = useState([]);
  const [selectedCompteur, setSelectedCompteur] = useState("");
  const [nouvelIndex, setNouvelIndex] = useState("");
  const [ancienIndex, setAncienIndex] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentCompteur, setCurrentCompteur] = useState(null); // New state

  const navigate = useNavigate(); // pour navigation

  useEffect(() => {
    fetch("http://localhost:3000/api/compteurs")
      .then((res) => {
        if (!res.ok) throw new Error(`Erreur réseau : ${res.status}`);
        return res.json();
      })
      .then((data) => setCompteurs(data.compteurs))
      .catch(() => setError("Erreur de récupération des compteurs."));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedCompteur || !nouvelIndex || (currentCompteur && currentCompteur.statut !== 'actif')) { // Added condition for status
      setError("Veuillez remplir tous les champs obligatoires et vérifier le statut du compteur.");
      return;
    }

    if (parseFloat(nouvelIndex) <= parseFloat(ancienIndex)) {
      setError("Le nouvel index doit être supérieur à l'ancien index.");
      return;
    }

    const payload = {
      id_compteur: parseInt(selectedCompteur),
      nouvel_index: parseFloat(nouvelIndex),
      ancien_index: parseFloat(ancienIndex),
      operateur_id: 1,
      notes,
    };

    fetch("http://localhost:3000/api/releves", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then(() => {
        setSuccess("Relevé ajouté avec succès !");
        setError("");
        setNouvelIndex("");
        setAncienIndex(currentCompteur ? (currentCompteur.nouvel_index === null ? 0 : currentCompteur.nouvel_index) : ""); // Reset ancienIndex based on currentCompteur
        setNotes("");
      })
      .catch(() => {
        setError("Une erreur est survenue lors de l'ajout du relevé.");
        setSuccess("");
      });
  };

  const isFormValid = () => selectedCompteur && nouvelIndex && currentCompteur && currentCompteur.statut === 'actif'; // Updated validation

  return (
    <div className="saisie-container">
      <h2>Saisie Manuelle de Relevés</h2>

      <button className="btn btn-secondary btn-retour" onClick={() => navigate("/")}>
        <FaArrowLeft /> Retour à l'accueil
      </button>

      {error && <div className="message-error">{error}</div>}
      {success && <div className="message-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <label>
          Compteur :
          <select
            value={selectedCompteur}
            onChange={(e) => {
              const id = e.target.value;
              setSelectedCompteur(id);
              const foundCompteur = compteurs.find((c) => c.id === parseInt(id));
              setCurrentCompteur(foundCompteur || null); // Set currentCompteur
              setAncienIndex(foundCompteur ? (foundCompteur.nouvel_index === null ? 0 : foundCompteur.nouvel_index) : "");
            }}
          >
            <option value="">-- Sélectionner un compteur --</option>
            {compteurs.map((compteur) => (
              <option key={compteur.id} value={compteur.id}>
                {compteur.numero_compteur}
              </option>
            ))}
          </select>
        </label>
        
        {currentCompteur && (
          <div className="compteur-info">
            <p><strong>Code-Barres :</strong> {currentCompteur.code_barre}</p>
            <p><strong>Statut :</strong> {currentCompteur.statut}</p>
            <p><strong>Adresse d'Installation :</strong> {currentCompteur.adresse_installation}</p>
          </div>
        )}

        {currentCompteur && currentCompteur.statut !== 'actif' && (
          <div className="message-error">
            Ce compteur est {currentCompteur.statut}. Vous ne pouvez pas effectuer de relevé.
          </div>
        )}

        <label>
          Ancien index :
          <input
            type="number"
            value={ancienIndex}
            onChange={(e) => setAncienIndex(e.target.value)}
            required
            readOnly
            disabled={!currentCompteur || currentCompteur.statut !== 'actif'}
          />
        </label>

        <label>
          Nouvel index :
          <input
            type="number"
            value={nouvelIndex}
            onChange={(e) => setNouvelIndex(e.target.value)}
            required
            disabled={!currentCompteur || currentCompteur.statut !== 'actif'}
          />
        </label>

        <label>
          Notes :
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={!currentCompteur || currentCompteur.statut !== 'actif'}
          />
        </label>

        <button type="submit" disabled={!isFormValid()} className="btn btn-primary">
          <FaCheck /> Ajouter relevé
        </button>
      </form>
    </div>
  );
}

export default SaisieManuelle;
