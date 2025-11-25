// server.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 10000;

// Pour pouvoir utiliser __dirname avec ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CHEMIN DU BUILD
// CRA -> build/      Vite -> dist/
const FRONT_PATH = path.join(__dirname, '../dist'); // ou '../build' si CRA

// Servir les fichiers statiques du build
app.use(express.static(FRONT_PATH));

// Exemple d'API

// 1. Enregistrer un Nouveau Compteur (POST)
app.post('/api/compteurs', async (req, res) => {
    const { id_compteur, adresse_installation, type_compteur, Diamètre_nominale, date_installation } = req.body;
    
    const query = 'INSERT INTO compteur (id_compteur, adresse_installation, type_compteur, Diamètre_nominale, date_installation) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    const values = [id_compteur, adresse_installation, type_compteur, Diamètre_nominale, date_installation];
    
    try {
        const result = await db.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Erreur lors de l'ajout du compteur:", err);
        res.status(500).send('Erreur interne du serveur lors de l\'ajout.');
    }
});


// 2. Récupérer l'Index Précédent (GET)
// Cette route est cruciale pour le composant ReleveCompteur.jsx
app.get('/api/compteurs/:id', async (req, res) => {
    const { id } = req.params;
    
    // Jointure pour obtenir le dernier index enregistré pour ce compteur
    const query = `
        SELECT COALESCE(MAX(r.nouvel_index), 0) AS ancien_index
        FROM compteur c
        LEFT JOIN releve r ON c.id_compteur = r.id_compteur
        WHERE c.id_compteur = $1;
    `;
    
    try {
        const result = await db.query(query, [id]);
        
        // Si le compteur existe, renvoyer l'ancien index (ou 0 si c'est la première fois)
        if (result.rows.length > 0) {
            res.json({ id_compteur: id, ancien_index: result.rows[0].ancien_index });
        } else {
            res.status(404).send('Compteur non trouvé.');
        }

    } catch (err) {
        console.error("Erreur de récupération de l'ancien index:", err);
        res.status(500).send('Erreur interne du serveur.');
    }
});


// 3. Enregistrer un Relevé (POST)
app.post('/api/releves', async (req, res) => {
    const { id_compteur, nouvel_index, ancien_index, operateur_id, notes } = req.body;
    
    const query = 'INSERT INTO releve (id_compteur, nouvel_index, ancien_index, operateur_id, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    const values = [id_compteur, nouvel_index, ancien_index, operateur_id || 1, notes]; // operateur_id en dur pour l'instant

    try {
        const result = await db.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Erreur lors de l'enregistrement du relevé:", err);
        res.status(500).send('Erreur interne du serveur lors de l\'enregistrement.');
    }
});
app.get('/api/compteurs/barcode/:barcode', (req, res) => {
  const { barcode } = req.params;
  res.json({
    compteur: {
      barcode,
      statut: 'actif',
    },
  });
});

// Catch-all pour SPA
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(FRONT_PATH, 'index.html'));
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
