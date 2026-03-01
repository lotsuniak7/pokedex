/**
 * @file auth.js
 * @description Store Pinia dédié à la gestion de l'authentification globale.
 * Gère l'état de connexion de l'utilisateur, le stockage du token JWT
 * et les appels API liés à l'authentification.
 */
import { defineStore } from 'pinia';
import api from '../api/axiosInstance';

/**
 * Définition du store d'authentification.
 * @exports useAuthStore
 */
export const useAuthStore = defineStore('auth', {

    /**
     * L'état global (State) du store.
     * @returns {Object} L'état réactif.
     * @property {string|null} token - Le token JWT récupéré depuis le localStorage au démarrage.
     */
    state: () => ({
        token: localStorage.getItem('token') || null,
    }),

    /**
     * Les accesseurs (Getters) pour déduire des informations à partir de l'état.
     */
    getters: {
        /**
         * Détermine si l'utilisateur est authentifié.
         * Utilise la double négation (!!) pour convertir la chaîne de caractères (ou null) en un vrai booléen.
         * @param {Object} state - L'état actuel du store.
         * @returns {boolean} True si un token existe, False sinon.
         */
        isAuthenticated: (state) => !!state.token,
    },

    /**
     * Les actions (Actions) pour modifier l'état et faire des appels asynchrones.
     */
    actions: {
        /**
         * Connecte un utilisateur existant.
         * Appelle l'API, met à jour le state et sauvegarde le token dans le navigateur.
         * @async
         * @param {string} username - Le nom d'utilisateur.
         * @param {string} password - Le mot de passe.
         * @returns {Promise<boolean>} True si la connexion réussit.
         * @throws {Error} Propage l'erreur en cas d'échec (ex: mauvais identifiants).
         */
        async login(username, password) {
            try {
                const response = await api.post('/auth/login', { username, password });

                // Mise à jour de l'état réactif
                this.token = response.data.token;

                // Persistance du token pour survivre au rafraîchissement de la page
                localStorage.setItem('token', this.token);

                return true;
            } catch (error) {
                console.error("Erreur de connexion:", error);
                throw error; // Permet au composant Vue d'afficher un message d'erreur
            }
        },

        /**
         * Inscrit un nouvel utilisateur et le connecte automatiquement dans la foulée.
         * @async
         * @param {string} username - Le nom d'utilisateur choisi.
         * @param {string} password - Le mot de passe choisi.
         * @returns {Promise<boolean>} True si l'inscription et la connexion réussissent.
         * @throws {Error} Propage l'erreur si l'inscription échoue.
         */
        async register(username, password) {
            try {
                // Appel API pour créer le compte
                await api.post('/auth/register', { username, password });
                // Connexion automatique immédiate
                await this.login(username, password);

                return true;
            } catch (error) {
                console.error("Erreur d'inscription:", error);
                throw error;
            }
        },

        /**
         * Déconnecte l'utilisateur actuel.
         * Nettoie l'état Pinia, supprime le token du navigateur et redirige vers le login.
         */
        logout() {
            // Nettoyage de l'état
            this.token = null;
            // Nettoyage du stockage local
            localStorage.removeItem('token');

            // Redirection (force le rechargement du cycle de vie Vue)
            window.location.href = '/login';
        }
    }
});