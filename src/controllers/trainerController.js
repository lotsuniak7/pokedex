const Trainer = require('../models/trainerModel');
const Pokemon = require('../models/pkmnModel');

const create = async (req, res) => {
    try {
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
        console.log("Erreur totale:", error.message);
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

// Ajouter pokemon
const markPokemon = async (req, res) => {
    try {
        const { isCaptured } = req.body;
        let pokemonId = req.body.pokemonId;

        // 🧙‍♂️ Si la requete est de test (24 chiffres)
        if (String(pokemonId).length === 24) {
            const pkmn = await Pokemon.findById(pokemonId);
            if (pkmn) pokemonId = pkmn.id;
        } else {
            // Si la requete de Front
            pokemonId = Number(pokemonId);
        }

        const trainer = await Trainer.findOne({ username: req.user.username });
        if (!trainer) return res.status(404).json({ error: "Trainer non trouvé" });

        // S'assurer que les listes sont presentes
        if (!trainer.pkmnCatch) trainer.pkmnCatch = [];
        if (!trainer.pkmnSeen) trainer.pkmnSeen = [];

        if (isCaptured) {
            // Ajouter dans la liste "Catch"
            const alreadyCaught = trainer.pkmnCatch.some(id => id.toString() === pokemonId.toString());
            if (!alreadyCaught) {
                trainer.pkmnCatch.push(pokemonId);
            }
        } else {
            // Ajoute dans la liste des pokemons déjà vues
            const alreadySeen = trainer.pkmnSeen.some(id => id.toString() === pokemonId.toString());
            if (!alreadySeen) {
                trainer.pkmnSeen.push(pokemonId);
            }
        }

        await trainer.save();
        res.status(200).json(trainer);
    } catch (error) {
        console.error("Erreur markPokemon:", error.message);
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