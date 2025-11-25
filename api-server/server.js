// server.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 10000;

// Pour pouvoir utiliser __dirname avec ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CHEMIN DU BUILD Vite
const FRONT_PATH = path.join(__dirname, '../dist');

// Middleware pour parser le JSON
app.use(express.json());

// Servir les fichiers statiques du build
app.use(express.static(FRONT_PATH));

// ----------------- ROUTES API SIMPLIFIÉES -----------------

// POST Nouveau Compteur
app.post('/api/compteurs', (req, res) => {
  const { id_compteur, adresse_installation, type_compteur, Diamètre_nominale, date_installation } = req.body;
  // Réponse fictive pour test
  res.status(201).json({ id_compteur, statut: 'créé' });
});

// GET tous les compteurs
app.get('/api/compteurs', (req, res) => {
  res.json(compteurs);
});

// GET Ancien index
app.get('/api/compteurs/:id', (req, res) => {
  const { id } = req.params;
  res.json({ id_compteur: id, ancien_index: 0 });
});

// POST Relevé
app.post('/api/releves', (req, res) => {
  const { id_compteur, nouvel_index, ancien_index, operateur_id, notes } = req.body;
  res.status(201).json({ id_compteur, nouvel_index, ancien_index, operateur_id: operateur_id || 1, notes });
});

// GET Barcode
app.get('/api/compteurs/barcode/:barcode', (req, res) => {
  const { barcode } = req.params;
  res.json({ compteur: { barcode, statut: 'actif' } });
});

// Catch-all pour SPA
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(FRONT_PATH, 'index.html'));
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
