<template>
  <div class="pokedex-root">

    <div class="pokedex-body">

      <div class="pokedex-top-panel">
        <div class="pokedex-hinge-left"></div>

        <div class="top-left-cluster">
          <div class="big-lens">
            <div class="lens-inner"></div>
            <div class="lens-glare-1"></div>
            <div class="lens-glare-2"></div>
          </div>
          <div class="indicator-dots">
            <div class="dot dot-red pulse"></div>
            <div class="dot dot-yellow"></div>
            <div class="dot dot-green"></div>
          </div>
        </div>

        <div class="top-screen-container">
          <div class="screen-bezel">
            <div class="screen-notches">
              <div class="notch"></div>
              <div class="notch"></div>
            </div>
            <div class="crt-screen search-screen">
              <input
                  v-model="pokemonStore.searchQuery"
                  @input="pokemonStore.fetchPokemons"
                  type="text"
                  placeholder="> RECHERCHE POKÉMON..."
                  class="search-input retro-font"
                  spellcheck="false"
              />
              <div class="search-cursor" :class="{ blink: true }"></div>
            </div>
          </div>
        </div>

        <div class="pokedex-hinge-right"></div>
      </div>

      <div class="pokedex-divider">
        <div class="divider-line"></div>
        <div class="divider-circle"></div>
        <div class="divider-line"></div>
      </div>

      <div class="pokedex-bottom-panel">

        <div class="bottom-left">
          <div class="main-screen-bezel">
            <div class="crt-screen main-screen">

              <div v-if="pokemonStore.isLoading" class="loading-screen retro-font">
                <div class="loading-text">CHARGEMENT DU SYSTÈME...</div>
                <div class="loading-bar">
                  <div class="loading-fill"></div>
                </div>
              </div>

              <div v-else class="pokemon-grid">
                <div
                    v-for="pkmn in pokemonStore.filteredPokemons"
                    :key="pkmn.id"
                    class="pkmn-card"
                    :class="{
                    'card-caught': isCaught(pkmn.id),
                    'card-seen': isSeen(pkmn.id) && !isCaught(pkmn.id),
                    'card-unknown': isUnknown(pkmn.id)
                  }"
                >
                  <div class="card-status">
                    <span v-if="isCaught(pkmn.id)" class="badge badge-caught">★</span>
                    <span v-else-if="isSeen(pkmn.id)" class="badge badge-seen">👁</span>
                    <span v-else class="badge badge-unknown">?</span>
                  </div>

                  <div class="card-id retro-font">N°{{ pkmn.id.toString().padStart(3, '0') }}</div>

                  <div class="card-image-wrap"
                       @click="isCaught(pkmn.id) ? openDetails(pkmn) : null"
                       :style="isCaught(pkmn.id) ? 'cursor: pointer;' : ''"
                       :title="isCaught(pkmn.id) ? 'Afficher les données' : ''">
                    <img
                        :src="pkmn.imageUrl"
                        :alt="pkmn.name"
                        class="card-image"
                        :class="{ 'image-silhouette': isUnknown(pkmn.id) }"
                    />
                    <div v-if="isCaught(pkmn.id)" class="card-caught-overlay"></div>
                  </div>

                  <div class="card-name retro-font">
                    {{ isUnknown(pkmn.id) ? '???' : pkmn.name }}
                  </div>

                  <div class="card-types">
                    <template v-if="!isUnknown(pkmn.id)">
                      <span v-for="type in pkmn.types" :key="type" class="type-badge retro-font" :class="`type-${type.toLowerCase()}`">
                        {{ type }}
                      </span>
                    </template>
                    <template v-else>
                      <span class="type-badge type-unknown retro-font">INCONNU</span>
                    </template>
                  </div>

                  <div class="card-actions">
                    <button
                        v-if="isUnknown(pkmn.id)"
                        @click="markPokemon(pkmn.id, false)"
                        class="btn-action btn-encounter retro-font"
                    >RENCONTRER</button>

                    <button
                        v-if="isSeen(pkmn.id) && !isCaught(pkmn.id)"
                        @click="markPokemon(pkmn.id, true)"
                        class="btn-action btn-catch retro-font"
                    >⚡ CAPTURER !</button>

                    <div v-if="isCaught(pkmn.id)" class="card-caught-label retro-font">
                      ✓ CAPTURÉ
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="selectedPkmn" class="pkmn-modal-overlay" @click="closeDetails">
                <div class="pkmn-modal" @click.stop>
                  <div class="modal-header">
                    <span class="retro-font">N°{{ selectedPkmn.id.toString().padStart(3, '0') }}</span>
                    <button class="btn-close retro-font" @click="closeDetails">X</button>
                  </div>
                  <img :src="selectedPkmn.imageUrl" class="modal-image" />
                  <h2 class="retro-font modal-name">{{ selectedPkmn.name }}</h2>
                  <div class="modal-types">
                    <span v-for="type in selectedPkmn.types" :key="type" class="type-badge retro-font" :class="`type-${type.toLowerCase()}`">{{ type }}</span>
                  </div>
                  <p class="retro-font modal-desc">{{ selectedPkmn.description }}</p>
                </div>
              </div>

              <div class="scanlines-overlay"></div>
              <div class="vignette-overlay"></div>
            </div>
          </div>

          <div class="screen-bottom-deco">
            <div class="deco-circle deco-red"></div>
            <div class="deco-lines">
              <div class="deco-line"></div>
              <div class="deco-line"></div>
              <div class="deco-line"></div>
            </div>
            <div class="stats-display retro-font">
              <span class="stat-item">VU: {{ trainerStore.seenIds.length }}</span>
              <span class="stat-sep">/</span>
              <span class="stat-item stat-caught">CAPTURÉ: {{ trainerStore.caughtIds.length }}</span>
            </div>
          </div>
        </div>

        <div class="controls-panel">

          <button
              @click="toggleVoice"
              class="btn-voice"
              :class="{ 'voice-active': isVoiceEnabled }"
              title="Activer/Désactiver la voix"
          >
            <svg v-if="!isVoiceEnabled" xmlns="http://www.w3.org/2000/svg" class="voice-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <div v-else class="voice-pulse-ring"></div>
          </button>

          <div class="small-buttons">
            <button @click="handleLogout" class="small-btn small-btn-red" title="Déconnexion">
              <span class="retro-font small-btn-label">OFF</span>
            </button>
            <button @click="router.push('/profile')" class="small-btn small-btn-blue" title="Carte de Dresseur">
              <span class="retro-font small-btn-label">Profil</span>
            </button>
          </div>

          <div class="dpad">
            <div class="dpad-h"></div>
            <div class="dpad-v"></div>
            <div class="dpad-center"></div>
            <div class="dpad-arrow dpad-up">▲</div>
            <div class="dpad-arrow dpad-down">▼</div>
            <div class="dpad-arrow dpad-left">◀</div>
            <div class="dpad-arrow dpad-right">▶</div>
          </div>

          <div class="speaker-grille">
            <div v-for="i in 7" :key="i" class="speaker-hole"></div>
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

// Status de Activer/Desactiver la voix
const isVoiceEnabled = ref(false);

// Etat du modele
const selectedPkmn = ref(null);

// Gardons le son du cri afin de pouvoir l'arrêter
let currentCry = null;

onMounted(async () => {
  await trainerStore.fetchProfile();
  pokemonStore.fetchPokemons();

  // demande au navigateur de charger les voix à l'avance
  window.speechSynthesis.getVoices();
});

const isCaught = (id) => trainerStore.caughtIds.includes(id);
const isSeen = (id) => trainerStore.seenIds.includes(id);
const isUnknown = (id) => !isCaught(id) && !isSeen(id);

const markPokemon = async (id, isCaptured) => {
  if (!trainerStore.hasProfile) {
    alert("Veuillez d'abord créer votre Carte de Dresseur !");
    router.push('/profile');
    return;
  }
  await trainerStore.markPokemon(id, isCaptured);
};

const handleLogout = () => authStore.logout();

// Activer/Desactiver le son
const toggleVoice = () => {
  isVoiceEnabled.value = !isVoiceEnabled.value;

  if (!isVoiceEnabled.value) {
    if (currentCry) {
      currentCry.pause();
      currentCry.currentTime = 0;
    }
    window.speechSynthesis.cancel();
  }
};

// OUVRONS LA FENÊTRE MODAL ET LANCONS LE SON
const openDetails = (pkmn) => {
  selectedPkmn.value = pkmn;

  if (currentCry) {
    currentCry.pause();
    currentCry.currentTime = 0;
  }
  window.speechSynthesis.cancel();

  if (isVoiceEnabled.value) {
    // Télécharger le cri
    const cryUrl = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${pkmn.id}.ogg`;

    currentCry = new Audio(cryUrl);
    currentCry.volume = 0.2;

    // Preparons le texte
    const textToSpeak = `${pkmn.name}. ${pkmn.description || 'Description non disponible.'}`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'fr-FR';
    utterance.pitch = 0.7;
    utterance.rate = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const frenchVoices = voices.filter(v => v.lang.startsWith('fr'));

    const premiumVoice = frenchVoices.find(v =>
        v.name.includes('Google') ||
        v.name.includes('Premium') ||
        v.name.includes('Thomas') ||
        v.name.includes('Amelie')
    );

    if (premiumVoice) {
      utterance.voice = premiumVoice;
      console.log('Une belle voix a été trouvée:', premiumVoice.name);
    } else if (frenchVoices.length > 0) {
      utterance.voice = frenchVoices[0];
      console.log('Aucune bonne voix trouvée, utilisons la voix standard:', frenchVoices[0].name);
    } else {
      console.warn('Les voix françaises ne sont pas disponibles dans le système!');
    }
    // --------------------------

    // Accrochons les auditeurs d'événements au lecteur
    utterance.onstart = () => console.log('Le lecteur a COMMENCÉ à lire le texte.');
    utterance.onend = () => console.log('Le lecteur a fini de lire le texte.');
    utterance.onerror = (e) => console.error('Erreur du lecteur:', e);

    // Événement : quand le cri s'arrête
    currentCry.onended = () => {
      window.speechSynthesis.speak(utterance);
    };

    // Lancer le cri
    currentCry.play()
        .then(() => console.log('Le cri a été reproduit avec succès.!'))
        .catch(e => console.error('Erreur le navigateur a bloqué le cri. Raison :', e));

  } else {
    //console.log('Le son est coupé. Ouvrons le dossier en silence..');
  }
};

// Fermer L'onglet
const closeDetails = () => {
  selectedPkmn.value = null;
  if (currentCry) {
    currentCry.pause();
    currentCry.currentTime = 0;
  }
  window.speechSynthesis.cancel();
};
</script>

<style scoped>
/* ─── ROOT ─── */
.pokedex-root {
  width: 100vw;
  height: 100vh;
  min-height: 100dvh;
  background: radial-gradient(ellipse at center, #1a0a0a 0%, #0d0000 100%);
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  overflow: hidden;
}

/* ─── POKÉDEX BODY ─── */
.pokedex-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: linear-gradient(145deg, #f03030 0%, #cc1a1a 40%, #a80f0f 100%);
  border: none;
  overflow: hidden;
  position: relative;
}

/* Plastic texture */
.pokedex-body::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='1' height='1' fill='rgba(255,255,255,0.03)'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 0;
}

/* Sheen highlight */
.pokedex-body::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 45%;
  background: linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 100%);
  pointer-events: none;
  z-index: 0;
}

/* ─── TOP PANEL ─── */
.pokedex-top-panel {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 0;
  padding: 10px 14px 8px;
  background: linear-gradient(180deg, rgba(255,100,100,0.2) 0%, rgba(0,0,0,0.15) 100%);
  border-bottom: 4px solid #6b0000;
  box-shadow: 0 4px 0 rgba(255,255,255,0.08) inset, 0 6px 12px rgba(0,0,0,0.4);
  min-height: 80px;
}

.pokedex-hinge-left, .pokedex-hinge-right {
  width: 18px;
  flex-shrink: 0;
}

/* ─── TOP-LEFT CLUSTER ─── */
.top-left-cluster {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  margin-right: 14px;
}

.big-lens {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #90c8f8, #1a5bb8 60%, #0a2a6e 100%);
  border: 5px solid #e8e8e8;
  box-shadow:
      0 0 0 3px #9a9a9a,
      0 0 20px rgba(30, 120, 220, 0.7),
      inset 0 4px 12px rgba(0,0,0,0.4);
  position: relative;
  flex-shrink: 0;
}

.lens-inner {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 30px; height: 30px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.3);
}

.lens-glare-1 {
  position: absolute;
  top: 8px; left: 8px;
  width: 16px; height: 16px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.7) 0%, transparent 70%);
}

.lens-glare-2 {
  position: absolute;
  bottom: 10px; right: 10px;
  width: 6px; height: 6px;
  border-radius: 50%;
  background: rgba(255,255,255,0.5);
}

.indicator-dots {
  display: flex;
  gap: 6px;
}

.dot {
  width: 14px; height: 14px;
  border-radius: 50%;
  border: 2px solid rgba(0,0,0,0.4);
  box-shadow: inset 0 2px 3px rgba(255,255,255,0.3), 0 2px 4px rgba(0,0,0,0.4);
}

.dot-red { background: radial-gradient(circle at 35% 35%, #ff6060, #cc0000); box-shadow: 0 0 8px rgba(255,0,0,0.6), inset 0 2px 3px rgba(255,255,255,0.4); }
.dot-yellow { background: radial-gradient(circle at 35% 35%, #ffe060, #c8a000); }
.dot-green { background: radial-gradient(circle at 35% 35%, #60ff90, #00aa40); }
.pulse { animation: pulse-glow 1.5s ease-in-out infinite; }

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 8px rgba(255,0,0,0.6), inset 0 2px 3px rgba(255,255,255,0.4); }
  50% { box-shadow: 0 0 18px rgba(255,0,0,0.9), 0 0 30px rgba(255,0,0,0.4), inset 0 2px 3px rgba(255,255,255,0.4); }
}

/* ─── TOP SCREEN (search) ─── */
.top-screen-container {
  flex: 1;
}

.screen-bezel {
  background: #2a2a2a;
  border-radius: 8px;
  padding: 6px;
  box-shadow: inset 0 3px 8px rgba(0,0,0,0.7), 0 2px 4px rgba(255,255,255,0.1);
}

.screen-notches {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 4px;
}

.notch {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #444;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.6);
}

.crt-screen {
  background: #7dbf7d;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.search-screen {
  display: flex;
  align-items: center;
  padding: 8px 14px;
  gap: 8px;
  background: linear-gradient(180deg, #92d492 0%, #7dbf7d 100%);
  min-height: 44px;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #1a4a1a;
  font-size: clamp(18px, 2.5vw, 26px);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.search-input::placeholder {
  color: #3a7a3a;
  opacity: 0.7;
}

/* ─── DIVIDER ─── */
.pokedex-divider {
  display: flex;
  align-items: center;
  padding: 0 14px;
  height: 24px;
  background: #8b0000;
  border-top: 3px solid #5a0000;
  border-bottom: 3px solid #5a0000;
  position: relative;
  z-index: 1;
}

.divider-line {
  flex: 1;
  height: 3px;
  background: linear-gradient(90deg, transparent, #c04040, transparent);
}

.divider-circle {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: radial-gradient(circle at 40% 35%, #ff8080, #cc0000 50%, #7a0000 100%);
  border: 3px solid #5a0000;
  box-shadow: 0 0 10px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.3);
  margin: 0 12px;
}

/* ─── BOTTOM PANEL ─── */
.pokedex-bottom-panel {
  flex: 1;
  display: flex;
  gap: 0;
  padding: 10px 14px 12px;
  overflow: hidden;
  position: relative;
  z-index: 1;
  min-height: 0;
}

/* ─── BOTTOM LEFT (main screen) ─── */
.bottom-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
  min-width: 0;
}

.main-screen-bezel {
  flex: 1;
  background: #2a2a2a;
  border-radius: 12px 12px 12px 40px;
  padding: 8px;
  box-shadow:
      inset 0 4px 10px rgba(0,0,0,0.8),
      inset 0 -2px 4px rgba(255,255,255,0.06),
      0 2px 4px rgba(255,255,255,0.08);
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.main-screen {
  flex: 1;
  border-radius: 6px 6px 6px 34px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: linear-gradient(180deg, #8fd48f 0%, #7dc87d 100%);
  box-shadow: inset 0 0 40px rgba(0,60,0,0.35);
}

/* ─── LOADING ─── */
.loading-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  color: #1a4a1a;
}

.loading-text {
  font-size: clamp(20px, 3vw, 32px);
  animation: blink 1s step-end infinite;
}

.loading-bar {
  width: 60%;
  height: 12px;
  background: rgba(0,60,0,0.2);
  border: 2px solid #2a6a2a;
  border-radius: 2px;
  overflow: hidden;
}

.loading-fill {
  height: 100%;
  background: #2a6a2a;
  animation: load 2s ease-in-out infinite;
}

@keyframes load {
  0% { width: 0%; }
  70% { width: 100%; }
  100% { width: 100%; }
}

/* ─── POKEMON GRID ─── */
.pokemon-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 10px;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: #2f6f2f #a8dfa8;
  align-content: start;
}

.pokemon-grid::-webkit-scrollbar { width: 10px; }
.pokemon-grid::-webkit-scrollbar-track { background: rgba(0,50,0,0.15); }
.pokemon-grid::-webkit-scrollbar-thumb { background: #2f6f2f; border: 2px solid #7dc87d; border-radius: 4px; }

/* ─── POKEMON CARD ─── */
.pkmn-card {
  background: #a2dca2;
  border: 3px solid rgba(0,80,0,0.35);
  border-radius: 4px;
  padding: 10px 8px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  cursor: default;
}

.pkmn-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,60,0,0.25);
}

.card-caught {
  border-color: #d4a000 !important;
  background: linear-gradient(135deg, #b0e8b0, #c8e8a0);
  box-shadow: 0 0 10px rgba(212,160,0,0.4);
}

.card-seen {
  border-color: #4080c0 !important;
  background: #a8d0e8;
}

.card-unknown {
  background: #90c090;
  opacity: 0.85;
}

/* Status badge */
.card-status {
  position: absolute;
  top: 4px;
  right: 6px;
}

.badge {
  font-size: 14px;
  line-height: 1;
}

.badge-caught { color: #c09000; filter: drop-shadow(0 0 3px rgba(255,180,0,0.6)); }
.badge-seen { font-size: 11px; }
.badge-unknown { color: #666; font-family: 'VT323', monospace; font-size: 16px; }

/* ID */
.card-id {
  font-size: clamp(14px, 1.8vw, 18px);
  color: #1a5a1a;
  font-weight: bold;
  align-self: flex-start;
  margin-bottom: 4px;
}

/* Image */
.card-image-wrap {
  background: rgba(210,240,210,0.6);
  border: 2px solid rgba(0,80,0,0.2);
  border-radius: 2px;
  padding: 6px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 6px;
  position: relative;
  overflow: hidden;
}

.card-image {
  width: clamp(56px, 8vw, 96px);
  height: clamp(56px, 8vw, 96px);
  object-fit: contain;
  transition: transform 0.3s ease;
  image-rendering: pixelated;
}

.pkmn-card:not(.card-unknown):hover .card-image {
  transform: scale(1.12);
}

.image-silhouette {
  filter: brightness(0) contrast(200%) opacity(0.75) !important;
}

.card-caught-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, rgba(255,200,0,0.12) 0%, transparent 70%);
  pointer-events: none;
}

/* Name */
.card-name {
  font-size: clamp(16px, 2.2vw, 22px);
  color: #1a4a1a;
  text-transform: uppercase;
  text-align: center;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: bold;
  margin-bottom: 4px;
}

/* Types */
.card-types {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: center;
  min-height: 22px;
  margin-bottom: 6px;
}

.type-badge {
  font-size: clamp(11px, 1.3vw, 14px);
  padding: 1px 6px;
  border-radius: 2px;
  border: 1px solid rgba(0,0,0,0.15);
  background: rgba(0,80,0,0.12);
  color: #1a4a1a;
  white-space: nowrap;
}

.type-unknown { color: #556a55; background: transparent; border-color: transparent; letter-spacing: 0.15em; }

/* Type colors */
.type-feu    { background: rgba(220,60,0,0.18); color: #8b2000; border-color: rgba(220,60,0,0.3); }
.type-eau    { background: rgba(0,100,220,0.15); color: #003880; border-color: rgba(0,100,220,0.3); }
.type-plante { background: rgba(0,150,40,0.15); color: #004020; border-color: rgba(0,150,40,0.3); }
.type-poison { background: rgba(140,0,160,0.15); color: #500060; border-color: rgba(140,0,160,0.3); }
.type-vol    { background: rgba(80,120,200,0.15); color: #203080; border-color: rgba(80,120,200,0.3); }
.type-normal { background: rgba(100,100,80,0.15); color: #404030; border-color: rgba(100,100,80,0.3); }

/* Actions */
.card-actions {
  width: 100%;
  margin-top: auto;
}

.btn-action {
  width: 100%;
  padding: 4px 6px;
  border: 2px solid;
  border-radius: 2px;
  font-size: clamp(12px, 1.5vw, 16px);
  cursor: pointer;
  transition: all 0.1s ease;
  letter-spacing: 0.04em;
}

.btn-action:active { transform: translateY(2px); }

.btn-encounter {
  background: #3060c0;
  color: white;
  border-color: #1a3a80;
  box-shadow: 0 3px 0 #1a3a80;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}
.btn-encounter:hover { background: #4070d0; }
.btn-encounter:active { box-shadow: none; }

.btn-catch {
  background: #cc2020;
  color: white;
  border-color: #7a0000;
  box-shadow: 0 3px 0 #7a0000;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  animation: catch-pulse 1.2s ease-in-out infinite;
}
.btn-catch:hover { background: #dd3030; }
.btn-catch:active { box-shadow: none; }

@keyframes catch-pulse {
  0%, 100% { box-shadow: 0 3px 0 #7a0000, 0 0 0 rgba(220,32,32,0); }
  50% { box-shadow: 0 3px 0 #7a0000, 0 0 8px rgba(220,32,32,0.5); }
}

.card-caught-label {
  text-align: center;
  color: #1a6a1a;
  font-size: clamp(12px, 1.5vw, 16px);
  padding: 4px;
  border: 2px solid transparent;
  font-weight: bold;
  letter-spacing: 0.06em;
}

/* ─── MODAL DETAILS ─── */
.pkmn-modal-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 40, 0, 0.85);
  z-index: 15;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
}

.pkmn-modal {
  background: #8fd48f;
  border: 4px solid #1a4a1a;
  border-radius: 8px;
  width: 100%;
  max-width: 320px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 0 20px rgba(0,0,0,0.6), inset 0 0 10px rgba(0,60,0,0.2);
}

.modal-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  color: #1a4a1a;
  font-size: clamp(18px, 2.5vw, 22px);
  border-bottom: 2px solid #1a4a1a;
  margin-bottom: 12px;
  padding-bottom: 4px;
}

.btn-close {
  background: transparent;
  border: none;
  color: #cc2020;
  cursor: pointer;
  font-weight: bold;
}
.btn-close:hover { transform: scale(1.2); }

.modal-image {
  width: clamp(80px, 15vw, 130px);
  height: clamp(80px, 15vw, 130px);
  object-fit: contain;
  image-rendering: pixelated;
  margin-bottom: 10px;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4));
}

.modal-name {
  font-size: clamp(22px, 3.5vw, 28px);
  color: #1a4a1a;
  font-weight: bold;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.modal-types {
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
}

.modal-desc {
  font-size: clamp(14px, 2vw, 18px);
  line-height: 1.3;
  color: #1a4a1a;
  text-align: center;
  background: rgba(0, 0, 0, 0.05);
  padding: 10px;
  border-radius: 4px;
  border: 1px dashed #1a4a1a;
  width: 100%;
}

/* ─── SCREEN OVERLAYS ─── */
.scanlines-overlay {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
      0deg,
      rgba(0,0,0,0.06) 0px,
      rgba(0,0,0,0.06) 1px,
      transparent 1px,
      transparent 3px
  );
  pointer-events: none;
  z-index: 20;
}

.vignette-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 60%, rgba(0,40,0,0.25) 100%);
  pointer-events: none;
  z-index: 21;
}

/* ─── SCREEN BOTTOM DECO ─── */
.screen-bottom-deco {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 6px;
}

.deco-circle {
  width: 18px; height: 18px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: inset 0 2px 3px rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.4);
}

.deco-red { background: radial-gradient(circle at 35% 35%, #ff8080, #cc0000); }

.deco-lines {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.deco-line {
  width: 20px; height: 2px;
  background: rgba(0,0,0,0.3);
  border-radius: 1px;
}

.stats-display {
  display: flex;
  gap: 8px;
  align-items: center;
  color: rgba(255,255,255,0.8);
  font-size: clamp(12px, 1.5vw, 16px);
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  flex: 1;
  justify-content: flex-end;
}

.stat-caught { color: #ffd060; }
.stat-sep { color: rgba(255,255,255,0.4); }

/* ─── CONTROLS PANEL ─── */
.controls-panel {
  width: 110px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  padding: 8px 6px;
  gap: 0;
}

/* Voice button */
.btn-voice {
  width: 62px; height: 62px;
  border-radius: 50%;
  background: radial-gradient(circle at 40% 35%, #6090ee, #2040b0 70%, #102080 100%);
  border: 4px solid #0a1a60;
  box-shadow:
      0 5px 0 #0a1a60,
      0 7px 15px rgba(0,0,0,0.5),
      inset 0 3px 5px rgba(255,255,255,0.3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.1s ease;
  flex-shrink: 0;
}

.btn-voice:hover { background: radial-gradient(circle at 40% 35%, #70a0ff, #3050c0 70%, #1830a0 100%); }
.btn-voice:active { transform: translateY(4px); box-shadow: 0 1px 0 #0a1a60, 0 2px 5px rgba(0,0,0,0.5), inset 0 3px 5px rgba(255,255,255,0.2); }

.voice-active {
  background: radial-gradient(circle at 40% 35%, #ff9090, #cc3030 70%) !important;
  border-color: #600a0a !important;
  box-shadow: 0 0 20px rgba(255,60,60,0.7), 0 5px 0 #600a0a, inset 0 3px 5px rgba(255,255,255,0.2) !important;
}

.voice-icon { width: 30px; height: 30px; color: white; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5)); }

.voice-pulse-ring {
  width: 24px; height: 24px;
  border-radius: 50%;
  background: white;
  animation: ping 0.8s ease-out infinite;
}

@keyframes ping {
  0% { transform: scale(0.8); opacity: 1; }
  100% { transform: scale(1.6); opacity: 0; }
}

/* Small buttons */
.small-buttons {
  display: flex;
  gap: 5px;
}

.small-btn {
  width: 52px; height: 36px;
  border-radius: 8px;
  border: 2px solid;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 0 rgba(0,0,0,0.4), inset 0 2px 3px rgba(255,255,255,0.3);
  transition: all 0.1s;
}

.small-btn:active { transform: translateY(2px); box-shadow: 0 1px 0 rgba(0,0,0,0.4); }

.small-btn-red { background: linear-gradient(180deg, #ff6060, #cc1a1a); border-color: #7a0000; }
.small-btn-blue { background: linear-gradient(180deg, #6090ee, #1a40cc); border-color: #0a1a7a; }

.small-btn-label {
  font-family: 'VT323', monospace;
  font-size: 11px;
  color: rgba(255,255,255,0.9);
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  letter-spacing: 0.05em;
}

/* D-Pad */
.dpad {
  width: 88px; height: 88px;
  position: relative;
  flex-shrink: 0;
}

.dpad-h, .dpad-v {
  position: absolute;
  background: linear-gradient(180deg, #3a3a3a, #222);
  border-radius: 4px;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.4);
}

.dpad-h {
  left: 0; top: 50%;
  width: 100%; height: 30px;
  transform: translateY(-50%);
}

.dpad-v {
  top: 0; left: 50%;
  width: 30px; height: 100%;
  transform: translateX(-50%);
}

.dpad-center {
  position: absolute;
  top: 50%; left: 50%;
  width: 30px; height: 30px;
  transform: translate(-50%, -50%);
  background: #2a2a2a;
  border-radius: 50%;
  z-index: 2;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.8);
}

.dpad-arrow {
  position: absolute;
  color: #555;
  font-size: 12px;
  z-index: 3;
  pointer-events: none;
  user-select: none;
}

.dpad-up { top: 4px; left: 50%; transform: translateX(-50%); }
.dpad-down { bottom: 4px; left: 50%; transform: translateX(-50%); }
.dpad-left { left: 4px; top: 50%; transform: translateY(-50%); }
.dpad-right { right: 4px; top: 50%; transform: translateY(-50%); }

/* Speaker grille */
.speaker-grille {
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: flex-start;
  align-self: flex-end;
  margin-right: 6px;
}

.speaker-hole {
  width: 28px; height: 4px;
  background: rgba(0,0,0,0.35);
  border-radius: 2px;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.5);
}

/* ─── ANIMATIONS ─── */
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.retro-font { font-family: 'VT323', monospace; letter-spacing: 0.05em; }

/* ─── RESPONSIVE ─── */

/* Large desktop: 3 cols for grid */
@media (min-width: 1200px) {
  .pokemon-grid { grid-template-columns: repeat(3, 1fr); gap: 12px; padding: 14px; }
  .card-image { width: 250px; height: 250px; }
  .controls-panel { width: 130px; }
  .big-lens { width: 70px; height: 70px; }
  .top-left-cluster { margin-right: 20px; }
  .pokedex-top-panel { padding: 14px 20px 10px; min-height: 100px; }
}

/* Medium desktop: 2 cols */
@media (min-width: 768px) and (max-width: 1199px) {
  .pokemon-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .card-image { width: 150px; height: 150px; }
  .controls-panel { width: 120px; }
}

/* Tablet */
@media (max-width: 767px) {
  .pokedex-top-panel {
    padding: 8px 10px 6px;
    min-height: 68px;
  }
  .big-lens { width: 50px; height: 50px; }
  .indicator-dots { gap: 4px; }
  .dot { width: 10px; height: 10px; }
  .top-left-cluster { margin-right: 10px; }

  .pokedex-bottom-panel { padding: 8px 10px 10px; gap: 0; }

  .pokemon-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 7px;
    padding: 8px;
  }

  .card-image { width: 100px; height: 100px; }
  .controls-panel { width: 80px; }
  .btn-voice { width: 50px; height: 50px; }
  .voice-icon { width: 24px; height: 24px; }
  .dpad { width: 70px; height: 70px; }
  .dpad-h { height: 24px; }
  .dpad-v { width: 24px; }
  .small-btn { width: 34px; }
  .speaker-grille { gap: 4px; }
  .speaker-hole { width: 22px; height: 3px; }
}

/* Mobile small */
@media (max-width: 480px) {
  .pokemon-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
    padding: 6px;
  }
  .card-image { width: 80px; height: 80px; }
  .pkmn-card { padding: 7px 6px 6px; }
  .card-name { font-size: 15px; }
  .card-id { font-size: 13px; }
  .btn-action { font-size: 12px; padding: 3px 4px; }
  .controls-panel { width: 72px; }
  .btn-voice { width: 44px; height: 44px; }
  .dpad { width: 60px; height: 60px; }
  .dpad-h { height: 20px; }
  .dpad-v { width: 20px; }
  .dpad-center { width: 20px; height: 20px; }
  .small-btn { width: 30px; height: 20px; }
  .small-btn-label { font-size: 9px; }
  .speaker-hole { width: 18px; }
  .stats-display { font-size: 12px; gap: 4px; }
}
</style>