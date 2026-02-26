<template>
  <div class="min-h-screen bg-gray-950 flex justify-center py-6 px-4 md:py-10 selection:bg-transparent">

    <div class="w-full max-w-4xl bg-gradient-to-br from-red-500 via-red-600 to-red-800 border-[8px] border-red-950 rounded-[3rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8),inset_0_4px_10px_rgba(255,255,255,0.3)] overflow-hidden flex flex-col relative">

      <div class="relative px-6 py-5 flex items-center gap-6 border-b-[6px] border-red-950 shadow-sm before:absolute before:bottom-0 before:left-0 before:w-full before:h-2 before:bg-black/20">
        <div class="relative w-20 h-20 rounded-full border-[6px] border-gray-200 bg-gradient-to-br from-blue-300 to-blue-700 shadow-[0_0_15px_rgba(0,0,0,0.5),inset_0_-5px_15px_rgba(0,0,0,0.6)] flex-shrink-0 flex items-center justify-center">
          <div class="w-8 h-8 rounded-full bg-blue-200 opacity-60 absolute top-2 left-2 blur-[2px]"></div>
          <div class="w-3 h-3 rounded-full bg-white absolute top-4 left-4 shadow-[0_0_5px_white]"></div>
        </div>
        <div class="flex gap-3 mb-8">
          <div class="w-5 h-5 rounded-full bg-gradient-to-br from-red-400 to-red-700 border-2 border-red-950 shadow-[0_0_8px_rgba(220,38,38,0.8)] animate-pulse"></div>
          <div class="w-5 h-5 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 border-2 border-red-950 shadow-[0_0_5px_rgba(0,0,0,0.5)]"></div>
          <div class="w-5 h-5 rounded-full bg-gradient-to-br from-green-400 to-green-700 border-2 border-red-950 shadow-[0_0_5px_rgba(0,0,0,0.5)]"></div>
        </div>
      </div>

      <div class="flex-grow p-6 flex flex-col md:flex-row gap-6">

        <div class="flex-grow bg-gray-200 border-[6px] border-gray-400 rounded-t-xl rounded-bl-xl rounded-br-[3rem] p-5 shadow-[inset_0_5px_15px_rgba(0,0,0,0.3)] relative flex flex-col">

          <div class="flex justify-center gap-4 mb-3">
            <div class="w-2 h-2 rounded-full bg-gray-400 border border-gray-500"></div>
            <div class="w-2 h-2 rounded-full bg-gray-400 border border-gray-500"></div>
          </div>

          <div class="relative bg-[#8bcf8b] border-[8px] border-gray-800 rounded-lg flex-grow h-[50vh] md:h-[60vh] overflow-hidden flex flex-col crt-screen shadow-[inset_0_0_30px_rgba(0,60,0,0.4)]">

            <div class="p-3 border-b-4 border-green-800/30 bg-black/10 flex gap-2 z-10">
              <input
                  v-model="pokemonStore.searchQuery"
                  @input="pokemonStore.fetchPokemons"
                  type="text"
                  placeholder="> RECHERCHE..."
                  class="flex-grow bg-transparent border-none text-gray-900 placeholder-gray-700 focus:outline-none retro-font text-2xl uppercase"
              />
            </div>

            <div class="flex-grow p-4 overflow-y-auto retro-scrollbar z-10 relative pb-10">
              <div v-if="pokemonStore.isLoading" class="h-full flex items-center justify-center retro-font text-3xl animate-pulse text-green-950">
                CHARGEMENT DU SYSTÈME...
              </div>

              <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                <div
                    v-for="pkmn in pokemonStore.filteredPokemons"
                    :key="pkmn.id"
                    class="bg-[#a2dca2] border-4 p-3 flex flex-col items-center relative group transition-all duration-300"
                    :class="isCaught(pkmn.id) ? 'border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'border-green-800/40'"
                >

                  <div class="absolute top-1 right-2 flex gap-1 z-10">
                    <span v-if="isCaught(pkmn.id)" class="text-yellow-600 drop-shadow-md text-xl" title="Capturé">★</span>
                    <span v-else-if="isSeen(pkmn.id)" class="text-blue-600 drop-shadow-md text-sm mt-1" title="Vu">👁</span>
                  </div>

                  <div class="w-full flex justify-between items-center mb-2">
                    <span class="retro-font text-lg text-green-950 font-bold">N°{{ pkmn.id.toString().padStart(3, '0') }}</span>
                  </div>

                  <div class="w-full bg-[#d0f0d0] border-2 border-green-900/50 rounded-sm mb-2 p-2 flex justify-center relative overflow-hidden">
                    <img
                        :src="pkmn.picture"
                        :alt="pkmn.name"
                        class="w-20 h-20 object-contain drop-shadow-md transition-all duration-700"
                        :class="{
                        'brightness-0 opacity-80 contrast-200': isUnknown(pkmn.id),
                        'group-hover:scale-110': !isUnknown(pkmn.id)
                      }"
                    />
                  </div>

                  <h3 class="retro-font text-xl text-green-950 uppercase text-center w-full truncate font-bold">
                    {{ isUnknown(pkmn.id) ? '???' : pkmn.name }}
                  </h3>

                  <div class="flex gap-1 mt-1 flex-wrap justify-center mb-3 min-h-[24px]">
                    <template v-if="!isUnknown(pkmn.id)">
                      <span v-for="type in pkmn.types" :key="type" class="retro-font text-xs px-2 py-0.5 bg-green-900/10 border border-green-900/30 text-green-950">
                        {{ type }}
                      </span>
                    </template>
                    <template v-else>
                      <span class="retro-font text-xs px-2 py-0.5 text-green-900/60 tracking-widest">
                        INCONNU
                      </span>
                    </template>
                  </div>

                  <div class="flex gap-2 w-full mt-auto">

                    <button
                        v-if="isUnknown(pkmn.id)"
                        @click="markPokemon(pkmn.id, false)"
                        class="w-full bg-blue-500 text-white retro-font text-sm py-1 border-2 border-blue-800 hover:bg-blue-400 active:translate-y-0.5 shadow-[0_2px_0_#1e3a8a] active:shadow-none transition-all"
                    >
                      RENCONTRER (VU)
                    </button>

                    <button
                        v-if="isSeen(pkmn.id) && !isCaught(pkmn.id)"
                        @click="markPokemon(pkmn.id, true)"
                        class="w-full bg-red-500 text-white retro-font text-sm py-1 border-2 border-red-800 hover:bg-red-400 active:translate-y-0.5 shadow-[0_2px_0_#7f1d1d] active:shadow-none transition-all animate-pulse"
                    >
                      CAPTURER !
                    </button>

                    <div
                        v-if="isCaught(pkmn.id)"
                        class="w-full text-center text-green-900 font-bold retro-font text-sm py-1.5 border-2 border-transparent"
                    >
                      - DÉJÀ CAPTURÉ -
                    </div>

                  </div>

                </div>
              </div>
            </div>

            <div class="absolute inset-0 pointer-events-none scanlines opacity-30 z-20"></div>
          </div>

          <div class="mt-4 flex justify-between items-center px-4">
            <div class="w-6 h-6 rounded-full bg-red-600 border-2 border-gray-800 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)]"></div>
            <div class="flex flex-col gap-1.5">
              <div class="w-12 h-1 bg-gray-600 rounded-full shadow-inner"></div>
              <div class="w-12 h-1 bg-gray-600 rounded-full shadow-inner"></div>
              <div class="w-12 h-1 bg-gray-600 rounded-full shadow-inner"></div>
              <div class="w-12 h-1 bg-gray-600 rounded-full shadow-inner"></div>
            </div>
          </div>
        </div>

        <div class="w-full md:w-32 flex flex-col justify-around items-center md:py-10">

          <button
              @click="startVoiceSearch"
              :class="isListening ? 'bg-red-400 shadow-[0_0_20px_rgba(248,113,113,0.8),inset_0_-4px_0_rgba(0,0,0,0.3)] translate-y-1' : 'bg-blue-500 shadow-[0_5px_0_rgba(30,58,138,1),0_10px_10px_rgba(0,0,0,0.5),inset_0_4px_4px_rgba(255,255,255,0.4)] hover:bg-blue-400'"
              class="w-16 h-16 rounded-full border-4 border-gray-900 flex items-center justify-center transition-all active:translate-y-2 active:shadow-[0_0_0_rgba(30,58,138,1)] focus:outline-none"
              title="Recherche vocale"
          >
            <svg v-if="!isListening" xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <div v-else class="w-6 h-6 bg-white rounded-full animate-ping"></div>
          </button>

          <div class="flex gap-4 mt-8 md:mt-0">
            <button @click="handleLogout" class="w-12 h-4 rounded-full bg-red-600 border-2 border-red-900 shadow-[inset_0_2px_2px_rgba(255,255,255,0.4),0_2px_0_rgba(0,0,0,0.5)] active:translate-y-1 active:shadow-none hover:bg-red-500 cursor-pointer" title="Déconnexion"></button>
            <button @click="router.push('/profile')" class="w-12 h-4 rounded-full bg-blue-600 border-2 border-blue-900 shadow-[inset_0_2px_2px_rgba(255,255,255,0.4),0_2px_0_rgba(0,0,0,0.5)] active:translate-y-1 active:shadow-none hover:bg-blue-500 cursor-pointer" title="Carte de Dresseur"></button>
          </div>

          <div class="relative w-24 h-24 mt-8 md:mt-0 drop-shadow-xl">
            <div class="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-24 bg-gray-800 rounded-lg"></div>
            <div class="absolute top-1/2 left-0 -translate-y-1/2 w-24 h-8 bg-gray-800 rounded-lg"></div>
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-gray-900 rounded-full shadow-inner"></div>
            <div class="absolute top-2 left-1/2 -translate-x-1/2 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-gray-600"></div>
            <div class="absolute bottom-2 left-1/2 -translate-x-1/2 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-gray-600"></div>
            <div class="absolute left-2 top-1/2 -translate-y-1/2 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[6px] border-r-gray-600"></div>
            <div class="absolute right-2 top-1/2 -translate-y-1/2 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-gray-600"></div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePokemonStore } from '../store/pokemon';
import { useTrainerStore } from '../store/trainer';
import { useAuthStore } from '../store/auth';

const router = useRouter();
const pokemonStore = usePokemonStore();
const trainerStore = useTrainerStore();
const authStore = useAuthStore();

const isListening = ref(false);

onMounted(async () => {
  await trainerStore.fetchProfile();
  pokemonStore.fetchPokemons();
});

// Хелперы состояний
const isCaught = (id) => trainerStore.caughtIds.includes(id);
const isSeen = (id) => trainerStore.seenIds.includes(id);
const isUnknown = (id) => !isCaught(id) && !isSeen(id); // Главная фишка: если нет ни там, ни там — он неизвестен!

const markPokemon = async (id, isCaptured) => {
  if (!trainerStore.hasProfile) {
    alert("Veuillez d'abord créer votre Carte de Dresseur !");
    router.push('/profile');
    return;
  }
  await trainerStore.markPokemon(id, isCaptured);
};

const handleLogout = () => {
  authStore.logout();
};

const startVoiceSearch = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Votre navigateur ne supporte pas la reconnaissance vocale.");
    return;
  }
  const recognition = new SpeechRecognition();
  recognition.lang = 'fr-FR';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => { isListening.value = true; };
  recognition.onresult = (event) => {
    pokemonStore.searchQuery = event.results[0][0].transcript.replace(/\.$/, '').trim();
    pokemonStore.fetchPokemons();
  };
  recognition.onerror = (error) => { console.error(error); isListening.value = false; };
  recognition.onend = () => { isListening.value = false; };

  recognition.start();
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
.retro-font { font-family: 'VT323', monospace; letter-spacing: 0.05em; }
.scanlines { background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.1)); background-size: 100% 4px; }
.retro-scrollbar::-webkit-scrollbar { width: 12px; }
.retro-scrollbar::-webkit-scrollbar-track { background: rgba(0, 50, 0, 0.1); border-left: 2px solid rgba(0,0,0,0.1); }
.retro-scrollbar::-webkit-scrollbar-thumb { background: #2f6f2f; border: 2px solid #8bcf8b; }
</style>