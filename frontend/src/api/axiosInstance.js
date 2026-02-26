// frontend/src/api/axiosInstance.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api', // Базовый URL твоего бэкенда
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor запросов: цепляем токен
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; // Подставляем токен
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor ответов: глобальный перехват 401 ошибки
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn("Non autorisé. Token expiré ou invalide.");
            localStorage.removeItem('token');
            window.location.href = '/login'; // Редирект, если токен протух
        }
        return Promise.reject(error);
    }
);

export default api;