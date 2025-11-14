import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// ➤ Ajouter un compteur
router.post("/", async (req, res) => {
    const {
        numero_compteur,
        code_bar,
        adresse_installation,
        type_compteur,
        diametre_nominale,
        date_installation
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO compteur 
                (numero_compteur, code_bar, adresse_installation, type_compteur, diametre_nominale, date_installation)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [numero_compteur, code_bar, adresse_installation, type_compteur, diametre_nominale, date_installation]
        );

        res.json(result.rows[0]); // Retourne l'objet complet avec id_compteur auto-généré
    } catch (err) {
        console.error("Erreur lors de l'ajout du compteur:", err.message);
        res.status(500).send(err.message);
    }
});

export default router;
