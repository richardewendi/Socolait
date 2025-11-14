const db = require('../db.js');

exports.addReleve = async ({ id_compteur, nouvel_index, ancien_index, operateur_id, notes }) => {
    
    const query = `
        INSERT INTO releve (id_compteur, nouvel_index, ancien_index, operateur_id, notes)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;

    const values = [id_compteur, nouvel_index, ancien_index, operateur_id, notes];
    const result = await db.query(query, values);

    return result.rows[0];
};
