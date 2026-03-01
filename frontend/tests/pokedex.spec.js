// frontend/tests/pokedex.spec.js
import { test, expect } from '@playwright/test';

// ============================================================
//  STRATÉGIE DES COMPTES
//
//  ADMIN  → login fixe : root / root  (existe déjà en DB)
//  TRAINER → créé dynamiquement à chaque suite (role TRAINER par défaut)
//
//  Pourquoi ?
//  - root/root est garanti ADMIN → pas besoin de manipuler les rôles
//  - Les nouveaux comptes sont TRAINER par défaut → tests de la carte dresseur OK
// ============================================================

const API = 'http://localhost:3000/api';

// ── Credentials admin fixe ───────────────────────────────────
const ADMIN = { username: 'root', password: 'root' };

// ── Helpers ──────────────────────────────────────────────────

/** Crée un compte TRAINER et retourne son token */
async function createTrainer(request, suffix = '') {
    const username = `trainer_${Date.now()}${suffix}`;
    await request.post(`${API}/auth/register`, {
        data: { username, password: 'pass123' }
    });
    const res = await request.post(`${API}/auth/login`, {
        data: { username, password: 'pass123' }
    });
    const token = (await res.json()).token;
    return { username, token };
}

/** Récupère le token de l'admin root */
async function getAdminToken(request) {
    const res = await request.post(`${API}/auth/login`, {
        data: ADMIN
    });
    return (await res.json()).token;
}

/**
 * Injecte un token dans localStorage.
 * La page doit être sur un domaine valide → on passe par /login.
 */
async function injectToken(page, token) {
    await page.goto('/login');
    await page.evaluate((t) => localStorage.setItem('token', t), token);
}

// ============================================================
//  SUITE 1 — AUTHENTIFICATION
// ============================================================

test.describe('🔐 Authentification', () => {

    test('Redirige vers /login sans token', async ({ page }) => {
        await page.goto('/login');
        await page.evaluate(() => localStorage.clear());
        await page.goto('/');
        await expect(page).toHaveURL(/\/login/);
    });

    test('Affiche le formulaire de connexion', async ({ page }) => {
        await page.goto('/login');
        await expect(page.locator('.title-text')).toContainText('IDENTIFICATION');
        await expect(page.locator('input[autocomplete="username"]')).toBeVisible();
        await expect(page.locator('input[autocomplete="current-password"]')).toBeVisible();
        await expect(page.locator('.submit-btn')).toBeVisible();
    });

    test('Affiche erreur avec mauvaises credentials', async ({ page }) => {
        await page.goto('/login');
        await page.locator('input[autocomplete="username"]').fill('faux_user_xyz');
        await page.locator('input[autocomplete="current-password"]').fill('mauvais_mdp');
        await page.locator('.submit-btn').click();
        await expect(page.locator('.error-msg')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('.error-msg')).toContainText('ACCÈS REFUSÉ');
    });

    test('Bascule vers le formulaire d\'inscription', async ({ page }) => {
        await page.goto('/login');
        await page.locator('.toggle-mode-btn').click();
        await expect(page.locator('.title-text')).toContainText('NOUVEAU DRESSEUR');
        await expect(page.locator('.submit-btn')).toContainText("S'ENREGISTRER");
    });

    test('Connexion réussie → animation → redirige vers /', async ({ page }) => {
        // On utilise root/root — garanti d'exister
        await page.goto('/login');
        await page.locator('input[autocomplete="username"]').fill(ADMIN.username);
        await page.locator('input[autocomplete="current-password"]').fill(ADMIN.password);
        await page.locator('.submit-btn').click();

        // PokedexTransition prend ~2.9s avant router.push('/')
        // On attend d'abord l'overlay de la transition
        await expect(page.locator('.stage')).toBeVisible({ timeout: 6000 });
        // Puis la fin de l'animation
        await expect(page).toHaveURL('/', { timeout: 8000 });
    });

    test('Inscription nouveau dresseur → connexion auto → redirige vers /', async ({ page }) => {
        const uniqueUser = `new_reg_${Date.now()}`;
        await page.goto('/login');
        await page.locator('.toggle-mode-btn').click();
        await page.locator('input[autocomplete="username"]').fill(uniqueUser);
        await page.locator('input[autocomplete="current-password"]').fill('pass123');
        await page.locator('.submit-btn').click();

        await expect(page.locator('.stage')).toBeVisible({ timeout: 6000 });
        await expect(page).toHaveURL('/', { timeout: 8000 });
    });

});

// ============================================================
//  SUITE 2 — PAGE ACCUEIL (Pokédex grid)
// ============================================================

test.describe('🏠 Page Accueil — Pokédex', () => {

    let trainerToken;

    test.beforeEach(async ({ page, request }) => {
        const { token } = await createTrainer(request);
        trainerToken = token;
        await injectToken(page, trainerToken);
        await page.goto('/');
        await expect(page.locator('.loading-screen')).not.toBeVisible({ timeout: 10000 });
    });

    test('Charge et affiche la liste des Pokémon', async ({ page }) => {
        await expect(page.locator('.pkmn-card').first()).toBeVisible({ timeout: 8000 });
        expect(await page.locator('.pkmn-card').count()).toBeGreaterThan(0);
    });

    test('Chaque carte affiche l\'ID au format N°XXX', async ({ page }) => {
        const idText = await page.locator('.pkmn-card').first().locator('.card-id').textContent();
        expect(idText).toMatch(/N°\d{3}/);
    });

    test('Pokémon inconnu affiche ??? et INCONNU', async ({ page }) => {
        const unknowns = page.locator('.pkmn-card.card-unknown');
        if (await unknowns.count() > 0) {
            await expect(unknowns.first().locator('.card-name')).toContainText('???');
            await expect(unknowns.first().locator('.type-badge')).toContainText('INCONNU');
        }
    });

    test('La barre de recherche filtre les Pokémon', async ({ page }) => {
        const total = await page.locator('.pkmn-card').count();
        await page.locator('.search-input').fill('bulba');
        await page.waitForTimeout(700);
        expect(await page.locator('.pkmn-card').count()).toBeLessThanOrEqual(total);
    });

    test('Vider la recherche recharge toute la liste', async ({ page }) => {
        const initial = await page.locator('.pkmn-card').count();
        await page.locator('.search-input').fill('zzz_inexistant');
        await page.waitForTimeout(700);
        await page.locator('.search-input').fill('');
        await page.waitForTimeout(700);
        expect(await page.locator('.pkmn-card').count()).toBe(initial);
    });

    test('Les stats VU et CAPTURÉ sont affichées', async ({ page }) => {
        await expect(page.locator('.stats-display')).toContainText('VU:');
        await expect(page.locator('.stats-display')).toContainText('CAPTURÉ:');
    });

    test('Bouton PROFIL navigue vers /profile', async ({ page }) => {
        await page.locator('.small-btn-blue').click();
        await expect(page).toHaveURL(/\/profile/);
    });

    test('Bouton OFF supprime le token et redirige vers /login', async ({ page }) => {
        await page.locator('.small-btn-red').click();
        await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
        expect(await page.evaluate(() => localStorage.getItem('token'))).toBeNull();
    });

    test('Bouton RENCONTRER marque un Pokémon comme vu', async ({ page, request }) => {
        // Il faut un profil trainer pour pouvoir marquer
        await request.post(`${API}/trainer`, {
            data: { trainerName: 'TestHome' },
            headers: { Authorization: `Bearer ${trainerToken}` }
        });
        await page.reload();
        await expect(page.locator('.loading-screen')).not.toBeVisible({ timeout: 10000 });

        const btn = page.locator('.btn-encounter').first();
        if (await btn.count() > 0) {
            await btn.click();
            await expect(page.locator('.badge-seen').first()).toBeVisible({ timeout: 8000 });
        }
    });

});

// ============================================================
//  SUITE 3 — PROFIL CARTE DRESSEUR (TRAINER)
//  Maintenant que le default est TRAINER, ces tests passent !
// ============================================================

test.describe('👤 Profil — Carte Dresseur (TRAINER)', () => {

    let trainerToken;

    test.beforeEach(async ({ page, request }) => {
        const { token } = await createTrainer(request);
        trainerToken = token;
        await injectToken(page, trainerToken);
        await page.goto('/profile');
    });

    test('Affiche le formulaire de création si pas de profil', async ({ page }) => {
        await expect(page.locator('.tc-spinner')).not.toBeVisible({ timeout: 8000 });
        await expect(page.locator('.tc-create')).toBeVisible();
        await expect(page.locator('.tc-create-title')).toContainText('IDENTITÉ REQUISE');
    });

    test('Bouton ENREGISTRER désactivé si le nom est vide', async ({ page }) => {
        await expect(page.locator('.tc-spinner')).not.toBeVisible({ timeout: 8000 });
        await expect(page.locator('.tc-btn-create')).toBeDisabled();
    });

    test('Le compteur de caractères s\'affiche (max 12)', async ({ page }) => {
        await expect(page.locator('.tc-spinner')).not.toBeVisible({ timeout: 8000 });
        await page.locator('input[placeholder="EX: SACHA"]').fill('SATOSHI');
        const counter = page.locator('.tc-charcount');
        await expect(counter).toContainText('7/12');
    });

    test('Crée un profil et affiche la carte dresseur', async ({ page }) => {
        await expect(page.locator('.tc-spinner')).not.toBeVisible({ timeout: 8000 });
        await page.locator('input[placeholder="EX: SACHA"]').fill('SATOSHI');
        await page.locator('.tc-btn-create').click();
        await expect(page.locator('.tc-profile')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('.tc-id-name')).toContainText('SATOSHI');
    });

    test('La carte affiche VUS, ATTRAPÉS et l\'anneau', async ({ page, request }) => {
        await request.post(`${API}/trainer`, {
            data: { trainerName: 'Sacha' },
            headers: { Authorization: `Bearer ${trainerToken}` }
        });
        await page.reload();
        await expect(page.locator('.tc-spinner')).not.toBeVisible({ timeout: 8000 });
        await expect(page.locator('.tc-stats')).toContainText('VUS');
        await expect(page.locator('.tc-stats')).toContainText('ATTRAPÉS');
        await expect(page.locator('.tc-ring-pct')).toBeVisible();
        await expect(page.locator('.tc-ring-sub')).toContainText('COMPLÉTÉ');
    });

    test('Bouton RETOUR AU POKÉDEX navigue vers /', async ({ page, request }) => {
        await request.post(`${API}/trainer`, {
            data: { trainerName: 'Sacha' },
            headers: { Authorization: `Bearer ${trainerToken}` }
        });
        await page.reload();
        await expect(page.locator('.tc-spinner')).not.toBeVisible({ timeout: 8000 });
        await page.locator('.tc-btn-back').click();
        await expect(page).toHaveURL('/');
    });

});

// ============================================================
//  SUITE 4 — COCKPIT ADMIN (root/root)
// ============================================================

test.describe('🛡️ Profil — Cockpit Admin', () => {

    let adminToken;

    test.beforeAll(async ({ request }) => {
        adminToken = await getAdminToken(request);
    });

    test.beforeEach(async ({ page }) => {
        await injectToken(page, adminToken);
        await page.goto('/profile');
        await expect(page.locator('.cockpit')).toBeVisible({ timeout: 8000 });
    });

    test('Affiche sidebar + main', async ({ page }) => {
        await expect(page.locator('.ck-sidebar')).toBeVisible();
        await expect(page.locator('.ck-main')).toBeVisible();
    });

    test('La sidebar affiche le badge ADMINISTRATEUR', async ({ page }) => {
        await expect(page.locator('.ck-admin-badge')).toContainText('ADMIN');
    });

    test('La sidebar affiche le compteur de la base de données', async ({ page }) => {
        await expect(page.locator('.ck-db-count')).toBeVisible({ timeout: 8000 });
        const text = await page.locator('.ck-db-count').textContent();
        expect(text).toMatch(/\d+/);
        expect(text).toContain('entrées');
    });

    test('L\'onglet BASE DE DONNÉES est actif par défaut', async ({ page }) => {
        await expect(page.locator('.ck-tab.active')).toContainText('BASE DE DONNÉES');
    });

    test('La grille affiche les Pokémon du backend', async ({ page }) => {
        await expect(page.locator('.ck-spinner')).not.toBeVisible({ timeout: 10000 });
        await expect(page.locator('.ck-pkmn-card').first()).toBeVisible({ timeout: 8000 });
        expect(await page.locator('.ck-pkmn-card').count()).toBeGreaterThan(0);
    });

    test('Chaque carte a numéro + nom + type', async ({ page }) => {
        await expect(page.locator('.ck-spinner')).not.toBeVisible({ timeout: 10000 });
        const first = page.locator('.ck-pkmn-card').first();
        await expect(first.locator('.ck-pc-num')).toBeVisible();
        await expect(first.locator('.ck-pc-name')).toBeVisible();
        await expect(first.locator('.ck-pc-type').first()).toBeVisible();
    });

    test('La recherche filtre les résultats', async ({ page }) => {
        await expect(page.locator('.ck-spinner')).not.toBeVisible({ timeout: 10000 });
        const before = await page.locator('.ck-pkmn-card').count();
        await page.locator('.ck-search input').fill('bulba');
        await page.waitForTimeout(400);
        expect(await page.locator('.ck-pkmn-card').count()).toBeLessThanOrEqual(before);
    });

    test('Filtre par type — seuls les bons Pokémon restent', async ({ page }) => {
        await expect(page.locator('.ck-spinner')).not.toBeVisible({ timeout: 10000 });
        const pill = page.locator('.ck-type-pill').first();
        if (await pill.count() > 0) {
            const typeName = (await pill.textContent())?.trim() ?? '';
            await pill.click();
            await expect(pill).toHaveClass(/active/);
            const cards = page.locator('.ck-pkmn-card');
            for (let i = 0; i < Math.min(await cards.count(), 3); i++) {
                const types = await cards.nth(i).locator('.ck-pc-type').allTextContents();
                expect(types.some(t => t.trim().toLowerCase() === typeName.toLowerCase())).toBeTruthy();
            }
        }
    });

    test('Cliquer ✎ ouvre le formulaire pré-rempli', async ({ page }) => {
        await expect(page.locator('.ck-spinner')).not.toBeVisible({ timeout: 10000 });
        const first = page.locator('.ck-pkmn-card').first();
        const name = (await first.locator('.ck-pc-name').textContent())?.trim();
        await first.locator('.ck-pc-btn.edit').click();
        await expect(page.locator('.ck-tab.editing')).toBeVisible();
        await expect(page.locator('.ck-tab.editing')).toContainText('MODIFIER');
        const val = await page.locator('.ck-ff-input.upper').inputValue();
        expect(val.toLowerCase()).toBe(name?.toLowerCase());
    });

    test('Cliquer AJOUTER ouvre un formulaire vide', async ({ page }) => {
        await page.locator('.ck-tab').nth(1).click();
        expect(await page.locator('input[type="number"]').inputValue()).toBe('');
    });

    test('Pagination s\'affiche si > 18 Pokémon', async ({ page }) => {
        await expect(page.locator('.ck-spinner')).not.toBeVisible({ timeout: 10000 });
        const pgInfo = page.locator('.ck-pg-info');
        if (await pgInfo.isVisible()) {
            const match = (await pgInfo.textContent())?.match(/(\d+) POKÉMON/);
            if (match && parseInt(match[1]) > 18) {
                await expect(page.locator('.ck-pagination')).toBeVisible();
            }
        }
    });

    test('Navigation pagination change les cartes', async ({ page }) => {
        await expect(page.locator('.ck-spinner')).not.toBeVisible({ timeout: 10000 });
        if (await page.locator('.ck-pagination').isVisible()) {
            const before = await page.locator('.ck-pc-name').first().textContent();
            // Cliquer sur le numéro de page "2" directement — plus fiable que les boutons flèches
            const page2btn = page.locator('.ck-pg-num', { hasText: '2' });
            if (await page2btn.count() > 0) {
                await page2btn.click();
            } else {
                // Fallback: bouton › (next) = nth(2) dans l'ordre « ‹ › »
                await page.locator('.ck-pg-btn').nth(2).click();
            }
            await page.waitForTimeout(300);
            const after = await page.locator('.ck-pc-name').first().textContent();
            expect(after).not.toBe(before);
        }
    });

    test('Modale suppression s\'ouvre et peut être annulée', async ({ page }) => {
        await expect(page.locator('.ck-spinner')).not.toBeVisible({ timeout: 10000 });
        await page.locator('.ck-pc-btn.del').first().click();
        await expect(page.locator('.modal')).toBeVisible();
        await expect(page.locator('.modal-title')).toContainText('SUPPRIMER');
        await page.locator('.modal-btn.cancel').click();
        await expect(page.locator('.modal')).not.toBeVisible();
    });

    test('Bouton ◀ POKÉDEX navigue vers /', async ({ page }) => {
        await page.locator('.ck-nav-btn.pokedex').click();
        await expect(page).toHaveURL('/');
    });

});

// ============================================================
//  SUITE 5 — CRUD Pokémon (root/root)
// ============================================================

test.describe('⚙️ CRUD Pokémon (Admin)', () => {

    let adminToken;
    const createdIds = []; // 🗑️ liste des _id créés — supprimés en afterAll

    test.beforeAll(async ({ request }) => {
        adminToken = await getAdminToken(request);
    });

    // 🧹 Nettoyage : supprime tous les Pokémon créés pendant les tests
    test.afterAll(async ({ request }) => {
        for (const id of createdIds) {
            await request.delete(`${API}/pkmn/${id}`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            }).catch(() => {}); // ignore si déjà supprimé
        }
        console.log(`🧹 Nettoyage CRUD : ${createdIds.length} Pokémon supprimé(s)`);
    });

    test.beforeEach(async ({ page }) => {
        await injectToken(page, adminToken);
        await page.goto('/profile');
        await expect(page.locator('.cockpit')).toBeVisible({ timeout: 8000 });
        await expect(page.locator('.ck-spinner')).not.toBeVisible({ timeout: 10000 });
        // Aller sur l'onglet AJOUTER
        await page.locator('.ck-tab').nth(1).click();
    });

    test('Crée un nouveau Pokémon et il apparaît dans la liste', async ({ page, request }) => {
        const name = `Testmon_${Date.now()}`;
        await page.locator('input[type="number"]').fill('997');
        await page.locator('.ck-ff-input.upper').fill(name);
        await page.locator('input[placeholder="Plante, Poison"]').fill('Feu');
        await page.locator('.ck-ff-input.url').fill('https://example.com/img.png');
        await page.locator('.ck-ff-ta').fill('Pokémon de test E2E');
        await page.locator('.ck-fa-save').click();

        // Revient automatiquement sur la liste
        await expect(page.locator('.ck-tab.active')).toContainText('BASE DE DONNÉES');

        // Chercher le Pokémon créé
        await page.locator('.ck-search input').fill(name);
        await page.waitForTimeout(500);
        await expect(page.locator('.ck-pc-name').filter({ hasText: name })).toBeVisible({ timeout: 5000 });

        // 🗑️ Enregistrer l'_id pour nettoyage afterAll
        const res = await request.get(`${API}/pkmn/search?partialName=${encodeURIComponent(name)}`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const body = await res.json();
        const found = (body.data ?? []).find(p => p.name === name);
        if (found?._id) createdIds.push(found._id);
    });

    test('Les pills de type se génèrent en temps réel', async ({ page }) => {
        await page.locator('input[placeholder="Plante, Poison"]').fill('Feu, Eau');
        await page.waitForTimeout(300);
        await expect(page.locator('.ck-ff-pills .ck-ff-pill')).toHaveCount(2);
    });

    test('Les champs required empêchent la soumission vide', async ({ page }) => {
        const requiredInputs = page.locator('.ck-ff-input[required]');
        expect(await requiredInputs.count()).toBeGreaterThan(0);
    });

    test('Modifier un Pokémon met à jour son nom dans la liste', async ({ page }) => {
        await page.locator('.ck-tab').nth(0).click();
        await expect(page.locator('.ck-spinner')).not.toBeVisible({ timeout: 10000 });

        const first = page.locator('.ck-pkmn-card').first();
        const orig = (await first.locator('.ck-pc-name').textContent())?.trim() ?? '';
        await first.locator('.ck-pc-btn.edit').click();
        await expect(page.locator('.ck-tab.editing')).toBeVisible();

        const newName = `${orig}_EDIT`;
        await page.locator('.ck-ff-input.upper').clear();
        await page.locator('.ck-ff-input.upper').fill(newName);
        await page.locator('.ck-fa-save.editing').click();

        await expect(page.locator('.ck-tab.active')).toContainText('BASE DE DONNÉES');
        await page.locator('.ck-search input').fill(newName);
        await page.waitForTimeout(500);
        await expect(page.locator('.ck-pc-name').filter({ hasText: newName })).toBeVisible({ timeout: 5000 });
    });

    test('Annuler l\'édition remet le formulaire en mode AJOUTER', async ({ page }) => {
        await page.locator('.ck-tab').nth(0).click();
        await expect(page.locator('.ck-spinner')).not.toBeVisible({ timeout: 10000 });
        await page.locator('.ck-pc-btn.edit').first().click();
        await expect(page.locator('.ck-tab.editing')).toBeVisible();
        await page.locator('.ck-fa-cancel').click();
        await expect(page.locator('.ck-tab.editing')).not.toBeVisible();
    });

    test('Supprime un Pokémon via la modale — vérifié en base de données', async ({ page, request }) => {
        // 1. Créer un Pokémon jetable et récupérer son _id MongoDB
        const tempName = `ToDelete_${Date.now()}`;
        const createRes = await request.post(`${API}/pkmn`, {
            data: {
                id: Math.floor(Math.random() * 89000) + 10000,
                name: tempName,
                types: ['Normal'],
                description: 'À supprimer',
                imageUrl: 'https://example.com/x.png'
            },
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        expect(createRes.status()).toBe(201);
        const created = await createRes.json();
        const mongoId = created._id; // _id MongoDB pour vérifier en base après

        // 2. Naviguer vers le cockpit
        await injectToken(page, adminToken);
        await page.goto('/profile');
        await expect(page.locator('.cockpit')).toBeVisible({ timeout: 8000 });
        await expect(page.locator('.ck-spinner')).not.toBeVisible({ timeout: 10000 });

        // 3. Chercher et trouver la carte
        await page.locator('.ck-search input').fill(tempName);
        await page.waitForTimeout(500);
        const card = page.locator('.ck-pkmn-card').filter({ hasText: tempName });
        await expect(card).toBeVisible({ timeout: 5000 });

        // 4. Supprimer via la modale
        await card.locator('.ck-pc-btn.del').click();
        await expect(page.locator('.modal')).toBeVisible();
        await page.locator('.modal-btn.del').click();
        await expect(page.locator('.modal')).not.toBeVisible({ timeout: 3000 });

        // 5. Vérifier disparition dans l'UI
        await page.waitForTimeout(1000);
        await expect(
            page.locator('.ck-pkmn-card').filter({ hasText: tempName })
        ).not.toBeVisible({ timeout: 5000 });

        // ✅ 6. VÉRIFICATION RÉELLE EN BASE DE DONNÉES via _id MongoDB
        // Si 200 → Pokémon encore présent → DELETE a échoué silencieusement → FAUX POSITIF
        // Si 404 → bien supprimé → test valide
        const checkRes = await request.get(`${API}/pkmn/${mongoId}`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        expect(
            checkRes.status(),
            `❌ FAUX POSITIF DÉTECTÉ : "${tempName}" (_id: ${mongoId}) est ENCORE en base ! Le bouton supprimer ne fait rien côté serveur.`
        ).toBe(404);
    });

});

// ============================================================
//  SUITE 6 — RETOUR DES DONNÉES API → UI
//  Vérifie que ce que l'API renvoie est bien affiché dans l'UI
// ============================================================

test.describe('📡 Retour des données API → UI', () => {

    let adminToken;
    const createdIds = []; // 🗑️ pokémon créés par la suite → supprimés en afterAll

    test.beforeAll(async ({ request }) => {
        adminToken = await getAdminToken(request);
    });

    // 🧹 Nettoyage : supprime les Pokémon créés pendant les tests API→UI
    test.afterAll(async ({ request }) => {
        for (const id of createdIds) {
            await request.delete(`${API}/pkmn/${id}`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            }).catch(() => {});
        }
        console.log(`🧹 Nettoyage API→UI : ${createdIds.length} Pokémon supprimé(s)`);
    });

    test('Les données API s\'affichent correctement dans la grille', async ({ page, request }) => {
        // 1. Récupérer le 1er Pokémon directement depuis l'API
        const res = await request.get(`${API}/pkmn`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        expect(res.ok()).toBeTruthy();
        const { data } = await res.json();
        expect(data.length).toBeGreaterThan(0);

        const firstPkmn = data[0];

        // 2. Ouvrir le cockpit
        await injectToken(page, adminToken);
        await page.goto('/profile');
        await expect(page.locator('.ck-spinner')).not.toBeVisible({ timeout: 10000 });

        // 3. Vérifier que ce Pokémon est bien dans l'UI
        await page.locator('.ck-search input').fill(firstPkmn.name);
        await page.waitForTimeout(500);
        await expect(
            page.locator('.ck-pc-name').filter({ hasText: firstPkmn.name })
        ).toBeVisible({ timeout: 5000 });
    });

    test('Compteur sidebar = total retourné par l\'API', async ({ page, request }) => {
        const { count } = await (await request.get(`${API}/pkmn`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        })).json();

        await injectToken(page, adminToken);
        await page.goto('/profile');
        await expect(page.locator('.ck-db-count')).toBeVisible({ timeout: 8000 });
        expect(await page.locator('.ck-db-count').textContent()).toContain(String(count));
    });

    test('Info pagination affiche le total correct', async ({ page, request }) => {
        const { count } = await (await request.get(`${API}/pkmn`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        })).json();

        await injectToken(page, adminToken);
        await page.goto('/profile');
        await expect(page.locator('.ck-spinner')).not.toBeVisible({ timeout: 10000 });

        if (count > 18) {
            await expect(page.locator('.ck-pg-info')).toContainText(String(count));
        }
    });

    test('Un Pokémon créé via API apparaît immédiatement dans l\'UI', async ({ page, request }) => {
        const apiName = `ApiCreate_${Date.now()}`;

        // Créer via API directement (sans passer par le formulaire)
        const createRes = await request.post(`${API}/pkmn`, {
            data: {
                id: Math.floor(Math.random() * 89000) + 10000,
                name: apiName,
                types: ['Vol'],
                description: 'Créé directement via API — test E2E',
                imageUrl: 'https://example.com/api.png'
            },
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        // 🗑️ Enregistrer l'_id pour nettoyage afterAll
        const createdPkmn = await createRes.json();
        if (createdPkmn._id) createdIds.push(createdPkmn._id);

        // Ouvrir l'UI → doit apparaître sans rechargement manuel
        await injectToken(page, adminToken);
        await page.goto('/profile');
        await expect(page.locator('.ck-spinner')).not.toBeVisible({ timeout: 10000 });

        await page.locator('.ck-search input').fill(apiName);
        await page.waitForTimeout(500);
        await expect(
            page.locator('.ck-pc-name').filter({ hasText: apiName })
        ).toBeVisible({ timeout: 5000 });
    });

    test('Les stats trainer dans la sidebar reflètent le profil API', async ({ page, request }) => {
        // Créer profil trainer pour root (si pas encore créé)
        await request.post(`${API}/trainer`, {
            data: { trainerName: 'Root' },
            headers: { Authorization: `Bearer ${adminToken}` }
        }).catch(() => {}); // ignore si déjà existant

        await injectToken(page, adminToken);
        await page.goto('/profile');
        await expect(page.locator('.cockpit')).toBeVisible({ timeout: 8000 });

        // Les bars VUS / ATTRAPÉS doivent être présentes dans la sidebar
        await expect(page.locator('.ck-mini-stats')).toBeVisible();
        const labels = await page.locator('.ck-ms-label').allTextContents();
        expect(labels.some(l => l.includes('VUS'))).toBeTruthy();
        expect(labels.some(l => l.includes('ATTRAPÉS'))).toBeTruthy();
    });

});