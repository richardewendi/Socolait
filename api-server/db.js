// db.js
import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

// Configuration de la connexion à la base de données
// Utilise la chaîne de connexion de Render en production, sinon fallback sur les identifiants locaux
export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

// Fallback pour le développement local si DATABASE_URL n'est pas défini
if (!process.env.DATABASE_URL) {
    Object.assign(pool.options, {
        user: "compteur_eau_user",
        password: "Hxm9lmmTHlhlAeqlO3iNeN5PCGb9vVsL",      // 🔥 Assurez-vous que c'est votre mot de passe local
        host: "dpg-d4ivqv15pdvs7386aqsg-a.oregon-postgres.render.com",
        port: 5432,
        database: "compteur_eau",
         ssl: { rejectUnauthorized: false }
    });
}
