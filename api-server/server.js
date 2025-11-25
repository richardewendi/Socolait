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
app.use(express.static(path.join(__dirname, '../build')));

// Exemple d'API
app.get('/api/compteurs/barcode/:barcode', (req, res) => {
  const { barcode } = req.params;
  // Exemple de réponse
  res.json({
    compteur: {
      barcode,
      statut: 'actif', // Ajoute ici la propriété "statut"
    },
  });
});

// Route catch-all pour React (toutes les autres routes)
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
