<template>
  <div class="min-h-screen bg-gray-950 flex items-center justify-center p-4 selection:bg-transparent">

    <div class="w-full max-w-lg bg-yellow-400 border-[8px] border-yellow-600 rounded-3xl p-3 shadow-[0_15px_40px_rgba(0,0,0,0.8),inset_0_4px_10px_rgba(255,255,255,0.4)] relative transform transition-transform duration-500 hover:scale-[1.02]">

      <div class="bg-gray-100 border-[6px] border-gray-800 rounded-xl p-6 shadow-inner min-h-[450px] flex flex-col relative overflow-hidden">

        <div class="absolute -right-10 -bottom-10 w-64 h-64 bg-gray-200 rounded-full opacity-50 border-[16px] border-gray-300 flex items-center justify-center pointer-events-none">
          <div class="w-full h-4 bg-gray-300 absolute"></div>
          <div class="w-20 h-20 bg-gray-100 border-[12px] border-gray-300 rounded-full z-10"></div>
        </div>

        <div class="relative z-10 flex flex-col h-full">
          <h1 class="retro-font text-4xl text-center mb-6 text-gray-800 uppercase border-b-4 border-gray-800 pb-2 drop-shadow-sm">Carte de Dresseur</h1>

          <div v-if="!trainerStore.hasProfile && !trainerStore.isLoading" class="flex flex-col gap-4 flex-grow justify-center mt-4">
            <p class="text-center retro-font text-2xl text-red-600 mb-2 animate-pulse">! IDENTITÉ REQUISE !</p>

            <div class="flex flex-col gap-2">
              <label class="retro-font text-gray-600 text-xl">NOM DU DRESSEUR:</label>
              <input
                  v-model="form.trainerName"
                  type="text"
                  placeholder="EX: SACHA"
                  class="retro-font text-2xl p-3 border-4 border-gray-400 rounded-md focus:border-blue-500 focus:outline-none uppercase bg-white shadow-inner"
              />
            </div>

            <div class="flex flex-col gap-2 mt-2">
              <label class="retro-font text-gray-600 text-xl">PHOTO DE PROFIL (URL):</label>
              <input
                  v-model="form.imgUrl"
                  type="text"
                  placeholder="https://..."
                  class="retro-font text-xl p-3 border-4 border-gray-400 rounded-md focus:border-blue-500 focus:outline-none bg-white shadow-inner"
              />
            </div>

            <button
                @click="handleCreateProfile"
                class="mt-6 bg-blue-500 text-white retro-font text-3xl py-3 border-4 border-blue-900 rounded-lg hover:bg-blue-400 active:translate-y-2 shadow-[0_6px_0_#1e3a8a] active:shadow-[0_0px_0_#1e3a8a] transition-all"
            >
              ENREGISTRER
            </button>
          </div>

          <div v-else-if="trainerStore.hasProfile" class="flex flex-col flex-grow">

            <div class="flex gap-6 items-center mb-8 bg-white p-4 rounded-lg border-4 border-gray-300 shadow-sm">
              <div class="w-28 h-28 bg-gray-200 border-4 border-gray-800 rounded-md flex items-center justify-center overflow-hidden shadow-inner flex-shrink-0">
                <img v-if="trainerStore.profile.imgUrl" :src="trainerStore.profile.imgUrl" alt="Avatar" class="w-full h-full object-cover" />
                <span v-else class="retro-font text-gray-400 text-6xl">?</span>
              </div>
              <div class="flex flex-col overflow-hidden">
                <span class="retro-font text-gray-500 text-xl">ID: #{{ String(trainerStore.profile._id).slice(-5).toUpperCase() }}</span>
                <span class="retro-font text-4xl font-bold uppercase text-gray-800 truncate">{{ trainerStore.profile.trainerName }}</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-6 mt-auto">
              <div class="bg-blue-50 border-4 border-blue-300 p-4 rounded-lg text-center shadow-sm relative overflow-hidden">
                <div class="absolute -right-2 -top-2 w-10 h-10 bg-blue-200 rounded-full opacity-50"></div>
                <span class="retro-font text-blue-800 text-2xl block mb-1 relative z-10">VUS</span>
                <span class="retro-font text-5xl text-blue-900 relative z-10">{{ trainerStore.seenIds.length }}</span>
              </div>

              <div class="bg-red-50 border-4 border-red-300 p-4 rounded-lg text-center shadow-sm relative overflow-hidden">
                <div class="absolute -right-2 -top-2 w-10 h-10 bg-red-200 rounded-full opacity-50"></div>
                <span class="retro-font text-red-800 text-2xl block mb-1 relative z-10">ATTRAPÉS</span>
                <span class="retro-font text-5xl text-red-900 relative z-10">{{ trainerStore.caughtIds.length }}</span>
              </div>
            </div>

            <button
                @click="router.push('/')"
                class="mt-8 bg-gray-800 text-white retro-font text-2xl py-3 px-6 rounded-lg border-4 border-black hover:bg-gray-700 mx-auto block shadow-[0_4px_0_#000] active:translate-y-1 active:shadow-[0_0px_0_#000] transition-all"
            >
              RETOUR AU POKÉDEX
            </button>
          </div>

          <div v-else class="flex flex-col flex-grow items-center justify-center">
            <span class="retro-font text-3xl text-gray-600 animate-pulse">CHARGEMENT...</span>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTrainerStore } from '../store/trainer';

const router = useRouter();
const trainerStore = useTrainerStore();

const form = reactive({
  trainerName: '',
  imgUrl: ''
});

onMounted(async () => {
  await trainerStore.fetchProfile();
});

const handleCreateProfile = async () => {
  if (!form.trainerName.trim()) return;
  await trainerStore.createProfile(form.trainerName, form.imgUrl);
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
.retro-font {
  font-family: 'VT323', monospace;
  letter-spacing: 0.05em;
}
</style>