import express from "express";
import { pool } from "../db.js"; // Assurez-vous que le fichier db.js existe et contient une connexion à la base de données

const router = express.Router();

// Route GET pour récupérer les relevés
router.get("/", async (req, res) => {
    try {
        const query = `
SELECT 
    r.id_releve,
    c.numero_compteur,
    c.code_bar,
    r.date_releve,
    r.ancien_index,
    r.nouvel_index,
    r.consommation
FROM releve r
JOIN compteur c ON r.id_compteur = c.id_compteur
ORDER BY r.date_releve DESC;

        `;
        const result = await pool.query(query);
        res.status(200).json({ releves: result.rows });
    } catch (err) {
        console.error("Erreur GET /releves :", err);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
});

// Route POST pour ajouter un relevé
router.post("/", async (req, res) => {
    const { id_compteur, nouvel_index, ancien_index, operateur_id, notes } = req.body;

    // Validation des champs obligatoires
    if (!id_compteur || nouvel_index == null || ancien_index == null || !operateur_id) {
        return res.status(400).json({ message: "Champs obligatoires manquants." });
    }

    // Validation des types de données (index et operateur doivent être des nombres)
    if (isNaN(nouvel_index) || isNaN(ancien_index) || isNaN(operateur_id)) {
        return res.status(400).json({ message: "Les index et l'opérateur doivent être des nombres." });
    }

    // Vérification que le compteur existe dans la base de données
    try {
        const checkCompteurQuery = `SELECT COUNT(*) FROM compteur WHERE id_compteur = $1`;
        const checkCompteurResult = await pool.query(checkCompteurQuery, [id_compteur]);

        if (checkCompteurResult.rows[0].count === "0") {
            return res.status(404).json({ message: "Compteur non trouvé." });
        }
    } catch (err) {
        console.error("Erreur lors de la vérification du compteur :", err);
        return res.status(500).json({ message: "Erreur interne du serveur." });
    }

    // Définir la date du relevé
    const date_releve = new Date().toISOString();

    try {
        // Insertion dans la base de données
        const query = `
            INSERT INTO releve (id_compteur, nouvel_index, ancien_index, operateur_id, notes, date_releve)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const result = await pool.query(query, [id_compteur, nouvel_index, ancien_index, operateur_id, notes, date_releve]);

        // Retourner l'objet inséré
        res.status(201).json({ message: "Relevé ajouté avec succès.", releve: result.rows[0] });
    } catch (err) {
        console.error("Erreur lors de l'insertion du relevé :", err);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
});

export default router;
