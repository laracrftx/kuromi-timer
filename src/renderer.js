// ---------- Config & state ----------

const RING_CIRCUMFERENCE = 552.92; // 2 * PI * 88, must match style.css stroke-dasharray

const DEFAULT_SETTINGS = {
  focusMin: 30,
  shortBreakMin: 5,
  longBreakMin: 15,
  sessionsBeforeLong: 4,
  sound: true
};

let settings = loadSettings();

let state = {
  phase: 'focus',       // 'focus' | 'shortBreak' | 'longBreak'
  secondsLeft: settings.focusMin * 60,
  totalSeconds: settings.focusMin * 60,
  running: false,
  completedFocusSessions: 0 // resets every long-break cycle, drives the dots
};

let tickHandle = null;

// ---------- DOM refs ----------

const timeDisplay = document.getElementById('time-display');
const sessionCountEl = document.getElementById('session-count');
const phaseLabel = document.getElementById('phase-label');
const ringProgress = document.getElementById('ring-progress');
const dotsWrap = document.getElementById('dots');
const btnToggle = document.getElementById('btn-toggle');
const btnReset = document.getElementById('btn-reset');
const btnSkip = document.getElementById('btn-skip');
const chime = document.getElementById('chime');

const settingsOverlay = document.getElementById('settings-overlay');
const btnSettingsOpen = document.getElementById('btn-settings');
const btnSettingsCancel = document.getElementById('btn-settings-cancel');
const btnSettingsSave = document.getElementById('btn-settings-save');
const inputFocus = document.getElementById('input-focus');
const inputShortBreak = document.getElementById('input-short-break');
const inputLongBreak = document.getElementById('input-long-break');
const inputSessions = document.getElementById('input-sessions');
const inputSound = document.getElementById('input-sound');

document.getElementById('btn-minimize').addEventListener('click', () => window.kuromi.minimize());
document.getElementById('btn-close').addEventListener('click', () => window.kuromi.close());

// ---------- Settings persistence ----------

function loadSettings() {
  try {
    const raw = localStorage.getItem('kuromi-timer-settings');
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) { /* ignore corrupt storage */ }
  return { ...DEFAULT_SETTINGS };
}

function saveSettings() {
  localStorage.setItem('kuromi-timer-settings', JSON.stringify(settings));
}

// ---------- Phase helpers ----------

const PHASE_META = {
  focus:      { label: 'Focus time',   ring: '#ff2e88' },
  shortBreak: { label: 'Short break',  ring: '#b98ee0' },
  longBreak:  { label: 'Long break',   ring: '#7ee0c0' }
};

function phaseDurationSeconds(phase) {
  if (phase === 'focus') return settings.focusMin * 60;
  if (phase === 'shortBreak') return settings.shortBreakMin * 60;
  return settings.longBreakMin * 60;
}

function setPhase(phase, { autoStart = false } = {}) {
  state.phase = phase;
  state.totalSeconds = phaseDurationSeconds(phase);
  state.secondsLeft = state.totalSeconds;
  phaseLabel.textContent = PHASE_META[phase].label;
  ringProgress.style.stroke = PHASE_META[phase].ring;
  updateMascotForPhase(state.running ? phase : 'idle');
  renderDots();
  renderTime();
  if (autoStart) startTimer();
}

function advancePhase() {
  if (state.phase === 'focus') {
    state.completedFocusSessions += 1;
    if (state.completedFocusSessions >= settings.sessionsBeforeLong) {
      state.completedFocusSessions = 0;
      setPhase('longBreak', { autoStart: true });
    } else {
      setPhase('shortBreak', { autoStart: true });
    }
  } else {
    setPhase('focus', { autoStart: true });
  }
}

// ---------- Rendering ----------

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function renderTime() {
  timeDisplay.textContent = formatTime(state.secondsLeft);
  // fraction = portion of this phase remaining. The visible arc length equals
  // that fraction of the ring, so it drains smoothly down to nothing.
  const fraction = state.totalSeconds > 0 ? state.secondsLeft / state.totalSeconds : 0;
  ringProgress.style.strokeDashoffset = String(RING_CIRCUMFERENCE * (1 - fraction));
  sessionCountEl.textContent = state.phase === 'focus'
    ? `Session ${state.completedFocusSessions + 1} of ${settings.sessionsBeforeLong}`
    : PHASE_META[state.phase].label;
}

function renderDots() {
  dotsWrap.innerHTML = '';
  for (let i = 0; i < settings.sessionsBeforeLong; i++) {
    const dot = document.createElement('div');
    dot.className = 'dot' + (i < state.completedFocusSessions ? ' filled' : '');
    dotsWrap.appendChild(dot);
  }
}

// ---------- Timer control ----------

function startTimer() {
  if (state.running) return;
  state.running = true;
  btnToggle.textContent = '❚❚';
  updateMascotForPhase(state.phase);
  tickHandle = setInterval(tick, 1000);
}

function pauseTimer() {
  state.running = false;
  btnToggle.textContent = '▶';
  updateMascotForPhase('idle');
  clearInterval(tickHandle);
}

function toggleTimer() {
  state.running ? pauseTimer() : startTimer();
}

function resetTimer() {
  pauseTimer();
  state.secondsLeft = state.totalSeconds;
  renderTime();
}

function skipPhase() {
  pauseTimer();
  advancePhase();
}

function tick() {
  state.secondsLeft -= 1;
  if (state.secondsLeft <= 0) {
    handlePhaseComplete();
    return;
  }
  renderTime();
}

function handlePhaseComplete() {
  clearInterval(tickHandle);
  state.running = false;
  playChime();
  flashMascotAlert();

  if (window.kuromi && window.kuromi.notifyTimerFinished) {
    window.kuromi.notifyTimerFinished(state.phase);
  }

  advancePhase();
}

function playChime() {
  if (!settings.sound) return;
  chime.currentTime = 0;
  chime.play().catch(() => {
    // No chime.mp3 dropped in yet, or autoplay blocked — fail silently.
  });
}

// ---------- Controls wiring ----------

btnToggle.addEventListener('click', toggleTimer);
btnReset.addEventListener('click', resetTimer);
btnSkip.addEventListener('click', skipPhase);

// ---------- Settings modal ----------

function openSettings() {
  inputFocus.value = settings.focusMin;
  inputShortBreak.value = settings.shortBreakMin;
  inputLongBreak.value = settings.longBreakMin;
  inputSessions.value = settings.sessionsBeforeLong;
  inputSound.checked = settings.sound;
  settingsOverlay.classList.add('open');
}

function closeSettings() {
  settingsOverlay.classList.remove('open');
}

btnSettingsOpen.addEventListener('click', openSettings);
btnSettingsCancel.addEventListener('click', closeSettings);

btnSettingsSave.addEventListener('click', () => {
  settings.focusMin = clampInt(inputFocus.value, 1, 180, settings.focusMin);
  settings.shortBreakMin = clampInt(inputShortBreak.value, 1, 60, settings.shortBreakMin);
  settings.longBreakMin = clampInt(inputLongBreak.value, 1, 90, settings.longBreakMin);
  settings.sessionsBeforeLong = clampInt(inputSessions.value, 1, 12, settings.sessionsBeforeLong);
  settings.sound = inputSound.checked;
  saveSettings();
  closeSettings();

  // Re-apply to the current phase without losing the fact that we just changed config
  pauseTimer();
  state.completedFocusSessions = Math.min(state.completedFocusSessions, settings.sessionsBeforeLong);
  setPhase(state.phase);
});

function clampInt(value, min, max, fallback) {
  const n = parseInt(value, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

// ---------- Mascot sprite loading ----------
// Drop spritesheets into assets/sprites/ named exactly as below.
// Each file should be a horizontal strip of 4 frames, each frame 32x32px.
// If a file is missing, the CSS-drawn placeholder mascot is used instead.

const SPRITE_FILES = {
  idle: '../assets/sprites/kuromi-idle.png',
  focus: '../assets/sprites/kuromi-focus.png',
  shortBreak: '../assets/sprites/kuromi-break.png',
  longBreak: '../assets/sprites/kuromi-break.png',
  alert: '../assets/sprites/kuromi-alert.png'
};

const FRAME_SIZE = 32;
const FRAME_COUNT = 4;
const FRAME_DURATION_MS = 220;

const canvas = document.getElementById('mascot-canvas');
const ctx = canvas.getContext('2d');
const fallbackEl = document.getElementById('mascot-fallback');

const loadedSprites = {};
let spritesReady = false;
let currentSpriteKey = 'idle';
let currentFrame = 0;
let frameTimer = null;

function preloadSprites() {
  const keys = Object.keys(SPRITE_FILES);
  let loadedCount = 0;

  keys.forEach((key) => {
    const img = new Image();
    img.onload = () => {
      loadedSprites[key] = img;
      loadedCount++;
      maybeActivateCanvas();
    };
    img.onerror = () => {
      loadedCount++;
      maybeActivateCanvas();
    };
    img.src = SPRITE_FILES[key];
  });

  function maybeActivateCanvas() {
    if (loadedCount === keys.length) {
      spritesReady = Object.keys(loadedSprites).length > 0;
      if (spritesReady) {
        canvas.style.display = 'block';
        fallbackEl.style.display = 'none';
        startSpriteAnimation();
      }
    }
  }
}

function startSpriteAnimation() {
  if (frameTimer) clearInterval(frameTimer);
  frameTimer = setInterval(() => {
    currentFrame = (currentFrame + 1) % FRAME_COUNT;
    drawCurrentFrame();
  }, FRAME_DURATION_MS);
  drawCurrentFrame();
}

function drawCurrentFrame() {
  const img = loadedSprites[currentSpriteKey] || loadedSprites.idle;
  if (!img) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    img,
    currentFrame * FRAME_SIZE, 0, FRAME_SIZE, FRAME_SIZE,
    0, 0, canvas.width, canvas.height
  );
}

function updateMascotForPhase(phaseOrIdle) {
  const key = loadedSprites[phaseOrIdle] ? phaseOrIdle : 'idle';
  currentSpriteKey = key;
  currentFrame = 0;
  if (spritesReady) drawCurrentFrame();
}

function flashMascotAlert() {
  if (!spritesReady || !loadedSprites.alert) return;
  const previous = currentSpriteKey;
  currentSpriteKey = 'alert';
  currentFrame = 0;
  drawCurrentFrame();
  setTimeout(() => {
    currentSpriteKey = previous;
  }, 1400);
}

// ---------- Init ----------

preloadSprites();
setPhase('focus');
renderTime();
