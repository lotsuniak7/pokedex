const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/userModel');

describe('Auth & Permissions', () => {
    // On se connecte à la bd
    beforeAll(async () => {
        const url = 'mongodb://localhost:27017/pokedex_test'; // On utilise bd pour les tests
        await mongoose.connect(url);
    });

    // On arrete juste apres les tests
    afterAll(async () => {
        await mongoose.connection.close();
    });

    // On vide base de données aprés chaque test
    beforeEach(async () => {
        await User.deleteMany({});
    });

    it('SHOULD FAIL login with wrong password', async () => {
        // D'abord créer un user
        await request(app).post('/api/auth/register').send({
            username: 'testuser',
            password: 'correct-password'
        });

        // On essaie de se connecter avec un mauvais mot de passe
        const res = await request(app).post('/api/auth/login').send({
            username: 'testuser',
            password: 'wrong-password'
        });

        // resultat
        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error');
    });

    it('SHOULD NOT allow creating pokemon without ADMIN role', async () => {
        // On crée un copte et on se connecte
        await request(app).post('/api/auth/register').send({
            username: 'trainer',
            password: 'password'
        });
        const loginRes = await request(app).post('/api/auth/login').send({
            username: 'trainer',
            password: 'password'
        });

        const token = loginRes.body.token;

        // Création du pokemon
        const res = await request(app)
            .post('/api/pkmn')
            .set('Authorization', `Bearer ${token}`)
            .send({ id: 1, name: 'Bulbasaur' });

        expect(res.statusCode).toBe(403);
    });
});