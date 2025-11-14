import React, { useState, useEffect } from "react";
import { FaTable, FaCalendarAlt, FaWater } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // <-- import pour navigation
import "../../styles/historique.css";

const Historique = () => {
    const [releves, setReleves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate(); // <-- hook pour navigation

    useEffect(() => {
        const fetchReleves = async () => {
            try {
                const response = await fetch("/api/releves");
                if (!response.ok) {
                    throw new Error(`Erreur ${response.status}: ${response.statusText}`);
                }
                const data = await response.json();
                setReleves(data.releves);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchReleves();
    }, []);

    if (loading) return <p>Chargement...</p>;
    if (error) return <p style={{ color: "red" }}>Erreur: {error}</p>;

    return (
        <div className="historique-container">
            <h2><FaTable /> Historique des Relevés</h2>

            {/* Bouton retour */}
            <button
                className="btn-retour"
                onClick={() => navigate("/")} // <-- redirige vers Home
            >
                Retour à l'accueil
            </button>

            <div className="table-responsive">
                <table className="releves-table">
                    <thead>
                        <tr>
                            <th><FaWater /> Compteur ID</th>
                            <th>Code Barre</th>
                            <th><FaCalendarAlt /> Date du Relevé</th>
                            <th>Ancien Index (m³)</th>
                            <th>Nouvel Index (m³)</th>
                            <th>Consommation (m³)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {releves.length === 0 ? (
                            <tr>
                                <td colSpan="6">Aucun relevé trouvé.</td>
                            </tr>
                        ) : (
                            releves.map((releve) => (
                                <tr key={releve.id_releve}>
                                    <td>{releve.numero_compteur}</td>
                                    <td>{releve.code_bar}</td>
                                    <td>{new Date(releve.date_releve).toLocaleDateString("fr-FR")}</td>
                                    <td>{releve.ancien_index}</td>
                                    <td>{releve.nouvel_index}</td>
                                    <td className="conso-cell">{releve.consommation}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Historique;
