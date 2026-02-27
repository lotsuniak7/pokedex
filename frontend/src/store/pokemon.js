// frontend/src/store/pokemon.js
import { defineStore } from 'pinia';
import api from '../api/axiosInstance';

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
                    // Иначе грузим всех
                    const response = await api.get('/pkmn');
                    this.pokemons = response.data.data || response.data;
                }
            } catch (error) {
                console.error("Erreur API Pokedex:", error);
                this.pokemons = []
            } finally {
                this.isLoading = false;
            }
        }
    }
});