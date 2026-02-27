// frontend/src/api/axiosInstance.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api', // Url de mon backend
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercepteur de requêtes, capturer le jeton
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

// Intercepteur de réponses - interception globale des erreurs 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn("Non autorisé. Token expiré ou invalide.");
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;