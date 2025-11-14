const db = require('../db.js');

// ➤ Ajouter un compteur
exports.addCompteur = async ({ numero_compteur, code_bar, adresse_installation, type_compteur, diametre_nominale, date_installation }) => {
    
    const query = `
        INSERT INTO compteur (numero_compteur, code_bar, adresse_installation, type_compteur, diametre_nominale, date_installation)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
    `;

    const values = [numero_compteur, code_bar, adresse_installation, type_compteur, diametre_nominale, date_installation];
    const result = await db.query(query, values);

    return result.rows[0]; // Retourne l'objet complet avec id_compteur auto-généré
};

// ➤ Récupérer l'ancien index pour un compteur
exports.getAncienIndex = async (id) => {
    const query = `
        SELECT COALESCE(MAX(r.nouvel_index), 0) AS ancien_index
        FROM compteur c
        LEFT JOIN releve r ON c.id_compteur = r.id_compteur
        WHERE c.id_compteur = $1
    `;

    const result = await db.query(query, [id]);
    return result.rows[0];
};
