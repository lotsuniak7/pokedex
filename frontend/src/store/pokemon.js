// frontend/src/store/pokemon.js
import { defineStore } from 'pinia';
import api from '../api/axiosInstance';
import axios from 'axios';

export const usePokemonStore = defineStore('pokemon', {
    state: () => ({
        pokemons: [],
        searchQuery: '',
        isLoading: false
    }),

    getters: {
        filteredPokemons: (state) => state.pokemons
    },
    actions: {
        async fetchPokemons() {
            this.isLoading = true;
            try {
                // S'il y a une barre de recherche, cliquez dessus.
                if (this.searchQuery.trim().length > 0) {
                    const response = await api.get(`/pkmn/search?partialName=${encodeURIComponent(this.searchQuery)}`);
                    this.pokemons = response.data.data || response.data;
                } else {
                    // Autrement telecharger tout
                    const response = await api.get('/pkmn');
                    this.pokemons = response.data.data || response.data;
                }
            } catch (error) {
                console.error("Erreur API Pokedex:", error);
                this.pokemons = []
            } finally {
                this.isLoading = false;
            }
        },
        // ADMIN - Créer un pokemon
        async createPokemon(pokemonData) {
            await axios.post('http://localhost:3000/api/pkmn', pokemonData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            await this.fetchPokemons();
        },
        // ADMIN - Metrre à jour un pokemon
        async updatePokemon(id, pokemonData) {
            await axios.put(`http://localhost:3000/api/pkmn/${id}`, pokemonData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            await this.fetchPokemons();
        },
        // ADMIN - Supprimer un pokemon
        async deletePokemon(mongoId) {
            await axios.delete(`http://localhost:3000/api/pkmn/${mongoId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            await this.fetchPokemons();
        }
    }
});