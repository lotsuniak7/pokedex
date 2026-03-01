/**
 * @file pokemon.js
 * @description Store Pinia dédié à la gestion de l'état des Pokémon.
 * Gère la liste des Pokémon, la barre de recherche, les états de chargement,
 * ainsi que les opérations CRUD (réservées aux administrateurs).
 */

import { defineStore } from 'pinia';
import api from '../api/axiosInstance'; // On utilise NOTRE instance configurée

/**
 * Définition du store Pokémon.
 * @exports usePokemonStore
 */
export const usePokemonStore = defineStore('pokemon', {

    /**
     * L'état global (State) du store.
     * @returns {Object} L'état réactif.
     * @property {Array} pokemons - La liste des Pokémon actuellement affichés.
     * @property {string} searchQuery - Le texte tapé dans la barre de recherche.
     * @property {boolean} isLoading - Indicateur de chargement pour afficher un spinner (UX).
     */
    state: () => ({
        pokemons: [],
        searchQuery: '',
        isLoading: false
    }),

    /**
     * Les accesseurs (Getters) pour déduire des informations de l'état.
     */
    getters: {
        /**
         * Retourne la liste des Pokémon (peut être étendu plus tard pour des filtres locaux additionnels).
         * @param {Object} state - L'état actuel du store.
         * @returns {Array} La liste filtrée.
         */
        filteredPokemons: (state) => state.pokemons
    },

    /**
     * Les actions (Actions) pour modifier l'état et communiquer avec le backend.
     */
    actions: {
        /**
         * Récupère la liste des Pokémon depuis l'API.
         * Si une recherche est en cours (`searchQuery` rempli), interroge la route de recherche.
         * Sinon, récupère la liste complète.
         * @async
         * @returns {Promise<void>} Met à jour `state.pokemons`.
         */
        async fetchPokemons() {
            // Début du chargement visuel
            this.isLoading = true;

            try {
                // S'il y a une recherche textuelle en cours (en enlevant les espaces inutiles)
                if (this.searchQuery.trim().length > 0) {
                    // encodeURIComponent protège contre les caractères spéciaux dans l'URL
                    const response = await api.get(`/pkmn/search?partialName=${encodeURIComponent(this.searchQuery)}`);
                    this.pokemons = response.data.data || response.data;
                } else {
                    // Sinon, récupérer tout le Pokédex
                    const response = await api.get('/pkmn');
                    this.pokemons = response.data.data || response.data;
                }
            } catch (error) {
                console.error("Erreur API Pokedex:", error);
                // on vide la liste en cas d'erreur
                this.pokemons = [];
            } finally {
                // Le bloc `finally` s'exécute toujours, qu'il y ait une erreur ou non.
                // fin du chargement visuel
                this.isLoading = false;
            }
        },
        // ==========================================
        // OPÉRATIONS CRUD (ADMIN UNIQUEMENT)
        // ==========================================

        /**
         * Crée un nouveau Pokémon dans la base de données.
         * Rafraîchit automatiquement la liste après la création.
         * @async
         * @param {Object} pokemonData - Les données du Pokémon à créer.
         * @returns {Promise<void>}
         */
        async createPokemon(pokemonData) {
            await api.post('/pkmn', pokemonData);
            await this.fetchPokemons(); // Synchronisation avec le backend
        },

        /**
         * Met à jour les informations d'un Pokémon existant.
         * @async
         * @param {string} id - L'identifiant MongoDB du Pokémon.
         * @param {Object} pokemonData - Les nouvelles données.
         * @returns {Promise<void>}
         */
        async updatePokemon(id, pokemonData) {
            await api.put(`/pkmn/${id}`, pokemonData);
            await this.fetchPokemons();
        },

        /**
         * Supprime définitivement un Pokémon.
         * @async
         * @param {string} mongoId - L'identifiant MongoDB du Pokémon à supprimer.
         * @returns {Promise<void>}
         */
        async deletePokemon(mongoId) {
            await api.delete(`/pkmn/${mongoId}`);
            await this.fetchPokemons();
        }
    }
});