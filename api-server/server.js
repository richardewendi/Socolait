// server.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Servir les fichiers statiques de ton dossier "projet"
app.use(express.static(path.join(__dirname, '../projet')));

// Ton API
app.get('/api/compteurs/barcode/:barcode', (req, res) => {
  const { barcode } = req.params;
  res.json({
    compteur: {
      barcode,
      statut: 'actif',
    },
  });
});

// Catch-all (Express 5 compatible)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../projet/index.html'));
});

// Lancer serveur
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
