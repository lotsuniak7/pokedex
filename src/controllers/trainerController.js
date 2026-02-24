const Trainer = require('../models/trainerModel');

const create = async (req, res) => {
    try {
        // ТЕРМИНАЛ ПОКАЖЕТ, ЧТО ВНУТРИ req.user
        console.log("Les données de token (req.user):", req.user);

        if (!req.user || !req.user.username) {
            return res.status(401).json({ error: "Username manquant dans le token !" });
        }

        const existing = await Trainer.findOne({ username: req.user.username });
        if (existing) {
            return res.status(400).json({ error: "Profil trainer déjà existant" });
        }

        const newTrainer = new Trainer({
            username: req.user.username,
            trainerName: req.body.trainerName,
            imgUrl: req.body.imgUrl || ""
    });

        await newTrainer.save();
        res.status(201).json(newTrainer);
    } catch (error) {
        console.log("ПОЛНАЯ ОШИБКА:", error.message);
        res.status(500).json({ error: error.message });
    }
};

// Recuperer le profil d'utilisateur actuel
const getProfile = async (req, res) => {
    try {
        // Utilise .populate, pour voir tous les données pas un seul id
        const trainer = await Trainer.findOne({ username: req.user.username })
            .populate('pkmnSeen')
            .populate('pkmnCatch');

        if (!trainer) return res.status(404).json({ error: "Trainerr non trouvé" });
        res.status(200).json(trainer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Mettre à jour les donneés
const update = async (req, res) => {
    try {
        const updatedTrainer = await Trainer.findOneAndUpdate(
            { username: req.user.username },
            { $set: req.body },
            { returnDocument: 'after' }
        );
        res.status(200).json(updatedTrainer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Supprimer le profil
const deleteProfile = async (req, res) => {
    try {
        await Trainer.findOneAndDelete({ username: req.user.username });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PAjouter pokemon
const markPokemon = async (req, res) => {
    try {
        const { pokemonId, isCaptured } = req.body; // Параметр из ТЗ

        const trainer = await Trainer.findOne({ username: req.user.username });
        if (!trainer) return res.status(404).json({ error: "Trainer non trouvé" });

        if (isCaptured) {
            // Ajouter dans la liste "Catch"
            if (!trainer.pkmnCatch.includes(pokemonId)) {
                trainer.pkmnCatch.push(pokemonId);
            }
        } else {
            // Ajoute dans la liste des pokemons déjà vues
            if (!trainer.pkmnSeen.includes(pokemonId)) {
                trainer.pkmnSeen.push(pokemonId);
            }
        }

        await trainer.save();
        res.status(200).json(trainer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    create,
    getProfile,
    update,
    delete: deleteProfile,
    markPokemon
};