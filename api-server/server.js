import express from "express";
import cors from "cors";

import compteurRoutes from "./routes/compteur.routes.js";
import releveRoutes from "./routes/releve.routes.js";
import compteurRouter from "./routes/compteur.js";  
// Si compteur.js est un ancien fichier
// import compteurRouter from "./routes/compteur.js";

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

// Routes API unifiées
app.use("/api/compteurs", compteurRoutes);
app.use("/api/releves", releveRoutes);
app.use("/compteurs", compteurRouter);
// app.use("/api/compteurs-old", compteurRouter);

app.listen(3000, () => {
    console.log("🚀 Serveur API sur http://localhost:3000");
    testDB();
});
