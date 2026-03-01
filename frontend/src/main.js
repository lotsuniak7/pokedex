/**
 * @file main.js
 * @description Point d'entrée principal du frontend Vue.js.
 * Responsable de l'instanciation de l'application, de l'intégration des plugins globaux
 * (Pinia pour l'état, Vue Router pour la navigation) et du montage sur le DOM.
 */
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './style.css';

/**
 * Création de l'instance de l'application Vue.
 * @constant {import('vue').App} app
 */
const app = createApp(App);

/**
 * Initialisation de Pinia (Gestion d'état globale).
 * Doit être installé avant le routeur si le routeur utilise des stores dans ses gardes.
 */
const pinia = createPinia();

// Injection des plugins dans l'instance Vue
app.use(pinia);
app.use(router);

/**
 * Montage de l'application sur l'élément HTML possédant l'ID "app".
 * C'est à ce moment que l'application devient interactive dans le navigateur.
 */
app.mount('#app');