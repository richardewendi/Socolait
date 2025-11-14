const CompteurService = require('../services/compteur.service');
const ReleveService = require('../services/releve.service');

exports.addCompteur = async (req, res) => {
    try {
        const data = await CompteurService.addCompteur(req.body);

        // on ajoute le premier relevé automatiquement
        await ReleveService.addReleve({
            id_compteur: req.body.id_compteur,
            nouvel_index: parseInt(req.body.index_initial) || 0,
            ancien_index: 0,
            operateur_id: 1,
            notes: "Premier relevé automatique"
        });

        res.status(201).json(data);
    } catch (err) {
        console.error("Erreur addCompteur:", err);
        res.status(500).json({ error: "Erreur interne serveur" });
    }
};

exports.getAncienIndex = async (req, res) => {
    try {
        const data = await CompteurService.getAncienIndex(req.params.id);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Erreur interne serveur" });
    }
};
