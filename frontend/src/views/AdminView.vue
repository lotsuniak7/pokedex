<template>
  <div class="admin-root">
    <div class="ambient-red"></div>
    <div class="ambient-green"></div>

    <div class="admin-shell">

      <!-- ══ TOP BAR ══ -->
      <div class="admin-topbar">
        <div class="topbar-left">
          <div class="terminal-icon">
            <span>$_</span>
          </div>
          <div class="topbar-title">
            <span class="title-main">PANNEAU ADMIN</span>
            <span class="title-sub">BASE DE DONNÉES POKÉMON — ACCÈS RESTREINT</span>
          </div>
        </div>
        <div class="topbar-right">
          <div class="db-status">
            <div class="status-dot"></div>
            <span>{{ pokemonStore.pokemons.length }} ENTRÉES</span>
          </div>
          <button @click="router.push('/')" class="back-btn">
            ◀ POKÉDEX
          </button>
        </div>
      </div>

      <!-- ══ BODY ══ -->
      <div class="admin-body">

        <!-- ── LEFT: FORM ── -->
        <div class="panel form-panel">
          <div class="panel-header">
            <span class="panel-title">
              <span class="panel-title-icon" :class="isEditing ? 'edit' : 'add'">
                {{ isEditing ? '✎' : '+' }}
              </span>
              {{ isEditing ? 'MODIFIER POKÉMON' : 'AJOUTER POKÉMON' }}
            </span>
            <div class="panel-header-dots">
              <div class="phd"></div>
              <div class="phd"></div>
              <div class="phd"></div>
            </div>
          </div>

          <form @submit.prevent="handleSubmit" class="crud-form" novalidate>

            <div class="field">
              <label class="field-label">ID NATIONAL</label>
              <div class="field-input-wrap" :class="{ focused: focus === 'id' }">
                <span class="field-prefix">#</span>
                <input
                    v-model="form.id"
                    type="number"
                    placeholder="152"
                    required
                    class="field-input"
                    @focus="focus = 'id'"
                    @blur="focus = null"
                />
              </div>
            </div>

            <div class="field">
              <label class="field-label">NOM DU POKÉMON</label>
              <div class="field-input-wrap" :class="{ focused: focus === 'name' }">
                <input
                    v-model="form.name"
                    type="text"
                    placeholder="MEGANIUM"
                    required
                    class="field-input"
                    @focus="focus = 'name'"
                    @blur="focus = null"
                    spellcheck="false"
                />
              </div>
            </div>

            <div class="field">
              <label class="field-label">TYPES <span class="field-hint">(séparés par virgule)</span></label>
              <div class="field-input-wrap" :class="{ focused: focus === 'types' }">
                <input
                    v-model="formTypes"
                    type="text"
                    placeholder="Plante, Poison"
                    required
                    class="field-input"
                    @focus="focus = 'types'"
                    @blur="focus = null"
                />
              </div>
              <!-- Type pills preview -->
              <div v-if="form.types.length" class="types-preview">
                <span v-for="t in form.types" :key="t" class="type-pill">{{ t }}</span>
              </div>
            </div>

            <div class="field">
              <label class="field-label">URL IMAGE</label>
              <div class="field-input-wrap" :class="{ focused: focus === 'img' }">
                <input
                    v-model="form.imageUrl"
                    type="url"
                    placeholder="https://..."
                    required
                    class="field-input field-input-url"
                    @focus="focus = 'img'"
                    @blur="focus = null"
                />
                <div v-if="form.imageUrl" class="img-thumb">
                  <img :src="form.imageUrl" @error="e => e.target.style.display='none'" />
                </div>
              </div>
            </div>

            <div class="field">
              <label class="field-label">DESCRIPTION</label>
              <div class="field-input-wrap field-textarea-wrap" :class="{ focused: focus === 'desc' }">
                <textarea
                    v-model="form.description"
                    placeholder="Description du Pokémon..."
                    required
                    rows="3"
                    class="field-input field-textarea"
                    @focus="focus = 'desc'"
                    @blur="focus = null"
                ></textarea>
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-save" :class="{ editing: isEditing }">
                {{ isEditing ? '✎ MODIFIER' : '+ SAUVEGARDER' }}
              </button>
              <button v-if="isEditing" type="button" @click="resetForm" class="btn-cancel">
                ✕ ANNULER
              </button>
            </div>

          </form>
        </div>

        <!-- ── RIGHT: DB LIST ── -->
        <div class="panel list-panel">
          <div class="panel-header">
            <span class="panel-title">
              <span class="panel-title-icon db">⬡</span>
              BASE DE DONNÉES
            </span>
            <div class="search-wrap" :class="{ focused: focus === 'search' }">
              <span class="search-icon">⌕</span>
              <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Filtrer..."
                  class="search-input"
                  @focus="focus = 'search'"
                  @blur="focus = null"
                  spellcheck="false"
              />
            </div>
          </div>

          <div class="db-list">
            <div v-if="pokemonStore.isLoading" class="list-loading">
              <div class="list-spinner"></div>
              <span>CHARGEMENT...</span>
            </div>

            <div v-else-if="!filteredList.length" class="list-empty">
              AUCUN RÉSULTAT
            </div>

            <div
                v-for="pkmn in filteredList"
                :key="pkmn._id"
                class="list-row"
                :class="{ 'is-editing': editingMongoId === pkmn._id }"
            >
              <div class="row-sprite">
                <img
                    v-if="pkmn.imageUrl"
                    :src="pkmn.imageUrl"
                    :alt="pkmn.name"
                    @error="e => e.target.style.display='none'"
                />
                <span v-else class="row-sprite-fallback">?</span>
              </div>

              <div class="row-info">
                <span class="row-number">N°{{ String(pkmn.id).padStart(3,'0') }}</span>
                <span class="row-name">{{ pkmn.name }}</span>
                <div class="row-types">
                  <span v-for="t in pkmn.types" :key="t" class="row-type">{{ t }}</span>
                </div>
              </div>

              <div class="row-actions">
                <button @click="editPokemon(pkmn)" class="row-btn btn-edit" title="Modifier">
                  ✎
                </button>
                <button @click="deletePokemon(pkmn._id)" class="row-btn btn-delete" title="Supprimer">
                  ✕
                </button>
              </div>
            </div>
          </div>

          <!-- Footer count -->
          <div class="list-footer">
            <span>{{ filteredList.length }} / {{ pokemonStore.pokemons.length }} POKÉMON</span>
            <div class="lf-dots">
              <div class="lf-dot"></div>
              <div class="lf-dot"></div>
              <div class="lf-dot"></div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Delete confirm modal -->
    <Teleport to="body">
      <div v-if="confirmId" class="modal-overlay" @click.self="confirmId = null">
        <div class="modal">
          <div class="modal-icon">⚠</div>
          <p class="modal-text">SUPPRIMER CE POKÉMON ?</p>
          <p class="modal-sub">Cette action est irréversible.</p>
          <div class="modal-actions">
            <button @click="confirmDelete" class="modal-btn confirm">SUPPRIMER</button>
            <button @click="confirmId = null" class="modal-btn cancel">ANNULER</button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePokemonStore } from '../store/pokemon';

const router       = useRouter();
const pokemonStore = usePokemonStore();

onMounted(() => pokemonStore.fetchPokemons());

const isEditing      = ref(false);
const editingMongoId = ref(null);
const focus          = ref(null);
const searchQuery    = ref('');
const confirmId      = ref(null);

const form = ref({ id: '', name: '', types: [], imageUrl: '', description: '' });

const formTypes = computed({
  get:  ()    => form.value.types.join(', '),
  set:  (val) => { form.value.types = val.split(',').map(t => t.trim()).filter(t => t); }
});

const filteredList = computed(() => {
  const q = searchQuery.value.toLowerCase().trim();
  if (!q) return pokemonStore.pokemons;
  return pokemonStore.pokemons.filter(p =>
      p.name.toLowerCase().includes(q) ||
      String(p.id).includes(q) ||
      p.types?.some(t => t.toLowerCase().includes(q))
  );
});

const handleSubmit = async () => {
  try {
    if (isEditing.value) {
      await pokemonStore.updatePokemon(editingMongoId.value, form.value);
    } else {
      await pokemonStore.createPokemon(form.value);
    }
    resetForm();
  } catch {
    alert('Erreur lors de la sauvegarde.');
  }
};

const editPokemon = (pkmn) => {
  isEditing.value      = true;
  editingMongoId.value = pkmn._id;
  form.value = { id: pkmn.id, name: pkmn.name, types: [...pkmn.types], imageUrl: pkmn.imageUrl, description: pkmn.description };
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const deletePokemon = (mongoId) => { confirmId.value = mongoId; };
const confirmDelete = async () => {
  await pokemonStore.deletePokemon(confirmId.value);
  confirmId.value = null;
};

const resetForm = () => {
  isEditing.value      = false;
  editingMongoId.value = null;
  form.value = { id: '', name: '', types: [], imageUrl: '', description: '' };
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=VT323&family=Share+Tech+Mono&display=swap');

/* ─────────────────────────────────────────────
   ROOT
───────────────────────────────────────────── */
.admin-root {
  min-height: 100dvh;
  background: #080c08;
  display: flex; align-items: stretch;
  padding: 0; position: relative; overflow: hidden;
}
.ambient-red {
  position:fixed; width:500px; height:500px; border-radius:50%;
  background:radial-gradient(circle, rgba(220,38,38,0.07) 0%, transparent 70%);
  top:-100px; right:-100px; pointer-events:none;
}
.ambient-green {
  position:fixed; width:600px; height:600px; border-radius:50%;
  background:radial-gradient(circle, rgba(74,222,128,0.05) 0%, transparent 70%);
  bottom:-150px; left:-100px; pointer-events:none;
}

/* ─────────────────────────────────────────────
   SHELL
───────────────────────────────────────────── */
.admin-shell {
  flex:1; display:flex; flex-direction:column;
  border: 1px solid rgba(74,222,128,0.15);
  margin: clamp(8px,1.5vw,20px);
  border-radius: 12px;
  overflow: hidden;
  background: #0a0f0a;
  box-shadow: 0 0 0 1px rgba(74,222,128,0.08), 0 30px 80px rgba(0,0,0,0.8);
}

/* ─────────────────────────────────────────────
   TOP BAR
───────────────────────────────────────────── */
.admin-topbar {
  flex-shrink:0;
  display:flex; align-items:center; justify-content:space-between;
  padding: clamp(10px,1.5vh,18px) clamp(16px,2vw,28px);
  border-bottom: 1px solid rgba(74,222,128,0.15);
  background: linear-gradient(to bottom, rgba(74,222,128,0.04), transparent);
}
.topbar-left { display:flex; align-items:center; gap:14px; }
.terminal-icon {
  width: 40px; height: 40px; border-radius: 8px;
  background: rgba(74,222,128,0.1);
  border: 1px solid rgba(74,222,128,0.3);
  display:flex; align-items:center; justify-content:center;
  font-family:'Share Tech Mono',monospace; font-size:13px;
  color:#4ade80; letter-spacing:-0.05em;
  flex-shrink:0;
}
.topbar-title { display:flex; flex-direction:column; }
.title-main {
  font-family:'VT323',monospace; font-size:clamp(20px,2.5vw,28px);
  color:#4ade80; letter-spacing:0.1em;
}
.title-sub {
  font-family:'Share Tech Mono',monospace;
  font-size:clamp(8px,0.9vw,11px); color:rgba(74,222,128,0.4);
  letter-spacing:0.15em; text-transform:uppercase;
}
.topbar-right { display:flex; align-items:center; gap:16px; }
.db-status {
  display:flex; align-items:center; gap:7px;
  font-family:'Share Tech Mono',monospace;
  font-size:clamp(10px,1.1vw,13px); color:rgba(74,222,128,0.5);
  background:rgba(74,222,128,0.06); border:1px solid rgba(74,222,128,0.15);
  border-radius:999px; padding:4px 12px;
}
.status-dot {
  width:7px; height:7px; border-radius:50%;
  background:#4ade80; box-shadow:0 0 8px rgba(74,222,128,0.8);
  animation:dotBlink 2s ease-in-out infinite;
}
@keyframes dotBlink { 0%,100%{opacity:1} 50%{opacity:0.4} }
.back-btn {
  font-family:'VT323',monospace; font-size:clamp(14px,1.6vw,18px);
  color:rgba(74,222,128,0.5); background:transparent;
  border:1px solid rgba(74,222,128,0.2); border-radius:4px;
  padding:5px 14px; cursor:pointer; letter-spacing:0.06em;
  transition:all 0.15s;
}
.back-btn:hover { color:#4ade80; border-color:rgba(74,222,128,0.5); background:rgba(74,222,128,0.06); }

/* ─────────────────────────────────────────────
   BODY
───────────────────────────────────────────── */
.admin-body {
  flex:1; display:grid;
  grid-template-columns: minmax(300px, 420px) 1fr;
  gap:0; overflow:hidden; min-height:0;
}

/* ─────────────────────────────────────────────
   PANELS
───────────────────────────────────────────── */
.panel { display:flex; flex-direction:column; min-height:0; }
.form-panel {
  border-right: 1px solid rgba(74,222,128,0.12);
  background: linear-gradient(to bottom right, rgba(74,222,128,0.02), transparent);
}
.list-panel { }

.panel-header {
  flex-shrink:0;
  display:flex; align-items:center; justify-content:space-between; gap:12px;
  padding: clamp(10px,1.5vh,16px) clamp(14px,2vw,24px);
  border-bottom: 1px solid rgba(74,222,128,0.12);
  background: rgba(74,222,128,0.03);
}
.panel-title {
  display:flex; align-items:center; gap:8px;
  font-family:'VT323',monospace;
  font-size:clamp(16px,1.8vw,22px); color:#4ade80; letter-spacing:0.08em;
}
.panel-title-icon {
  width:26px; height:26px; border-radius:4px;
  display:flex; align-items:center; justify-content:center;
  font-size:14px; flex-shrink:0;
}
.panel-title-icon.add    { background:rgba(74,222,128,0.15); color:#4ade80; border:1px solid rgba(74,222,128,0.3); }
.panel-title-icon.edit   { background:rgba(250,204,21,0.15); color:#fde047; border:1px solid rgba(250,204,21,0.3); }
.panel-title-icon.db     { background:rgba(99,102,241,0.15); color:#818cf8; border:1px solid rgba(99,102,241,0.3); }
.panel-header-dots { display:flex; gap:5px; }
.phd { width:8px; height:8px; border-radius:50%; background:rgba(74,222,128,0.2); }

/* ─────────────────────────────────────────────
   FORM
───────────────────────────────────────────── */
.crud-form {
  flex:1; overflow-y:auto; padding:clamp(16px,2vw,24px);
  display:flex; flex-direction:column; gap:14px;
}
.crud-form::-webkit-scrollbar { width:6px; }
.crud-form::-webkit-scrollbar-track { background:transparent; }
.crud-form::-webkit-scrollbar-thumb { background:rgba(74,222,128,0.2); border-radius:3px; }

.field { display:flex; flex-direction:column; gap:5px; }
.field-label {
  font-family:'Share Tech Mono',monospace;
  font-size:clamp(9px,1vw,11px); color:rgba(74,222,128,0.5);
  letter-spacing:0.18em; text-transform:uppercase;
}
.field-hint { font-size:0.85em; color:rgba(74,222,128,0.3); letter-spacing:0.05em; }
.field-input-wrap {
  display:flex; align-items:center;
  border: 1px solid rgba(74,222,128,0.2);
  border-radius:4px; background:rgba(74,222,128,0.03);
  transition:border-color 0.2s, box-shadow 0.2s;
  position:relative;
}
.field-input-wrap.focused {
  border-color:rgba(74,222,128,0.6);
  box-shadow:0 0 0 3px rgba(74,222,128,0.08), 0 0 12px rgba(74,222,128,0.1);
}
.field-prefix {
  padding:0 0 0 12px;
  font-family:'Share Tech Mono',monospace; font-size:16px;
  color:rgba(74,222,128,0.4); flex-shrink:0;
}
.field-input {
  flex:1; background:transparent; border:none; outline:none;
  font-family:'Share Tech Mono',monospace; font-size:clamp(13px,1.4vw,15px);
  color:#d1fae5; padding:9px 12px; letter-spacing:0.04em;
  caret-color:#4ade80;
}
.field-input-url { font-size:clamp(11px,1.2vw,13px); }
.field-input::placeholder { color:rgba(74,222,128,0.2); }
.field-textarea-wrap { align-items:flex-start; }
.field-textarea { resize:none; line-height:1.5; }

.img-thumb {
  padding-right:6px; flex-shrink:0;
}
.img-thumb img {
  width:36px; height:36px; object-fit:cover;
  border-radius:3px; border:1px solid rgba(74,222,128,0.2);
}

.types-preview { display:flex; flex-wrap:wrap; gap:5px; margin-top:4px; }
.type-pill {
  font-family:'Share Tech Mono',monospace; font-size:10px;
  color:#4ade80; background:rgba(74,222,128,0.1);
  border:1px solid rgba(74,222,128,0.25); border-radius:3px;
  padding:2px 8px; letter-spacing:0.06em; text-transform:uppercase;
}

.form-actions { display:flex; gap:10px; padding-top:4px; }
.btn-save {
  flex:1; font-family:'VT323',monospace; font-size:clamp(17px,1.8vw,21px);
  letter-spacing:0.08em; color:#0a0f0a;
  background:#4ade80; border:none; border-radius:4px;
  padding:9px; cursor:pointer;
  box-shadow:0 3px 0 #166534, 0 0 20px rgba(74,222,128,0.2);
  transition:all 0.1s; position:relative; overflow:hidden;
}
.btn-save::before { content:''; position:absolute; inset:0; background:linear-gradient(to bottom,rgba(255,255,255,0.12),transparent); pointer-events:none; }
.btn-save:hover { background:#86efac; }
.btn-save:active { transform:translateY(2px); box-shadow:0 1px 0 #166534; }
.btn-save.editing { background:#fde047; box-shadow:0 3px 0 #713f12, 0 0 20px rgba(253,224,71,0.15); }
.btn-save.editing:hover { background:#fef08a; }

.btn-cancel {
  font-family:'VT323',monospace; font-size:clamp(17px,1.8vw,21px);
  letter-spacing:0.08em; color:#f87171;
  background:transparent; border:1px solid rgba(248,113,113,0.4); border-radius:4px;
  padding:9px 20px; cursor:pointer;
  transition:all 0.1s;
}
.btn-cancel:hover { background:rgba(248,113,113,0.1); border-color:rgba(248,113,113,0.7); }

/* ─────────────────────────────────────────────
   DB LIST
───────────────────────────────────────────── */
.search-wrap {
  display:flex; align-items:center; gap:6px;
  border:1px solid rgba(74,222,128,0.2); border-radius:4px;
  background:rgba(74,222,128,0.03); padding:5px 10px;
  transition:border-color 0.2s, box-shadow 0.2s;
}
.search-wrap.focused { border-color:rgba(74,222,128,0.5); box-shadow:0 0 0 3px rgba(74,222,128,0.07); }
.search-icon { font-size:16px; color:rgba(74,222,128,0.4); }
.search-input {
  background:transparent; border:none; outline:none;
  font-family:'Share Tech Mono',monospace; font-size:13px;
  color:#d1fae5; width:120px; caret-color:#4ade80;
  letter-spacing:0.04em;
}
.search-input::placeholder { color:rgba(74,222,128,0.25); }

.db-list {
  flex:1; overflow-y:auto;
  padding:0;
}
.db-list::-webkit-scrollbar { width:6px; }
.db-list::-webkit-scrollbar-track { background:transparent; }
.db-list::-webkit-scrollbar-thumb { background:rgba(74,222,128,0.15); border-radius:3px; }

.list-loading, .list-empty {
  display:flex; align-items:center; justify-content:center; gap:12px;
  height:200px;
  font-family:'VT323',monospace; font-size:20px;
  color:rgba(74,222,128,0.35); letter-spacing:0.1em;
}
.list-spinner {
  width:28px; height:28px; border-radius:50%;
  border:3px solid rgba(74,222,128,0.15);
  border-top-color:#4ade80;
  animation:spin 0.8s linear infinite;
}
@keyframes spin { to { transform:rotate(360deg); } }

.list-row {
  display:flex; align-items:center; gap:12px;
  padding:clamp(8px,1.2vh,12px) clamp(14px,2vw,24px);
  border-bottom:1px solid rgba(74,222,128,0.07);
  transition:background 0.15s;
  position:relative;
}
.list-row:hover { background:rgba(74,222,128,0.04); }
.list-row.is-editing {
  background:rgba(253,224,71,0.04);
  border-left:3px solid rgba(253,224,71,0.5);
}

.row-sprite {
  width: clamp(36px,4vw,48px); height: clamp(36px,4vw,48px);
  border-radius:4px; flex-shrink:0;
  background:rgba(74,222,128,0.05); border:1px solid rgba(74,222,128,0.1);
  display:flex; align-items:center; justify-content:center; overflow:hidden;
}
.row-sprite img { width:100%; height:100%; object-fit:contain; image-rendering:pixelated; }
.row-sprite-fallback { font-family:'VT323',monospace; font-size:22px; color:rgba(74,222,128,0.3); }

.row-info { flex:1; display:flex; flex-direction:column; gap:2px; min-width:0; }
.row-number { font-family:'Share Tech Mono',monospace; font-size:10px; color:rgba(74,222,128,0.4); letter-spacing:0.1em; }
.row-name { font-family:'VT323',monospace; font-size:clamp(17px,2vw,22px); color:#d1fae5; letter-spacing:0.05em; text-transform:uppercase; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.row-types { display:flex; gap:4px; flex-wrap:wrap; }
.row-type {
  font-family:'Share Tech Mono',monospace; font-size:9px;
  color:rgba(74,222,128,0.5); background:rgba(74,222,128,0.08);
  border:1px solid rgba(74,222,128,0.15); border-radius:2px;
  padding:1px 5px; letter-spacing:0.06em; text-transform:uppercase;
}

.row-actions { display:flex; gap:8px; flex-shrink:0; }
.row-btn {
  width:30px; height:30px; border-radius:4px;
  border:1px solid; display:flex; align-items:center; justify-content:center;
  font-size:14px; cursor:pointer; transition:all 0.12s;
  background:transparent;
}
.btn-edit  { color:rgba(96,165,250,0.7); border-color:rgba(96,165,250,0.2); }
.btn-edit:hover  { color:#60a5fa; border-color:rgba(96,165,250,0.6); background:rgba(96,165,250,0.1); }
.btn-delete { color:rgba(248,113,113,0.6); border-color:rgba(248,113,113,0.2); }
.btn-delete:hover { color:#f87171; border-color:rgba(248,113,113,0.6); background:rgba(248,113,113,0.1); }

.list-footer {
  flex-shrink:0;
  display:flex; align-items:center; justify-content:space-between;
  padding:8px clamp(14px,2vw,24px);
  border-top:1px solid rgba(74,222,128,0.1);
  background:rgba(74,222,128,0.02);
  font-family:'Share Tech Mono',monospace;
  font-size:10px; color:rgba(74,222,128,0.35); letter-spacing:0.12em;
}
.lf-dots { display:flex; gap:4px; }
.lf-dot { width:5px; height:5px; border-radius:50%; background:rgba(74,222,128,0.2); }

/* ─────────────────────────────────────────────
   DELETE CONFIRM MODAL
───────────────────────────────────────────── */
.modal-overlay {
  position:fixed; inset:0; z-index:9999;
  background:rgba(0,0,0,0.75); backdrop-filter:blur(4px);
  display:flex; align-items:center; justify-content:center;
  animation:fadeIn 0.15s ease;
}
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
.modal {
  background:#0d1a0d; border:1px solid rgba(248,113,113,0.4);
  border-radius:10px; padding:32px 28px;
  display:flex; flex-direction:column; align-items:center; gap:12px;
  box-shadow:0 0 0 1px rgba(248,113,113,0.1), 0 30px 60px rgba(0,0,0,0.8);
  animation:slideUp 0.2s cubic-bezier(0.34,1.56,0.64,1);
  min-width:280px;
}
@keyframes slideUp { from{transform:translateY(12px);opacity:0} to{transform:translateY(0);opacity:1} }
.modal-icon { font-size:36px; }
.modal-text { font-family:'VT323',monospace; font-size:22px; color:#f87171; letter-spacing:0.08em; }
.modal-sub  { font-family:'Share Tech Mono',monospace; font-size:11px; color:rgba(248,113,113,0.5); }
.modal-actions { display:flex; gap:10px; margin-top:6px; }
.modal-btn {
  font-family:'VT323',monospace; font-size:18px; letter-spacing:0.06em;
  border-radius:4px; padding:7px 20px; cursor:pointer; border:1px solid;
  transition:all 0.1s;
}
.modal-btn.confirm { color:#0a0f0a; background:#f87171; border-color:#dc2626; box-shadow:0 3px 0 #7f1d1d; }
.modal-btn.confirm:hover { background:#fca5a5; }
.modal-btn.confirm:active { transform:translateY(2px); box-shadow:0 1px 0 #7f1d1d; }
.modal-btn.cancel  { color:rgba(74,222,128,0.7); background:transparent; border-color:rgba(74,222,128,0.2); }
.modal-btn.cancel:hover { border-color:rgba(74,222,128,0.5); color:#4ade80; }

/* ─────────────────────────────────────────────
   RESPONSIVE
───────────────────────────────────────────── */
@media (max-width: 768px) {
  .admin-body { grid-template-columns:1fr; overflow-y:auto; }
  .form-panel { border-right:none; border-bottom:1px solid rgba(74,222,128,0.12); }
  .db-list { max-height:50vh; }
  .search-input { width:90px; }
}
@media (max-width: 480px) {
  .topbar-right { gap:8px; }
  .db-status { display:none; }
  .admin-shell { margin:6px; border-radius:8px; }
}
</style>