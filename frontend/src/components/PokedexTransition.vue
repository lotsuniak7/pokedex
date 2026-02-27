<template>
  <Teleport to="body">
    <div class="stage" ref="stageRef">

      <!-- ══════════════════════════════════════════
           BACKGROUND — dark void with subtle grid
      ══════════════════════════════════════════ -->
      <div class="void-bg">
        <div class="grid-lines"></div>
      </div>

      <!-- ══════════════════════════════════════════
           ENERGY PARTICLES — fly out on flash
      ══════════════════════════════════════════ -->
      <div class="particles" :class="{ burst: phase >= 2 }">
        <div v-for="i in 12" :key="i" class="particle" :style="particleStyle(i)"></div>
      </div>

      <!-- ══════════════════════════════════════════
           SHOCKWAVE RINGS
      ══════════════════════════════════════════ -->
      <div class="shockwave ring-1" :class="{ fire: phase >= 2 }"></div>
      <div class="shockwave ring-2" :class="{ fire: phase >= 2 }"></div>
      <div class="shockwave ring-3" :class="{ fire: phase >= 2 }"></div>

      <!-- ══════════════════════════════════════════
           WHITE FLASH
      ══════════════════════════════════════════ -->
      <div class="flash-overlay" :class="{ fire: phase >= 2 }"></div>

      <!-- ══════════════════════════════════════════
           MINI POKÉDEX
      ══════════════════════════════════════════ -->
      <div
          class="mini-wrap"
          :class="{
          'phase-flip':  phase === 1,
          'phase-gone':  phase >= 2
        }"
      >
        <!-- The device itself -->
        <div class="mini-device">
          <div class="mini-top">
            <div class="mini-cam">
              <div class="mini-shine"></div>
              <div class="mini-dot"></div>
            </div>
            <div class="mini-leds">
              <div class="mini-led r" :class="{ flicker: phase === 1 }"></div>
              <div class="mini-led y"></div>
              <div class="mini-led g"></div>
            </div>
          </div>
          <div class="mini-screen-wrap">
            <div class="mini-screen">
              <div class="ms-text">{{ miniText }}</div>
              <div class="ms-scanlines"></div>
            </div>
          </div>
          <div class="mini-bottom">
            <div class="mb-btn red"></div>
            <div class="mb-btn blue"></div>
          </div>
        </div>

        <!-- Motion blur trail behind the device -->
        <div class="flip-trail"></div>
      </div>

      <!-- ══════════════════════════════════════════
           BIG POKÉDEX — unfolds after flash
      ══════════════════════════════════════════ -->
      <div
          class="big-wrap"
          :class="{
          'phase-unfold': phase >= 3,
          'phase-landed': phase >= 4
        }"
      >
        <div class="big-device">

          <!-- Top bar -->
          <div class="big-top">
            <div class="big-cam" :class="{ glow: phase >= 4 }">
              <div class="big-cam-shine"></div>
              <div class="big-cam-dot"></div>
              <div class="big-cam-pulse" v-if="phase >= 4"></div>
            </div>
            <div class="big-leds">
              <div class="big-led r" :class="{ on: phase >= 4 }"></div>
              <div class="big-led y"></div>
              <div class="big-led g"></div>
            </div>
            <div class="big-stats" :class="{ visible: phase >= 4 }">
              <span>BIENVENUE, DRESSEUR</span>
            </div>
          </div>

          <!-- Body -->
          <div class="big-body">

            <!-- Screen panel -->
            <div class="big-screen-panel">
              <div class="big-bezel">
                <div class="big-sdots">
                  <div class="bsd"></div>
                  <div class="bsd"></div>
                </div>

                <div class="big-screen">
                  <!-- Power-on sweep -->
                  <div class="power-sweep" :class="{ active: phase >= 3 }"></div>

                  <!-- Boot lines -->
                  <div class="boot-sequence" :class="{ visible: phase >= 4 }">
                    <div
                        v-for="(line, i) in bootLines"
                        :key="i"
                        class="boot-line"
                        :class="{ show: visibleLines > i }"
                        :style="{ '--i': i }"
                    >
                      <span v-if="line.type === 'header'" class="bl-header">{{ line.text }}</span>
                      <span v-else-if="line.type === 'progress'" class="bl-progress">
                        <span class="bl-label">{{ line.label }}</span>
                        <span class="bl-bar">{{ line.text }}</span>
                      </span>
                      <span v-else-if="line.type === 'ok'" class="bl-ok">
                        <span class="bl-ok-label">{{ line.label }}</span>
                        <span class="bl-ok-badge">[ OK ]</span>
                      </span>
                      <span v-else-if="line.type === 'success'" class="bl-success">{{ line.text }}</span>
                      <span v-else class="bl-normal">{{ line.text }}</span>
                    </div>
                  </div>

                  <div class="big-scanlines"></div>
                  <div class="big-glare"></div>
                </div>

                <div class="big-bezel-foot">
                  <div class="bbf-dot"></div>
                  <div class="bbf-lines">
                    <div class="bbf-line"></div>
                    <div class="bbf-line"></div>
                    <div class="bbf-line"></div>
                  </div>
                </div>
              </div>

              <!-- Right panel skeleton -->
              <div class="big-right">
                <div class="big-voice"></div>
                <div class="big-actions">
                  <div class="big-abtn" style="background:#dc2626;border-color:#7f1d1d">EXIT</div>
                  <div class="big-abtn" style="background:#2563eb;border-color:#1e3a8a">PROFIL</div>
                </div>
                <div class="big-dpad">
                  <div class="dpad-h"></div>
                  <div class="dpad-v"></div>
                  <div class="dpad-c"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Hinge -->
          <div class="big-hinge">
            <div class="bh-s"></div>
            <div class="bh-l"></div>
            <div class="bh-s"></div>
          </div>
        </div>

        <!-- Landing glow under device -->
        <div class="landing-glow" :class="{ active: phase >= 4 }"></div>
      </div>

    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// ─── State ───────────────────────────────────────────
// phase 0 = black stage visible, mini pokédex idle
// phase 1 = mini starts 3D flip
// phase 2 = flash + shockwave
// phase 3 = big pokédex unfolds
// phase 4 = big pokédex landed, boot sequence runs
// phase 5 = navigate away
const phase       = ref(0);
const miniText    = ref('CONNEXION...');
const visibleLines = ref(0);

// ─── Boot sequence content ────────────────────────────
const bootLines = [
  { type: 'header',   text: 'POKÉDEX OS  v3.1.0' },
  { type: 'normal',   text: '' },
  { type: 'progress', label: 'CPU...  ', text: '████████████  100%' },
  { type: 'progress', label: 'RAM...  ', text: '████████████  100%' },
  { type: 'normal',   text: '' },
  { type: 'ok',       label: 'BASE DE DONNÉES  ', text: '' },
  { type: 'ok',       label: 'RÉSEAU POKÉMON   ', text: '' },
  { type: 'ok',       label: 'CAPTEUR GPS      ', text: '' },
  { type: 'normal',   text: '' },
  { type: 'success',  text: '▶  BIENVENUE, DRESSEUR !' },
];

// ─── Particle styles (pre-computed) ──────────────────
function particleStyle(i) {
  const angle = (i / 12) * 360;
  const dist  = 120 + (i % 3) * 40;
  const size  = 4 + (i % 4) * 2;
  const delay = (i % 4) * 30;
  return {
    '--angle':  `${angle}deg`,
    '--dist':   `${dist}px`,
    '--size':   `${size}px`,
    '--delay':  `${delay}ms`,
  };
}

// ─── Timeline ─────────────────────────────────────────
onMounted(() => {
  /*
    0ms    — phase 0: mini idle, text blinks
    80ms   — mini text changes to "DÉCONNEXION..."
    300ms  — phase 1: 3D flip starts
    850ms  — phase 2: flash + rings + particles
    950ms  — phase 3: big pokédex unfolds
    1550ms — phase 4: big device landed, boot starts
    1600ms — boot lines appear one by one (every 90ms)
    2800ms — navigate
  */

  setTimeout(() => { miniText.value = 'TRANSFERT...'; }, 80);
  setTimeout(() => { phase.value = 1; }, 300);
  setTimeout(() => { phase.value = 2; }, 850);
  setTimeout(() => { phase.value = 3; }, 980);
  setTimeout(() => {
    phase.value = 4;
    // Stagger boot lines
    bootLines.forEach((_, i) => {
      setTimeout(() => { visibleLines.value = i + 1; }, i * 95);
    });
  }, 1580);
  setTimeout(() => { router.push('/'); }, 2900);
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=VT323&family=Share+Tech+Mono&display=swap');

/* ──────────────────────────────────────────────────────
   PERFORMANCE RULES
   Only transform + opacity are animated = pure GPU
────────────────────────────────────────────────────── */

/* ── STAGE ── */
.stage {
  position: fixed; inset: 0; z-index: 9999;
  background: #060606;
  display: flex; align-items: center; justify-content: center;
  perspective: 1400px;
  overflow: hidden;
  animation: stageIn 0.12s ease forwards;
}
@keyframes stageIn { from { opacity:0 } to { opacity:1 } }

/* ── VOID BG ── */
.void-bg {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at center, #1a0505 0%, #060606 70%);
}
.grid-lines {
  position: absolute; inset: 0;
  background-image:
      linear-gradient(rgba(220,38,38,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(220,38,38,0.04) 1px, transparent 1px);
  background-size: 40px 40px;
  animation: gridDrift 4s linear infinite;
}
@keyframes gridDrift {
  from { transform: translateY(0); }
  to   { transform: translateY(40px); }
}

/* ── FLASH ── */
.flash-overlay {
  position: absolute; inset: 0; z-index: 50;
  background: white;
  opacity: 0; pointer-events: none;
  will-change: opacity;
}
.flash-overlay.fire {
  animation: flashBang 0.55s ease-out forwards;
}
@keyframes flashBang {
  0%   { opacity: 0; }
  8%   { opacity: 0.95; }
  20%  { opacity: 0.6; }
  100% { opacity: 0; }
}

/* ── SHOCKWAVE RINGS ── */
.shockwave {
  position: absolute;
  width: 10px; height: 10px;
  border-radius: 50%;
  border: 3px solid rgba(220,38,38,0.9);
  opacity: 0; pointer-events: none;
  will-change: transform, opacity;
}
.shockwave.fire { animation: shockExpand var(--dur, 0.7s) var(--delay, 0ms) cubic-bezier(0.1,0.5,0.3,1) forwards; }
.ring-1 { --dur: 0.65s; --delay: 0ms;   --max: 320px; }
.ring-2 { --dur: 0.80s; --delay: 80ms;  --max: 480px; border-color: rgba(239,68,68,0.5); }
.ring-3 { --dur: 0.95s; --delay: 160ms; --max: 640px; border-color: rgba(239,68,68,0.25); border-width: 2px; }
@keyframes shockExpand {
  0%   { opacity: 1; transform: scale(1); width: 10px; height: 10px; margin: 0; }
  100% { opacity: 0; transform: scale(1); width: var(--max); height: var(--max); margin: calc(var(--max) / -2); }
}

/* ── PARTICLES ── */
.particles {
  position: absolute;
  width: 0; height: 0;
  z-index: 40; pointer-events: none;
}
.particle {
  position: absolute;
  width: var(--size); height: var(--size);
  border-radius: 50%;
  background: radial-gradient(circle, #fca5a5, #dc2626);
  opacity: 0;
  will-change: transform, opacity;
}
.particles.burst .particle {
  animation: particleFly 0.7s calc(var(--delay)) cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
}
@keyframes particleFly {
  0%   { opacity: 1; transform: rotate(var(--angle)) translateX(0); }
  60%  { opacity: 1; }
  100% { opacity: 0; transform: rotate(var(--angle)) translateX(var(--dist)); }
}

/* ══════════════════════════════════════════════════════
   MINI POKÉDEX
══════════════════════════════════════════════════════ */
.mini-wrap {
  position: absolute;
  z-index: 30;
  transform-style: preserve-3d;
  will-change: transform, opacity;
  /* Start: upright, centered */
  transform: rotateY(0deg) rotateZ(0deg) scale(1);
}

/* Phase 1: The 3D barrel flip away */
.mini-wrap.phase-flip {
  animation: miniFlip3D 0.62s cubic-bezier(0.55, 0.05, 0.9, 0.3) forwards;
}
@keyframes miniFlip3D {
  0%   {
    transform: rotateY(0deg)   rotateZ(0deg)   scale(1)    translateY(0px);
    opacity: 1;
  }
  20%  {
    transform: rotateY(-25deg) rotateZ(-8deg)  scale(0.92) translateY(-12px);
    opacity: 1;
  }
  55%  {
    transform: rotateY(-75deg) rotateZ(-20deg) scale(0.55) translateY(-30px);
    opacity: 0.7;
  }
  /* At 90deg the device is edge-on — invisible. Perfect disappear moment */
  85%  {
    transform: rotateY(-90deg) rotateZ(-28deg) scale(0.2)  translateY(-50px);
    opacity: 0.15;
  }
  100% {
    transform: rotateY(-90deg) rotateZ(-30deg) scale(0.1)  translateY(-60px);
    opacity: 0;
  }
}

/* Phase 2+: fully gone, no lingering */
.mini-wrap.phase-gone {
  opacity: 0;
  pointer-events: none;
}

/* mini device styles */
.mini-device {
  width: clamp(240px, 36vw, 320px);
  background: linear-gradient(155deg, #f87171 0%, #dc2626 45%, #b91c1c 100%);
  border: 4px solid #7f1d1d;
  border-radius: 1.5rem 1.5rem 1.2rem 1.2rem;
  box-shadow:
      0 20px 50px rgba(0,0,0,0.9),
      0 0 0 1px rgba(255,255,255,0.05),
      inset 0 3px 8px rgba(255,255,255,0.18);
  overflow: hidden;
  backface-visibility: hidden;
}
.mini-top {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 16px 10px;
  border-bottom: 3px solid #7f1d1d;
  background: linear-gradient(to bottom, rgba(0,0,0,0.12), transparent);
}
.mini-cam {
  width: 40px; height: 40px; border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #93c5fd, #1d4ed8 70%, #1e3a8a);
  border: 3px solid #1e3a8a;
  box-shadow: 0 0 16px rgba(59,130,246,0.8);
  position: relative; flex-shrink: 0;
}
.mini-shine { position:absolute; top:18%; left:18%; width:34%; height:34%; border-radius:50%; background:rgba(255,255,255,0.75); filter:blur(2px); }
.mini-dot   { position:absolute; top:28%; left:30%; width:14%; height:14%; border-radius:50%; background:white; box-shadow:0 0 5px white; }
.mini-leds  { display:flex; gap:7px; }
.mini-led   { width:12px; height:12px; border-radius:50%; border:2px solid rgba(0,0,0,0.4); }
.mini-led.r { background:radial-gradient(circle at 35% 35%, #f87171, #b91c1c); box-shadow:0 0 8px rgba(239,68,68,1); animation:ledPulse 1.4s ease-in-out infinite; }
.mini-led.y { background:radial-gradient(circle at 35% 35%, #fde047, #ca8a04); }
.mini-led.g { background:radial-gradient(circle at 35% 35%, #86efac, #16a34a); }
.mini-led.r.flicker { animation: ledFlicker 0.08s linear infinite; }
@keyframes ledPulse    { 0%,100%{box-shadow:0 0 6px rgba(239,68,68,0.8)} 50%{box-shadow:0 0 16px rgba(239,68,68,1),0 0 30px rgba(239,68,68,0.4)} }
@keyframes ledFlicker  { 0%,100%{opacity:1} 50%{opacity:0.2} }

.mini-screen-wrap { padding: 10px 14px; }
.mini-screen {
  background: #1a2e1a;
  border: 5px solid #111; border-radius: 3px;
  height: 90px; display: flex; align-items: center; justify-content: center;
  position: relative; overflow: hidden;
  box-shadow: inset 0 0 20px rgba(0,60,0,0.7), 0 0 0 1px #333;
}
.ms-text {
  font-family: 'VT323', monospace;
  font-size: 20px; color: #4ade80; letter-spacing: 0.1em;
  animation: msBlink 0.9s step-end infinite;
  position: relative; z-index: 1;
}
@keyframes msBlink { 0%,100%{opacity:1} 50%{opacity:0.5} }
.ms-scanlines {
  position: absolute; inset: 0;
  background: repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px);
  pointer-events: none;
}
.mini-bottom {
  display: flex; justify-content: center; gap: 14px;
  padding: 8px 14px 12px;
  border-top: 3px solid #7f1d1d;
}
.mb-btn { width: 34px; height: 8px; border-radius: 999px; border: 2px solid; }
.mb-btn.red  { background: #dc2626; border-color: #7f1d1d; }
.mb-btn.blue { background: #2563eb; border-color: #1e3a8a; }

/* Motion blur trail */
.flip-trail {
  position: absolute; inset: 0;
  pointer-events: none; opacity: 0;
}
.phase-flip .flip-trail {
  animation: trailFade 0.62s ease forwards;
  background: linear-gradient(to right, rgba(220,38,38,0.12), transparent);
}
@keyframes trailFade { 0%{opacity:0} 30%{opacity:1} 100%{opacity:0} }

/* ══════════════════════════════════════════════════════
   BIG POKÉDEX
══════════════════════════════════════════════════════ */
.big-wrap {
  position: absolute;
  inset: clamp(8px, 1.5vw, 20px);
  z-index: 20;
  display: flex; flex-direction: column;
  /* Start: edge-on, tiny, hidden */
  transform: rotateY(-90deg) scale(0.05);
  opacity: 0;
  pointer-events: none;
  transform-style: preserve-3d;
  will-change: transform, opacity;
}

/* Phase 3: dramatic unfold from edge */
.big-wrap.phase-unfold {
  animation: bigUnfold 0.72s cubic-bezier(0.34, 1.4, 0.64, 1) forwards;
}
@keyframes bigUnfold {
  0%   { transform: rotateY(-90deg) scale(0.05); opacity: 0; }
  15%  { opacity: 1; }
  65%  { transform: rotateY(6deg) scale(1.03); opacity: 1; }
  82%  { transform: rotateY(-2deg) scale(0.99); }
  100% { transform: rotateY(0deg) scale(1); opacity: 1; }
}

/* Phase 4: settled — enable pointer events */
.big-wrap.phase-landed { pointer-events: auto; }

/* Landing glow */
.landing-glow {
  position: absolute;
  bottom: -30px; left: 10%; right: 10%;
  height: 60px; border-radius: 50%;
  background: radial-gradient(ellipse, rgba(220,38,38,0.5) 0%, transparent 70%);
  opacity: 0; filter: blur(20px);
  will-change: opacity;
}
.landing-glow.active {
  animation: glowIn 0.5s ease forwards;
}
@keyframes glowIn { from{opacity:0} to{opacity:1} }

/* ─── Big device shell ─── */
.big-device {
  flex: 1; display: flex; flex-direction: column;
  background: linear-gradient(160deg, #ef4444 0%, #dc2626 40%, #b91c1c 100%);
  border: 6px solid #7f1d1d; border-radius: 2rem;
  overflow: hidden;
  box-shadow:
      0 40px 100px rgba(0,0,0,0.95),
      inset 0 4px 12px rgba(255,255,255,0.22),
      inset 0 -8px 20px rgba(0,0,0,0.4);
  backface-visibility: hidden;
  position: relative;
}
/* Seam */
.big-device::after {
  content: '';
  position: absolute; left:0; right:0; top:50%;
  height: 5px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.28), transparent);
  pointer-events: none; z-index: 5;
}

/* Top bar */
.big-top {
  flex-shrink: 0;
  display: flex; align-items: center; gap: clamp(8px,1.5vw,20px);
  padding: clamp(8px,1.5vh,16px) clamp(12px,2vw,28px);
  border-bottom: 4px solid #7f1d1d;
  background: linear-gradient(to bottom, rgba(0,0,0,0.14), transparent);
  position: relative; z-index: 10;
}
.big-cam {
  width: clamp(40px,5vw,66px); height: clamp(40px,5vw,66px); border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #93c5fd, #1d4ed8 70%, #1e3a8a);
  border: 4px solid #1e3a8a;
  box-shadow: 0 0 16px rgba(59,130,246,0.5);
  position: relative; flex-shrink: 0;
  transition: box-shadow 0.4s ease;
}
.big-cam.glow {
  box-shadow: 0 0 30px rgba(59,130,246,0.9), 0 0 60px rgba(59,130,246,0.4);
  animation: camPulse 1.5s ease-in-out infinite;
}
@keyframes camPulse {
  0%,100%{ box-shadow:0 0 25px rgba(59,130,246,0.8), 0 0 50px rgba(59,130,246,0.3); }
  50%    { box-shadow:0 0 40px rgba(59,130,246,1),   0 0 80px rgba(59,130,246,0.5); }
}
.big-cam-shine { position:absolute; top:18%; left:18%; width:34%; height:34%; border-radius:50%; background:rgba(255,255,255,0.72); filter:blur(3px); }
.big-cam-dot   { position:absolute; top:28%; left:30%; width:14%; height:14%; border-radius:50%; background:white; box-shadow:0 0 6px white; }
.big-cam-pulse {
  position: absolute; inset: -8px; border-radius: 50%;
  border: 2px solid rgba(59,130,246,0.4);
  animation: camRing 1.5s ease-out infinite;
}
@keyframes camRing {
  0%   { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(1.5); opacity: 0; }
}

.big-leds { display:flex; gap:clamp(4px,0.6vw,9px); margin-bottom:auto; margin-top:2px; }
.big-led  { width:clamp(11px,1.2vw,17px); height:clamp(11px,1.2vw,17px); border-radius:50%; border:2px solid rgba(0,0,0,0.4); }
.big-led.r    { background:radial-gradient(circle at 35% 35%,#4b5563,#374151); } /* off initially */
.big-led.r.on { background:radial-gradient(circle at 35% 35%,#f87171,#b91c1c); box-shadow:0 0 10px rgba(239,68,68,1); animation:ledPulse 2s ease-in-out infinite; }
.big-led.y { background:radial-gradient(circle at 35% 35%,#fde047,#ca8a04); }
.big-led.g { background:radial-gradient(circle at 35% 35%,#86efac,#16a34a); }

.big-stats {
  margin-left: auto;
  background: rgba(0,0,0,0.4); border: 2px solid rgba(0,0,0,0.5);
  border-radius: 999px; padding: 4px 16px;
  font-family: 'VT323', monospace;
  font-size: clamp(14px,1.6vw,22px); color: #fde047;
  letter-spacing: 0.08em;
  opacity: 0; transform: translateY(-6px);
  transition: opacity 0.4s ease 0.2s, transform 0.4s ease 0.2s;
}
.big-stats.visible { opacity: 1; transform: translateY(0); }

/* Body */
.big-body { flex:1; display:flex; overflow:hidden; min-height:0; }

/* Screen panel */
.big-screen-panel { flex:1; display:flex; padding:clamp(8px,1.5vw,20px); gap:0; min-width:0; min-height:0; }
.big-bezel {
  flex:1; display:flex; flex-direction:column;
  background:#d1d5db; border:5px solid #6b7280;
  border-radius:1.2rem 1.2rem 1.2rem 2.8rem;
  box-shadow:inset 0 5px 18px rgba(0,0,0,0.3);
  overflow:hidden; min-height:0;
}
.big-sdots { display:flex; justify-content:center; gap:12px; padding:7px 0 5px; flex-shrink:0; }
.bsd { width:7px; height:7px; border-radius:50%; background:#9ca3af; border:1px solid #6b7280; }

/* THE SCREEN */
.big-screen {
  flex:1;
  background:#0f1f0f;
  border:6px solid #111; margin:0 clamp(8px,1.5vw,16px); border-radius:4px;
  position:relative; overflow:hidden; min-height:0;
  box-shadow:inset 0 0 40px rgba(0,60,0,0.7), 0 0 0 2px #222;
  display:flex; flex-direction:column;
}

/* Power-on horizontal sweep */
.power-sweep {
  position:absolute; inset:0; z-index:15; pointer-events:none;
  background:linear-gradient(to bottom, #4ade80 0%, #4ade80 4px, transparent 4px);
  transform:translateY(-100%);
  will-change:transform;
}
.power-sweep.active {
  animation: sweepDown 0.55s cubic-bezier(0.4, 0, 0.6, 1) forwards;
}
@keyframes sweepDown {
  0%   { transform: translateY(-100%); opacity: 1; }
  85%  { transform: translateY(100%);  opacity: 1; }
  100% { transform: translateY(100%);  opacity: 0; }
}

/* Boot sequence */
.boot-sequence {
  flex:1; padding:clamp(10px,2vh,20px) clamp(10px,2vw,20px);
  display:flex; flex-direction:column; gap:2px;
  overflow:hidden; position:relative; z-index:2;
  opacity:0; transition:opacity 0.1s;
}
.boot-sequence.visible { opacity:1; }

.boot-line {
  font-family: 'Share Tech Mono', monospace;
  font-size: clamp(11px, 1.3vw, 16px);
  line-height: 1.5;
  white-space: nowrap;
  opacity: 0;
  transform: translateX(-8px);
  will-change: opacity, transform;
}
.boot-line.show {
  animation: lineReveal 0.18s ease forwards;
}
@keyframes lineReveal {
  to { opacity:1; transform:translateX(0); }
}

.bl-header  { color:#4ade80; font-size:1.15em; letter-spacing:0.1em; }
.bl-normal  { color:rgba(74,222,128,0.6); }
.bl-progress { display:flex; gap:8px; }
.bl-label   { color:rgba(74,222,128,0.55); }
.bl-bar     { color:#4ade80; }
.bl-ok      { display:flex; justify-content:space-between; width:100%; }
.bl-ok-label{ color:rgba(74,222,128,0.55); }
.bl-ok-badge{ color:#4ade80; animation: okBlink 0.3s ease forwards; }
@keyframes okBlink { from{opacity:0;transform:scale(0.8)} to{opacity:1;transform:scale(1)} }
.bl-success {
  color:#fde047; font-size:1.1em; letter-spacing:0.05em;
  animation: successGlow 1.5s ease-in-out infinite;
}
@keyframes successGlow {
  0%,100%{ text-shadow:0 0 8px rgba(253,224,71,0.5); }
  50%    { text-shadow:0 0 20px rgba(253,224,71,1), 0 0 40px rgba(253,224,71,0.3); }
}

.big-scanlines {
  position:absolute; inset:0; pointer-events:none; z-index:20;
  background:repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px);
}
.big-glare {
  position:absolute; top:0; left:0; width:55%; height:35%;
  background:linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 60%);
  pointer-events:none; z-index:21;
}

.big-bezel-foot {
  flex-shrink:0; display:flex; justify-content:space-between; align-items:center;
  padding:clamp(6px,1vh,12px) clamp(14px,2vw,22px);
}
.bbf-dot { width:clamp(13px,1.5vw,19px); height:clamp(13px,1.5vw,19px); border-radius:50%; background:radial-gradient(circle at 35% 35%,#f87171,#dc2626); border:2px solid #7f1d1d; }
.bbf-lines { display:flex; flex-direction:column; gap:4px; }
.bbf-line { width:clamp(24px,3vw,42px); height:3px; background:#9ca3af; border-radius:2px; }

/* Right panel */
.big-right {
  width:clamp(65px,9.5vw,128px); flex-shrink:0;
  display:flex; flex-direction:column; align-items:center; justify-content:space-around;
  padding:clamp(12px,2vh,24px) clamp(6px,1vw,14px);
  border-left:4px solid rgba(0,0,0,0.2);
  background:linear-gradient(to left, rgba(0,0,0,0.08), transparent);
}
.big-voice {
  width:clamp(44px,5.5vw,70px); height:clamp(44px,5.5vw,70px); border-radius:50%;
  border:3px solid #1c1c1c;
  background:linear-gradient(145deg,#60a5fa,#2563eb);
  box-shadow:0 5px 0 #1e3a8a, inset 0 3px 4px rgba(255,255,255,0.3);
}
.big-actions { display:flex; flex-direction:column; gap:10px; width:100%; }
.big-abtn {
  font-family:'VT323',monospace; font-size:clamp(10px,1.1vw,15px);
  color:white; border:2px solid; border-radius:999px;
  padding:clamp(4px,0.6vh,7px) 4px; text-align:center;
  box-shadow:0 3px 0 rgba(0,0,0,0.4); letter-spacing:0.04em;
}
.big-dpad {
  position:relative; width:clamp(55px,6.5vw,92px); height:clamp(55px,6.5vw,92px);
}
.dpad-h,.dpad-v { position:absolute; background:#374151; border-radius:4px; }
.dpad-h { top:33%; left:0; width:100%; height:34%; }
.dpad-v { top:0; left:33%; width:34%; height:100%; }
.dpad-c { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:30%; height:30%; border-radius:50%; background:#1f2937; z-index:1; }

/* Hinge */
.big-hinge {
  flex-shrink:0; height:clamp(13px,1.8vh,24px);
  background:linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.05));
  display:flex; align-items:center; justify-content:center; gap:40%;
  border-top:3px solid rgba(0,0,0,0.25);
}
.bh-s { width:clamp(9px,1.1vw,13px); height:clamp(9px,1.1vw,13px); border-radius:50%; background:radial-gradient(circle at 35% 35%,#6b7280,#374151); border:2px solid rgba(0,0,0,0.5); }
.bh-l { flex:1; max-width:180px; height:2px; background:rgba(0,0,0,0.25); }

/* ─── Responsive ─── */
@media (max-width:600px) {
  .big-right    { display:none; }
  .big-bezel    { border-radius:10px; }
  .mini-device  { width:220px; }
}
@media (max-width:400px) {
  .mini-device  { width:180px; }
  .boot-line    { font-size:10px; }
}
</style>