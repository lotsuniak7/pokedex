<template>
  <div class="root" :class="isAdmin ? 'mode-admin' : 'mode-user'">

    <!-- ══════════════════════════════════════════════
         USER MODE — gold trainer card, centered
    ══════════════════════════════════════════════ -->
    <template v-if="!isAdmin">
      <div class="user-bg">
        <div class="user-glow"></div>
      </div>

      <div class="trainer-card">
        <!-- Card top bar -->
        <div class="tc-top">
          <div class="tc-brand">
            <div class="tc-cam">
              <div class="tc-cam-shine"></div>
            </div>
            <div class="tc-brand-text">
              <span class="tc-brand-main">POKÉDEX</span>
              <span class="tc-brand-sub">CARTE DE DRESSEUR</span>
            </div>
          </div>
          <div class="tc-leds">
            <div class="tc-led r"></div>
            <div class="tc-led y"></div>
            <div class="tc-led g"></div>
          </div>
        </div>

        <!-- Card screen area -->
        <div class="tc-body">

          <!-- LOADING -->
          <div v-if="trainerStore.isLoading" class="tc-state">
            <div class="tc-spinner"></div>
            <span class="tc-state-txt">LECTURE DE LA CARTE...</span>
          </div>

          <!-- CREATE PROFILE -->
          <div v-else-if="!trainerStore.hasProfile" class="tc-create">
            <div class="tc-create-head">
              <div class="tc-create-orb">!</div>
              <div>
                <p class="tc-create-title">IDENTITÉ REQUISE</p>
                <p class="tc-create-sub">Enregistrez votre profil dresseur</p>
              </div>
            </div>

            <div class="tc-field">
              <label class="tc-label">▶ NOM DU DRESSEUR</label>
              <div class="tc-input-wrap" :class="{ focused: focus === 'tname' }">
                <input v-model="form.trainerName" type="text" placeholder="EX: SACHA"
                       maxlength="12" class="tc-input tc-input-big" spellcheck="false"
                       @focus="focus='tname'" @blur="focus=null" />
                <span class="tc-charcount">{{ form.trainerName.length }}/12</span>
              </div>
            </div>

            <div class="tc-field">
              <label class="tc-label">▶ PHOTO (URL)</label>
              <div class="tc-input-wrap" :class="{ focused: focus === 'timg' }">
                <input v-model="form.imgUrl" type="url" placeholder="https://..."
                       class="tc-input tc-input-url"
                       @focus="focus='timg'" @blur="focus=null" />
              </div>
              <div v-if="form.imgUrl" class="tc-preview">
                <img :src="form.imgUrl" @error="imgError=true" @load="imgError=false" />
                <span v-if="imgError" class="tc-preview-err">URL invalide</span>
              </div>
            </div>

            <button class="tc-btn-create" :disabled="!form.trainerName.trim()" @click="handleCreateProfile">
              ▶ ENREGISTRER
            </button>
          </div>

          <!-- PROFILE -->
          <div v-else class="tc-profile">
            <!-- Identity -->
            <div class="tc-identity">
              <div class="tc-avatar">
                <img v-if="trainerStore.profile.imgUrl && !avatarError"
                     :src="trainerStore.profile.imgUrl" @error="avatarError=true" />
                <span v-else class="tc-avatar-txt">{{ initials }}</span>
                <div class="tc-avatar-gloss"></div>
              </div>
              <div class="tc-identity-info">
                <span class="tc-id-meta">ID DRESSEUR</span>
                <span class="tc-id-code">#{{ String(trainerStore.profile._id).slice(-6).toUpperCase() }}</span>
                <span class="tc-id-name">{{ trainerStore.profile.trainerName }}</span>
                <div class="tc-chips">
                  <span class="tc-chip">KANTO</span>
                  <span class="tc-chip gold">ACTIF</span>
                </div>
              </div>
            </div>

            <!-- Divider pokeball -->
            <div class="tc-sep">
              <div class="tc-sep-line"></div>
              <div class="tc-pokeball">
                <div class="tp-top"></div><div class="tp-band"></div><div class="tp-center"></div>
              </div>
              <div class="tc-sep-line"></div>
            </div>

            <!-- Stats -->
            <div class="tc-stats">
              <div class="tc-stat blue">
                <span class="ts-icon">👁</span>
                <div class="ts-body">
                  <div class="ts-row">
                    <span class="ts-label">VUS</span>
                    <span class="ts-val">{{ trainerStore.seenIds.length }}</span>
                  </div>
                  <div class="ts-bar"><div class="ts-fill blue" :style="{ width: seenPct + '%' }"></div></div>
                  <span class="ts-pct">{{ seenPct }}% de {{ TOTAL }}</span>
                </div>
              </div>
              <div class="tc-stat gold">
                <span class="ts-icon">★</span>
                <div class="ts-body">
                  <div class="ts-row">
                    <span class="ts-label">ATTRAPÉS</span>
                    <span class="ts-val">{{ trainerStore.caughtIds.length }}</span>
                  </div>
                  <div class="ts-bar"><div class="ts-fill gold" :style="{ width: caughtPct + '%' }"></div></div>
                  <span class="ts-pct">{{ caughtPct }}% de {{ TOTAL }}</span>
                </div>
              </div>
            </div>

            <!-- Completion ring -->
            <div class="tc-completion">
              <svg viewBox="0 0 72 72" class="tc-ring-svg">
                <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(113,63,18,0.15)" stroke-width="6"/>
                <circle cx="36" cy="36" r="30" fill="none" stroke="#ca8a04" stroke-width="6"
                        stroke-linecap="round"
                        stroke-dasharray="188.5"
                        :stroke-dashoffset="188.5 * (1 - caughtPct / 100)"
                        style="transform:rotate(-90deg);transform-origin:center;transition:stroke-dashoffset 1.2s ease"
                />
              </svg>
              <div class="tc-ring-label">
                <span class="tc-ring-pct">{{ caughtPct }}%</span>
                <span class="tc-ring-sub">COMPLÉTÉ</span>
              </div>
            </div>

            <button @click="router.push('/')" class="tc-btn-back">◀ RETOUR AU POKÉDEX</button>
          </div>

        </div>

        <!-- Card bottom -->
        <div class="tc-foot">
          <div class="tc-foot-line"></div>
          <span class="tc-foot-txt">LIGUE POKÉMON — RÉGION KANTO</span>
          <div class="tc-foot-line"></div>
        </div>
      </div>
    </template>

    <!-- ══════════════════════════════════════════════
         ADMIN MODE — full cockpit
    ══════════════════════════════════════════════ -->
    <template v-else>

      <!-- Cockpit background -->
      <div class="ck-bg">
        <div class="ck-bg-grid"></div>
        <div class="ck-bg-glow-tl"></div>
        <div class="ck-bg-glow-br"></div>
      </div>

      <div class="cockpit">

        <!-- ── SIDEBAR ── -->
        <aside class="ck-sidebar">

          <!-- Sidebar header -->
          <div class="ck-sb-head">
            <div class="ck-sb-logo">
              <div class="ck-sb-cam">
                <div class="ck-sb-cam-shine"></div>
              </div>
              <div class="ck-sb-brand">
                <span class="ck-sb-brand-main">POKÉDEX</span>
                <span class="ck-sb-brand-sub">ADMIN SYSTEM</span>
              </div>
            </div>
            <div class="ck-sb-leds">
              <div class="ck-led r"></div>
              <div class="ck-led y"></div>
              <div class="ck-led g"></div>
            </div>
          </div>

          <!-- Profile block -->
          <div class="ck-profile-block" v-if="trainerStore.hasProfile">
            <div class="ck-p-avatar">
              <img v-if="trainerStore.profile.imgUrl && !avatarError"
                   :src="trainerStore.profile.imgUrl" @error="avatarError=true" />
              <span v-else>{{ initials }}</span>
              <div class="ck-p-avatar-border"></div>
            </div>
            <div class="ck-p-info">
              <div class="ck-p-name">{{ trainerStore.profile.trainerName }}</div>
              <div class="ck-p-id">#{{ String(trainerStore.profile._id).slice(-6).toUpperCase() }}</div>
              <div class="ck-admin-badge">
                <div class="ck-admin-dot"></div>
                ADMINISTRATEUR
              </div>
            </div>
          </div>
          <div class="ck-profile-block" v-else>
            <div class="ck-p-avatar"><span>??</span></div>
            <div class="ck-p-info">
              <div class="ck-p-name">—</div>
              <div class="ck-admin-badge"><div class="ck-admin-dot"></div>ADMINISTRATEUR</div>
            </div>
          </div>

          <!-- Mini stats -->
          <div class="ck-mini-stats">
            <div class="ck-ms">
              <div class="ck-ms-icon">👁</div>
              <div class="ck-ms-body">
                <div class="ck-ms-bar"><div class="ck-ms-fill blue" :style="{ width: seenPct+'%' }"></div></div>
                <div class="ck-ms-row">
                  <span class="ck-ms-label">VUS</span>
                  <span class="ck-ms-val">{{ trainerStore.seenIds.length }}/{{ TOTAL }}</span>
                </div>
              </div>
            </div>
            <div class="ck-ms">
              <div class="ck-ms-icon">★</div>
              <div class="ck-ms-body">
                <div class="ck-ms-bar"><div class="ck-ms-fill gold" :style="{ width: caughtPct+'%' }"></div></div>
                <div class="ck-ms-row">
                  <span class="ck-ms-label">ATTRAPÉS</span>
                  <span class="ck-ms-val">{{ trainerStore.caughtIds.length }}/{{ TOTAL }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- DB info -->
          <div class="ck-db-info">
            <div class="ck-db-row">
              <span class="ck-db-label">BASE DE DONNÉES</span>
              <div class="ck-db-dot"></div>
            </div>
            <div class="ck-db-count">{{ pokemonStore.pokemons.length }}<span>entrées</span></div>
          </div>

          <!-- Nav -->
          <div class="ck-nav">
            <button class="ck-nav-btn pokedex" @click="router.push('/')">◀ POKÉDEX</button>
          </div>

        </aside>

        <!-- ── MAIN ── -->
        <main class="ck-main">

          <!-- Tabs + toolbar -->
          <div class="ck-toolbar">
            <div class="ck-tabs">
              <button class="ck-tab" :class="{ active: activeTab==='list' }" @click="activeTab='list'">
                <span class="ck-tab-icon">⬡</span> BASE DE DONNÉES
              </button>
              <button class="ck-tab" :class="{ active: activeTab==='form', editing: isEditing }" @click="activeTab='form'">
                <span class="ck-tab-icon">{{ isEditing ? '✎' : '+' }}</span>
                {{ isEditing ? 'MODIFIER' : 'AJOUTER' }}
              </button>
            </div>

            <!-- List toolbar -->
            <div v-if="activeTab === 'list'" class="ck-list-tools">
              <!-- Search -->
              <div class="ck-search" :class="{ focused: focus==='search' }">
                <span class="ck-search-ico">⌕</span>
                <input v-model="searchQuery" type="text" placeholder="Rechercher..."
                       @focus="focus='search'" @blur="focus=null" spellcheck="false" />
              </div>

              <!-- Type filter pills -->
              <div class="ck-type-filters">
                <button
                    v-for="t in allTypes" :key="t"
                    class="ck-type-pill"
                    :class="{ active: activeTypes.includes(t) }"
                    @click="toggleType(t)"
                >{{ t }}</button>
              </div>

              <!-- Clear filters -->
              <button v-if="activeTypes.length" class="ck-clear-btn" @click="activeTypes=[]">✕ Tout</button>
            </div>
          </div>

          <!-- ── LIST TAB ── -->
          <div v-show="activeTab === 'list'" class="ck-tab-content">

            <div v-if="pokemonStore.isLoading" class="ck-empty">
              <div class="ck-spinner"></div> CHARGEMENT...
            </div>
            <div v-else-if="!filteredList.length" class="ck-empty">AUCUN RÉSULTAT</div>

            <div v-else>
              <!-- Grid -->
              <div class="ck-grid">
                <div
                    v-for="pkmn in paginatedList"
                    :key="pkmn._id"
                    class="ck-pkmn-card"
                    :class="{ editing: editingMongoId === pkmn._id }"
                >
                  <div class="ck-pc-sprite">
                    <img v-if="pkmn.imageUrl" :src="pkmn.imageUrl" :alt="pkmn.name"
                         @error="e => e.target.style.display='none'" />
                    <span v-else>?</span>
                  </div>
                  <div class="ck-pc-info">
                    <span class="ck-pc-num">N°{{ String(pkmn.id).padStart(3,'0') }}</span>
                    <span class="ck-pc-name">{{ pkmn.name }}</span>
                    <div class="ck-pc-types">
                      <span v-for="t in pkmn.types" :key="t" class="ck-pc-type">{{ t }}</span>
                    </div>
                  </div>
                  <div class="ck-pc-btns">
                    <button @click="editPokemon(pkmn)" class="ck-pc-btn edit" title="Modifier">✎</button>
                    <button @click="confirmId=pkmn._id" class="ck-pc-btn del" title="Supprimer">✕</button>
                  </div>
                </div>
              </div>

              <!-- Pagination -->
              <div class="ck-pagination">
                <button class="ck-pg-btn" :disabled="currentPage===1" @click="currentPage=1">«</button>
                <button class="ck-pg-btn" :disabled="currentPage===1" @click="currentPage--">‹</button>

                <button
                    v-for="p in pageNumbers" :key="p"
                    class="ck-pg-num"
                    :class="{ active: p===currentPage, ellipsis: p==='…' }"
                    :disabled="p==='…'"
                    @click="p!=='…' && (currentPage=p)"
                >{{ p }}</button>

                <button class="ck-pg-btn" :disabled="currentPage===totalPages" @click="currentPage++">›</button>
                <button class="ck-pg-btn" :disabled="currentPage===totalPages" @click="currentPage=totalPages">»</button>

                <span class="ck-pg-info">{{ filteredList.length }} POKÉMON — PAGE {{ currentPage }}/{{ totalPages }}</span>
              </div>
            </div>
          </div>

          <!-- ── FORM TAB ── -->
          <div v-show="activeTab === 'form'" class="ck-tab-content ck-form-content">
            <form @submit.prevent="handleSubmit" class="ck-form" novalidate>

              <div class="ck-form-row">
                <div class="ck-ff">
                  <label class="ck-ff-label">ID NATIONAL</label>
                  <div class="ck-ff-wrap" :class="{ focused: focus==='fid' }">
                    <span class="ck-ff-prefix">#</span>
                    <input v-model="aForm.id" type="number" placeholder="001"
                           required class="ck-ff-input"
                           @focus="focus='fid'" @blur="focus=null" />
                  </div>
                </div>
                <div class="ck-ff" style="flex:2">
                  <label class="ck-ff-label">NOM</label>
                  <div class="ck-ff-wrap" :class="{ focused: focus==='fname' }">
                    <input v-model="aForm.name" type="text" placeholder="BULBIZARRE"
                           required class="ck-ff-input upper"
                           @focus="focus='fname'" @blur="focus=null" spellcheck="false" />
                  </div>
                </div>
              </div>

              <div class="ck-ff">
                <label class="ck-ff-label">TYPES <span class="ck-ff-hint">— séparés par virgule</span></label>
                <div class="ck-ff-wrap" :class="{ focused: focus==='ftypes' }">
                  <input v-model="formTypes" type="text" placeholder="Plante, Poison"
                         required class="ck-ff-input"
                         @focus="focus='ftypes'" @blur="focus=null" />
                </div>
                <div v-if="aForm.types.length" class="ck-ff-pills">
                  <span v-for="t in aForm.types" :key="t" class="ck-ff-pill">{{ t }}</span>
                </div>
              </div>

              <div class="ck-ff">
                <label class="ck-ff-label">URL IMAGE</label>
                <div class="ck-ff-wrap" :class="{ focused: focus==='fimg' }">
                  <input v-model="aForm.imageUrl" type="url" placeholder="https://..."
                         required class="ck-ff-input url"
                         @focus="focus='fimg'" @blur="focus=null" />
                  <div v-if="aForm.imageUrl" class="ck-ff-thumb">
                    <img :src="aForm.imageUrl" @error="e=>e.target.style.display='none'" />
                  </div>
                </div>
              </div>

              <div class="ck-ff">
                <label class="ck-ff-label">DESCRIPTION</label>
                <div class="ck-ff-wrap ck-ff-ta-wrap" :class="{ focused: focus==='fdesc' }">
                  <textarea v-model="aForm.description" placeholder="Description..."
                            required rows="4" class="ck-ff-input ck-ff-ta"
                            @focus="focus='fdesc'" @blur="focus=null"></textarea>
                </div>
              </div>

              <div class="ck-form-actions">
                <button type="submit" class="ck-fa-save" :class="{ editing: isEditing }">
                  {{ isEditing ? '✎ MODIFIER' : '+ SAUVEGARDER' }}
                </button>
                <button v-if="isEditing" type="button" @click="resetForm" class="ck-fa-cancel">
                  ✕ ANNULER
                </button>
              </div>

            </form>
          </div>

        </main>
      </div>

      <!-- DELETE MODAL -->
      <Teleport to="body">
        <div v-if="confirmId" class="modal-overlay" @click.self="confirmId=null">
          <div class="modal">
            <div class="modal-ico">⚠</div>
            <p class="modal-title">SUPPRIMER CE POKÉMON ?</p>
            <p class="modal-sub">Action irréversible.</p>
            <div class="modal-btns">
              <button @click="confirmDelete" class="modal-btn del">SUPPRIMER</button>
              <button @click="confirmId=null" class="modal-btn cancel">ANNULER</button>
            </div>
          </div>
        </div>
      </Teleport>

    </template>
  </div>
</template>

<script setup>
/**
 * @file ProfileView.vue
 * @description Logique du composant Profil.
 * Gère l'affichage du profil dresseur, les statistiques de complétion du Pokédex,
 * et fournit une interface d'administration complète (CRUD) pour les administrateurs.
 */
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTrainerStore } from '../store/trainer';
import { useAuthStore }    from '../store/auth';
import { usePokemonStore } from '../store/pokemon';

const router       = useRouter();
const trainerStore = useTrainerStore();
const authStore    = useAuthStore();
const pokemonStore = usePokemonStore();

// ── VÉRIFICATION DES DROITS ADMIN ────────────────────────────────
/**
 * Détermine si l'utilisateur possède le rôle ADMIN.
 * Vérifie d'abord le store, puis décode le payload du JWT dans le localStorage par sécurité.
 * @type {import('vue').ComputedRef<boolean>}
 */
const isAdmin = computed(() => {
  if (authStore.user?.isAdmin === true || authStore.user?.role === 'ADMIN') return true;
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;
    // Décodage du Base64 du token pour lire les claims sans librairie externe
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.isAdmin === true || payload.role === 'ADMIN';
  } catch { return false; }
});

// ── Shared ───────────────────────────────────────────
const focus      = ref(null);
const TOTAL      = 151;

// ── Trainer profile ──────────────────────────────────
const imgError    = ref(false);
const avatarError = ref(false);
const form        = reactive({ trainerName: '', imgUrl: '' });

/** Calcul des statistiques de progression */
const seenPct   = computed(() => Math.round((trainerStore.seenIds.length / TOTAL) * 100));
const caughtPct = computed(() => Math.round((trainerStore.caughtIds.length / TOTAL) * 100));

/** Génère des initiales si aucune image de profil n'est disponible */
const initials  = computed(() => (trainerStore.profile?.trainerName ?? '').slice(0,2).toUpperCase() || '??');

/**
 * Enregistre le profil dresseur initial.
 */
const handleCreateProfile = async () => {
  if (!form.trainerName.trim()) return;
  await trainerStore.createProfile(form.trainerName, form.imgUrl);
};

// ── Admin state ──────────────────────────────────────
const activeTab      = ref('list');
const isEditing      = ref(false);
const editingMongoId = ref(null);
const confirmId      = ref(null);
const aForm          = ref({ id: '', name: '', types: [], imageUrl: '', description: '' });

// Search & filter
const searchQuery = ref('');
const activeTypes = ref([]);

// Pagination
const PAGE_SIZE   = 18;
const currentPage = ref(1);

/** Liste de tous les types uniques existants dans la base pour les filtres */
const allTypes = computed(() => {
  const s = new Set();
  pokemonStore.pokemons.forEach(p => p.types?.forEach(t => s.add(t)));
  return [...s].sort();
});

/** Active ou désactive un filtre de type */
const toggleType = (t) => {
  const idx = activeTypes.value.indexOf(t);
  if (idx >= 0) activeTypes.value.splice(idx, 1);
  else activeTypes.value.push(t);
  currentPage.value = 1;
};

// Réinitialise la page si les filtres changent
watch([searchQuery, activeTypes], () => { currentPage.value = 1; }, { deep: true });

/**
 * Liste filtrée selon le nom, l'ID, le type et les filtres actifs.
 */
const filteredList = computed(() => {
  let list = pokemonStore.pokemons;
  const q = searchQuery.value.toLowerCase().trim();
  if (q) list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      String(p.id).includes(q) ||
      p.types?.some(t => t.toLowerCase().includes(q))
  );
  if (activeTypes.value.length) {
    list = list.filter(p => activeTypes.value.every(t => p.types?.includes(t)));
  }
  return list;
});

/** Calcul de la pagination */
const totalPages  = computed(() => Math.max(1, Math.ceil(filteredList.value.length / PAGE_SIZE)));
const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return filteredList.value.slice(start, start + PAGE_SIZE);
});

/**
 * Logique de pagination "intelligente" avec ellipses
 */
const pageNumbers = computed(() => {
  const total = totalPages.value;
  const cur   = currentPage.value;
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, cur, cur-1, cur+1].filter(p => p >= 1 && p <= total));
  const sorted = [...pages].sort((a,b)=>a-b);
  const result = [];
  let prev = 0;
  sorted.forEach(p => {
    if (p - prev > 1) result.push('…');
    result.push(p);
    prev = p;
  });
  return result;
});

/** Getter/Setter pour transformer la chaîne des types en tableau */
const formTypes = computed({
  get: ()    => aForm.value.types.join(', '),
  set: (val) => { aForm.value.types = val.split(',').map(t => t.trim()).filter(Boolean); }
});

/**
 * Soumet le formulaire (Création ou Mise à jour).
 */
const handleSubmit = async () => {
  try {
    if (isEditing.value) await pokemonStore.updatePokemon(editingMongoId.value, aForm.value);
    else                 await pokemonStore.createPokemon(aForm.value);
    resetForm();
    activeTab.value = 'list';
  } catch (e) {
    alert(`Échec: ${e.response?.data?.error || e.message}`);
  }
};

/** Prépare le formulaire pour l'édition d'un Pokémon existant */
const editPokemon = (pkmn) => {
  isEditing.value      = true;
  editingMongoId.value = pkmn._id;
  aForm.value = { id: pkmn.id, name: pkmn.name, types: [...pkmn.types], imageUrl: pkmn.imageUrl, description: pkmn.description };
  activeTab.value = 'form';
};

/** Confirme et exécute la suppression */
const confirmDelete = async () => {
  await pokemonStore.deletePokemon(confirmId.value);
  confirmId.value = null;
};

const resetForm = () => {
  isEditing.value = false; editingMongoId.value = null;
  aForm.value = { id: '', name: '', types: [], imageUrl: '', description: '' };
};

/** Initialisation au montage du composant */
onMounted(async () => {
  await trainerStore.fetchProfile();
  if (isAdmin.value) pokemonStore.fetchPokemons();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=VT323&family=Share+Tech+Mono&display=swap');

/* ══════════════════════════════════════════════════════
   ROOT
══════════════════════════════════════════════════════ */
.root {
  min-height: 100dvh;
  box-sizing: border-box;
  position: relative;
}

/* ══════════════════════════════════════════════════════
   USER MODE
══════════════════════════════════════════════════════ */
.mode-user {
  display: flex; align-items: center; justify-content: center;
  padding: clamp(12px, 3vw, 24px);
  background: #060606;
  overflow: hidden;
}

.user-bg {
  position: fixed; inset: 0; pointer-events: none;
  background: radial-gradient(ellipse at center, #1a0a0a 0%, #060606 100%);
}
.user-glow {
  position: absolute; width: 700px; height: 500px; border-radius: 50%;
  background: radial-gradient(ellipse, rgba(234,179,8,0.08) 0%, transparent 70%);
  top: 50%; left: 50%; transform: translate(-50%, -50%);
  animation: userGlow 5s ease-in-out infinite;
}
@keyframes userGlow { 0%,100%{opacity:0.6;transform:translate(-50%,-50%) scale(1)} 50%{opacity:1;transform:translate(-50%,-50%) scale(1.12)} }

/* ── Trainer Card ── */
.trainer-card {
  position: relative; z-index: 1;
  width: 100%; max-width: 440px;
  background: linear-gradient(160deg, #fde047 0%, #eab308 50%, #a16207 100%);
  border: 5px solid #713f12; border-radius: 1.6rem;
  box-shadow:
      0 0 0 1px rgba(253,224,71,0.2),
      0 30px 80px rgba(0,0,0,0.9),
      inset 0 3px 10px rgba(255,255,255,0.35),
      inset 0 -6px 16px rgba(0,0,0,0.3);
  overflow: hidden;
  animation: cardIn 0.4s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes cardIn { from{opacity:0;transform:translateY(20px) scale(0.97)} to{opacity:1;transform:none} }

.tc-top {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 18px 12px;
  border-bottom: 4px solid rgba(113,63,18,0.6);
  background: linear-gradient(to bottom, rgba(0,0,0,0.18), rgba(0,0,0,0.04));
}
.tc-brand { display:flex; align-items:center; gap:12px; }
.tc-cam {
  width: 46px; height: 46px; border-radius: 50%; flex-shrink: 0;
  background: radial-gradient(circle at 35% 35%, #93c5fd, #1d4ed8 70%, #1e3a8a);
  border: 3px solid #1e3a8a; box-shadow: 0 0 16px rgba(59,130,246,0.9);
  position: relative;
}
.tc-cam-shine { position:absolute; top:18%; left:18%; width:34%; height:34%; border-radius:50%; background:rgba(255,255,255,0.75); filter:blur(2px); }
.tc-brand-text { display:flex; flex-direction:column; line-height:1; }
.tc-brand-main { font-family:'VT323',monospace; font-size:30px; color:#1c0a00; letter-spacing:0.12em; }
.tc-brand-sub  { font-family:'Share Tech Mono',monospace; font-size:9px; color:rgba(28,10,0,0.5); letter-spacing:0.2em; text-transform:uppercase; }
.tc-leds { display:flex; flex-direction:column; gap:6px; }
.tc-led  { width:11px; height:11px; border-radius:50%; border:2px solid rgba(0,0,0,0.4); }
.tc-led.r { background:radial-gradient(circle at 35% 35%,#f87171,#b91c1c); box-shadow:0 0 8px rgba(239,68,68,1); animation:ledP 2s ease-in-out infinite; }
.tc-led.y { background:radial-gradient(circle at 35% 35%,#fde047,#ca8a04); }
.tc-led.g { background:radial-gradient(circle at 35% 35%,#86efac,#16a34a); }
@keyframes ledP { 0%,100%{box-shadow:0 0 6px rgba(239,68,68,0.8)} 50%{box-shadow:0 0 16px rgba(239,68,68,1)} }

.tc-body {
  background: #f5f0e8; margin: 0 14px;
  border: 3px solid rgba(113,63,18,0.25);
  border-radius: 10px; overflow: hidden; min-height: 280px;
}

/* Loading */
.tc-state { min-height:280px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; }
.tc-spinner { width:38px; height:38px; border-radius:50%; border:4px solid rgba(180,130,40,0.2); border-top-color:#ca8a04; animation:spin 0.8s linear infinite; }
@keyframes spin { to{transform:rotate(360deg)} }
.tc-state-txt { font-family:'VT323',monospace; font-size:20px; color:#92400e; letter-spacing:0.1em; animation:blink 1s step-end infinite; }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.4} }

/* Create */
.tc-create { padding: clamp(16px,3vw,24px); display:flex; flex-direction:column; gap:14px; }
.tc-create-head { display:flex; align-items:center; gap:12px; padding-bottom:14px; border-bottom:2px dashed rgba(113,63,18,0.2); }
.tc-create-orb { width:48px; height:48px; border-radius:50%; background:linear-gradient(135deg,#fde047,#ca8a04); border:3px solid #713f12; display:flex; align-items:center; justify-content:center; font-size:26px; font-weight:bold; color:#713f12; flex-shrink:0; box-shadow:0 4px 12px rgba(113,63,18,0.3); }
.tc-create-title { font-family:'VT323',monospace; font-size:22px; color:#7f1d1d; letter-spacing:0.08em; animation:blink 1.5s ease-in-out infinite; }
.tc-create-sub   { font-family:'Share Tech Mono',monospace; font-size:10px; color:rgba(92,60,10,0.6); margin-top:2px; }

.tc-field { display:flex; flex-direction:column; gap:5px; }
.tc-label { font-family:'VT323',monospace; font-size:15px; color:#92400e; letter-spacing:0.08em; }
.tc-input-wrap { display:flex; align-items:center; border:2px solid rgba(113,63,18,0.35); border-radius:5px; background:white; transition:border-color 0.2s,box-shadow 0.2s; }
.tc-input-wrap.focused { border-color:#ca8a04; box-shadow:0 0 0 3px rgba(202,138,4,0.18); }
.tc-input { flex:1; background:transparent; border:none; outline:none; padding:8px 10px; caret-color:#ca8a04; }
.tc-input-big { font-family:'VT323',monospace; font-size:22px; color:#1c0a00; letter-spacing:0.08em; text-transform:uppercase; }
.tc-input-url { font-family:'Share Tech Mono',monospace; font-size:13px; color:#1c0a00; }
.tc-input::placeholder { color:rgba(28,10,0,0.22); }
.tc-charcount { font-family:'Share Tech Mono',monospace; font-size:10px; color:rgba(28,10,0,0.3); padding-right:10px; }
.tc-preview { display:flex; align-items:center; gap:10px; margin-top:5px; }
.tc-preview img { width:44px; height:44px; object-fit:cover; border:2px solid rgba(113,63,18,0.3); border-radius:4px; }
.tc-preview-err { font-family:'VT323',monospace; font-size:13px; color:#dc2626; }

.tc-btn-create {
  font-family:'VT323',monospace; font-size:22px; letter-spacing:0.1em;
  color:white; background:#1d4ed8; border:3px solid #1e3a8a; border-radius:5px;
  padding:10px; cursor:pointer; width:100%; position:relative; overflow:hidden;
  box-shadow:0 5px 0 #1e3a8a; transition:all 0.1s;
}
.tc-btn-create::before { content:''; position:absolute; inset:0; background:linear-gradient(to bottom,rgba(255,255,255,0.12),transparent); pointer-events:none; }
.tc-btn-create:hover:not(:disabled) { background:#2563eb; }
.tc-btn-create:active:not(:disabled) { transform:translateY(4px); box-shadow:0 1px 0 #1e3a8a; }
.tc-btn-create:disabled { opacity:0.4; cursor:not-allowed; }

/* Profile */
.tc-profile { padding:clamp(14px,2.5vw,20px); display:flex; flex-direction:column; gap:12px; }
.tc-identity { display:flex; gap:14px; align-items:center; background:linear-gradient(135deg,#1e3a8a,#2563eb); border-radius:10px; padding:14px; box-shadow:0 4px 20px rgba(30,58,138,0.5); }
.tc-avatar { width:76px; height:76px; border-radius:50%; flex-shrink:0; border:3px solid rgba(255,255,255,0.3); background:rgba(255,255,255,0.1); display:flex; align-items:center; justify-content:center; overflow:hidden; position:relative; box-shadow:0 0 0 2px rgba(255,255,255,0.1),0 8px 20px rgba(0,0,0,0.45); }
.tc-avatar img { width:100%; height:100%; object-fit:cover; }
.tc-avatar-txt { font-family:'VT323',monospace; font-size:30px; color:rgba(255,255,255,0.65); }
.tc-avatar-gloss { position:absolute; inset:0; border-radius:50%; background:radial-gradient(circle at 35% 35%,rgba(255,255,255,0.15),transparent); pointer-events:none; }
.tc-identity-info { display:flex; flex-direction:column; gap:1px; min-width:0; }
.tc-id-meta { font-family:'Share Tech Mono',monospace; font-size:8px; color:rgba(255,255,255,0.42); letter-spacing:0.2em; text-transform:uppercase; }
.tc-id-code { font-family:'Share Tech Mono',monospace; font-size:12px; color:rgba(255,255,255,0.6); letter-spacing:0.1em; }
.tc-id-name { font-family:'VT323',monospace; font-size:34px; color:white; letter-spacing:0.05em; text-transform:uppercase; line-height:1; text-shadow:0 2px 8px rgba(0,0,0,0.4); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.tc-chips { display:flex; gap:5px; margin-top:4px; }
.tc-chip { font-family:'Share Tech Mono',monospace; font-size:8px; color:rgba(255,255,255,0.48); border:1px solid rgba(255,255,255,0.2); border-radius:3px; padding:1px 6px; letter-spacing:0.1em; }
.tc-chip.gold { color:#fde047; border-color:rgba(253,224,71,0.45); background:rgba(253,224,71,0.08); }

.tc-sep { display:flex; align-items:center; gap:10px; }
.tc-sep-line { flex:1; height:2px; background:linear-gradient(to right,transparent,rgba(113,63,18,0.2),transparent); }
.tc-pokeball { width:22px; height:22px; border-radius:50%; border:2px solid rgba(113,63,18,0.4); position:relative; overflow:hidden; flex-shrink:0; }
.tp-top { position:absolute; top:0; left:0; right:0; height:50%; background:#dc2626; }
.tp-band { position:absolute; top:50%; transform:translateY(-50%); left:0; right:0; height:3px; background:rgba(113,63,18,0.55); z-index:1; }
.tp-center { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:7px; height:7px; border-radius:50%; background:white; border:2px solid rgba(113,63,18,0.4); z-index:2; }

.tc-stats { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
.tc-stat { border-radius:8px; padding:10px 12px; display:flex; align-items:flex-start; gap:9px; }
.tc-stat.blue { background:linear-gradient(135deg,#eff6ff,#dbeafe); border:2px solid #bfdbfe; }
.tc-stat.gold { background:linear-gradient(135deg,#fefce8,#fef9c3); border:2px solid #fde68a; }
.ts-icon { font-size:16px; margin-top:2px; }
.ts-body { flex:1; display:flex; flex-direction:column; gap:4px; }
.ts-row  { display:flex; justify-content:space-between; align-items:baseline; }
.ts-label { font-family:'VT323',monospace; font-size:16px; letter-spacing:0.06em; }
.tc-stat.blue .ts-label { color:#1e40af; }
.tc-stat.gold .ts-label { color:#92400e; }
.ts-val { font-family:'VT323',monospace; font-size:28px; line-height:1; }
.tc-stat.blue .ts-val { color:#1e3a8a; }
.tc-stat.gold .ts-val { color:#78350f; }
.ts-bar { height:3px; background:rgba(0,0,0,0.1); border-radius:2px; overflow:hidden; }
.ts-fill { height:100%; border-radius:2px; transition:width 1s ease; }
.ts-fill.blue { background:linear-gradient(to right,#3b82f6,#60a5fa); }
.ts-fill.gold { background:linear-gradient(to right,#f59e0b,#fde047); }
.ts-pct { font-family:'Share Tech Mono',monospace; font-size:8px; color:rgba(0,0,0,0.3); }

.tc-completion { display:flex; align-items:center; gap:14px; background:rgba(113,63,18,0.06); border:1px solid rgba(113,63,18,0.12); border-radius:8px; padding:10px 18px; justify-content:center; }
.tc-ring-svg { width:60px; height:60px; flex-shrink:0; }
.tc-ring-label { display:flex; flex-direction:column; }
.tc-ring-pct { font-family:'VT323',monospace; font-size:34px; color:#92400e; line-height:1; }
.tc-ring-sub { font-family:'Share Tech Mono',monospace; font-size:8px; color:rgba(92,60,10,0.5); letter-spacing:0.15em; text-transform:uppercase; }

.tc-btn-back { font-family:'VT323',monospace; font-size:17px; letter-spacing:0.08em; color:white; background:#374151; border:2px solid #111; border-radius:5px; padding:9px; cursor:pointer; width:100%; box-shadow:0 4px 0 #111; transition:all 0.1s; }
.tc-btn-back:hover  { background:#4b5563; }
.tc-btn-back:active { transform:translateY(3px); box-shadow:0 1px 0 #111; }

.tc-foot { display:flex; align-items:center; gap:8px; padding:8px 18px 12px; margin-top:10px; }
.tc-foot-line { flex:1; height:2px; background:rgba(113,63,18,0.3); border-radius:1px; }
.tc-foot-txt  { font-family:'Share Tech Mono',monospace; font-size:9px; color:rgba(113,63,18,0.5); letter-spacing:0.14em; white-space:nowrap; }

/* ══════════════════════════════════════════════════════
   ADMIN / COCKPIT MODE
══════════════════════════════════════════════════════ */
.mode-admin {
  background: #06080a;
  display: flex; align-items: stretch;
  overflow: hidden;
}

.ck-bg { position:fixed; inset:0; pointer-events:none; z-index:0; }
.ck-bg-grid {
  position:absolute; inset:0;
  background-image:
      linear-gradient(rgba(74,222,128,0.02) 1px,transparent 1px),
      linear-gradient(90deg,rgba(74,222,128,0.02) 1px,transparent 1px);
  background-size:52px 52px;
}
.ck-bg-glow-tl { position:absolute; width:600px; height:600px; border-radius:50%; background:radial-gradient(circle,rgba(234,179,8,0.05) 0%,transparent 70%); top:-200px; left:-100px; }
.ck-bg-glow-br { position:absolute; width:700px; height:700px; border-radius:50%; background:radial-gradient(circle,rgba(74,222,128,0.04) 0%,transparent 70%); bottom:-250px; right:-200px; }

.cockpit {
  position: relative; z-index: 1;
  display: flex; width: 100%; min-height: 100dvh;
}

/* ── Sidebar ── */
.ck-sidebar {
  width: clamp(210px, 20vw, 280px); flex-shrink: 0;
  display: flex; flex-direction: column;
  background: linear-gradient(170deg, #a16207 0%, #78350f 60%, #451a03 100%);
  border-right: 2px solid rgba(113,63,18,0.5);
  box-shadow: 4px 0 40px rgba(0,0,0,0.6);
  position: relative; overflow: hidden;
}
/* diagonal stripe texture */
.ck-sidebar::before {
  content:''; position:absolute; inset:0; pointer-events:none;
  background: repeating-linear-gradient(-45deg,rgba(255,255,255,0.012) 0,rgba(255,255,255,0.012) 1px,transparent 1px,transparent 8px);
}

.ck-sb-head {
  flex-shrink:0; display:flex; align-items:center; justify-content:space-between;
  padding: 16px 16px 14px;
  border-bottom: 2px solid rgba(113,63,18,0.45);
  background: rgba(0,0,0,0.2);
  position:relative; z-index:1;
}
.ck-sb-logo { display:flex; align-items:center; gap:10px; }
.ck-sb-cam { width:36px; height:36px; border-radius:50%; background:radial-gradient(circle at 35% 35%,#93c5fd,#1d4ed8 70%,#1e3a8a); border:3px solid #1e3a8a; box-shadow:0 0 14px rgba(59,130,246,0.9); position:relative; flex-shrink:0; }
.ck-sb-cam-shine { position:absolute; top:18%; left:18%; width:34%; height:34%; border-radius:50%; background:rgba(255,255,255,0.7); filter:blur(1.5px); }
.ck-sb-brand { display:flex; flex-direction:column; line-height:1; }
.ck-sb-brand-main { font-family:'VT323',monospace; font-size:20px; color:#fef3c7; letter-spacing:0.12em; }
.ck-sb-brand-sub  { font-family:'Share Tech Mono',monospace; font-size:7.5px; color:rgba(254,243,199,0.5); letter-spacing:0.2em; text-transform:uppercase; }
.ck-sb-leds { display:flex; flex-direction:column; gap:5px; }
.ck-led  { width:9px; height:9px; border-radius:50%; border:1px solid rgba(0,0,0,0.4); }
.ck-led.r { background:radial-gradient(circle at 35% 35%,#f87171,#b91c1c); box-shadow:0 0 7px rgba(239,68,68,1); animation:ledP 2s ease-in-out infinite; }
.ck-led.y { background:radial-gradient(circle at 35% 35%,#fde047,#ca8a04); }
.ck-led.g { background:radial-gradient(circle at 35% 35%,#86efac,#16a34a); }

/* Profile block in sidebar */
.ck-profile-block {
  flex-shrink:0; display:flex; align-items:center; gap:11px;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(113,63,18,0.3);
  background: rgba(0,0,0,0.15);
  position:relative; z-index:1;
}
.ck-p-avatar {
  width:46px; height:46px; border-radius:50%; flex-shrink:0;
  border:2px solid rgba(255,255,255,0.25); background:rgba(255,255,255,0.1);
  display:flex; align-items:center; justify-content:center; overflow:hidden; position:relative;
  box-shadow:0 4px 14px rgba(0,0,0,0.45);
}
.ck-p-avatar img { width:100%; height:100%; object-fit:cover; }
.ck-p-avatar span { font-family:'VT323',monospace; font-size:20px; color:rgba(255,255,255,0.65); }
.ck-p-avatar-border { position:absolute; inset:-2px; border-radius:50%; border:1px solid rgba(253,224,71,0.35); pointer-events:none; }
.ck-p-info { display:flex; flex-direction:column; gap:1px; min-width:0; flex:1; }
.ck-p-name { font-family:'VT323',monospace; font-size:18px; color:#fef3c7; letter-spacing:0.06em; text-transform:uppercase; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; line-height:1; }
.ck-p-id   { font-family:'Share Tech Mono',monospace; font-size:8px; color:rgba(254,243,199,0.4); letter-spacing:0.08em; }
.ck-admin-badge { display:inline-flex; align-items:center; gap:4px; margin-top:3px; background:rgba(74,222,128,0.14); border:1px solid rgba(74,222,128,0.35); border-radius:999px; padding:1px 7px; font-family:'Share Tech Mono',monospace; font-size:7px; color:#4ade80; letter-spacing:0.15em; width:fit-content; }
.ck-admin-dot { width:4px; height:4px; border-radius:50%; background:#4ade80; box-shadow:0 0 5px rgba(74,222,128,0.9); animation:dotBlink 2s ease-in-out infinite; }
@keyframes dotBlink { 0%,100%{opacity:1} 50%{opacity:0.3} }

/* Mini stats */
.ck-mini-stats { flex-shrink:0; display:flex; flex-direction:column; gap:10px; padding:14px 16px; position:relative; z-index:1; }
.ck-ms { display:flex; align-items:center; gap:8px; }
.ck-ms-icon { font-size:13px; flex-shrink:0; }
.ck-ms-body { flex:1; display:flex; flex-direction:column; gap:3px; min-width:0; }
.ck-ms-bar  { height:3px; background:rgba(0,0,0,0.25); border-radius:2px; overflow:hidden; }
.ck-ms-fill { height:100%; border-radius:2px; transition:width 1s ease; }
.ck-ms-fill.blue { background:linear-gradient(to right,#60a5fa,#93c5fd); }
.ck-ms-fill.gold { background:linear-gradient(to right,#fde047,#fef08a); }
.ck-ms-row  { display:flex; justify-content:space-between; }
.ck-ms-label { font-family:'Share Tech Mono',monospace; font-size:7.5px; color:rgba(254,243,199,0.45); letter-spacing:0.15em; text-transform:uppercase; }
.ck-ms-val  { font-family:'Share Tech Mono',monospace; font-size:7.5px; color:rgba(254,243,199,0.55); }

/* DB info */
.ck-db-info {
  flex-shrink:0; margin:0 16px;
  background:rgba(0,0,0,0.18); border:1px solid rgba(113,63,18,0.35); border-radius:8px;
  padding:10px 14px; position:relative; z-index:1;
}
.ck-db-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:4px; }
.ck-db-label { font-family:'Share Tech Mono',monospace; font-size:7px; color:rgba(254,243,199,0.4); letter-spacing:0.18em; text-transform:uppercase; }
.ck-db-dot { width:5px; height:5px; border-radius:50%; background:#4ade80; box-shadow:0 0 6px rgba(74,222,128,0.8); animation:dotBlink 2s ease-in-out infinite; }
.ck-db-count { font-family:'VT323',monospace; font-size:28px; color:#fef3c7; line-height:1; }
.ck-db-count span { font-family:'Share Tech Mono',monospace; font-size:10px; color:rgba(254,243,199,0.4); margin-left:4px; vertical-align:middle; }

/* Nav */
.ck-nav { flex-shrink:0; padding:14px 16px; margin-top:auto; position:relative; z-index:1; }
.ck-nav-btn { font-family:'VT323',monospace; font-size:16px; letter-spacing:0.08em; border-radius:6px; padding:9px 14px; cursor:pointer; border:none; transition:all 0.12s; width:100%; text-align:center; }
.ck-nav-btn.pokedex { color:#0a0f0a; background:#4ade80; box-shadow:0 3px 0 #166534; }
.ck-nav-btn.pokedex:hover { background:#86efac; }
.ck-nav-btn.pokedex:active { transform:translateY(2px); box-shadow:0 1px 0 #166534; }

/* ── Main ── */
.ck-main {
  flex:1; display:flex; flex-direction:column;
  min-width:0; overflow:hidden; position:relative; z-index:1;
}

.ck-toolbar {
  flex-shrink:0;
  border-bottom:1px solid rgba(74,222,128,0.1);
  background:rgba(74,222,128,0.02);
}
.ck-tabs { display:flex; }
.ck-tab {
  display:flex; align-items:center; gap:7px;
  font-family:'VT323',monospace; font-size:clamp(14px,1.5vw,17px);
  letter-spacing:0.08em; color:rgba(74,222,128,0.38);
  background:transparent; border:none; border-bottom:2px solid transparent;
  padding:clamp(11px,1.6vh,16px) clamp(14px,2vw,24px);
  cursor:pointer; transition:all 0.15s; white-space:nowrap;
}
.ck-tab:hover { color:rgba(74,222,128,0.65); }
.ck-tab.active { color:#4ade80; border-bottom-color:#4ade80; background:rgba(74,222,128,0.04); }
.ck-tab.editing { color:#fde047; border-bottom-color:#fde047; background:rgba(253,224,71,0.04); }
.ck-tab-icon { font-size:13px; opacity:0.75; }

.ck-list-tools {
  display:flex; align-items:center; flex-wrap:wrap; gap:8px;
  padding:8px clamp(14px,2vw,24px) 10px;
  border-top:1px solid rgba(74,222,128,0.06);
}

.ck-search {
  display:flex; align-items:center; gap:6px;
  border:1px solid rgba(74,222,128,0.2); border-radius:6px;
  background:rgba(74,222,128,0.03); padding:5px 11px;
  transition:border-color 0.2s,box-shadow 0.2s; flex-shrink:0;
}
.ck-search.focused { border-color:rgba(74,222,128,0.5); box-shadow:0 0 0 3px rgba(74,222,128,0.07); }
.ck-search-ico { font-size:15px; color:rgba(74,222,128,0.4); }
.ck-search input { background:transparent; border:none; outline:none; font-family:'Share Tech Mono',monospace; font-size:12px; color:#d1fae5; width:clamp(90px,10vw,160px); caret-color:#4ade80; }
.ck-search input::placeholder { color:rgba(74,222,128,0.22); }

.ck-type-filters { display:flex; flex-wrap:wrap; gap:5px; flex:1; }
.ck-type-pill {
  font-family:'Share Tech Mono',monospace; font-size:9px; letter-spacing:0.08em;
  color:rgba(74,222,128,0.5); background:rgba(74,222,128,0.05);
  border:1px solid rgba(74,222,128,0.18); border-radius:999px;
  padding:3px 9px; cursor:pointer; transition:all 0.12s; text-transform:uppercase;
}
.ck-type-pill:hover { border-color:rgba(74,222,128,0.45); color:rgba(74,222,128,0.8); }
.ck-type-pill.active { background:rgba(74,222,128,0.18); border-color:rgba(74,222,128,0.7); color:#4ade80; }

.ck-clear-btn { font-family:'Share Tech Mono',monospace; font-size:9px; color:rgba(248,113,113,0.65); background:transparent; border:1px solid rgba(248,113,113,0.25); border-radius:999px; padding:3px 9px; cursor:pointer; transition:all 0.12s; flex-shrink:0; }
.ck-clear-btn:hover { color:#f87171; border-color:rgba(248,113,113,0.55); }

/* Tab content */
.ck-tab-content {
  flex:1; overflow-y:auto;
  padding:clamp(14px,2vh,22px) clamp(14px,2vw,22px);
}
.ck-tab-content::-webkit-scrollbar { width:5px; }
.ck-tab-content::-webkit-scrollbar-thumb { background:rgba(74,222,128,0.14); border-radius:3px; }

.ck-empty { display:flex; align-items:center; justify-content:center; gap:12px; min-height:180px; font-family:'VT323',monospace; font-size:18px; color:rgba(74,222,128,0.3); letter-spacing:0.1em; }
.ck-spinner { width:22px; height:22px; border-radius:50%; border:3px solid rgba(74,222,128,0.1); border-top-color:#4ade80; animation:spin 0.8s linear infinite; }

/* Pokemon card grid */
.ck-grid {
  display:grid;
  grid-template-columns: repeat(auto-fill, minmax(clamp(160px,14vw,220px),1fr));
  gap:clamp(7px,1vw,12px);
  margin-bottom:clamp(14px,2vh,20px);
}
.ck-pkmn-card {
  display:flex; align-items:center; gap:9px;
  background:rgba(74,222,128,0.025); border:1px solid rgba(74,222,128,0.1);
  border-radius:8px; padding:9px 11px;
  transition:all 0.14s;
}
.ck-pkmn-card:hover { background:rgba(74,222,128,0.055); border-color:rgba(74,222,128,0.28); transform:translateY(-1px); box-shadow:0 4px 12px rgba(0,0,0,0.3); }
.ck-pkmn-card.editing { background:rgba(253,224,71,0.04); border-color:rgba(253,224,71,0.4); }

.ck-pc-sprite { width:42px; height:42px; flex-shrink:0; border-radius:6px; background:rgba(74,222,128,0.05); border:1px solid rgba(74,222,128,0.1); display:flex; align-items:center; justify-content:center; overflow:hidden; }
.ck-pc-sprite img { width:100%; height:100%; object-fit:contain; image-rendering:pixelated; }
.ck-pc-sprite span { font-family:'VT323',monospace; font-size:20px; color:rgba(74,222,128,0.3); }
.ck-pc-info { flex:1; display:flex; flex-direction:column; gap:1px; min-width:0; }
.ck-pc-num  { font-family:'Share Tech Mono',monospace; font-size:8.5px; color:rgba(74,222,128,0.37); letter-spacing:0.1em; }
.ck-pc-name { font-family:'VT323',monospace; font-size:17px; color:#d1fae5; letter-spacing:0.04em; text-transform:uppercase; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; line-height:1; }
.ck-pc-types { display:flex; gap:3px; flex-wrap:wrap; }
.ck-pc-type  { font-family:'Share Tech Mono',monospace; font-size:7.5px; color:rgba(74,222,128,0.48); background:rgba(74,222,128,0.07); border:1px solid rgba(74,222,128,0.14); border-radius:2px; padding:1px 4px; text-transform:uppercase; letter-spacing:0.04em; }
.ck-pc-btns { display:flex; flex-direction:column; gap:4px; flex-shrink:0; }
.ck-pc-btn { width:26px; height:26px; border-radius:4px; border:1px solid; display:flex; align-items:center; justify-content:center; font-size:12px; cursor:pointer; background:transparent; transition:all 0.12s; }
.ck-pc-btn.edit { color:rgba(96,165,250,0.6); border-color:rgba(96,165,250,0.2); }
.ck-pc-btn.edit:hover { color:#60a5fa; border-color:rgba(96,165,250,0.5); background:rgba(96,165,250,0.08); }
.ck-pc-btn.del  { color:rgba(248,113,113,0.55); border-color:rgba(248,113,113,0.18); }
.ck-pc-btn.del:hover  { color:#f87171; border-color:rgba(248,113,113,0.5); background:rgba(248,113,113,0.08); }

/* Pagination */
.ck-pagination {
  display:flex; align-items:center; gap:5px; flex-wrap:wrap;
  padding-top:clamp(10px,1.5vh,16px);
  border-top:1px solid rgba(74,222,128,0.08);
}
.ck-pg-btn, .ck-pg-num {
  font-family:'Share Tech Mono',monospace; font-size:11px;
  background:transparent; border:1px solid rgba(74,222,128,0.18); border-radius:4px;
  color:rgba(74,222,128,0.5); width:28px; height:28px;
  display:flex; align-items:center; justify-content:center;
  cursor:pointer; transition:all 0.12s;
}
.ck-pg-btn:hover:not(:disabled), .ck-pg-num:hover:not(.ellipsis):not(:disabled) {
  border-color:rgba(74,222,128,0.5); color:#4ade80;
}
.ck-pg-btn:disabled { opacity:0.25; cursor:not-allowed; }
.ck-pg-num.active { background:rgba(74,222,128,0.18); border-color:rgba(74,222,128,0.6); color:#4ade80; }
.ck-pg-num.ellipsis { border:none; cursor:default; color:rgba(74,222,128,0.3); width:auto; padding:0 2px; }
.ck-pg-info { font-family:'Share Tech Mono',monospace; font-size:9px; color:rgba(74,222,128,0.3); letter-spacing:0.1em; margin-left:auto; }

/* CRUD Form */
.ck-form-content { max-width:660px; }
.ck-form { display:flex; flex-direction:column; gap:clamp(13px,1.8vh,18px); }
.ck-form-row { display:flex; gap:12px; }
.ck-ff { display:flex; flex-direction:column; gap:5px; flex:1; }
.ck-ff-label { font-family:'Share Tech Mono',monospace; font-size:clamp(8px,0.85vw,10px); color:rgba(74,222,128,0.5); letter-spacing:0.18em; text-transform:uppercase; }
.ck-ff-hint  { color:rgba(74,222,128,0.3); font-size:0.85em; }
.ck-ff-wrap  { display:flex; align-items:center; border:1px solid rgba(74,222,128,0.2); border-radius:6px; background:rgba(74,222,128,0.025); transition:border-color 0.2s,box-shadow 0.2s; }
.ck-ff-wrap.focused { border-color:rgba(74,222,128,0.55); box-shadow:0 0 0 3px rgba(74,222,128,0.08); }
.ck-ff-ta-wrap { align-items:flex-start; }
.ck-ff-prefix { padding:0 0 0 12px; font-family:'Share Tech Mono',monospace; font-size:16px; color:rgba(74,222,128,0.4); flex-shrink:0; }
.ck-ff-input { flex:1; background:transparent; border:none; outline:none; font-family:'Share Tech Mono',monospace; font-size:clamp(12px,1.3vw,14px); color:#d1fae5; padding:10px 14px; letter-spacing:0.04em; caret-color:#4ade80; }
.ck-ff-input.upper { text-transform:uppercase; }
.ck-ff-input.url   { font-size:clamp(10px,1.1vw,12px); }
.ck-ff-input::placeholder { color:rgba(74,222,128,0.18); }
.ck-ff-ta { resize:none; line-height:1.6; }
.ck-ff-thumb { padding-right:8px; flex-shrink:0; }
.ck-ff-thumb img { width:40px; height:40px; object-fit:cover; border-radius:4px; border:1px solid rgba(74,222,128,0.2); }
.ck-ff-pills { display:flex; flex-wrap:wrap; gap:5px; margin-top:5px; }
.ck-ff-pill  { font-family:'Share Tech Mono',monospace; font-size:9px; color:#4ade80; background:rgba(74,222,128,0.1); border:1px solid rgba(74,222,128,0.25); border-radius:4px; padding:2px 8px; text-transform:uppercase; }

.ck-form-actions { display:flex; gap:10px; }
.ck-fa-save { flex:1; font-family:'VT323',monospace; font-size:clamp(16px,1.7vw,20px); letter-spacing:0.08em; color:#0a0f0a; background:#4ade80; border:none; border-radius:6px; padding:11px; cursor:pointer; box-shadow:0 4px 0 #166534; transition:all 0.1s; position:relative; overflow:hidden; }
.ck-fa-save::before { content:''; position:absolute; inset:0; background:linear-gradient(to bottom,rgba(255,255,255,0.12),transparent); pointer-events:none; }
.ck-fa-save:hover { background:#86efac; }
.ck-fa-save:active { transform:translateY(3px); box-shadow:0 1px 0 #166534; }
.ck-fa-save.editing { background:#fde047; box-shadow:0 4px 0 #713f12; color:#1c0a00; }
.ck-fa-save.editing:hover { background:#fef08a; }
.ck-fa-cancel { font-family:'VT323',monospace; font-size:clamp(16px,1.7vw,20px); letter-spacing:0.08em; color:#f87171; background:transparent; border:1px solid rgba(248,113,113,0.35); border-radius:6px; padding:11px 22px; cursor:pointer; transition:all 0.1s; }
.ck-fa-cancel:hover { background:rgba(248,113,113,0.08); border-color:rgba(248,113,113,0.6); }

/* ── Modal ── */
.modal-overlay { position:fixed; inset:0; z-index:9999; background:rgba(0,0,0,0.75); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; animation:fadeIn 0.15s ease; }
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
.modal { background:#0d1a0d; border:1px solid rgba(248,113,113,0.35); border-radius:12px; padding:28px 24px; display:flex; flex-direction:column; align-items:center; gap:10px; box-shadow:0 30px 60px rgba(0,0,0,0.8); animation:slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1); min-width:260px; }
@keyframes slideUp { from{transform:translateY(12px);opacity:0} to{transform:translateY(0);opacity:1} }
.modal-ico  { font-size:30px; }
.modal-title { font-family:'VT323',monospace; font-size:20px; color:#f87171; letter-spacing:0.08em; }
.modal-sub   { font-family:'Share Tech Mono',monospace; font-size:10px; color:rgba(248,113,113,0.5); }
.modal-btns  { display:flex; gap:10px; margin-top:4px; }
.modal-btn { font-family:'VT323',monospace; font-size:17px; letter-spacing:0.06em; border-radius:4px; padding:7px 18px; cursor:pointer; border:1px solid; transition:all 0.1s; }
.modal-btn.del    { color:#0a0f0a; background:#f87171; border-color:#dc2626; box-shadow:0 3px 0 #7f1d1d; }
.modal-btn.del:hover { background:#fca5a5; }
.modal-btn.del:active { transform:translateY(2px); box-shadow:0 1px 0 #7f1d1d; }
.modal-btn.cancel { color:rgba(74,222,128,0.7); background:transparent; border-color:rgba(74,222,128,0.2); }
.modal-btn.cancel:hover { border-color:rgba(74,222,128,0.5); color:#4ade80; }

/* ══════════════════════════════════════════════════════
   RESPONSIVE
══════════════════════════════════════════════════════ */
@media (max-width: 960px) {
  .cockpit { flex-direction: column; }
  .ck-sidebar {
    width: 100%; flex-direction: row; align-items: center;
    border-right: none; border-bottom: 2px solid rgba(113,63,18,0.4);
    overflow: hidden;
  }
  .ck-sb-head { border-bottom:none; border-right:1px solid rgba(113,63,18,0.35); padding:12px 14px; }
  .ck-profile-block { border-bottom:none; border-right:1px solid rgba(113,63,18,0.25); flex:1; }
  .ck-mini-stats { display:none; }
  .ck-db-info { display:none; }
  .ck-nav { margin-top:0; padding:12px 14px; margin-left:auto; }
  .ck-nav-btn { white-space:nowrap; }
}

@media (max-width: 640px) {
  .ck-grid { grid-template-columns: 1fr; }
  .ck-form-row { flex-direction: column; }
  .ck-pagination { justify-content: center; }
  .ck-pg-info { width:100%; text-align:center; margin-left:0; margin-top:4px; }
  .ck-list-tools { gap:6px; }
  .ck-type-filters { display:none; } /* on very small screens hide type pills */
}

@media (max-width: 480px) {
  .mode-user { padding: 10px; }
  .trainer-card { border-radius: 1.2rem; border-width: 4px; }
}
</style>