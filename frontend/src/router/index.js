/**
 * @file index.js
 * @description Configuration principale du routeur frontend (Vue Router).
 * Définit les routes de l'application, optimise le chargement avec du Lazy-Loading,
 * et sécurise l'accès aux pages privées grâce aux gardes de navigation (Navigation Guards).
 */
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../store/auth';

/**
 * Table de routage de l'application.
 * Utilise l'import dynamique `() => import(...)` pour le "Code Splitting",
 * optimisant ainsi les performances de chargement initial.
 * @type {import('vue-router').RouteRecordRaw[]}
 */
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
        // La balise "meta" permet d'attacher des métadonnées personnalisées à la route
        meta: { requiresAuth: true }
    },
    {
        path: '/profile',
        name: 'Profile',
        component: () => import('../views/ProfileView.vue'),
        meta: { requiresAuth: true }
    },
];

/**
 * Instance principale du routeur Vue.
 * Configurée avec l'historique HTML5 (createWebHistory) pour des URL propres sans le "#".
 */
const router = createRouter({
    history: createWebHistory(),
    routes,
});

/**
 * Garde de navigation globale (Global Before Guard).
 * Intercepte CHAQUE changement de page avant qu'il ne s'affiche.
 * * @param {import('vue-router').RouteLocationNormalized} to - La route cible vers laquelle on se dirige.
 * @param {import('vue-router').RouteLocationNormalized} from - La route actuelle d'où l'on vient.
 * @returns {string | void} Renvoie un chemin de redirection si nécessaire, sinon laisse passer (void).
 */
router.beforeEach((to, from) => {
    // Instanciation du store Pinia pour vérifier l'état d'authentification en temps réel
    const authStore = useAuthStore();

    // Si la page nécessite d'être connecté ET que l'utilisateur ne l'est pas
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        // Redirection vers la page de connexion
        return '/login';
    }
    // Si l'utilisateur est déjà connecté et tente d'accéder à la page de connexion
    else if (to.name === 'Login' && authStore.isAuthenticated) {
        // Redirection vers l'accueil (il n'a rien à faire sur la page de login)
        return '/';
    }
   // Si aucune des conditions ci-dessus n'est remplie, Vue Router laisse passer.
});

export default router;