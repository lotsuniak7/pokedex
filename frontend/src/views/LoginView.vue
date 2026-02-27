<template>
  <div class="auth-root">

    <!-- ✨ Transition overlay — mounts after login success -->
    <PokedexTransition v-if="showTransition" />

    <div class="ambient-glow"></div>

    <div class="pokedex-device">

      <div class="device-top">
        <div class="camera-orb">
          <div class="camera-shine"></div>
          <div class="camera-dot"></div>
        </div>
        <div class="led-row">
          <div class="led led-red"></div>
          <div class="led led-yellow"></div>
          <div class="led led-green"></div>
        </div>
      </div>

      <div class="device-screen-wrap">
        <div class="screen-bezel">

          <div class="screen-dots">
            <div class="sdot"></div>
            <div class="sdot"></div>
          </div>

          <div class="crt-screen">

            <div class="screen-title">
              <span class="title-text" :key="isLogin">
                {{ isLogin ? 'IDENTIFICATION...' : 'NOUVEAU DRESSEUR' }}
              </span>
              <span class="title-cursor">█</span>
            </div>

            <div class="screen-divider"><span>──────────────────</span></div>

            <form @submit.prevent="handleSubmit" class="auth-form" novalidate>

              <div class="field-group">
                <label class="field-label">▶ ID DRESSEUR</label>
                <div class="input-wrap" :class="{ focused: focusedField === 'username' }">
                  <input
                      v-model="form.username"
                      type="text"
                      required
                      autocomplete="username"
                      spellcheck="false"
                      class="field-input"
                      @focus="focusedField = 'username'"
                      @blur="focusedField = null"
                  />
                </div>
              </div>

              <div class="field-group">
                <label class="field-label">▶ MOT DE PASSE</label>
                <div class="input-wrap" :class="{ focused: focusedField === 'password' }">
                  <input
                      v-model="form.password"
                      :type="showPassword ? 'text' : 'password'"
                      required
                      autocomplete="current-password"
                      class="field-input"
                      @focus="focusedField = 'password'"
                      @blur="focusedField = null"
                  />
                  <button type="button" class="toggle-pw" @click="showPassword = !showPassword" tabindex="-1">
                    {{ showPassword ? '🙈' : '👁' }}
                  </button>
                </div>
              </div>

              <transition name="err-slide">
                <div v-if="errorMsg" class="error-msg">
                  <span class="err-icon">!</span> {{ errorMsg }}
                </div>
              </transition>

              <button
                  type="submit"
                  class="submit-btn"
                  :class="{ loading: isLoading }"
                  :disabled="isLoading"
              >
                <span v-if="!isLoading">{{ isLogin ? '▶ CONNEXION' : '▶ S\'ENREGISTRER' }}</span>
                <span v-else class="loading-dots">
                  <span>.</span><span>.</span><span>.</span>
                </span>
              </button>

            </form>

            <button @click="toggleMode" class="toggle-mode-btn">
              {{ isLogin ? '[ Créer un profil dresseur ]' : '[ Déjà dresseur ? Connexion ]' }}
            </button>

            <div class="scanlines" aria-hidden="true"></div>
            <div class="screen-glare" aria-hidden="true"></div>
          </div>

          <div class="bezel-bottom">
            <div class="bb-dot"></div>
            <div class="bb-lines">
              <div class="bb-line"></div>
              <div class="bb-line"></div>
              <div class="bb-line"></div>
            </div>
          </div>

        </div>
      </div>

      <div class="device-bottom">
        <div class="db-btn db-btn-a"></div>
        <div class="db-btn db-btn-b"></div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useAuthStore } from '../store/auth';
import PokedexTransition from '../components/PokedexTransition.vue';

const authStore = useAuthStore();

const isLogin        = ref(true);
const errorMsg       = ref('');
const isLoading      = ref(false);
const showPassword   = ref(false);
const focusedField   = ref(null);
const showTransition = ref(false);  // ← triggers the cinematic animation

const form = reactive({ username: '', password: '' });

const toggleMode = () => {
  isLogin.value      = !isLogin.value;
  errorMsg.value     = '';
  showPassword.value = false;
};

const handleSubmit = async () => {
  errorMsg.value  = '';
  isLoading.value = true;
  try {
    if (isLogin.value) {
      await authStore.login(form.username, form.password);
    } else {
      await authStore.register(form.username, form.password);
    }

    // ✅ Auth succeeded — launch the flip animation!
    // PokedexTransition handles router.push('/') itself after animation ends.
    showTransition.value = true;

  } catch {
    errorMsg.value  = 'ACCÈS REFUSÉ — Vérifiez vos données.';
    isLoading.value = false;
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=VT323&family=Share+Tech+Mono&display=swap');

.auth-root {
  min-height: 100dvh;
  background: radial-gradient(ellipse at center, #1a0a0a 0%, #0d0000 100%);
  display: flex; align-items: center; justify-content: center;
  padding: 16px; position: relative; overflow: hidden;
}

.ambient-glow {
  position: absolute; width: 500px; height: 500px; border-radius: 50%;
  background: radial-gradient(circle, rgba(220,38,38,0.15) 0%, transparent 70%);
  top: 50%; left: 50%; transform: translate(-50%,-50%);
  pointer-events: none;
  animation: ambientPulse 4s ease-in-out infinite;
}
@keyframes ambientPulse {
  0%,100%{ opacity:0.6; transform:translate(-50%,-50%) scale(1); }
  50%    { opacity:1;   transform:translate(-50%,-50%) scale(1.15); }
}

.pokedex-device {
  width: 100%; max-width: 400px;
  background: linear-gradient(160deg, #ef4444 0%, #dc2626 45%, #b91c1c 100%);
  border: 5px solid #7f1d1d; border-radius: 2rem 2rem 1.5rem 1.5rem;
  box-shadow: 0 30px 60px rgba(0,0,0,0.8), inset 0 4px 10px rgba(255,255,255,0.25), inset 0 -6px 16px rgba(0,0,0,0.35);
  overflow: hidden; position: relative; z-index: 1;
}

.device-top {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 18px 12px; border-bottom: 4px solid #7f1d1d;
  background: linear-gradient(to bottom, rgba(0,0,0,0.12), transparent);
}
.camera-orb {
  width: 52px; height: 52px; border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #93c5fd, #1d4ed8 70%, #1e3a8a);
  border: 4px solid #1e3a8a;
  box-shadow: 0 0 18px rgba(59,130,246,0.7), inset 0 -4px 10px rgba(0,0,0,0.5);
  position: relative; flex-shrink: 0;
}
.camera-shine { position:absolute; top:18%; left:18%; width:34%; height:34%; border-radius:50%; background:rgba(255,255,255,0.75); filter:blur(2px); }
.camera-dot   { position:absolute; top:28%; left:30%; width:14%; height:14%; border-radius:50%; background:white; box-shadow:0 0 5px white; }

.led-row { display: flex; gap: 8px; margin-bottom: auto; margin-top: 2px; }
.led { width: 14px; height: 14px; border-radius: 50%; border: 2px solid rgba(0,0,0,0.4); }
.led-red    { background: radial-gradient(circle at 35% 35%, #f87171, #b91c1c); box-shadow: 0 0 8px rgba(239,68,68,0.9); animation: ledBlink 2s ease-in-out infinite; }
.led-yellow { background: radial-gradient(circle at 35% 35%, #fde047, #ca8a04); }
.led-green  { background: radial-gradient(circle at 35% 35%, #86efac, #16a34a); }
@keyframes ledBlink { 0%,100%{box-shadow:0 0 6px rgba(239,68,68,0.8)} 50%{box-shadow:0 0 18px rgba(239,68,68,1),0 0 36px rgba(239,68,68,0.4)} }

.device-screen-wrap { padding: 12px 16px; }
.screen-bezel {
  background: #d1d5db; border: 4px solid #6b7280;
  border-radius: 1rem 1rem 1rem 2.5rem;
  box-shadow: inset 0 4px 16px rgba(0,0,0,0.3); overflow: hidden;
}
.screen-dots { display: flex; justify-content: center; gap: 12px; padding: 7px 0 5px; }
.sdot { width: 7px; height: 7px; border-radius: 50%; background: #9ca3af; border: 1px solid #6b7280; }

.crt-screen {
  background: #1a2e1a; border: 6px solid #111;
  margin: 0 12px; border-radius: 4px;
  padding: 18px 16px 16px; position: relative; overflow: hidden;
  display: flex; flex-direction: column; gap: 10px; min-height: 300px;
  box-shadow: inset 0 0 30px rgba(0,60,0,0.6), 0 0 0 2px #222;
}

.screen-title { display: flex; align-items: baseline; gap: 4px; justify-content: center; }
.title-text { font-family:'VT323',monospace; font-size:22px; color:#4ade80; letter-spacing:0.1em; animation: titleIn 0.3s ease; }
@keyframes titleIn { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
.title-cursor { font-family:'VT323',monospace; font-size:20px; color:#4ade80; animation: blink 1s step-end infinite; }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
.screen-divider { font-family:'VT323',monospace; font-size:14px; color:rgba(74,222,128,0.25); text-align:center; user-select:none; }

.auth-form { display: flex; flex-direction: column; gap: 12px; }
.field-group { display: flex; flex-direction: column; gap: 4px; }
.field-label { font-family:'VT323',monospace; font-size:15px; color:#16a34a; letter-spacing:0.08em; }

.input-wrap {
  position: relative; border: 2px solid #166534;
  border-radius: 2px; background: #0d1f0d;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.input-wrap.focused { border-color: #4ade80; box-shadow: 0 0 10px rgba(74,222,128,0.25); }
.field-input {
  width: 100%; background: transparent; border: none; outline: none;
  font-family:'Share Tech Mono','VT323',monospace; font-size:16px; color:#4ade80;
  padding: 8px 36px 8px 10px; letter-spacing:0.06em; text-transform:uppercase; caret-color:#4ade80;
}
.field-input::placeholder { color: rgba(74,222,128,0.2); }
.field-input[type="password"] { letter-spacing: 0.2em; }
.toggle-pw { position:absolute; right:8px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; font-size:14px; opacity:0.6; padding:0; line-height:1; transition:opacity 0.15s; }
.toggle-pw:hover { opacity: 1; }

.error-msg { font-family:'VT323',monospace; font-size:14px; color:#f87171; background:rgba(220,38,38,0.1); border:1px solid rgba(220,38,38,0.3); border-radius:2px; padding:6px 10px; display:flex; align-items:center; gap:6px; letter-spacing:0.04em; }
.err-icon { width:18px; height:18px; border-radius:50%; background:#dc2626; color:white; font-size:13px; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-weight:bold; }
.err-slide-enter-active { transition: all 0.25s ease; }
.err-slide-leave-active { transition: all 0.2s ease; }
.err-slide-enter-from   { opacity:0; transform:translateY(-6px); }
.err-slide-leave-to     { opacity:0; transform:translateY(-4px); }

.submit-btn {
  font-family:'VT323',monospace; font-size:18px; letter-spacing:0.1em;
  color:#0d1f0d; background:#4ade80; border:2px solid #166534; border-radius:2px;
  padding:8px; cursor:pointer; transition:all 0.1s; box-shadow:0 4px 0 #14532d;
  position:relative; overflow:hidden;
}
.submit-btn::before { content:''; position:absolute; inset:0; background:linear-gradient(to bottom,rgba(255,255,255,0.12),transparent); pointer-events:none; }
.submit-btn:hover:not(:disabled) { background: #86efac; }
.submit-btn:active:not(:disabled) { transform:translateY(3px); box-shadow:0 1px 0 #14532d; }
.submit-btn:disabled { opacity:0.6; cursor:not-allowed; }
.submit-btn.loading { background:#166534; color:#4ade80; }

.loading-dots { display:flex; justify-content:center; gap:4px; }
.loading-dots span { animation:dotBounce 1.2s ease-in-out infinite; font-size:20px; line-height:1; }
.loading-dots span:nth-child(1) { animation-delay:0s; }
.loading-dots span:nth-child(2) { animation-delay:0.2s; }
.loading-dots span:nth-child(3) { animation-delay:0.4s; }
@keyframes dotBounce { 0%,60%,100%{opacity:0.2;transform:translateY(0)} 30%{opacity:1;transform:translateY(-3px)} }

.toggle-mode-btn { font-family:'VT323',monospace; font-size:14px; color:#16a34a; background:none; border:none; cursor:pointer; text-align:center; width:100%; padding:4px 0; transition:color 0.15s; letter-spacing:0.04em; }
.toggle-mode-btn:hover { color:#4ade80; text-shadow:0 0 8px rgba(74,222,128,0.5); }

.scanlines { position:absolute; inset:0; pointer-events:none; z-index:10; background:repeating-linear-gradient(to bottom,transparent 0px,transparent 2px,rgba(0,0,0,0.08) 2px,rgba(0,0,0,0.08) 4px); }
.screen-glare { position:absolute; top:0; left:0; width:55%; height:35%; background:linear-gradient(135deg,rgba(255,255,255,0.06) 0%,transparent 70%); pointer-events:none; z-index:11; }

.bezel-bottom { display:flex; justify-content:space-between; align-items:center; padding:8px 20px; }
.bb-dot { width:18px; height:18px; border-radius:50%; background:radial-gradient(circle at 35% 35%,#f87171,#dc2626); border:2px solid #7f1d1d; box-shadow:inset 0 2px 4px rgba(255,255,255,0.3); }
.bb-lines { display:flex; flex-direction:column; gap:4px; }
.bb-line { width:38px; height:3px; background:#9ca3af; border-radius:2px; }

.device-bottom { display:flex; justify-content:center; gap:16px; padding:10px 18px 14px; border-top:4px solid #7f1d1d; background:linear-gradient(to top,rgba(0,0,0,0.15),transparent); }
.db-btn { width:36px; height:10px; border-radius:999px; border:2px solid; box-shadow:0 2px 0 rgba(0,0,0,0.4); }
.db-btn-a { background:#dc2626; border-color:#7f1d1d; }
.db-btn-b { background:#2563eb; border-color:#1e3a8a; }

@media (max-width: 420px) {
  .pokedex-device { border-radius: 1.5rem 1.5rem 1rem 1rem; border-width: 4px; }
  .camera-orb { width: 44px; height: 44px; }
  .crt-screen { padding: 14px 12px 12px; min-height: 280px; }
  .title-text { font-size: 18px; }
}
</style>