import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// GET : récupérer tous les compteurs avec les relevés associés
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `
SELECT DISTINCT ON (c.id)
  c.id,
  c.numero_compteur,
  c.code_barre,
  c.adresse_installation,
  c.type_compteur,
  c.diametre_nominal,
  c.date_installation,
  c.statut,
  r.nouvel_index
FROM compteurs c
LEFT JOIN releves r ON c.id = r.id_compteur
ORDER BY c.id, r.date_releve DESC;

      `
    );
    res.json({ compteurs: result.rows });
  } catch (err) {
    console.error("Erreur GET /compteurs :", err);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
});

// GET : Récupérer un compteur par son code-barres
router.get("/barcode/:code_barre", async (req, res) => {
  const { code_barre } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT
        c.id,
        c.numero_compteur,
        c.code_barre,
        c.adresse_installation,
        c.statut,
        r.nouvel_index
      FROM compteurs c
      LEFT JOIN (
        SELECT id_compteur, nouvel_index, ROW_NUMBER() OVER(PARTITION BY id_compteur ORDER BY date_releve DESC) as rn
        FROM releves
      ) r ON c.id = r.id_compteur AND r.rn = 1
      WHERE c.code_barre = $1
      `,
      [code_barre]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Compteur non trouvé." });
    }

    res.json({ compteur: result.rows[0] });
  } catch (err) {
    console.error("Erreur GET /barcode/:code_barre :", err);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
});

// GET : Récupérer un compteur par son ID
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("SELECT * FROM compteurs WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Compteur non trouvé." });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Erreur GET /compteurs/:id :", err);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
});

// ➤ Ajouter un compteur
router.post("/", async (req, res) => {
  const {
    numero_compteur,
    code_barre,
    adresse_installation,
    type_compteur,
    diametre_nominal,
    date_installation,
    statut = "actif"
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO compteurs 
        (numero_compteur, code_barre, adresse_installation, type_compteur,  diametre_nominal, date_installation, statut)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        numero_compteur,
        code_barre,
        adresse_installation,
        type_compteur,
        diametre_nominal,
        date_installation,
        statut
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erreur lors de l'ajout du compteur:", err.message);
    res.status(500).send(err.message);
  }
});


// DELETE : Supprimer un compteur par son ID
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const deleteOp = await pool.query("DELETE FROM compteurs WHERE id = $1", [id]);
        if (deleteOp.rowCount === 0) {
            return res.status(404).json({ message: "Compteur non trouvé." });
        }
        res.status(200).json({ message: "Compteur supprimé avec succès." });
    } catch (err) {
        console.error("Erreur lors de la suppression du compteur:", err.message);
        res.status(500).send(err.message);
    }
});

// PUT : Mettre à jour un compteur
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const {
        numero_compteur,
        code_barre,
        adresse_installation,
        type_compteur,
        diametre_nominal,
        statut,
        date_installation
    } = req.body;

    try {
        const result = await pool.query(
            `UPDATE compteurs 
             SET numero_compteur = $1, code_barre = $2, adresse_installation = $3, type_compteur = $4, diametre_nominal = $5, statut = $6, date_installation = $7
             WHERE id = $8
             RETURNING *`,
            [numero_compteur, code_barre, adresse_installation, type_compteur, diametre_nominal, statut, date_installation, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Compteur non trouvé." });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Erreur lors de la mise à jour du compteur:", err.message);
        res.status(500).send(err.message);
    }
});

export default router;
