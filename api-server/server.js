// server.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 10000;

// Pour pouvoir utiliser __dirname avec ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Servir les fichiers statiques de la racine
app.use(express.static(path.join(__dirname, '..')));

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

// Catch-all pour React ou autre SPA
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
