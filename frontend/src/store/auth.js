// frontend/src/store/auth.js
import { defineStore } from 'pinia';
import api from '../api/axiosInstance';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('token') || null,
    }),
    getters: {
        isAuthenticated: (state) => !!state.token,
    },
    actions: {
        async login(username, password) {
            try {
                const response = await api.post('/auth/login', { username, password });
                this.token = response.data.token;
                localStorage.setItem('token', this.token);
                return true;
            } catch (error) {
                console.error("Erreur de connexion:", error);
                throw error;
            }
        },
        async register(username, password) {
            try {
                await api.post('/auth/register', { username, password });
                await this.login(username, password);
                return true;
            } catch (error) {
                console.error("Erreur d'inscription:", error);
                throw error;
            }
        },
        logout() {
            this.token = null;
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
    }
});