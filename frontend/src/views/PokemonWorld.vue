<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// ─────────────────────────────────────────────────────────────
// ⚙️  API
// ─────────────────────────────────────────────────────────────
const API = 'http://localhost:3000/api'

function getToken() {
  return localStorage.getItem('token')
}

async function ensureTrainerExists() {
  const token = getToken()
  if (!token) return false
  try {
    const res = await fetch(`${API}/trainer`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return res.ok
  } catch {
    return false
  }
}

async function apiMarkSeen(pokemonId) {
  const token = getToken()
  if (!token) return
  if (!await ensureTrainerExists()) return
  try {
    await fetch(`${API}/trainer/mark`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ pokemonId, isCaptured: false })
    })
  } catch (e) { console.warn('[World] apiMarkSeen failed:', e) }
}

async function apiMarkCaught(pokemonId) {
  const token = getToken()
  if (!token) return
  if (!await ensureTrainerExists()) return
  try {
    await fetch(`${API}/trainer/mark`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ pokemonId, isCaptured: true })
    })
  } catch (e) { console.warn('[World] apiMarkCaught failed:', e) }
}

// ─── GAME CONSTANTS ──────────────────────────────────────────
const TS = 48, CH = 16, SPD = 200, RDIST = 3
const INTERACT = TS * 1.8
const BLOCK = [false, true, false]

let VW = window.innerWidth
let VH = window.innerHeight

function rng(x, y) {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263)) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177) | 0
  return ((h ^ (h >>> 16)) >>> 0) / 0xffffffff
}
const CK = (cx, cy) => cx + '|' + cy

function tileType(wx, wy) {
  const r = rng(wx, wy)
  return r < 0.18 ? 1 : r < 0.26 ? 2 : 0
}
function findSpawn() {
  for (let ty = 5; ty < 60; ty++)
    for (let tx = 5; tx < 60; tx++)
      if (!BLOCK[tileType(tx, ty)])
        return { px: tx * TS + TS / 2, py: ty * TS + TS / 2 }
  return { px: 8 * TS, py: 8 * TS }
}

// ─── CHUNK GENERATION ────────────────────────────────────────
function genChunk(cx, cy) {
  const tiles = [], cases = []
  for (let ty = 0; ty < CH; ty++) {
    tiles[ty] = new Uint8Array(CH)
    for (let tx = 0; tx < CH; tx++) {
      const wx = cx * CH + tx, wy = cy * CH + ty
      const t = tileType(wx, wy)
      tiles[ty][tx] = t
      if (!BLOCK[t] && rng(wx * 7 + 99991, wy * 7 + 99991) < 0.007)
        cases.push({ id: wx + ':' + wy, wx, wy })
    }
  }
  return { tiles, cases }
}
function getTile(chunks, tx, ty) {
  const cx = Math.floor(tx / CH), cy = Math.floor(ty / CH)
  const lx = ((tx % CH) + CH) % CH, ly = ((ty % CH) + CH) % CH
  return chunks.get(CK(cx, cy))?.tiles[ly]?.[lx] ?? 0
}
function isBlocked(chunks, px, py) {
  return BLOCK[getTile(chunks, Math.floor(px / TS), Math.floor(py / TS))]
}

// ─── POKEMON DATA ─────────────────────────────────────────────
const PKM = [
  { id: 16,  n: 'Roucool',    r: 'Commun',      c: '#8888b0', w: .14 },
  { id: 19,  n: 'Rattatac',   r: 'Commun',      c: '#a09070', w: .13 },
  { id: 10,  n: 'Chenipan',   r: 'Commun',      c: '#60a040', w: .12 },
  { id: 41,  n: 'Nosferapti', r: 'Commun',      c: '#705880', w: .11 },
  { id: 52,  n: 'Miaouss',    r: 'Commun',      c: '#b0a088', w: .10 },
  { id: 25,  n: 'Pikachu',    r: 'Rare',        c: '#f0c030', w: .09 },
  { id: 133, n: 'Évoli',      r: 'Rare',        c: '#c09060', w: .08 },
  { id: 58,  n: 'Caninos',    r: 'Rare',        c: '#e06820', w: .07 },
  { id: 6,   n: 'Dracaufeu',  r: 'Épique',      c: '#f06020', w: .03 },
  { id: 9,   n: 'Tortank',    r: 'Épique',      c: '#3870f0', w: .025 },
  { id: 3,   n: 'Florizarre', r: 'Épique',      c: '#38a038', w: .025 },
  { id: 150, n: 'Mewtwo',     r: 'Légendaire',  c: '#c070f0', w: .013 },
  { id: 151, n: 'Mew',        r: 'Légendaire',  c: '#f080c0', w: .007 },
  { id: 145, n: 'Électhor',   r: 'Légendaire',  c: '#f0e030', w: .003 },
  { id: 144, n: 'Artikodin',  r: 'Légendaire',  c: '#70c0f0', w: .003 },
]
const RC = { Commun: '#909090', Rare: '#3888ff', Épique: '#9030f0', Légendaire: '#ff9830' }

const _seenThisSession   = new Set()
const _caughtThisSession = new Set()

function pickRandom(excludeIds) {
  const pool = excludeIds ? PKM.filter(p => !excludeIds.has(p.id)) : PKM
  const src = pool.length ? pool : PKM
  const total = src.reduce((s, p) => s + p.w, 0)
  let r = Math.random() * total
  for (const p of src) { r -= p.w; if (r < 0) return p }
  return src[0]
}

// ─── DRAWING ─────────────────────────────────────────────────
// Hero sprite — hardcoded default (Ash-style trainer from PokeAPI)
let heroImage = null
const defaultHeroUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/1.png'

function drawGrassBase(ctx, sx, sy) {
  ctx.fillStyle = '#4a7a34'
  ctx.fillRect(sx, sy, TS, TS)
  ctx.strokeStyle = 'rgba(0,0,0,0.04)'
  ctx.lineWidth = 0.5
  ctx.strokeRect(sx, sy, TS, TS)
  ctx.fillStyle = '#3d6828'
  ;[[5, TS - 9, 2, 7], [11, TS - 12, 2, 9], [TS - 7, TS - 8, 2, 6], [TS - 15, TS - 10, 2, 8]]
      .forEach(([dx, dy, w, h]) => ctx.fillRect(sx + dx, sy + dy, w, h))
}

function drawTile(ctx, sx, sy, t) {
  drawGrassBase(ctx, sx, sy)
  if (t === 1) {
    ctx.fillStyle = '#5a3010'
    ctx.fillRect(sx + TS / 2 - 4, sy + TS / 2 + 4, 8, TS / 2 - 6)
    ;[{ r: 19, y: .36, c: '#1d5018' }, { r: 13, y: .28, c: '#2a6a28' }, { r: 9, y: .22, c: '#368038' }]
        .forEach(({ r, y, c }) => {
          ctx.fillStyle = c; ctx.beginPath()
          ctx.arc(sx + TS / 2, sy + TS * y, r, 0, Math.PI * 2); ctx.fill()
        })
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.beginPath(); ctx.arc(sx + TS / 2 - 5, sy + TS * 0.19, 6, 0, Math.PI * 2); ctx.fill()
  } else if (t === 2) {
    const px = sx + TS / 2, py = sy + TS / 2
    ctx.fillStyle = '#ff7777'
    for (let i = 0; i < 5; i++) {
      const a = i / 5 * Math.PI * 2
      ctx.beginPath(); ctx.arc(px + Math.cos(a) * 7, py + Math.sin(a) * 7, 4, 0, Math.PI * 2); ctx.fill()
    }
    ctx.fillStyle = '#ffe020'
    ctx.beginPath(); ctx.arc(px, py, 3.5, 0, Math.PI * 2); ctx.fill()
  }
}

function drawCase(ctx, sx, sy, glow) {
  if (glow) { ctx.shadowColor = '#fde047'; ctx.shadowBlur = 26 }
  ctx.fillStyle = '#7a5c10'; ctx.fillRect(sx + 7, sy + 16, TS - 14, TS - 22)
  ctx.fillStyle = '#9a7418'; ctx.fillRect(sx + 7, sy + 11, TS - 14, 11)
  ctx.fillStyle = '#c0a030'
  ;[[9, 13], [TS - 9, 13], [9, TS - 9], [TS - 9, TS - 9]].forEach(([ox, oy]) => {
    ctx.beginPath(); ctx.arc(sx + ox, sy + oy, 2.5, 0, Math.PI * 2); ctx.fill()
  })
  ctx.strokeStyle = '#5a4010'; ctx.lineWidth = 3
  ctx.beginPath(); ctx.arc(sx + TS / 2, sy + 11, 8, Math.PI, 0); ctx.stroke()
  ctx.fillStyle = '#d4a020'; ctx.fillRect(sx + TS / 2 - 5, sy + TS / 2 - 4, 10, 8)
  ctx.fillStyle = '#ffe040'; ctx.fillRect(sx + TS / 2 - 3, sy + TS / 2 - 2, 6, 4)
  if (glow) ctx.shadowBlur = 0
}

function drawPlayer(ctx, px, py) {
  ctx.fillStyle = 'rgba(0,0,0,0.18)'
  ctx.beginPath(); ctx.ellipse(px, py + 17, 13, 5, 0, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#dc2626'; ctx.fillRect(px - 13, py - 19, 26, 16)
  ctx.fillStyle = '#b91c1c'; ctx.fillRect(px - 18, py - 7, 36, 5)
  ctx.fillStyle = '#fff'; ctx.fillRect(px - 5, py - 17, 10, 6)
  ctx.fillStyle = '#f5cba0'
  ctx.beginPath(); ctx.arc(px, py + 4, 13, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#1a1a1a'
  ctx.beginPath(); ctx.arc(px - 4, py + 2, 2.5, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(px + 4, py + 2, 2.5, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = '#5a2800'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.arc(px, py + 6, 5, .2, Math.PI - .2); ctx.stroke()
}

function renderWorld(ctx, g) {
  ctx.clearRect(0, 0, VW, VH)
  const ox = VW / 2 - g.px, oy = VH / 2 - g.py
  const sx = Math.floor((g.px - VW / 2) / TS) - 1, ex = Math.ceil((g.px + VW / 2) / TS) + 1
  const sy2 = Math.floor((g.py - VH / 2) / TS) - 1, ey = Math.ceil((g.py + VH / 2) / TS) + 1
  for (let ty = sy2; ty <= ey; ty++) for (let tx = sx; tx <= ex; tx++)
    drawTile(ctx, tx * TS + ox, ty * TS + oy, getTile(g.chunks, tx, ty))
  for (const ch of g.chunks.values()) for (const c of ch.cases) {
    if (g.opened.has(c.id)) continue
    const csX = c.wx * TS + ox, csY = c.wy * TS + oy
    if (csX < -TS || csX > VW + TS || csY < -TS || csY > VH + TS) continue
    drawCase(ctx, csX, csY, g.nearby?.id === c.id)
  }
  drawPlayer(ctx, VW / 2, VH / 2)
  // Minimap
  const ms = 70, mmx = VW - ms - 10, mmy = 10
  ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(mmx, mmy, ms, ms)
  ctx.strokeStyle = '#fde047'; ctx.lineWidth = 1.5; ctx.strokeRect(mmx, mmy, ms, ms)
  ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '8px monospace'
  ctx.textAlign = 'center'; ctx.textBaseline = 'top'
  ctx.fillText('N', mmx + ms / 2, mmy + 2)
  ctx.fillStyle = '#ef4444'
  ctx.beginPath(); ctx.arc(mmx + ms / 2, mmy + ms / 2, 4, 0, Math.PI * 2); ctx.fill()
  for (const ch of g.chunks.values()) for (const c of ch.cases) {
    if (g.opened.has(c.id)) continue
    const rx = (c.wx * TS - g.px) / (TS * 4) * ms / 2
    const ry = (c.wy * TS - g.py) / (TS * 4) * ms / 2
    const mx = mmx + ms / 2 + rx, my = mmy + ms / 2 + ry
    if (mx < mmx + 4 || mx > mmx + ms - 4 || my < mmy + 4 || my > mmy + ms - 4) continue
    ctx.fillStyle = '#fde047'; ctx.fillRect(mx - 2, my - 2, 4, 4)
  }
}

// ─── REACTIVE STATE ──────────────────────────────────────────
const canvasRef        = ref(null)
const nearby           = ref(null)
const caseData         = ref(null)
const caseScrolled     = ref(false)
const caseRevealed     = ref(false)
const pos              = ref({ x: 0, y: 0 })
const noProfileWarning = ref(false)

// ── TRANSITION STATE ──────────────────────────────────────────
// 'idle' | 'pullout' | 'navigate'
const transitionState  = ref('idle')
const transitionTarget = ref('/')

// Toast notification
const toast    = ref(null)
let toastTimer = null

function showToast(text, color = '#86efac') {
  clearTimeout(toastTimer)
  toast.value = { text, color }
  toastTimer = setTimeout(() => toast.value = null, 2800)
}

// ─── GAME STATE ──────────────────────────────────────────────
const { px: spawnX, py: spawnY } = findSpawn()
const G = {
  px: spawnX, py: spawnY,
  chunks: new Map(), opened: new Set(),
  keys: {}, jx: 0, jy: 0,
  nearby: null, lastTime: 0, _uit: 0
}
let rafId = null, _caseRef = null, revT1 = null, revT2 = null

// ─── NAVIGATION WITH TRANSITION ─────────────────────────────
function navigateTo(path) {
  transitionTarget.value = path
  transitionState.value = 'pullout'
  setTimeout(() => {
    // Passer le paramètre from=world pour déclencher l'animation d'entrée dans le Pokédex
    const dest = path === '/' ? { path: '/', query: { from: 'world' } } : path
    router.push(dest)
  }, 1600)
}

// ─── CASE + API LOGIC ────────────────────────────────────────
function tryOpenNearby() {
  if (!_caseRef && G.nearby && !G.opened.has(G.nearby.id)) startOpen(G.nearby)
}

async function startOpen(c) {
  G.opened.add(c.id); G.nearby = null; nearby.value = null

  const hasProfile = await ensureTrainerExists()
  if (!hasProfile) {
    noProfileWarning.value = true
    setTimeout(() => noProfileWarning.value = false, 4000)
  }

  const winner = pickRandom(_seenThisSession)
  const wi = 20 + Math.floor(Math.random() * 5)
  const reel = Array.from({ length: 30 }, (_, i) => i === wi ? winner : pickRandom())

  for (const p of reel) {
    if (!_seenThisSession.has(p.id)) {
      _seenThisSession.add(p.id)
      apiMarkSeen(p.id)
    }
  }

  _caseRef = { reel, winnerIdx: wi, winner, finalTX: -(wi * 130 + 65 - 360) }
  caseScrolled.value = false; caseRevealed.value = false
  caseData.value = _caseRef
  clearTimeout(revT1); clearTimeout(revT2)
  revT1 = setTimeout(() => caseScrolled.value = true, 80)
  revT2 = setTimeout(() => caseRevealed.value = true, 4700)
}

function onDone() {
  if (_caseRef?.winner) {
    const p = _caseRef.winner
    const isNew = !_caughtThisSession.has(p.id)
    if (isNew) {
      _caughtThisSession.add(p.id)
      apiMarkCaught(p.id)
    }
    showToast(
        isNew ? `✅ ${p.n} ajouté à ta collection !` : `📖 ${p.n} est déjà dans ton Pokédex`,
        isNew ? '#86efac' : '#93c5fd'
    )
  }
  caseData.value = null; _caseRef = null
  caseScrolled.value = false; caseRevealed.value = false
}

// ─── VIRTUAL JOYSTICK ────────────────────────────────────────
const joyActive  = ref(false)
const joyBasePos = ref({ x: 0, y: 0 })
const joyOffset  = ref({ x: 0, y: 0 })
const JOY_R = 52

function onJoyStart(e) {
  e.preventDefault()
  const t = e.touches[0]
  joyActive.value = true
  joyBasePos.value = { x: t.clientX, y: t.clientY }
  joyOffset.value = { x: 0, y: 0 }
  G.jx = 0; G.jy = 0
}
function onJoyMove(e) {
  if (!joyActive.value) return
  e.preventDefault()
  const t = e.touches[0]
  let dx = t.clientX - joyBasePos.value.x
  let dy = t.clientY - joyBasePos.value.y
  const dist = Math.hypot(dx, dy)
  if (dist > JOY_R) { dx = dx / dist * JOY_R; dy = dy / dist * JOY_R }
  joyOffset.value = { x: dx, y: dy }
  G.jx = dx / JOY_R; G.jy = dy / JOY_R
}
function onJoyEnd(e) {
  e.preventDefault()
  joyActive.value = false; joyOffset.value = { x: 0, y: 0 }
  G.jx = 0; G.jy = 0
}

// ─── LISTENERS (module scope for cleanup access) ─────────────
let _onResize = null, _dn = null, _up = null

// ─── MOUNT ───────────────────────────────────────────────────
onMounted(() => {
  const heroImg = new Image(); heroImg.crossOrigin = 'anonymous'
  heroImg.onload = () => { heroImage = heroImg }
  heroImg.src = defaultHeroUrl;(function loadDefaultHero() {
    const img = new Image(); img.crossOrigin = 'anonymous'
    img.onload = () => { heroImage = img }
    img.src = defaultHeroUrl
  })()
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')

  _onResize = () => {
    VW = window.innerWidth; VH = window.innerHeight
    canvas.width = VW; canvas.height = VH
  }
  _onResize()
  window.addEventListener('resize', _onResize)

  _dn = e => {
    G.keys[e.code] = true
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code))
      e.preventDefault()
    if (e.code === 'KeyE') tryOpenNearby()
  }
  _up = e => { G.keys[e.code] = false }
  window.addEventListener('keydown', _dn)
  window.addEventListener('keyup', _up)

  const loop = ts => {
    const dt = Math.min((ts - (G.lastTime || ts)) / 1000, .05)
    G.lastTime = ts
    if (transitionState.value === 'idle') {
      let dx = G.jx, dy = G.jy
      if (G.keys.ArrowLeft  || G.keys.KeyA) dx -= 1
      if (G.keys.ArrowRight || G.keys.KeyD) dx += 1
      if (G.keys.ArrowUp    || G.keys.KeyW) dy -= 1
      if (G.keys.ArrowDown  || G.keys.KeyS) dy += 1
      const mag = Math.hypot(dx, dy)
      if (mag > 1) { dx /= mag; dy /= mag }
      const spd = SPD * dt
      const npx = G.px + dx * spd, npy = G.py + dy * spd
      if (!isBlocked(G.chunks, npx + 14, G.py) && !isBlocked(G.chunks, npx - 14, G.py)) G.px = npx
      if (!isBlocked(G.chunks, G.px, npy + 14) && !isBlocked(G.chunks, G.px, npy - 14)) G.py = npy
    }
    const pcx = Math.floor(G.px / (CH * TS)), pcy = Math.floor(G.py / (CH * TS))
    for (let cy = pcy - RDIST; cy <= pcy + RDIST; cy++)
      for (let cx = pcx - RDIST; cx <= pcx + RDIST; cx++) {
        const k = CK(cx, cy); if (!G.chunks.has(k)) G.chunks.set(k, genChunk(cx, cy))
      }
    for (const k of G.chunks.keys()) {
      const [cx, cy] = k.split('|').map(Number)
      if (Math.abs(cx - pcx) > RDIST + 1 || Math.abs(cy - pcy) > RDIST + 1) G.chunks.delete(k)
    }
    let nearest = null, minD = INTERACT
    for (const ch of G.chunks.values()) for (const c of ch.cases) {
      if (G.opened.has(c.id)) continue
      const d = Math.hypot(G.px - (c.wx * TS + TS / 2), G.py - (c.wy * TS + TS / 2))
      if (d < minD) { minD = d; nearest = c }
    }
    G.nearby = nearest
    renderWorld(ctx, G)
    G._uit += dt
    if (G._uit > .1) {
      G._uit = 0
      nearby.value = nearest
      pos.value = { x: Math.round(G.px / TS), y: Math.round(G.py / TS) }
    }
    rafId = requestAnimationFrame(loop)
  }
  rafId = requestAnimationFrame(loop)
})

onUnmounted(() => {
  cancelAnimationFrame(rafId)
  clearTimeout(revT1); clearTimeout(revT2); clearTimeout(toastTimer)
  if (_onResize) window.removeEventListener('resize', _onResize)
  if (_dn) window.removeEventListener('keydown', _dn)
  if (_up) window.removeEventListener('keyup', _up)
})
</script>

<template>
  <div class="pw-root">
    <canvas ref="canvasRef" class="pw-canvas" />

    <!-- HUD top-left -->
    <div class="pw-hud-tl">
      <span class="hud-pos">📍 {{ pos.x }}, {{ pos.y }}</span>
    </div>

    <!-- Top-right nav buttons — séparés pour éviter le chevauchement avec la minimap -->
    <div class="pw-hud-tr">
      <button class="pw-btn" @click="navigateTo('/')">POKÉDEX</button>
      <button class="pw-btn" @click="navigateTo('/profile')">PROFIL</button>
    </div>

    <!-- Keyboard hint (desktop only) -->
    <div class="pw-kb-hint">WASD / ↑←↓→ · [E] ouvrir une mallette</div>

    <!-- Avertissement si pas de profil trainer -->
    <Transition name="toast">
      <div v-if="noProfileWarning" class="pw-toast" style="border-color:#f87171;color:#f87171">
        ⚠️ Créez d'abord votre profil dresseur pour sauvegarder votre progression !
      </div>
    </Transition>

    <!-- Nearby prompt -->
    <Transition name="prompt">
      <div v-if="nearby && !caseData" class="pw-case-prompt">
        [E] Ouvrir la mallette
      </div>
    </Transition>

    <!-- Toast notification -->
    <Transition name="toast">
      <div v-if="toast" class="pw-toast" :style="{ borderColor: toast.color, color: toast.color }">
        {{ toast.text }}
      </div>
    </Transition>

    <!-- Virtual Joystick (mobile) -->
    <div
        class="pw-joy-zone"
        @touchstart.prevent="onJoyStart"
        @touchmove.prevent="onJoyMove"
        @touchend.prevent="onJoyEnd"
    >
      <div class="pw-joy-base" :class="{ active: joyActive }">
        <div class="pw-joy-knob" :style="`transform:translate(${joyOffset.x}px,${joyOffset.y}px)`" />
      </div>
    </div>

    <!-- Mobile action buttons -->
    <div class="pw-mobile-btns">
      <button class="pw-mob-poke" @click="navigateTo('/')">📖</button>
      <button
          class="pw-mob-action"
          @touchstart.prevent="tryOpenNearby"
          @click="tryOpenNearby"
      >E</button>
    </div>

    <!-- ══════════════════════════════════════════════
         ANIMATION POKÉBALL THROW — transition vers Pokédex
    ══════════════════════════════════════════════ -->
    <div v-if="transitionState === 'pullout'" class="pb-transition-overlay">
      <!-- Fond qui s'assombrit -->
      <div class="pb-bg"></div>

      <!-- La Pokéball qui vole -->
      <div class="pb-ball-wrap">
        <div class="pb-ball">
          <div class="pb-ball-top"></div>
          <div class="pb-ball-mid"></div>
          <div class="pb-ball-bot"></div>
          <div class="pb-ball-btn"></div>
        </div>
        <!-- Trainée de lumière -->
        <div class="pb-trail"></div>
      </div>

      <!-- Explosion de lumière au centre -->
      <div class="pb-burst">
        <div class="pb-burst-ring r1"></div>
        <div class="pb-burst-ring r2"></div>
        <div class="pb-burst-ring r3"></div>
        <div class="pb-burst-rays"></div>
      </div>

      <!-- Flash blanc final -->
      <div class="pb-flash"></div>

      <!-- Texte rétro -->
      <div class="pb-text">POKÉDEX...</div>
    </div>

    <!-- ── CASE OPENING ── -->
    <Transition name="fade">
      <div v-if="caseData" class="pw-overlay co-bg">
        <div class="co-title">══ OUVERTURE ══</div>
        <div class="co-reel-wrap">
          <div class="co-fade-l" /><div class="co-fade-r" />
          <div class="co-line" />
          <div
              class="co-reel"
              :style="{
              transform: caseScrolled ? `translateX(${caseData.finalTX}px)` : 'translateX(0px)',
              transition: caseScrolled ? 'transform 4.2s cubic-bezier(0.05,0.9,0.25,1)' : 'none'
            }"
          >
            <div
                v-for="(p, i) in caseData.reel"
                :key="i"
                class="co-item"
                :style="{ borderColor: RC[p.r] || '#555', background: p.c + '14' }"
            >
              <img
                  :src="`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`"
                  class="co-sprite"
                  :alt="p.n"
              />
              <div class="co-iname" :style="{ color: RC[p.r] }">{{ p.n }}</div>
              <div class="co-irarity" :style="{ color: RC[p.r], opacity: .7 }">{{ p.r }}</div>
            </div>
          </div>
        </div>
        <Transition name="pop">
          <div v-if="caseRevealed" class="co-result">
            <div class="co-rlabel">VOUS AVEZ OBTENU</div>
            <img
                :src="`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${caseData.winner.id}.png`"
                class="co-rbig"
                :alt="caseData.winner.n"
            />
            <div class="co-rname" :style="{ color: RC[caseData.winner.r] }">{{ caseData.winner.n }}</div>
            <div class="co-rrarity" :style="{ color: RC[caseData.winner.r] }">✦ {{ caseData.winner.r }} ✦</div>
            <div class="co-sub-actions">
              <button class="co-done" @click="onDone">CONTINUER →</button>
              <button class="co-go-pokedex" @click="onDone(); navigateTo('/')">VOIR MON POKÉDEX</button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');

.pw-root {
  position: fixed;
  inset: 0;
  width: 100dvw;
  height: 100dvh;
  background: #000;
  overflow: hidden;
  user-select: none;
  font-family: 'VT323', monospace;
  touch-action: none;
}
.pw-canvas {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
}

/* ── HUD TL ── */
.pw-hud-tl {
  position: absolute; top: 10px; left: 10px;
  pointer-events: none;
  font-size: clamp(13px, 2.2vw, 18px);
  color: rgba(255,255,255,.7);
  text-shadow: 1px 1px 4px rgba(0,0,0,.9);
}

/* ── HUD TR — décalé pour ne pas toucher la minimap (minimap = 70px + 10px marge = 90px depuis droite) ── */
.pw-hud-tr {
  position: absolute;
  top: 10px;
  /* La minimap fait 70px + 10px de marge = on laisse 90px de plus */
  right: 90px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: flex-end;
  /* On s'assure de ne pas dépasser vers la minimap */
  max-width: calc(100vw - 200px);
}
.pw-btn {
  font-family: 'VT323', monospace;
  font-size: clamp(12px, 1.8vw, 17px);
  color: #fde047; background: rgba(0,0,0,.78);
  border: 2px solid #fde047; border-radius: 6px;
  padding: 4px 10px; cursor: pointer; letter-spacing: 1px;
  transition: background .15s;
  white-space: nowrap;
}
.pw-btn:hover { background: rgba(253,224,71,.14); }

/* ── KB HINT ── */
.pw-kb-hint {
  position: absolute; bottom: 10px; left: 10px;
  font-family: monospace; font-size: 11px;
  color: rgba(255,255,255,.3); pointer-events: none;
}
@media (max-width: 768px) { .pw-kb-hint { display: none; } }

/* ── CASE PROMPT ── */
.pw-case-prompt {
  position: absolute;
  bottom: clamp(90px, 15vh, 130px);
  left: 50%; transform: translateX(-50%);
  font-size: clamp(16px, 3vw, 24px);
  color: #fde047; background: rgba(0,0,0,.87);
  border: 2px solid #fde047; border-radius: 8px;
  padding: 6px 20px; white-space: nowrap;
  box-shadow: 0 0 20px rgba(253,224,71,.2);
}
.prompt-enter-active, .prompt-leave-active { transition: opacity .2s, transform .2s; }
.prompt-enter-from, .prompt-leave-to { opacity: 0; transform: translateX(-50%) translateY(6px); }

/* ── TOAST ── */
.pw-toast {
  position: absolute;
  bottom: clamp(90px, 15vh, 130px);
  left: 50%; transform: translateX(-50%);
  font-size: clamp(14px, 2.5vw, 20px);
  background: rgba(0,0,0,.9);
  border: 2px solid;
  border-radius: 8px;
  padding: 8px 22px;
  white-space: nowrap;
  font-family: 'VT323', monospace;
  pointer-events: none;
  max-width: 90vw;
  text-align: center;
}
.toast-enter-active, .toast-leave-active { transition: opacity .3s, transform .3s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(8px); }

/* ── VIRTUAL JOYSTICK ── */
.pw-joy-zone {
  display: none;
  position: absolute;
  bottom: clamp(16px, 4vh, 40px);
  left: clamp(16px, 4vw, 40px);
  width: 120px; height: 120px;
}
.pw-joy-base {
  width: 100%; height: 100%;
  border-radius: 50%;
  background: rgba(255,255,255,.08);
  border: 2px solid rgba(255,255,255,.22);
  display: flex; align-items: center; justify-content: center;
  transition: background .15s;
}
.pw-joy-base.active { background: rgba(255,255,255,.16); }
.pw-joy-knob {
  width: 48px; height: 48px;
  border-radius: 50%;
  background: rgba(253,224,71,.7);
  border: 2px solid #fde047;
  pointer-events: none;
  will-change: transform;
}

/* ── MOBILE BUTTONS ── */
.pw-mobile-btns {
  display: none;
  position: absolute;
  bottom: clamp(16px, 4vh, 40px);
  right: clamp(16px, 4vw, 40px);
  flex-direction: column; align-items: flex-end; gap: 12px;
}
.pw-mob-action {
  width: 72px; height: 72px; border-radius: 50%;
  background: rgba(253,224,71,.12);
  border: 3px solid #fde047;
  color: #fde047; font-family: 'VT323',monospace; font-size: 30px;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 16px rgba(253,224,71,.2);
  -webkit-tap-highlight-color: transparent;
}
.pw-mob-poke {
  width: 54px; height: 54px; border-radius: 50%;
  background: rgba(0,0,0,.7); border: 2px solid #4ade80;
  font-size: 22px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  -webkit-tap-highlight-color: transparent;
}

@media (max-width: 900px), (pointer: coarse) {
  .pw-joy-zone    { display: flex; }
  .pw-mobile-btns { display: flex; }
  /* Sur mobile, HUD TR encore plus décalé */
  .pw-hud-tr { right: 96px; }
}

/* ═══════════════════════════════════════════════════════════════
   🎬 POKÉBALL THROW TRANSITION — inspiré des jeux Pokémon GB/GBA
   Séquence: pokéball vole du coin → explose au centre → flash blanc
════════════════════════════════════════════════════════════════ */
.pb-transition-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  overflow: hidden;
}

/* Fond s'assombrissant */
.pb-bg {
  position: absolute;
  inset: 0;
  background: #000;
  animation: pbBgFade 1.6s ease forwards;
}
@keyframes pbBgFade {
  0%   { opacity: 0; }
  30%  { opacity: 0.4; }
  75%  { opacity: 0.7; }
  90%  { opacity: 0; }
  100% { opacity: 0; }
}

/* ── La Pokéball ── */
.pb-ball-wrap {
  position: absolute;
  bottom: 15%;
  left: 10%;
  animation: pbThrow 0.7s cubic-bezier(0.22, 0.61, 0.36, 1) 0.1s forwards;
  transform: translate(0, 0) rotate(0deg);
}
@keyframes pbThrow {
  0%   { transform: translate(0,0) rotate(0deg); opacity: 1; }
  70%  { transform: translate(35vw, -40vh) rotate(540deg); opacity: 1; }
  85%  { transform: translate(42vw, -46vh) rotate(650deg); opacity: 1; }
  100% { transform: translate(43vw, -47vh) rotate(720deg); opacity: 0; }
}

.pb-ball {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  position: relative;
  overflow: hidden;
  border: 3px solid #111;
  box-shadow: 0 0 20px rgba(255,255,255,0.4), inset -6px -4px 0 rgba(0,0,0,0.2);
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.6));
}
.pb-ball-top {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 50%;
  background: radial-gradient(circle at 35% 35%, #ff6b6b, #cc0000);
}
.pb-ball-bot {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 50%;
  background: radial-gradient(circle at 65% 65%, #f5f5f5, #cccccc);
}
.pb-ball-mid {
  position: absolute;
  top: calc(50% - 4px);
  left: 0; right: 0;
  height: 8px;
  background: #111;
  z-index: 2;
}
.pb-ball-btn {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 18px; height: 18px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #fff, #ddd);
  border: 3px solid #111;
  z-index: 3;
  box-shadow: 0 0 8px rgba(255,255,255,0.9);
}

/* Trainée lumineuse derrière la ball */
.pb-trail {
  position: absolute;
  top: 50%; left: 50%;
  width: 80px; height: 4px;
  transform-origin: right center;
  transform: translate(-100%, -50%);
  background: linear-gradient(to left, rgba(255,220,100,0.9), transparent);
  border-radius: 4px;
  animation: pbTrailFade 0.7s 0.1s ease forwards;
}
@keyframes pbTrailFade {
  0%   { opacity: 0; width: 0; }
  20%  { opacity: 1; width: 80px; }
  100% { opacity: 0; width: 120px; }
}

/* ── Explosion de lumière ── */
.pb-burst {
  position: absolute;
  top: 50%; left: 55%;
  transform: translate(-50%, -55%);
  animation: pbBurstAppear 0.6s 0.75s ease-out forwards;
  opacity: 0;
}
@keyframes pbBurstAppear {
  0%   { opacity: 0; transform: translate(-50%, -55%) scale(0.1); }
  30%  { opacity: 1; transform: translate(-50%, -55%) scale(1); }
  100% { opacity: 1; transform: translate(-50%, -55%) scale(1.2); }
}

.pb-burst-ring {
  position: absolute;
  border-radius: 50%;
  border: 4px solid white;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  animation: pbRingExpand 0.5s 0.75s cubic-bezier(0.2, 0.8, 0.3, 1) forwards;
}
.pb-burst-ring.r1 { width: 60px;  height: 60px;  border-color: #fff;     animation-delay: 0.75s; }
.pb-burst-ring.r2 { width: 120px; height: 120px; border-color: #ffdd55;  animation-delay: 0.82s; border-width: 3px; }
.pb-burst-ring.r3 { width: 180px; height: 180px; border-color: #ff6666;  animation-delay: 0.89s; border-width: 2px; }

@keyframes pbRingExpand {
  0%   { transform: translate(-50%,-50%) scale(0.2); opacity: 1; }
  100% { transform: translate(-50%,-50%) scale(2.5); opacity: 0; }
}

/* Rayons de lumière */
.pb-burst-rays {
  position: absolute;
  top: 50%; left: 50%;
  width: 200px; height: 200px;
  transform: translate(-50%, -50%);
  animation: pbRaysRotate 0.8s 0.75s linear forwards;
  opacity: 0;
  background: repeating-conic-gradient(
      rgba(255,255,255,0.6) 0deg 10deg,
      transparent 10deg 30deg
  );
  border-radius: 50%;
  mask-image: radial-gradient(circle, rgba(0,0,0,1) 20%, transparent 70%);
}
@keyframes pbRaysRotate {
  0%   { opacity: 0; transform: translate(-50%,-50%) scale(0) rotate(0deg); }
  20%  { opacity: 1; transform: translate(-50%,-50%) scale(1) rotate(45deg); }
  100% { opacity: 0; transform: translate(-50%,-50%) scale(2) rotate(180deg); }
}

/* ── Flash blanc final ── */
.pb-flash {
  position: absolute;
  inset: 0;
  background: white;
  opacity: 0;
  animation: pbFlash 0.5s 1.1s ease-out forwards;
}
@keyframes pbFlash {
  0%   { opacity: 0; }
  20%  { opacity: 1; }
  100% { opacity: 1; }
}

/* ── Texte rétro ── */
.pb-text {
  position: absolute;
  bottom: 12%;
  left: 50%;
  transform: translateX(-50%);
  font-family: 'VT323', monospace;
  font-size: clamp(18px, 3vw, 28px);
  color: #fff;
  letter-spacing: 0.2em;
  text-shadow: 0 0 20px rgba(255,255,255,0.8);
  animation: pbTextAppear 0.4s 0.4s ease forwards;
  opacity: 0;
}
@keyframes pbTextAppear {
  to { opacity: 1; }
}

.fade-enter-active, .fade-leave-active { transition: opacity .25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ── OVERLAY ── */
.pw-overlay {
  position: absolute; inset: 0; z-index: 200;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px;
}
.co-bg { background: rgba(3,3,18,.96); }

/* ── CASE OPENING ── */
.co-title { font-size: clamp(18px, 4vw, 34px); color: #fde047; letter-spacing: 3px; }
.co-reel-wrap {
  position: relative;
  width: min(720px, 96vw); height: clamp(110px, 22vw, 184px);
  overflow: hidden; border: 3px solid #fde047; border-radius: 10px;
  background: #050518; box-shadow: 0 0 40px rgba(253,224,71,.12);
}
.co-fade-l, .co-fade-r {
  position: absolute; inset-y: 0; width: 18%; z-index: 5; pointer-events: none;
}
.co-fade-l { left: 0; background: linear-gradient(to right, #050518, transparent); }
.co-fade-r { right: 0; background: linear-gradient(to left, #050518, transparent); }
.co-line {
  position: absolute; left: calc(50% - 2px); top: 0; width: 4px; height: 100%;
  background: #ef4444; z-index: 6; box-shadow: 0 0 14px #ef4444;
}
.co-reel {
  display: flex; align-items: center; height: 100%; padding: 0 10px;
  will-change: transform;
}
.co-item {
  min-width: 130px; height: 90%; border: 2px solid; border-radius: 8px;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
  flex-shrink: 0;
}
.co-sprite  { width: clamp(42px, 8vw, 60px); height: clamp(42px, 8vw, 60px); image-rendering: pixelated; }
.co-iname   { font-size: 13px; color: #fff; text-align: center; }
.co-irarity { font-size: 11px; text-align: center; }
.co-result {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  background: rgba(5,5,24,.95); border: 2px solid #fde047; border-radius: 14px;
  padding: clamp(14px, 3vw, 28px) clamp(18px, 5vw, 50px);
}
.co-rlabel  { font-size: clamp(13px, 2vw, 18px); color: rgba(255,255,255,.5); letter-spacing: 2px; }
.co-rbig    { width: clamp(64px, 10vw, 96px); height: clamp(64px, 10vw, 96px); image-rendering: pixelated; }
.co-rname   { font-size: clamp(24px, 5vw, 36px); letter-spacing: 2px; }
.co-rrarity { font-size: clamp(15px, 2.5vw, 20px); }
.co-sub-actions { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
.co-done {
  font-family: 'VT323',monospace; font-size: clamp(17px, 3vw, 22px);
  color: #fde047; background: rgba(253,224,71,.08);
  border: 2px solid #fde047; border-radius: 8px;
  padding: 8px 24px; cursor: pointer; letter-spacing: 2px;
  transition: background .15s;
}
.co-done:hover { background: rgba(253,224,71,.18); }
.co-go-pokedex {
  font-family: 'VT323',monospace; font-size: clamp(17px, 3vw, 22px);
  color: #4ade80; background: rgba(74,222,128,.08);
  border: 2px solid #4ade80; border-radius: 8px;
  padding: 8px 24px; cursor: pointer; letter-spacing: 1px;
  transition: background .15s;
}
.co-go-pokedex:hover { background: rgba(74,222,128,.18); }
.pop-enter-active { animation: popIn .35s ease-out; }
@keyframes popIn {
  from { opacity: 0; transform: scale(.88) translateY(10px); }
  to   { opacity: 1; transform: none; }
}
</style>