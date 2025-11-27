import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// Route GET pour récupérer les relevés
router.get("/", async (req, res) => {
    try {
        const query = `
SELECT 
    r.id,
    c.numero_compteur,
    c.code_barre,
    r.date_releve,
    r.ancien_index,
    r.nouvel_index,
    r.consommation
FROM releves r
JOIN compteurs c ON r.id_compteur = c.id
ORDER BY r.date_releve DESC;
        `;
        const result = await pool.query(query);
        res.status(200).json({ releves: result.rows });
    } catch (err) {
        console.error("Erreur GET /releves :", err);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
});

router.post("/", async (req, res) => {
    const { id_compteur, nouvel_index, ancien_index, operateur_id, notes } = req.body;

    // ✅ correction du test
    if (id_compteur == null || nouvel_index == null || ancien_index == null || operateur_id == null) {
        return res.status(400).json({ message: "Champs obligatoires manquants." });
    }

    if (isNaN(nouvel_index) || isNaN(ancien_index) || isNaN(operateur_id)) {
        return res.status(400).json({ message: "Les index et l'opérateur doivent être des nombres." });
    }

    try {
        const checkCompteurQuery = `SELECT COUNT(*) FROM compteurs WHERE id = $1`;
        const checkCompteurResult = await pool.query(checkCompteurQuery, [id_compteur]);

        if (checkCompteurResult.rows[0].count === "0") {
            return res.status(404).json({ message: "Compteur non trouvé." });
        }
    } catch (err) {
        console.error("Erreur lors de la vérification du compteur :", err);
        return res.status(500).json({ message: "Erreur interne du serveur : vérification compteur" });
    }

    const date_releve = new Date().toISOString();
    const consommation = Number(nouvel_index) - Number(ancien_index);
    const safeNotes = notes ?? null;

    try {
        const query = `
            INSERT INTO releves (id_compteur, nouvel_index, ancien_index, consommation, operateur_id, notes, date_releve)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const result = await pool.query(query, [
            id_compteur,
            nouvel_index,
            ancien_index,
            consommation,
            operateur_id,
            safeNotes,
            date_releve
        ]);

        res.status(201).json({ message: "Relevé ajouté avec succès.", releve: result.rows[0] });
    } catch (err) {
        console.error("Erreur lors de l'insertion du relevé :", err);
        res.status(500).json({ message: "Erreur interne du serveur : insertion relevé" });
    }
});


export default router;
