// frontend/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../store/auth';

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/LoginView.vue')
    },
    {
        path: '/',
        name: 'Home',
        component: () => import('../views/HomeView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/profile',
        name: 'Profile',
        component: () => import('../views/ProfileView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/admin',
        name: 'Admin',
        component: () => import('../views/AdminView.vue'),
        meta: { requiresAuth: true }
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from) => {
    const authStore = useAuthStore();

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        return '/login';
    } else if (to.name === 'Login' && authStore.isAuthenticated) {
        return '/';
    }
});

export default router;