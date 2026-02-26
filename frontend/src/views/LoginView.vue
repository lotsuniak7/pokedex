<template>
  <div class="min-h-screen bg-pokedex-red flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-pokedex-red border-4 border-red-900 rounded-3xl p-4 shadow-[10px_10px_0px_0px_rgba(0,0,0,0.5)]">

      <div class="flex items-center gap-2 mb-6 ml-2">
        <div class="w-12 h-12 rounded-full border-4 border-gray-100 bg-blue-500 shadow-inner flex items-center justify-center">
          <div class="w-4 h-4 rounded-full bg-white opacity-50 absolute top-2 left-2"></div>
        </div>
        <div class="w-4 h-4 rounded-full bg-red-500 border border-gray-800"></div>
        <div class="w-4 h-4 rounded-full bg-yellow-400 border border-gray-800"></div>
        <div class="w-4 h-4 rounded-full bg-green-500 border border-gray-800"></div>
      </div>

      <div class="bg-gray-200 p-4 border-4 border-gray-600 rounded-lg shadow-inner">
        <div class="bg-pokedex-dark text-green-400 font-mono p-6 rounded border-2 border-gray-800 h-80 flex flex-col justify-center">

          <h1 class="text-xl mb-6 text-center animate-pulse">
            {{ isLogin ? "IDENTIFICATION..." : "NOUVEAU DRESSEUR" }}
          </h1>

          <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
            <div>
              <label class="block text-xs text-green-600 mb-1">ID DRESSEUR</label>
              <input
                  v-model="form.username"
                  type="text"
                  required
                  class="w-full bg-gray-900 text-green-400 border border-green-700 p-2 focus:outline-none focus:border-green-400 uppercase"
              />
            </div>

            <div>
              <label class="block text-xs text-green-600 mb-1">MOT DE PASSE</label>
              <input
                  v-model="form.password"
                  type="password"
                  required
                  class="w-full bg-gray-900 text-green-400 border border-green-700 p-2 focus:outline-none focus:border-green-400"
              />
            </div>

            <div v-if="errorMsg" class="text-red-500 text-xs text-center mt-2">
              {{ errorMsg }}
            </div>

            <button
                type="submit"
                class="mt-4 bg-gray-700 text-green-400 border-2 border-green-700 hover:bg-gray-600 hover:text-white p-2 transition-colors active:translate-y-1"
            >
              {{ isLogin ? "CONNEXION" : "S'ENREGISTRER" }}
            </button>
          </form>

          <button
              @click="toggleMode"
              class="mt-4 text-xs text-green-600 hover:text-green-300 underline text-center"
          >
            {{ isLogin ? "Créer un nouveau profil ?" : "Déjà dresseur ?" }}
          </button>
        </div>

        <div class="flex justify-between items-center mt-4 px-4">
          <div class="w-6 h-6 rounded-full bg-red-600 border-2 border-gray-800 shadow-sm"></div>
          <div class="flex gap-2">
            <div class="h-2 w-8 bg-gray-800 rounded-full"></div>
            <div class="h-2 w-8 bg-gray-800 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';

const router = useRouter();
const authStore = useAuthStore();

const isLogin = ref(true);
const errorMsg = ref('');

const form = reactive({
  username: '',
  password: ''
});

const toggleMode = () => {
  isLogin.value = !isLogin.value;
  errorMsg.value = '';
};

const handleSubmit = async () => {
  errorMsg.value = '';
  try {
    if (isLogin.value) {
      await authStore.login(form.username, form.password);
    } else {
      await authStore.register(form.username, form.password);
    }
    // Если всё ок, пушим в Pokedex
    router.push('/');
  } catch (err) {
    errorMsg.value = "Accès refusé. Vérifiez vos données.";
  }
};
</script>