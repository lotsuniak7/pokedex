/**
 * @file axiosInstance.js
 * @description Configuration globale d'Axios pour les requêtes HTTP du frontend.
 * Centralise l'URL de base de l'API et met en place des intercepteurs (interceptors)
 * pour la gestion automatique des tokens JWT et des erreurs d'authentification.
 */

import axios from 'axios';

/**
 * Instance Axios pré-configurée.
 * @constant {import('axios').AxiosInstance} api
 */
const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Intercepteur de requêtes (Request Interceptor).
 * S'exécute automatiquement AVANT que chaque requête ne quitte le navigateur.
 * Récupère le token JWT dans le localStorage et l'injecte dans les en-têtes (Headers)
 * sous le format standard "Bearer <token>".
 */
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Intercepteur de réponses (Response Interceptor).
 * S'exécute dès la réception d'une réponse du serveur, avant qu'elle n'atteigne le composant Vue.
 * Intercepte globalement les erreurs 401 (Non Autorisé) : si le token est expiré ou absent,
 * il nettoie le localStorage et redirige de force l'utilisateur vers la page de connexion.
 */
api.interceptors.response.use(
    (response) => response, // Si la requête réussit, on la laisse passer
    (error) => {
        // Si le serveur backend nous renvoie une erreur 401 (Unauthorized)
        if (error.response && error.response.status === 401) {
            console.warn("🛡️ Sécurité : Non autorisé. Token expiré ou invalide.");

            // On supprime le token invalide pour "déconnecter" l'utilisateur
            localStorage.removeItem('token');

            // Redirection brutale vers la page de connexion
            // (Alternative technique : utiliser le router Vue si accessible ici)
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;