// frontend/src/store/trainer.js
import { defineStore } from 'pinia';
import api from '../api/axiosInstance';

export const useTrainerStore = defineStore('trainer', {
    state: () => ({
        profile: null,
        isLoading: false,
    }),
    getters: {
        hasProfile: (state) => !!state.profile,
        caughtIds: (state) => state.profile?.pkmnCatch || [],
        seenIds: (state) => state.profile?.pkmnSeen || []
    },
    actions: {
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

        async markPokemon(pokemonId, isCaptured) {
            try {
                await api.post('/trainer/mark', { pokemonId, isCaptured });
                // После успешной отметки обновляем профиль, чтобы UI сразу отреагировал
                await this.fetchProfile();
            } catch (error) {
                console.error("Erreur lors du marquage du Pokémon", error);
            }
        }
    }
});