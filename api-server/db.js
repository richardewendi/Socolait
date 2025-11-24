// db.js
import pkg from "pg";
const { Pool } = pkg;

export const pool = new Pool({
    user: process.env.DB_USER,        // utilisateur DB Render
    password: process.env.DB_PASS,    // mot de passe DB Render
    host: process.env.DB_HOST,        // host DB Render
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,    // nom de la DB
    ssl: { rejectUnauthorized: false } // utile si DB distante avec SSL
});
