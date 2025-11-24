// Route GET pour récupérer les relevés
router.get("/", async (req, res) => {
    try {
        const query = `
            SELECT 
                r.id, 
                c.numero_compteur, 
                c.code_barre, 
                r.date_releve, 
                r.ancien_index, 
                r.nouvel_index,
                r.nouvel_index - r.ancien_index AS consommation
            FROM releve r
            JOIN compteur c ON r.id_compteur = c.id_compteur
            ORDER BY r.date_releve DESC;
        `;
        const result = await pool.query(query);
        res.status(200).json({ releves: result.rows });
    } catch (err) {
        console.error("Erreur GET /releves :", err);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
});
