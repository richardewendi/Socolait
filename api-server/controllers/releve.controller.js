const ReleveService = require('../services/releve.service');

exports.addReleve = async (req, res) => {
    try {
        const data = await ReleveService.addReleve(req.body);
        res.status(201).json(data);
    } catch (err) {
        res.status(500).json({ error: "Erreur interne" });
    }
};
