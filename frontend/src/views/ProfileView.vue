<template>
  <div class="profile-root">

    <div class="ambient"></div>

    <!-- ══════════════════════════════════
         TRAINER CARD
    ══════════════════════════════════ -->
    <div class="card-shell">

      <!-- Card header strip -->
      <div class="card-header">
        <div class="ch-logo">
          <span class="ch-logo-text">POKÉDEX</span>
          <span class="ch-logo-sub">CARTE DE DRESSEUR</span>
        </div>
        <div class="ch-badge">
          <div class="badge-orb">
            <div class="badge-shine"></div>
          </div>
          <div class="badge-leds">
            <div class="badge-led r"></div>
            <div class="badge-led y"></div>
            <div class="badge-led g"></div>
          </div>
        </div>
      </div>

      <!-- Card body -->
      <div class="card-body">

        <!-- ─── LOADING ─── -->
        <div v-if="trainerStore.isLoading" class="state-loading">
          <div class="loading-spinner"></div>
          <span class="loading-text">LECTURE DE LA CARTE...</span>
        </div>

        <!-- ─── CREATE PROFILE ─── -->
        <div v-else-if="!trainerStore.hasProfile" class="state-create">

          <div class="create-header">
            <div class="create-icon">?</div>
            <div class="create-title">
              <span class="create-title-main">IDENTITÉ REQUISE</span>
              <span class="create-title-sub">Enregistrez votre profil de Dresseur</span>
            </div>
          </div>

          <div class="create-form">
            <div class="form-field">
              <label class="form-label">▶ NOM DU DRESSEUR</label>
              <div class="form-input-wrap" :class="{ focused: focus === 'name' }">
                <input
                    v-model="form.trainerName"
                    type="text"
                    placeholder="EX: SACHA"
                    maxlength="12"
                    class="form-input"
                    @focus="focus = 'name'"
                    @blur="focus = null"
                    @keyup.enter="$refs.imgInput.focus()"
                    spellcheck="false"
                />
                <span class="char-count">{{ form.trainerName.length }}/12</span>
              </div>
            </div>

            <div class="form-field">
              <label class="form-label">▶ PHOTO DE PROFIL (URL)</label>
              <div class="form-input-wrap" :class="{ focused: focus === 'img' }">
                <input
                    ref="imgInput"
                    v-model="form.imgUrl"
                    type="url"
                    placeholder="https://..."
                    class="form-input form-input-url"
                    @focus="focus = 'img'"
                    @blur="focus = null"
                />
              </div>
              <!-- Preview -->
              <div v-if="form.imgUrl" class="img-preview">
                <img :src="form.imgUrl" alt="preview" @error="imgError = true" @load="imgError = false" />
                <span v-if="imgError" class="img-error">URL invalide</span>
              </div>
            </div>

            <button
                @click="handleCreateProfile"
                class="create-btn"
                :disabled="!form.trainerName.trim()"
            >
              <span>▶ ENREGISTRER</span>
            </button>
          </div>
        </div>

        <!-- ─── PROFILE ─── -->
        <div v-else class="state-profile">

          <!-- Avatar + name block -->
          <div class="profile-identity">
            <div class="avatar-frame">
              <img
                  v-if="trainerStore.profile.imgUrl && !avatarError"
                  :src="trainerStore.profile.imgUrl"
                  alt="Avatar"
                  class="avatar-img"
                  @error="avatarError = true"
              />
              <span v-else class="avatar-placeholder">{{ initials }}</span>
              <div class="avatar-glow"></div>
            </div>

            <div class="identity-info">
              <span class="id-label">ID DRESSEUR</span>
              <span class="id-code">#{{ String(trainerStore.profile._id).slice(-6).toUpperCase() }}</span>
              <span class="id-name">{{ trainerStore.profile.trainerName }}</span>
              <div class="id-badges">
                <span class="id-badge">KANTO</span>
                <span class="id-badge active">ACTIF</span>
              </div>
            </div>
          </div>

          <!-- Divider -->
          <div class="profile-divider">
            <div class="pd-line"></div>
            <div class="pd-pokeball">
              <div class="pb-top"></div>
              <div class="pb-band"></div>
              <div class="pb-center"></div>
            </div>
            <div class="pd-line"></div>
          </div>

          <!-- Stats -->
          <div class="profile-stats">
            <div class="stat-card stat-seen">
              <div class="stat-icon">👁</div>
              <div class="stat-info">
                <span class="stat-label">VUS</span>
                <span class="stat-value">{{ trainerStore.seenIds.length }}</span>
              </div>
              <div class="stat-bar">
                <div class="stat-fill" :style="{ width: seenPct + '%' }"></div>
              </div>
              <span class="stat-pct">{{ seenPct }}%</span>
            </div>

            <div class="stat-card stat-caught">
              <div class="stat-icon">★</div>
              <div class="stat-info">
                <span class="stat-label">ATTRAPÉS</span>
                <span class="stat-value">{{ trainerStore.caughtIds.length }}</span>
              </div>
              <div class="stat-bar">
                <div class="stat-fill" :style="{ width: caughtPct + '%' }"></div>
              </div>
              <span class="stat-pct">{{ caughtPct }}%</span>
            </div>
          </div>

          <!-- Progress ring -->
          <div class="completion-block">
            <svg class="completion-ring" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="6"/>
              <circle
                  cx="40" cy="40" r="34"
                  fill="none" stroke="#fde047" stroke-width="6"
                  stroke-linecap="round"
                  stroke-dasharray="213.6"
                  :stroke-dashoffset="213.6 * (1 - caughtPct / 100)"
                  style="transform:rotate(-90deg);transform-origin:center;transition:stroke-dashoffset 1s ease"
              />
            </svg>
            <div class="completion-text">
              <span class="ct-pct">{{ caughtPct }}%</span>
              <span class="ct-label">COMPLET</span>
            </div>
          </div>

          <!-- Back button -->
          <button @click="router.push('/')" class="back-btn">
            ◀ RETOUR AU POKÉDEX
          </button>
        </div>

      </div>

      <!-- Card bottom edge -->
      <div class="card-footer">
        <div class="cf-stripe"></div>
        <div class="cf-text">LIGUE POKÉMON — RÉGION KANTO</div>
        <div class="cf-stripe"></div>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTrainerStore } from '../store/trainer';

const router       = useRouter();
const trainerStore = useTrainerStore();
const imgInput     = ref(null);

const focus      = ref(null);
const imgError   = ref(false);
const avatarError = ref(false);

const form = reactive({ trainerName: '', imgUrl: '' });

const TOTAL_POKEMON = 151;

const seenPct   = computed(() => Math.round((trainerStore.seenIds.length   / TOTAL_POKEMON) * 100));
const caughtPct = computed(() => Math.round((trainerStore.caughtIds.length / TOTAL_POKEMON) * 100));

const initials = computed(() => {
  const name = trainerStore.profile?.trainerName ?? '';
  return name.slice(0, 2).toUpperCase() || '??';
});

onMounted(() => trainerStore.fetchProfile());

const handleCreateProfile = async () => {
  if (!form.trainerName.trim()) return;
  await trainerStore.createProfile(form.trainerName, form.imgUrl);
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=VT323&family=Share+Tech+Mono&display=swap');

/* ─── ROOT ─── */
.profile-root {
  min-height: 100dvh;
  background: radial-gradient(ellipse at center, #1a0a0a 0%, #060606 100%);
  display: flex; align-items: center; justify-content: center;
  padding: 16px; position: relative; overflow: hidden;
}
.ambient {
  position: absolute; width: 600px; height: 400px; border-radius: 50%;
  background: radial-gradient(ellipse, rgba(234,179,8,0.08) 0%, transparent 70%);
  top: 50%; left: 50%; transform: translate(-50%,-50%);
  pointer-events: none;
  animation: amb 5s ease-in-out infinite;
}
@keyframes amb { 0%,100%{opacity:0.6;transform:translate(-50%,-50%) scale(1)} 50%{opacity:1;transform:translate(-50%,-50%) scale(1.1)} }

/* ─── CARD SHELL ─── */
.card-shell {
  width: 100%; max-width: 480px;
  background: linear-gradient(155deg, #fde047 0%, #eab308 50%, #ca8a04 100%);
  border: 5px solid #713f12;
  border-radius: 1.5rem;
  box-shadow:
      0 30px 70px rgba(0,0,0,0.85),
      inset 0 3px 8px rgba(255,255,255,0.35),
      inset 0 -6px 14px rgba(0,0,0,0.25);
  overflow: hidden;
  position: relative; z-index: 1;
}

/* ─── CARD HEADER ─── */
.card-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 18px 10px;
  border-bottom: 4px solid #713f12;
  background: linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.05));
}
.ch-logo { display:flex; flex-direction:column; line-height:1; }
.ch-logo-text {
  font-family: 'VT323', monospace;
  font-size: 28px; color: #1c0a00; letter-spacing: 0.12em;
}
.ch-logo-sub {
  font-family: 'Share Tech Mono', monospace;
  font-size: 9px; color: rgba(28,10,0,0.55); letter-spacing: 0.2em; text-transform: uppercase;
}
.ch-badge { display:flex; align-items:center; gap:10px; }
.badge-orb {
  width: 44px; height: 44px; border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #93c5fd, #1d4ed8 70%, #1e3a8a);
  border: 3px solid #1e3a8a;
  box-shadow: 0 0 14px rgba(59,130,246,0.8);
  position: relative; flex-shrink: 0;
}
.badge-shine { position:absolute; top:18%; left:18%; width:34%; height:34%; border-radius:50%; background:rgba(255,255,255,0.72); filter:blur(2px); }
.badge-leds { display:flex; flex-direction:column; gap:5px; }
.badge-led { width:10px; height:10px; border-radius:50%; border:2px solid rgba(0,0,0,0.35); }
.badge-led.r { background:radial-gradient(circle at 35% 35%,#f87171,#b91c1c); box-shadow:0 0 7px rgba(239,68,68,0.9); animation:ledP 2s ease-in-out infinite; }
.badge-led.y { background:radial-gradient(circle at 35% 35%,#fde047,#ca8a04); }
.badge-led.g { background:radial-gradient(circle at 35% 35%,#86efac,#16a34a); }
@keyframes ledP { 0%,100%{box-shadow:0 0 5px rgba(239,68,68,0.8)} 50%{box-shadow:0 0 14px rgba(239,68,68,1)} }

/* ─── CARD BODY ─── */
.card-body {
  background: #f5f0e8;
  border: 3px solid rgba(113,63,18,0.3);
  margin: 0 12px;
  border-radius: 0.75rem;
  overflow: hidden;
  min-height: 360px;
  position: relative;
}

/* ─── LOADING ─── */
.state-loading {
  min-height: 280px; display:flex; flex-direction:column;
  align-items:center; justify-content:center; gap:16px;
}
.loading-spinner {
  width: 40px; height: 40px; border-radius: 50%;
  border: 4px solid rgba(180,130,40,0.2);
  border-top-color: #ca8a04;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform:rotate(360deg); } }
.loading-text { font-family:'VT323',monospace; font-size:22px; color:#92400e; letter-spacing:0.1em; animation:fadeP 1s ease-in-out infinite; }
@keyframes fadeP { 0%,100%{opacity:1} 50%{opacity:0.4} }

/* ─── CREATE FORM ─── */
.state-create { padding: clamp(16px,3vw,28px); }

.create-header {
  display:flex; align-items:center; gap:14px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px dashed rgba(113,63,18,0.25);
}
.create-icon {
  width: 52px; height: 52px; border-radius: 50%;
  background: linear-gradient(135deg, #fde047, #ca8a04);
  border: 3px solid #713f12;
  display: flex; align-items: center; justify-content: center;
  font-size: 28px; font-weight: bold; color: #713f12;
  box-shadow: 0 4px 12px rgba(113,63,18,0.3), inset 0 2px 4px rgba(255,255,255,0.4);
  flex-shrink: 0;
}
.create-title { display:flex; flex-direction:column; }
.create-title-main {
  font-family:'VT323',monospace; font-size:24px; color:#7f1d1d;
  letter-spacing:0.08em; animation:pulse 1.5s ease-in-out infinite;
}
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
.create-title-sub {
  font-family:'Share Tech Mono',monospace; font-size:11px;
  color:rgba(92,60,10,0.6); letter-spacing:0.04em; margin-top:2px;
}

.create-form { display:flex; flex-direction:column; gap:16px; }
.form-field   { display:flex; flex-direction:column; gap:5px; }
.form-label   { font-family:'VT323',monospace; font-size:16px; color:#92400e; letter-spacing:0.08em; }

.form-input-wrap {
  display:flex; align-items:center;
  border: 2px solid rgba(113,63,18,0.4);
  border-radius: 4px; background: white;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.form-input-wrap.focused { border-color: #ca8a04; box-shadow: 0 0 0 3px rgba(202,138,4,0.2); }
.form-input {
  flex:1; background:transparent; border:none; outline:none;
  font-family:'VT323',monospace; font-size:22px; color:#1c0a00;
  padding: 8px 10px; letter-spacing:0.08em; text-transform:uppercase;
  caret-color: #ca8a04;
}
.form-input-url { font-size:14px; font-family:'Share Tech Mono',monospace; text-transform:none; }
.form-input::placeholder { color:rgba(28,10,0,0.25); }
.char-count { font-family:'Share Tech Mono',monospace; font-size:11px; color:rgba(28,10,0,0.35); padding-right:10px; white-space:nowrap; }

.img-preview {
  margin-top: 6px; display:flex; align-items:center; gap:10px;
}
.img-preview img {
  width: 48px; height: 48px; object-fit:cover;
  border: 2px solid rgba(113,63,18,0.4); border-radius:4px;
}
.img-error { font-family:'VT323',monospace; font-size:14px; color:#dc2626; }

.create-btn {
  font-family:'VT323',monospace; font-size:24px; letter-spacing:0.1em;
  color: white; background: #1d4ed8;
  border: 3px solid #1e3a8a; border-radius:4px;
  padding: 10px; cursor:pointer;
  box-shadow: 0 5px 0 #1e3a8a, inset 0 2px 4px rgba(255,255,255,0.2);
  transition: all 0.1s; position:relative; overflow:hidden;
  margin-top: 4px;
}
.create-btn::before { content:''; position:absolute; inset:0; background:linear-gradient(to bottom,rgba(255,255,255,0.12),transparent); pointer-events:none; }
.create-btn:hover:not(:disabled) { background:#2563eb; }
.create-btn:active:not(:disabled) { transform:translateY(4px); box-shadow:0 1px 0 #1e3a8a; }
.create-btn:disabled { opacity:0.4; cursor:not-allowed; }

/* ─── PROFILE ─── */
.state-profile { padding: clamp(16px,3vw,24px); display:flex; flex-direction:column; gap:0; }

/* Identity block */
.profile-identity {
  display:flex; gap:16px; align-items:center;
  background: linear-gradient(135deg, #1e3a8a, #1d4ed8);
  border-radius: 10px; padding: 16px;
  box-shadow: 0 4px 16px rgba(30,58,138,0.5), inset 0 1px 0 rgba(255,255,255,0.1);
  margin-bottom: 16px;
}
.avatar-frame {
  width: clamp(72px,16vw,96px); height: clamp(72px,16vw,96px);
  border-radius: 50%; flex-shrink:0;
  border: 3px solid rgba(255,255,255,0.3);
  background: rgba(255,255,255,0.1);
  display:flex; align-items:center; justify-content:center;
  overflow:hidden; position:relative;
  box-shadow: 0 0 0 2px rgba(255,255,255,0.1), 0 8px 20px rgba(0,0,0,0.4);
}
.avatar-img { width:100%; height:100%; object-fit:cover; }
.avatar-placeholder { font-family:'VT323',monospace; font-size:36px; color:rgba(255,255,255,0.6); }
.avatar-glow {
  position:absolute; inset:0; border-radius:50%;
  background:radial-gradient(circle at 35% 35%, rgba(255,255,255,0.15), transparent);
  pointer-events:none;
}

.identity-info { display:flex; flex-direction:column; gap:2px; min-width:0; }
.id-label { font-family:'Share Tech Mono',monospace; font-size:10px; color:rgba(255,255,255,0.45); letter-spacing:0.2em; text-transform:uppercase; }
.id-code  { font-family:'Share Tech Mono',monospace; font-size:13px; color:rgba(255,255,255,0.65); letter-spacing:0.1em; }
.id-name  {
  font-family:'VT323',monospace; font-size:clamp(28px,6vw,40px); color:white;
  letter-spacing:0.05em; text-transform:uppercase; line-height:1;
  text-shadow: 0 2px 8px rgba(0,0,0,0.4);
  overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
}
.id-badges { display:flex; gap:6px; margin-top:4px; }
.id-badge {
  font-family:'Share Tech Mono',monospace; font-size:9px; color:rgba(255,255,255,0.5);
  border: 1px solid rgba(255,255,255,0.2); border-radius:3px;
  padding: 1px 6px; letter-spacing:0.1em;
}
.id-badge.active { color:#fde047; border-color:rgba(253,224,71,0.5); background:rgba(253,224,71,0.08); }

/* Divider */
.profile-divider {
  display:flex; align-items:center; gap:10px; margin-bottom:16px;
}
.pd-line { flex:1; height:2px; background:linear-gradient(to right, transparent, rgba(113,63,18,0.25), transparent); }
.pd-pokeball {
  width: 24px; height: 24px; border-radius: 50%;
  border: 2px solid rgba(113,63,18,0.4);
  position: relative; overflow: hidden; flex-shrink:0;
}
.pb-top    { position:absolute; top:0; left:0; right:0; height:50%; background:#dc2626; }
.pb-band   { position:absolute; top:50%; transform:translateY(-50%); left:0; right:0; height:3px; background:rgba(113,63,18,0.6); z-index:1; }
.pb-center { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:8px; height:8px; border-radius:50%; background:white; border:2px solid rgba(113,63,18,0.4); z-index:2; }

/* Stats */
.profile-stats { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:16px; }
.stat-card {
  border-radius: 8px; padding: 12px 14px;
  display:flex; flex-direction:column; gap:6px;
  position:relative; overflow:hidden;
}
.stat-seen   { background:linear-gradient(135deg,#eff6ff,#dbeafe); border:2px solid #bfdbfe; }
.stat-caught { background:linear-gradient(135deg,#fefce8,#fef9c3); border:2px solid #fde68a; }
.stat-icon { font-size:18px; line-height:1; }
.stat-info { display:flex; justify-content:space-between; align-items:baseline; }
.stat-label { font-family:'VT323',monospace; font-size:18px; letter-spacing:0.06em; }
.stat-seen   .stat-label  { color:#1e40af; }
.stat-caught .stat-label  { color:#92400e; }
.stat-value { font-family:'VT323',monospace; font-size:34px; line-height:1; }
.stat-seen   .stat-value  { color:#1e3a8a; }
.stat-caught .stat-value  { color:#78350f; }
.stat-bar { height:4px; background:rgba(0,0,0,0.1); border-radius:2px; overflow:hidden; }
.stat-fill { height:100%; border-radius:2px; transition:width 1s cubic-bezier(0.4,0,0.2,1); }
.stat-seen   .stat-fill { background:linear-gradient(to right,#3b82f6,#60a5fa); }
.stat-caught .stat-fill { background:linear-gradient(to right,#f59e0b,#fde047); }
.stat-pct { font-family:'Share Tech Mono',monospace; font-size:10px; color:rgba(0,0,0,0.35); text-align:right; }

/* Completion ring */
.completion-block {
  display:flex; align-items:center; justify-content:center;
  gap:12px; margin-bottom: 16px;
  background: rgba(113,63,18,0.06); border:1px solid rgba(113,63,18,0.12);
  border-radius: 8px; padding:12px 20px;
}
.completion-ring { width:72px; height:72px; flex-shrink:0; }
.completion-text { display:flex; flex-direction:column; }
.ct-pct   { font-family:'VT323',monospace; font-size:42px; color:#92400e; line-height:1; }
.ct-label { font-family:'Share Tech Mono',monospace; font-size:10px; color:rgba(92,60,10,0.55); letter-spacing:0.15em; text-transform:uppercase; }

/* Back button */
.back-btn {
  font-family:'VT323',monospace; font-size:20px; letter-spacing:0.08em;
  color:white; background:#374151;
  border:2px solid #111; border-radius:4px;
  padding: 10px; cursor:pointer; width:100%;
  box-shadow: 0 4px 0 #111, inset 0 2px 4px rgba(255,255,255,0.1);
  transition:all 0.1s;
}
.back-btn:hover { background:#4b5563; }
.back-btn:active { transform:translateY(3px); box-shadow:0 1px 0 #111; }

/* ─── CARD FOOTER ─── */
.card-footer {
  display:flex; align-items:center; gap:8px;
  padding: 8px 18px 12px;
  margin-top: 12px;
}
.cf-stripe { flex:1; height:3px; background:rgba(113,63,18,0.35); border-radius:1px; }
.cf-text { font-family:'Share Tech Mono',monospace; font-size:9px; color:rgba(113,63,18,0.55); letter-spacing:0.15em; white-space:nowrap; }

/* ─── RESPONSIVE ─── */
@media (max-width: 420px) {
  .card-shell { border-radius:1.2rem; }
  .state-profile, .state-create { padding:14px; }
  .profile-stats { grid-template-columns:1fr 1fr; gap:8px; }
  .completion-block { padding:10px 14px; }
}
</style>