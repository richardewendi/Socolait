import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// GET : récupérer tous les compteurs avec les relevés associés
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `
SELECT DISTINCT ON (c.id_compteur)
  c.id_compteur,
  c.numero_compteur,
  c.code_bar,
  c.adresse_installation,
  c.type_compteur,
  c.statut,
  r.nouvel_index
FROM compteur c
LEFT JOIN releve r ON c.id_compteur = r.id_compteur
ORDER BY c.id_compteur, r.date_releve DESC;

      `
    );
    res.json({ compteurs: result.rows });
  } catch (err) {
    console.error("Erreur GET /compteurs :", err);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
});

export default router;
