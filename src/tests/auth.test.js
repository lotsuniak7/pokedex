const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/userModel');
const Pokemon = require('../models/pkmnModel');

describe('API Pokedex - Tests d\'Intégration', () => {
    let adminToken;
    let trainerToken;

    beforeAll(async () => {
        const url = 'mongodb://localhost:27017/pokedex_test';
        await mongoose.connect(url);
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        await User.deleteMany({});
        await Pokemon.deleteMany({});

        // Création de l'admin via enregistrement pour le hachage du mot de passe
        await request(app).post('/api/auth/register').send({
            username: 'adminTest',
            password: 'password123'
        });

        // Mise à jour MANUELLE du rôle en ADMIN dans la base de données
        await User.findOneAndUpdate({ username: 'adminTest' }, { role: 'ADMIN' });

        const adminLogin = await request(app).post('/api/auth/login').send({
            username: 'adminTest',
            password: 'password123'
        });
        adminToken = adminLogin.body.token;

        // Création d'un trainer classique
        await request(app).post('/api/auth/register').send({
            username: 'trainerTest',
            password: 'password123'
        });

        const trainerLogin = await request(app).post('/api/auth/login').send({
            username: 'trainerTest',
            password: 'password123'
        });
        trainerToken = trainerLogin.body.token;

        if (!adminToken) console.log("ERREUR : Token ADMIN manquant !");
    });

    it('DOIT créer un pokémon quand l\'utilisateur est ADMIN', async () => {
        const res = await request(app)
            .post('/api/pkmn')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Charmander',
                types: ['FIRE'],
                description: 'Loves hot things'
            });
        expect(res.statusCode).toBe(201);
    });

    it('DOIT trouver un pokémon par un nom partiel', async () => {
        await Pokemon.create({ name: 'Bulbasaur', types: ['GRASS'] });
        const res = await request(app)
            .get('/api/pkmn/search?partialName=bulba')
            .set('Authorization', `Bearer ${trainerToken}`);
        expect(res.statusCode).toBe(200);
    });

    it('DOIT mettre à jour le numéro de région s\'il existe déjà', async () => {
        const pkmn = await Pokemon.create({
            name: 'Mew',
            types: ['PSYCHIC'],
            regions: [{ regionName: 'Kanto', regionPokedexNumber: 151 }]
        });
        const res = await request(app)
            .post('/api/pkmn/region')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                pkmnID: pkmn._id.toString(),
                regionName: 'Kanto',
                regionPokedexNumber: 999
            });
        expect(res.statusCode).toBe(200);
    });

    it('NE DOIT PAS autoriser un dresseur à supprimer un pokémon', async () => {
        const pkmn = await Pokemon.create({ name: 'Weedle', types: ['BUG'] });
        const res = await request(app)
            .delete(`/api/pkmn?id=${pkmn._id}`)
            .set('Authorization', `Bearer ${trainerToken}`);
        expect(res.statusCode).toBe(403);
    });

    it('NE DOIT PAS créer un pokémon avec un nom déjà existant', async () => {
        const pkmnData = { name: 'Pikachu', types: ['ELECTRIC'] };
        await request(app).post('/api/pkmn').set('Authorization', `Bearer ${adminToken}`).send(pkmnData);

        const res = await request(app)
            .post('/api/pkmn')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(pkmnData);

        expect(res.statusCode).toBe(400);
    });

    it('DOIT filtrer la recherche par types', async () => {
        await Pokemon.create({ id: 100, name: 'Charmander', types: ['FIRE'] });
        await Pokemon.create({ id: 101, name: 'Squirtle', types: ['WATER'] });

        const res = await request(app)
            .get('/api/pkmn/search?typeOne=FIRE')
            .set('Authorization', `Bearer ${trainerToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].name).toBe('Charmander');
    });

    it('DOIT supprimer una région spécifique d\'un pokémon', async () => {
        const pkmn = await Pokemon.create({
            name: 'Bulbasaur',
            types: ['GRASS'],
            regions: [
                { regionName: 'Kanto', regionPokedexNumber: 1 },
                { regionName: 'Johto', regionPokedexNumber: 152 }
            ]
        });

        const res = await request(app)
            .delete(`/api/pkmn/region?pkmnID=${pkmn._id}&regionName=Kanto`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(204);

        const updatedPkmn = await Pokemon.findById(pkmn._id);
        expect(updatedPkmn.regions.length).toBe(1);
        expect(updatedPkmn.regions[0].regionName).toBe('Johto');
    });

    it('DOIT retourner 404 pour un pokémon inexistant', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .get(`/api/pkmn?id=${fakeId}`)
            .set('Authorization', `Bearer ${trainerToken}`);

        expect(res.statusCode).toBe(404);
    });
});