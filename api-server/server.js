// server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import compteurRoutes from "./routes/compteur.js"; 
import releveRoutes from "./routes/releve.routes.js"; 
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 10000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Build Vite
const FRONT_PATH = path.join(__dirname, "../dist");

app.use(cors());
app.use(express.json());

// ---- ACTIVER LES ROUTES API ----
app.use("/api/compteurs", compteurRoutes);
app.use("/api/releves", releveRoutes);

// ---- SERVIR LE FRONT (Vite) ----
app.use(express.static(FRONT_PATH));

// ----------------- CATCH-ALL POUR SPA -----------------
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(FRONT_PATH, 'index.html'));
});

// ----------------- LANCEMENT DU SERVEUR -----------------
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
