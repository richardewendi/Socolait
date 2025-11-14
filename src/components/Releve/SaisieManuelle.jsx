import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/saisieManuelle.css";

function SaisieManuelle() {
  const [compteurs, setCompteurs] = useState([]);
  const [selectedCompteur, setSelectedCompteur] = useState("");
  const [nouvelIndex, setNouvelIndex] = useState("");
  const [ancienIndex, setAncienIndex] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate(); // pour navigation

  useEffect(() => {
    fetch("http://localhost:3000/compteurs")
      .then((res) => {
        if (!res.ok) throw new Error(`Erreur réseau : ${res.status}`);
        return res.json();
      })
      .then((data) => setCompteurs(data.compteurs))
      .catch(() => setError("Erreur de récupération des compteurs."));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedCompteur || !nouvelIndex || !ancienIndex) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    if (parseFloat(nouvelIndex) <= parseFloat(ancienIndex)) {
      setError("Le nouvel index doit être supérieur à l'ancien index.");
      return;
    }

    const payload = {
      id_compteur: selectedCompteur,
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
        setAncienIndex("");
        setNotes("");
      })
      .catch(() => {
        setError("Une erreur est survenue lors de l'ajout du relevé.");
        setSuccess("");
      });
  };

  const isFormValid = () => selectedCompteur && nouvelIndex && ancienIndex;

  return (
    <div className="saisie-container">
      <h2>Saisie Manuelle de Relevés</h2>

      <button className="btn-retour" onClick={() => navigate("/")}>
        Retour à l'accueil
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
              const compteur = compteurs.find((c) => c.id_compteur === parseInt(id));
              setAncienIndex(compteur ? compteur.nouvel_index : "");
            }}
          >
            <option value="">-- Sélectionner un compteur --</option>
            {compteurs.map((compteur) => (
              <option key={compteur.id_compteur} value={compteur.id_compteur}>
                {compteur.numero_compteur}
              </option>
            ))}
          </select>
        </label>

        <label>
          Ancien index :
          <input
            type="number"
            value={ancienIndex ?? ""}
            onChange={(e) => setAncienIndex(e.target.value)}
            required
          />
        </label>

        <label>
          Nouvel index :
          <input
            type="number"
            value={nouvelIndex}
            onChange={(e) => setNouvelIndex(e.target.value)}
            required
          />
        </label>

        <label>
          Notes :
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>

        <button type="submit" disabled={!isFormValid()}>
          Ajouter relevé
        </button>
      </form>
    </div>
  );
}

export default SaisieManuelle;
