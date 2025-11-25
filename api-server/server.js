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
