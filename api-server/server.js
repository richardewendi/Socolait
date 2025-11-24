// server.js
import express from "express";
import cors from "cors";

import releveRoutes from "./routes/releve.routes.js";
import compteurRouter from "./routes/compteur.js";

import { pool } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

// Test DB
const testDB = async () => {
    try {
        const now = await pool.query("SELECT NOW()");
        console.log("✅ Connecté à PostgreSQL. Heure DB:", now.rows[0].now);
    } catch (err) {
        console.error("❌ Erreur connexion DB:", err.message);
    }
};

// Routes API
app.use("/api/compteurs", compteurRouter);
app.use("/api/releves", releveRoutes);

// Dossier static pour le front-end Vite build
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur API sur http://localhost:${PORT}`);
    testDB();
});
