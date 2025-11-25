// server.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;

// Pour pouvoir utiliser __dirname avec ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Servir les fichiers statiques du build React
app.use(express.static(path.join(__dirname, '../dist')));

// Exemple d'API
app.get('/api/compteurs/barcode/:barcode', (req, res) => {
  const { barcode } = req.params;
  res.json({
    compteur: {
      barcode,
      statut: 'actif', // Propriété ajoutée
    },
  });
});

// Route catch-all pour React (Express 5 compatible)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
