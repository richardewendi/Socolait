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

// ----------------- SIMULATION BASE DE DONNÉES -----------------
let compteurs = []; // tableau des compteurs
let releves = [];   // tableau des relevés

// ----------------- ROUTES API -----------------

// POST Nouveau Compteur
app.post('/api/compteurs', (req, res) => {
  const { id_compteur, adresse_installation, type_compteur, Diamètre_nominale, date_installation } = req.body;
  
  const nouveauCompteur = {
    id_compteur: id_compteur || Date.now().toString(),
    adresse_installation,
    type_compteur,
    Diamètre_nominale,
    date_installation,
    statut: 'actif',
  };

  compteurs.push(nouveauCompteur);
  res.status(201).json(nouveauCompteur);
});

// GET tous les compteurs
app.get('/api/compteurs', (req, res) => {
  res.json(compteurs);
});

// GET un compteur par ID
app.get('/api/compteurs/:id', (req, res) => {
  const { id } = req.params;
  const compteur = compteurs.find(c => c.id_compteur === id);
  if (!compteur) return res.status(404).json({ error: 'Compteur non trouvé' });

  // Récupérer le dernier index
  const dernierReleve = releves
    .filter(r => r.id_compteur === id)
    .sort((a, b) => b.date - a.date)[0] || { nouvel_index: 0 };

  res.json({ ...compteur, ancien_index: dernierReleve.nouvel_index });
});

// POST Relevé
app.post('/api/releves', (req, res) => {
  const { id_compteur, nouvel_index, ancien_index, operateur_id, notes } = req.body;

  const nouveauReleve = {
    id_compteur,
    nouvel_index,
    ancien_index,
    operateur_id: operateur_id || 1,
    notes,
    date: new Date(),
  };

  releves.push(nouveauReleve);
  res.status(201).json(nouveauReleve);
});

// GET tous les relevés
app.get('/api/releves', (req, res) => {
  res.json(releves);
});

// GET Barcode
app.get('/api/compteurs/barcode/:barcode', (req, res) => {
  const { barcode } = req.params;
  const compteur = compteurs.find(c => c.id_compteur === barcode);
  res.json({ compteur: compteur || { barcode, statut: 'actif' } });
});

// ----------------- CATCH-ALL POUR SPA -----------------
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(FRONT_PATH, 'index.html'));
});

// ----------------- LANCEMENT DU SERVEUR -----------------
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
