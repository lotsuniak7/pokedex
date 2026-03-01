/**
 * @file trainer.js
 * @description Store Pinia dédié à la gestion du profil du Dresseur.
 * Gère le chargement, la création et la mise à jour des statistiques de capture (Pokédex)
 * de l'utilisateur authentifié.
 */
import { defineStore } from 'pinia';
import api from '../api/axiosInstance';

/**
 * Définition du store Trainer.
 * @exports useTrainerStore
 */
export const useTrainerStore = defineStore('trainer', {

    /**
     * @returns {Object} État réactif du profil.
     * @property {Object|null} profile - Données du dresseur (si chargé).
     * @property {boolean} isLoading - Indicateur de chargement pour l'UI.
     */
    state: () => ({
        profile: null,
        isLoading: false,
    }),

    /**
     * Getters pour extraire les données du profil facilement.
     */
    getters: {
        hasProfile: (state) => !!state.profile,
        caughtIds: (state) => state.profile?.pkmnCatch || [],
        seenIds: (state) => state.profile?.pkmnSeen || []
    },
    actions: {
        /**
         * Récupère le profil du dresseur depuis l'API.
         * Si aucun profil n'existe (404), initialise à null.
         * @async
         */
        async fetchProfile() {
            this.isLoading = true;
            try {
                const response = await api.get('/trainer');
                this.profile = response.data;
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    // Il n'y a pas encore de profil, il faudra en créer un.
                    this.profile = null;
                } else {
                    console.error("Erreur lors de la récupération du profil", error);
                }
            } finally {
                this.isLoading = false;
            }
        },

        /**
         * Crée un nouveau profil pour le dresseur.
         * @async
         * @param {string} trainerName - Nom public du dresseur.
         * @param {string} [imgUrl=''] - URL de l'image (optionnelle).
         * @returns {Promise<boolean>}
         */
        async createProfile(trainerName, imgUrl = '') {
            try {
                const response = await api.post('/trainer', { trainerName, imgUrl });
                this.profile = response.data;
                return true;
            } catch (error) {
                console.error("Erreur lors de la création du profil", error);
                throw error;
            }
        },

        /**
         * Marque un Pokémon comme vu ou capturé et rafraîchit le profil local.
         * Ce pattern garantit que le State est synchronisé avec la base de données.
         * @async
         * @param {string|number} pokemonId - ID du Pokémon.
         * @param {boolean} isCaptured - Vrai si capturé, Faux si vu.
         */
        async markPokemon(pokemonId, isCaptured) {
            try {
                await api.post('/trainer/mark', { pokemonId, isCaptured });
                // on force le rechargement des données pour mettre à jour les listes
                await this.fetchProfile();
            } catch (error) {
                console.error("Erreur lors du marquage du Pokémon", error);
            }
        }
    }
});