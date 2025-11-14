import pkg from "pg";
const { Pool } = pkg;

export const pool = new Pool({
    user: "postgres",
    password: "1234",      // 🔥 mets ton vrai mot de passe PostgreSQL ici
    host: "localhost",
    port: 5432,
    database: "compteur_eau"
});
