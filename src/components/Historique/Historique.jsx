import React, { useState, useEffect } from "react";
import { FaTable, FaCalendarAlt, FaWater, FaFilePdf, FaFileExcel, FaFileWord, FaHome } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "../../styles/historique.css";

const Historique = () => {
    const [releves, setReleves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchReleves = async () => {
            try {
                const response = await fetch("http://localhost:3000/api/releves");
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

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.text("Historique des Relevés", 20, 10);
        autoTable(doc, {
            head: [["ID Compteur", "Code Barre", "Date", "Ancien Index", "Nouvel Index", "Consommation"]],
            body: releves.map(r => [r.numero_compteur, r.code_barre, new Date(r.date_releve).toLocaleDateString("fr-FR"), r.ancien_index, r.nouvel_index, r.consommation]),
        });
        doc.save("historique_releves.pdf");
    };

    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(releves.map(r => ({
            "ID Compteur": r.numero_compteur, "Code Barre": r.code_barre, "Date": new Date(r.date_releve).toLocaleDateString("fr-FR"), "Ancien Index": r.ancien_index, "Nouvel Index": r.nouvel_index, "Consommation": r.consommation
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Historique");
        XLSX.writeFile(workbook, "historique_releves.xlsx");
    };

    const handleExportWord = () => {
        const header = "<html><head><meta charset='utf-8'><title>Historique</title></head><body>";
        const footer = "</body></html>";
        const table = `<h2>Historique des Relevés</h2><table border="1">... (table content) ...</table>`; // simplified for brevity
        const sourceHTML = header + `<h2>Historique des Relevés</h2>
            <table border="1">
                <thead>
                    <tr>
                        <th>ID Compteur</th>
                        <th>Code Barre</th>
                        <th>Date du Relevé</th>
                        <th>Ancien Index (m³)</th>
                        <th>Nouvel Index (m³)</th>
                        <th>Consommation (m³)</th>
                    </tr>
                </thead>
                <tbody>
                    ${releves.map(r => `<tr><td>${r.numero_compteur || ''}</td><td>${r.code_barre || ''}</td><td>${new Date(r.date_releve).toLocaleDateString("fr-FR")}</td><td>${r.ancien_index}</td><td>${r.nouvel_index}</td><td>${r.consommation}</td></tr>`).join('')}
                </tbody>
            </table>` + footer;
        saveAs(new Blob([sourceHTML], { type: "application/msword" }), 'historique_releves.doc');
    };

    if (loading) return <p>Chargement...</p>;
    if (error) return <p style={{ color: "red" }}>Erreur: {error}</p>;

    return (
        <div className="historique-container">
            <h2><FaTable /> Historique des Relevés</h2>

            <div className="historique-actions">
                <button className="btn-retour" onClick={() => navigate("/home")}>
                    <FaHome />
                    Retour à l'accueil
                </button>
                <div className="export-buttons">
                    <button onClick={handleExportPDF} disabled={releves.length === 0} title="PDF"><FaFilePdf /> PDF</button>
                    <button onClick={handleExportExcel} disabled={releves.length === 0} title="Excel"><FaFileExcel /> Excel</button>
                    <button onClick={handleExportWord} disabled={releves.length === 0} title="Word"><FaFileWord /> Word</button>
                </div>
            </div>

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
                                <td colSpan="6" style={{ textAlign: 'center' }}>Aucun relevé trouvé.</td>
                            </tr>
                        ) : (
                            releves.map((releve) => (
                                <tr key={releve.id}>
                                    <td data-label="Compteur ID">{releve.numero_compteur}</td>
                                    <td data-label="Code Barre">{releve.code_barre}</td>
                                    <td data-label="Date">{new Date(releve.date_releve).toLocaleDateString("fr-FR")}</td>
                                    <td data-label="Ancien Index">{releve.ancien_index}</td>
                                    <td data-label="Nouvel Index">{releve.nouvel_index}</td>
                                    <td data-label="Consommation" className="consommation-cell">{releve.consommation}</td>
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
