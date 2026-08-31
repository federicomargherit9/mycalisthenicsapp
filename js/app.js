(() => {
"use strict";

/* =========================================================
   STORAGE KEYS
   ========================================================= */
const K_PLANS = "mca_plans_v2";
const K_TRACKS = "mca_tracks_v2";
const K_PROGRESS_PREFIX = "mca_progress_";
const K_LAST_PLAN = "mca_last_plan";
const K_GOALS = "mca_goals_v1";
const K_CALENDAR = "mca_calendar_v2";
const K_JOURNAL = "mca_journal_v1";
const K_TECH_NOTES = "mca_tech_notes_v1";
const K_MUSIC_SECTIONS = "mca_music_sections_v1";
const K_PLAN_GROUP_ORDER = "mca_plan_group_order_v1";

/* =========================================================
   MOTIVATIONAL QUOTES
   ========================================================= */
const QUOTES = [
  { text: "La forza non viene da ciò che puoi fare, ma dal superare ciò che pensavi di non poter fare.", author: "Rikki Rogers" },
  { text: "Il dolore che senti oggi sarà la forza che sentirai domani.", author: "Arnold Schwarzenegger" },
  { text: "Non contare i giorni, fai che i giorni contino.", author: "Muhammad Ali" },
  { text: "La disciplina è la scelta tra ciò che vuoi ora e ciò che vuoi davvero.", author: "Abraham Lincoln" },
  { text: "Un campione si allena quando nessuno lo sta guardando.", author: "Stephen Curry" },
  { text: "Il corpo raggiunge ciò che la mente crede.", author: "Napoleon Hill" },
  { text: "Non smettere quando fa male. Smetti quando hai finito.", author: "David Goggins" },
  { text: "Ogni ripetizione è un mattone. Costruisci con pazienza.", author: "Anonimo" },
  { text: "La costanza batte il talento quando il talento non è costante.", author: "Anonimo" },
  { text: "Datti oggi ciò per cui domani ringrazierai te stesso.", author: "Anonimo" },
  { text: "Il corpo fa quello che la mente gli dice di fare.", author: "Arnold Schwarzenegger" },
  { text: "Non è la forza del corpo che conta, ma la forza dello spirito.", author: "Jiddu Krishnamurti" },
  { text: "Se vuoi qualcosa che non hai mai avuto, devi fare qualcosa che non hai mai fatto.", author: "Thomas Jefferson" },
  { text: "Nel calisthenics non combatti contro la gravità, impari a dominarla.", author: "Anonimo" },
  { text: "Il dolore è temporaneo, l'orgoglio è per sempre.", author: "Lance Armstrong" },
  { text: "La gravità è solo un'opinione finché non decidi di sollevare il tuo stesso peso.", author: "Anonimo" },
  { text: "La disciplina è fare ciò che odi, ma farlo come se lo amassi.", author: "Mike Tyson" },
  { text: "Il ferro non mente mai. Duecento chili saranno sempre duecento chili.", author: "Henry Rollins" },
  { text: "Il successo non è l'altezza che hai raggiunto, ma come ti rialzi quando cadi.", author: "Anonimo" }
];
function randomQuote() { return QUOTES[Math.floor(Math.random() * QUOTES.length)]; }

/* =========================================================
   SEED DATA
   ========================================================= */
function uid(prefix) { return prefix + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

function seedPlans() {
  return [
    {
      id: uid("plan"),
      title: "Scheda Statici (90° / HSPU)",
      group: "Skills",
      phases: [
        {
          name: "Riscaldamento articolare / Equilibrio",
          restAfter: 60,
          exercises: [
            { id: uid("ex"), name: "Mobilità spalle e polsi", sets: 2, reps: "10 rip.", restSeconds: 30, restAfter: 30, note: "" },
            { id: uid("ex"), name: "Verticale pancia al muro", sets: 3, reps: "20-30s", restSeconds: 45, restAfter: 0, note: "concentrati sull'allineamento" }
          ]
        },
        {
          name: "Forza massima",
          restAfter: 90,
          exercises: [
            { id: uid("ex"), name: "90° hold", sets: 5, reps: "max hold", restSeconds: 120, restAfter: 60, note: "" },
            { id: uid("ex"), name: "HSPU negative", sets: 4, reps: "3-5 rip.", restSeconds: 150, restAfter: 0, note: "scendi lentamente, 3-4s" }
          ]
        },
        {
          name: "Volume di spinta",
          restAfter: 60,
          exercises: [
            { id: uid("ex"), name: "PPPU (pseudo planche push up)", sets: 4, reps: "8-10 rip.", restSeconds: 90, restAfter: 0, note: "" }
          ]
        },
        {
          name: "Defaticamento",
          restAfter: 0,
          exercises: [
            { id: uid("ex"), name: "Russian Twist", sets: 3, reps: "20 rip.", restSeconds: 45, restAfter: 30, note: "" },
            { id: uid("ex"), name: "Woodchopper", sets: 3, reps: "12 per lato", restSeconds: 45, restAfter: 30, note: "" },
            { id: uid("ex"), name: "Stretching generale", sets: 1, reps: "5 min", restSeconds: 0, restAfter: 0, note: "" }
          ]
        }
      ]
    }
  ];
}

/* Default section names — used to seed state.musicSections the first time */
const DEFAULT_MUSIC_SECTIONS = ["Riscaldamento / Equilibrio", "Forza massima", "Volume di spinta", "Defaticamento"];

function seedTracks() { return []; }

/* =========================================================
   STATE
   ========================================================= */
const state = {
  plans: [], tracks: [], goals: [], calendar: {}, journal: [], techNotes: [],
  musicSections: [], planGroupOrder: [],
  currentPlanId: null, progress: {},
  currentTrackId: null, playlistOpen: false,
  playQueue: [], queueIndex: -1,
  currentView: "workout",
  celebratedSession: false
};

function loadState() {
  state.plans = JSON.parse(localStorage.getItem(K_PLANS) || "null") || seedPlans();
  state.plans.forEach(p => { if (!p.group) p.group = "Generale"; if (p.estimatedMinutes === undefined) p.estimatedMinutes = 0; if (p.archived === undefined) p.archived = false; p.phases.forEach(ph => { if (ph.restAfter === undefined) ph.restAfter = 0; ph.exercises.forEach(e => { if (e.restAfter === undefined) e.restAfter = 0; if (e.repScheme === undefined) e.repScheme = null; }); }); });
  state.tracks = JSON.parse(localStorage.getItem(K_TRACKS) || "null") || seedTracks();
  state.tracks.forEach(t => { if (t.src === undefined) t.src = ""; if (t.durationSec === undefined) t.durationSec = null; });
  state.goals = JSON.parse(localStorage.getItem(K_GOALS) || "[]");

  // Calendar: migrate from the old "one entry per day" shape to "array of entries per day",
  // and from the old storage key, without losing anything already saved.
  const rawCalV2 = localStorage.getItem(K_CALENDAR);
  if (rawCalV2) {
    state.calendar = JSON.parse(rawCalV2);
  } else {
    const legacy = JSON.parse(localStorage.getItem("mca_calendar_v1") || "{}");
    state.calendar = {};
    Object.keys(legacy).forEach(ds => { state.calendar[ds] = [legacy[ds]]; });
  }
  Object.keys(state.calendar).forEach(ds => {
    if (!Array.isArray(state.calendar[ds])) state.calendar[ds] = [state.calendar[ds]];
    state.calendar[ds].forEach(entry => { if (entry.completed === undefined) entry.completed = false; if (!entry.id) entry.id = uid("cal"); });
  });

  state.journal = JSON.parse(localStorage.getItem(K_JOURNAL) || "[]");
  state.journal.forEach((n, i) => { if (!n.createdAt) n.createdAt = i; });
  state.techNotes = JSON.parse(localStorage.getItem(K_TECH_NOTES) || "[]");

  state.musicSections = JSON.parse(localStorage.getItem(K_MUSIC_SECTIONS) || "null") || DEFAULT_MUSIC_SECTIONS.slice();
  // Make sure every category actually used by a saved track is represented too.
  state.tracks.forEach(t => { if (t.category && !state.musicSections.includes(t.category)) state.musicSections.push(t.category); });

  const groups = [];
  state.plans.forEach(p => { if (!groups.includes(p.group)) groups.push(p.group); });
  state.planGroupOrder = JSON.parse(localStorage.getItem(K_PLAN_GROUP_ORDER) || "null") || groups.slice();
  groups.forEach(g => { if (!state.planGroupOrder.includes(g)) state.planGroupOrder.push(g); });

  savePlans(); saveTracks(); saveCalendar(); saveMusicSections(); savePlanGroupOrder();
  state.currentPlanId = localStorage.getItem(K_LAST_PLAN) || (state.plans[0] && state.plans[0].id) || null;
  const cp = state.plans.find(p => p.id === state.currentPlanId);
  if (!cp || cp.archived) {
    const firstActive = state.plans.find(p => !p.archived);
    state.currentPlanId = firstActive ? firstActive.id : null;
  }
  loadProgressForCurrentPlan();
}
function savePlans() { localStorage.setItem(K_PLANS, JSON.stringify(state.plans)); }
function saveTracks() { localStorage.setItem(K_TRACKS, JSON.stringify(state.tracks)); }
function saveGoals() { localStorage.setItem(K_GOALS, JSON.stringify(state.goals)); }
function saveCalendar() { localStorage.setItem(K_CALENDAR, JSON.stringify(state.calendar)); }
function saveJournal() { localStorage.setItem(K_JOURNAL, JSON.stringify(state.journal)); }
function saveTechNotes() { localStorage.setItem(K_TECH_NOTES, JSON.stringify(state.techNotes)); }
function saveMusicSections() { localStorage.setItem(K_MUSIC_SECTIONS, JSON.stringify(state.musicSections)); }
function savePlanGroupOrder() { localStorage.setItem(K_PLAN_GROUP_ORDER, JSON.stringify(state.planGroupOrder)); }
function ensureGroupInOrder(name) { if (name && !state.planGroupOrder.includes(name)) { state.planGroupOrder.push(name); savePlanGroupOrder(); } }
function orderedGroups() {
  const present = [];
  state.plans.filter(p => !p.archived).forEach(p => { if (!present.includes(p.group)) present.push(p.group); });
  const ordered = state.planGroupOrder.filter(g => present.includes(g));
  present.forEach(g => { if (!ordered.includes(g)) ordered.push(g); });
  return ordered;
}

const K_AUTO_REST = "mca_auto_rest";
function getAutoRestSetting() { return localStorage.getItem(K_AUTO_REST) === "1"; }
function setAutoRestSetting(on) { localStorage.setItem(K_AUTO_REST, on ? "1" : "0"); }
function syncAutoRestToggleUI() {
  const btn = $("#autoRestToggle");
  if (!btn) return;
  const on = getAutoRestSetting();
  btn.classList.toggle("on", on);
  btn.setAttribute("aria-checked", on ? "true" : "false");
}

/* Undo/redo for accidental double-taps on the exercise check button.
   Tracks only set-completion toggles for the plan currently open. */
let undoStack = [];
let redoStack = [];
function clearUndoStacks() { undoStack = []; redoStack = []; }
function pushUndoAction(exerciseId, previousValue) {
  undoStack.push({ exerciseId, previousValue });
  if (undoStack.length > 30) undoStack.shift();
  redoStack = [];
}
function undoLastAction() {
  const entry = undoStack.pop();
  if (!entry) { toast("Niente da annullare."); return; }
  const currentValue = state.progress[entry.exerciseId] || 0;
  redoStack.push({ exerciseId: entry.exerciseId, previousValue: currentValue });
  if (entry.previousValue) state.progress[entry.exerciseId] = entry.previousValue; else delete state.progress[entry.exerciseId];
  saveProgress();
}
function redoLastAction() {
  const entry = redoStack.pop();
  if (!entry) { toast("Niente da ripristinare."); return; }
  const currentValue = state.progress[entry.exerciseId] || 0;
  undoStack.push({ exerciseId: entry.exerciseId, previousValue: currentValue });
  if (entry.previousValue) state.progress[entry.exerciseId] = entry.previousValue; else delete state.progress[entry.exerciseId];
  saveProgress();
}

function loadProgressForCurrentPlan() {
  state.celebratedSession = false;
  clearUndoStacks();
  if (!state.currentPlanId) { state.progress = {}; return; }
  state.progress = JSON.parse(localStorage.getItem(K_PROGRESS_PREFIX + state.currentPlanId) || "{}");
}
function saveProgress() { if (state.currentPlanId) localStorage.setItem(K_PROGRESS_PREFIX + state.currentPlanId, JSON.stringify(state.progress)); }
function getCurrentPlan() { return state.plans.find(p => p.id === state.currentPlanId) || null; }

/* =========================================================
   INDEXEDDB — uploaded audio blobs
   ========================================================= */
const AudioDB = (() => {
  let dbp = null;
  function open() {
    if (dbp) return dbp;
    dbp = new Promise((resolve, reject) => {
      const req = indexedDB.open("mca-audio-db", 1);
      req.onupgradeneeded = () => req.result.createObjectStore("audio");
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return dbp;
  }
  async function put(id, blob) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("audio", "readwrite");
      tx.objectStore("audio").put(blob, id);
      tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error);
    });
  }
  async function get(id) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("audio", "readonly");
      const req = tx.objectStore("audio").get(id);
      req.onsuccess = () => resolve(req.result || null); req.onerror = () => reject(req.error);
    });
  }
  async function remove(id) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("audio", "readwrite");
      tx.objectStore("audio").delete(id);
      tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error);
    });
  }
  return { put, get, remove };
})();

/* =========================================================
   DOM HELPERS
   ========================================================= */
const $ = (sel) => document.querySelector(sel);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

function toast(msg) {
  let t = document.getElementById("mcaToast");
  if (!t) {
    t = el("div", ""); t.id = "mcaToast";
    t.style.cssText = "position:fixed;left:50%;bottom:150px;transform:translateX(-50%);background:#262319;border:1px solid #3a3527;color:#ede7da;padding:10px 16px;border-radius:20px;font-size:13px;z-index:99;opacity:0;transition:opacity .25s ease;max-width:80vw;text-align:center;";
    document.body.appendChild(t);
  }
  t.textContent = msg; t.style.opacity = "1";
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.style.opacity = "0"; }, 2200);
}

function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
}
function todayIso() { return new Date().toISOString().slice(0, 10); }

/* =========================================================
   VIEW SWITCHING
   ========================================================= */
const VIEW_TITLES = { workout: "MyCalisthenicsApp", goals: "Obiettivi", calendar: "Calendario", journal: "Diario", technotes: "Note tecniche", settings: "Impostazioni", timer: "Timer" };

function switchView(view) {
  state.currentView = view;
  ["workout", "goals", "calendar", "journal", "technotes", "settings", "timer"].forEach(v => {
    $("#view-" + v).classList.toggle("hidden", v !== view);
  });
  $("#drawerAddPlanWrap").classList.toggle("hidden", view !== "workout");
  document.querySelectorAll(".nav-tab").forEach(b => b.classList.toggle("active", b.dataset.view === view));
  if (view === "workout") { $("#topbarTitle").innerHTML = "MyCalisthenics<span>App</span>"; renderWorkout(); }
  else { $("#topbarTitle").textContent = VIEW_TITLES[view]; }
  if (view === "goals") renderGoals();
  if (view === "calendar") renderCalendar();
  if (view === "journal") renderJournal();
  if (view === "technotes") renderTechNotes();
  if (view === "settings") { renderSettingsPlans(); renderSettingsArchive(); renderSettingsTracks(); renderMusicSections(); syncAutoRestToggleUI(); }
  closeDrawer();
}

/* =========================================================
   DRAWER
   ========================================================= */
function renderDrawer() {
  const list = $("#drawerList");
  list.innerHTML = "";
  orderedGroups().forEach(g => {
    list.appendChild(el("div", "group-header", escapeHtml(g)));
    state.plans.filter(p => p.group === g && !p.archived).forEach(p => {
      const totalEx = p.phases.reduce((s, ph) => s + ph.exercises.length, 0);
      const btn = el("button", "drawer-item" + (p.id === state.currentPlanId && state.currentView === "workout" ? " active" : ""));
      btn.innerHTML = `<span>${escapeHtml(p.title)}</span><small>${totalEx} es.</small>`;
      btn.addEventListener("click", () => {
        state.currentPlanId = p.id;
        localStorage.setItem(K_LAST_PLAN, p.id);
        loadProgressForCurrentPlan();
        switchView("workout");
        renderDrawer();
      });
      list.appendChild(btn);
    });
  });
  if (!state.plans.length) list.appendChild(el("div", "playlist-empty", "Nessuna scheda. Aggiungine una."));
}
function openDrawer() { $("#drawer").classList.add("open"); $("#drawerOverlay").classList.add("open"); }
function closeDrawer() { $("#drawer").classList.remove("open"); $("#drawerOverlay").classList.remove("open"); }

/* =========================================================
   WORKOUT VIEW
   ========================================================= */
function fmtRest(sec) {
  if (!sec) return null;
  if (sec < 60) return sec + "s";
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function renderWorkout() {
  const main = $("#view-workout");
  main.innerHTML = "";
  const plan = getCurrentPlan();
  if (!plan) {
    main.appendChild(el("div", "empty-state", "<h3>Nessuna scheda selezionata</h3><p>Apri il menu ☰ per crearne una.</p>"));
    return;
  }

  const titleBlock = el("div", "plan-title-block");
  const totalEx = plan.phases.reduce((s, ph) => s + ph.exercises.length, 0);
  const doneEx = plan.phases.reduce((s, ph) => s + ph.exercises.filter(e => (state.progress[e.id] || 0) >= e.sets).length, 0);
  const estStr = plan.estimatedMinutes ? ` · tempo stimato: ${fmtClock(plan.estimatedMinutes * 60)}` : "";
  titleBlock.innerHTML = `<h1>${escapeHtml(plan.title)}</h1><div class="plan-meta">${escapeHtml(plan.group)} · ${doneEx}/${totalEx} esercizi completati${estStr}</div>`;
  const toolbar = el("div", "workout-toolbar");
  const resetBtn = el("button", "plan-reset-btn", "↺ Reset progresso sessione");
  resetBtn.addEventListener("click", () => {
    plan.phases.forEach(ph => ph.exercises.forEach(e => delete state.progress[e.id]));
    saveProgress(); state.celebratedSession = false;
    clearUndoStacks();
    renderWorkout();
  });
  toolbar.appendChild(resetBtn);
  const undoBtn = el("button", "undo-redo-btn", "↩"); undoBtn.title = "Annulla ultima azione";
  undoBtn.addEventListener("click", () => { undoLastAction(); renderWorkout(); });
  const redoBtn = el("button", "undo-redo-btn", "↪"); redoBtn.title = "Ripristina azione annullata";
  redoBtn.addEventListener("click", () => { redoLastAction(); renderWorkout(); });
  toolbar.appendChild(undoBtn); toolbar.appendChild(redoBtn);
  titleBlock.appendChild(toolbar);
  main.appendChild(titleBlock);

  plan.phases.forEach((phase, phIdx) => {
    const phaseEl = el("div", "phase");
    const header = el("div", "phase-header");
    header.appendChild(el("h2", "", escapeHtml(phase.name)));
    phaseEl.appendChild(header);

    phase.exercises.forEach((ex, exIdxInPhase) => {
      const completed = state.progress[ex.id] || 0;
      const isDone = completed >= ex.sets;
      const row = el("div", "exercise" + (isDone ? " done" : ""));

      const info = el("div", "exercise-info");
      let html;
      if (Array.isArray(ex.repScheme) && ex.repScheme.length) {
        const nextTarget = completed < ex.repScheme.length ? ex.repScheme[completed] : null;
        const schemeStr = ex.repScheme.join("-");
        html = `<div class="exercise-name">${escapeHtml(ex.name)}</div><div class="exercise-detail">${ex.sets} serie · schema ${escapeHtml(schemeStr)}</div>`;
        html += `<div class="exercise-next-target">${nextTarget !== null ? `Prossima: <strong>${nextTarget}</strong> ripetizioni` : "Schema completato ✓"}</div>`;
      } else {
        const detail = `${ex.sets} serie × ${escapeHtml(ex.reps)}`;
        html = `<div class="exercise-name">${escapeHtml(ex.name)}</div><div class="exercise-detail">${detail}</div>`;
      }
      if (ex.note) html += `<div class="exercise-note">${escapeHtml(ex.note)}</div>`;
      info.innerHTML = html;
      if (ex.restSeconds) {
        const chip = el("button", "rest-chip", "⏱ " + fmtRest(ex.restSeconds) + " tra le serie");
        chip.addEventListener("click", (e) => { e.stopPropagation(); startRestTimer(ex.restSeconds, "Recupero — " + ex.name); });
        info.appendChild(chip);
      }
      row.appendChild(info);

      const progressEl = el("div", "exercise-progress", `${completed}/${ex.sets}`);
      row.appendChild(progressEl);

      const check = el("button", "exercise-check", isDone ? "✓" : "");
      check.addEventListener("click", () => {
        const cur = state.progress[ex.id] || 0;
        const newVal = cur >= ex.sets ? 0 : cur + 1;
        pushUndoAction(ex.id, cur);
        state.progress[ex.id] = newVal;
        saveProgress();
        renderWorkout();
        maybeCelebrate(plan);

        if (newVal > cur && getAutoRestSetting()) {
          const nowDone = newVal >= ex.sets;
          if (!nowDone) {
            if (ex.restSeconds) startRestTimer(ex.restSeconds, "Recupero — " + ex.name);
          } else {
            const isLastExInPhase = exIdxInPhase === phase.exercises.length - 1;
            if (isLastExInPhase) { if (phase.restAfter) startRestTimer(phase.restAfter, "Recupero tra fasi"); }
            else if (ex.restAfter) startRestTimer(ex.restAfter, "Recupero tra esercizi");
          }
        }
      });
      row.appendChild(check);

      phaseEl.appendChild(row);

      if (ex.restAfter) {
        const div = el("div", "rest-divider");
        div.innerHTML = `<div class="line"></div>`;
        const btn = el("button", "", "⏱ " + fmtRest(ex.restAfter) + " prima del prossimo esercizio");
        btn.addEventListener("click", () => startRestTimer(ex.restAfter, "Recupero tra esercizi"));
        div.appendChild(btn);
        div.appendChild(el("div", "line"));
        phaseEl.appendChild(div);
      }
    });

    main.appendChild(phaseEl);

    if (phase.restAfter && phIdx < plan.phases.length - 1) {
      const div = el("div", "phase-rest-divider");
      const btn = el("button", "", "⏱ Recupero tra fasi — " + fmtRest(phase.restAfter));
      btn.addEventListener("click", () => startRestTimer(phase.restAfter, "Recupero tra fasi"));
      div.appendChild(btn);
      main.appendChild(div);
    }
  });

  const finishBtn = el("button", "finish-btn", "🏁 Termina allenamento");
  finishBtn.addEventListener("click", () => showCelebration());
  main.appendChild(finishBtn);
}

function maybeCelebrate(plan) {
  const totalEx = plan.phases.reduce((s, ph) => s + ph.exercises.length, 0);
  const doneEx = plan.phases.reduce((s, ph) => s + ph.exercises.filter(e => (state.progress[e.id] || 0) >= e.sets).length, 0);
  if (totalEx > 0 && doneEx === totalEx && !state.celebratedSession) {
    state.celebratedSession = true;
    showCelebration();
  }
}

/* =========================================================
   CELEBRATION / CONFETTI
   ========================================================= */
function showCelebration() {
  const q = randomQuote();
  $("#celebrationQuote").textContent = `"${q.text}"`;
  $("#celebrationAuthor").textContent = "— " + q.author;
  const field = $("#confettiField");
  field.innerHTML = "";
  const colors = ["#ff4d1c", "#ede7da", "#7fb069", "#d4c9a8", "#e15252"];
  for (let i = 0; i < 40; i++) {
    const piece = el("div", "confetti-piece");
    piece.style.left = Math.random() * 100 + "%";
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = (1.8 + Math.random() * 1.6) + "s";
    piece.style.animationDelay = (Math.random() * 0.6) + "s";
    field.appendChild(piece);
  }
  $("#celebrationOverlay").classList.add("open");
}
function hideCelebration() { $("#celebrationOverlay").classList.remove("open"); }

/* =========================================================
   TIMER / STOPWATCH — two independent clocks that can run at once.
   The floating widget shows one at a time (toggle), the full-screen
   Timer view shows both together.

   Both clocks are tracked using real wall-clock timestamps (endAt /
   startedAt), not just a per-second counter. Android sometimes reloads
   a backgrounded PWA tab (e.g. after using the camera/gallery) to free
   memory, which would wipe a plain in-memory counter. Anchoring to an
   actual timestamp — saved to localStorage — means the clocks pick up
   exactly where they should be even after a reload, instead of
   silently resetting.
   ========================================================= */
const K_TIMER_STATE = "mca_timer_state_v1";
const restTimer = { baseSeconds: 60, remaining: 60, running: false, intervalId: null, label: "", endAt: null };
const stopwatch = { baseElapsed: 0, startedAt: null, running: false, intervalId: null, beepIntervalSec: parseInt(localStorage.getItem("mca_stopwatch_beep") || "0", 10), lastBeepMark: 0 };
let widgetMode = "timer"; // which clock the compact floating widget is currently showing

function fmtClock(totalSec) {
  totalSec = Math.max(0, Math.round(totalSec));
  const m = Math.floor(totalSec / 60), s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function restTimerRemaining() {
  if (restTimer.running && restTimer.endAt) return Math.max(0, Math.round((restTimer.endAt - Date.now()) / 1000));
  return restTimer.remaining;
}
function stopwatchElapsed() {
  return stopwatch.baseElapsed + (stopwatch.running && stopwatch.startedAt ? (Date.now() - stopwatch.startedAt) / 1000 : 0);
}
function saveTimerState() {
  localStorage.setItem(K_TIMER_STATE, JSON.stringify({
    restTimer: { baseSeconds: restTimer.baseSeconds, remaining: restTimer.remaining, running: restTimer.running, endAt: restTimer.endAt, label: restTimer.label },
    stopwatch: { baseElapsed: stopwatch.baseElapsed, startedAt: stopwatch.startedAt, running: stopwatch.running, beepIntervalSec: stopwatch.beepIntervalSec }
  }));
}
function restoreTimerState() {
  const saved = JSON.parse(localStorage.getItem(K_TIMER_STATE) || "null");
  if (!saved) return;
  let shouldExpand = false;
  if (saved.restTimer) {
    restTimer.baseSeconds = saved.restTimer.baseSeconds || 60;
    restTimer.label = saved.restTimer.label || "";
    if (saved.restTimer.running && saved.restTimer.endAt) {
      const rem = Math.round((saved.restTimer.endAt - Date.now()) / 1000);
      if (rem > 0) {
        restTimer.remaining = rem; restTimer.running = true; restTimer.endAt = saved.restTimer.endAt;
        startClockInterval("timer");
        widgetMode = "timer"; shouldExpand = true;
      } else {
        restTimer.remaining = 0; restTimer.running = false; restTimer.endAt = null;
        setTimeout(() => { playBeep(3); if (navigator.vibrate) navigator.vibrate([200, 100, 200]); }, 400);
      }
    } else {
      restTimer.remaining = saved.restTimer.remaining != null ? saved.restTimer.remaining : restTimer.baseSeconds;
    }
  }
  if (saved.stopwatch) {
    stopwatch.baseElapsed = saved.stopwatch.baseElapsed || 0;
    stopwatch.beepIntervalSec = saved.stopwatch.beepIntervalSec || 0;
    if (saved.stopwatch.running && saved.stopwatch.startedAt) {
      stopwatch.running = true; stopwatch.startedAt = saved.stopwatch.startedAt;
      startClockInterval("stopwatch");
    }
  }
  if (shouldExpand) expandTimerWidget();
}

function clockFor(which) { return which === "timer" ? restTimer : stopwatch; }
function startClockInterval(which) {
  stopClockInterval(which);
  if (which === "timer") restTimer.intervalId = setInterval(restTimerTick, 1000);
  else stopwatch.intervalId = setInterval(stopwatchTick, 1000);
}
function stopClockInterval(which) {
  const clock = clockFor(which);
  if (clock.intervalId) { clearInterval(clock.intervalId); clock.intervalId = null; }
}
function restTimerTick() {
  restTimer.remaining = restTimerRemaining();
  if (restTimer.remaining <= 0) {
    restTimer.remaining = 0;
    stopClockInterval("timer");
    restTimer.running = false; restTimer.endAt = null;
    saveTimerState();
    playBeep(3);
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
  }
  refreshAllTimerDisplays();
}
function stopwatchTick() {
  const elapsedNow = stopwatchElapsed();
  if (stopwatch.beepIntervalSec > 0) {
    const mark = Math.floor(elapsedNow / stopwatch.beepIntervalSec);
    if (mark > stopwatch.lastBeepMark) { stopwatch.lastBeepMark = mark; playBeep(1); }
  }
  refreshAllTimerDisplays();
}

function playBeep(times) {
  // Duck the music volume while the beep plays, so it cuts through even
  // with headphones on and the track playing loud, then restore it.
  times = times || 3;
  const a = audioEl();
  const musicWasPlaying = !a.paused;
  const originalVolume = a.volume;
  if (musicWasPlaying) a.volume = Math.min(originalVolume, 0.15);

  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const delays = times === 1 ? [0] : [0, 220, 440];
    delays.forEach((delay) => {
      setTimeout(() => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.type = "sine"; osc.frequency.value = times === 1 ? 660 : 880; gain.gain.value = 0.3;
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.18);
      }, delay);
    });
  } catch (e) {}

  if (musicWasPlaying) {
    setTimeout(() => { a.volume = originalVolume; }, times === 1 ? 350 : 750);
  }
}

function toggleClock(which) {
  if (which === "timer") {
    restTimer.running = !restTimer.running;
    if (restTimer.running) {
      if (restTimer.remaining <= 0) restTimer.remaining = restTimer.baseSeconds;
      restTimer.endAt = Date.now() + restTimer.remaining * 1000;
      startClockInterval("timer");
    } else {
      restTimer.remaining = restTimerRemaining();
      restTimer.endAt = null;
      stopClockInterval("timer");
    }
  } else {
    stopwatch.running = !stopwatch.running;
    if (stopwatch.running) {
      stopwatch.startedAt = Date.now();
      startClockInterval("stopwatch");
    } else {
      stopwatch.baseElapsed = stopwatchElapsed();
      stopwatch.startedAt = null;
      stopClockInterval("stopwatch");
    }
  }
  saveTimerState();
  refreshAllTimerDisplays();
}
function resetClock(which) {
  if (which === "timer") {
    restTimer.running = false; restTimer.endAt = null; stopClockInterval("timer");
    restTimer.remaining = restTimer.baseSeconds;
  } else {
    stopwatch.running = false; stopwatch.startedAt = null; stopClockInterval("stopwatch");
    stopwatch.baseElapsed = 0; stopwatch.lastBeepMark = 0;
  }
  saveTimerState();
  refreshAllTimerDisplays();
}

function refreshAllTimerDisplays() {
  const restVal = restTimerRemaining();
  const stopwatchVal = stopwatchElapsed();

  // Compact widget: shows whichever clock is currently selected there
  const widgetClock = clockFor(widgetMode);
  const widgetVal = widgetMode === "timer" ? restVal : stopwatchVal;
  $("#timerDisplay").textContent = fmtClock(widgetVal);
  $("#timerAdjustRow").style.display = widgetMode === "timer" ? "flex" : "none";
  $("#timerStartBtn").textContent = widgetClock.running ? "Pausa" : "Avvia";
  document.querySelectorAll(".mode-timer-btn").forEach(b => b.classList.toggle("active", widgetMode === "timer"));
  document.querySelectorAll(".mode-stopwatch-btn").forEach(b => b.classList.toggle("active", widgetMode === "stopwatch"));
  $("#timerLabel").textContent = widgetMode === "timer" ? (restTimer.label || "") : "";

  // Full-screen Timer view: both clocks always shown together
  document.querySelectorAll(".restTimerDisplayFull").forEach(elx => elx.textContent = fmtClock(restVal));
  document.querySelectorAll(".stopwatchDisplayFull").forEach(elx => elx.textContent = fmtClock(stopwatchVal));
  document.querySelectorAll(".restTimerStartBtnFull").forEach(b => b.textContent = restTimer.running ? "Pausa" : "Avvia");
  document.querySelectorAll(".stopwatchStartBtnFull").forEach(b => b.textContent = stopwatch.running ? "Pausa" : "Avvia");
  const labelEl = $("#restTimerLabelFull"); if (labelEl) labelEl.textContent = restTimer.label || "";
}

function startRestTimer(seconds, label) {
  restTimer.baseSeconds = seconds; restTimer.remaining = seconds; restTimer.label = label || "";
  widgetMode = "timer";
  expandTimerWidget();
  restTimer.running = true;
  restTimer.endAt = Date.now() + seconds * 1000;
  startClockInterval("timer");
  saveTimerState();
  refreshAllTimerDisplays();
}

/* ---- draggable floating widget ---- */
const K_TIMER_POS = "mca_timer_widget_pos";
function clampWidgetPosition() {
  const w = $("#timerWidget");
  const rect = w.getBoundingClientRect();
  // Width is a fixed, known value per state (56 collapsed / 220 expanded).
  // Reading it from the DOM right after toggling the class can catch the
  // box mid-transition and return the OLD width, so use the target value
  // directly instead — that's what was pushing the widget off-screen.
  const width = w.classList.contains("expanded") ? 220 : 56;
  const height = rect.height;
  let left = parseFloat(w.style.left);
  let top = parseFloat(w.style.top);
  if (isNaN(left) || isNaN(top)) return;
  left = Math.min(Math.max(8, left), window.innerWidth - width - 8);
  top = Math.min(Math.max(8, top), window.innerHeight - height - 8);
  w.style.left = left + "px"; w.style.top = top + "px";
}
function restoreWidgetPosition() {
  const saved = JSON.parse(localStorage.getItem(K_TIMER_POS) || "null");
  if (!saved) return;
  const w = $("#timerWidget");
  w.style.right = "auto"; w.style.bottom = "auto";
  w.style.left = saved.left + "px"; w.style.top = saved.top + "px";
  clampWidgetPosition();
}
function wireWidgetDrag() {
  const w = $("#timerWidget");
  let dragging = false, moved = false, startX = 0, startY = 0, startLeft = 0, startTop = 0;

  function onDown(clientX, clientY) {
    const rect = w.getBoundingClientRect();
    w.style.right = "auto"; w.style.bottom = "auto";
    w.style.left = rect.left + "px"; w.style.top = rect.top + "px";
    dragging = true; moved = false;
    startX = clientX; startY = clientY; startLeft = rect.left; startTop = rect.top;
  }
  function onMove(clientX, clientY) {
    if (!dragging) return;
    const dx = clientX - startX, dy = clientY - startY;
    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) moved = true;
    if (!moved) return;
    w.style.left = (startLeft + dx) + "px";
    w.style.top = (startTop + dy) + "px";
    clampWidgetPosition();
  }
  function onUp() {
    if (!dragging) return;
    dragging = false;
    if (moved) {
      const rect = w.getBoundingClientRect();
      localStorage.setItem(K_TIMER_POS, JSON.stringify({ left: rect.left, top: rect.top }));
    }
  }

  const handles = [$("#timerToggleBtn"), $("#timerDragHandle")];
  handles.forEach(handle => {
    handle.addEventListener("pointerdown", (e) => { onDown(e.clientX, e.clientY); handle.setPointerCapture(e.pointerId); });
    handle.addEventListener("pointermove", (e) => onMove(e.clientX, e.clientY));
    handle.addEventListener("pointerup", (e) => {
      const wasMoved = moved;
      onUp();
      if (!wasMoved && handle.id === "timerToggleBtn") expandTimerWidget();
    });
  });
  window.addEventListener("resize", clampWidgetPosition);
  w.addEventListener("transitionend", clampWidgetPosition);
}

function expandTimerWidget() { resizeWidgetKeepingAnchor(true); }
function collapseTimerWidget() { resizeWidgetKeepingAnchor(false); }
function resizeWidgetKeepingAnchor(expand) {
  const w = $("#timerWidget");
  const hasCustomPos = w.style.left && w.style.left !== "auto";
  if (hasCustomPos) {
    // Keep whichever edge (left or right) is closer to its screen edge fixed,
    // so a widget docked on the right stays docked on the right when it
    // grows/shrinks, instead of drifting toward the middle of the screen.
    const beforeRect = w.getBoundingClientRect();
    const distRight = window.innerWidth - beforeRect.right;
    const anchorRight = beforeRect.left > distRight;
    if (expand) { w.classList.remove("collapsed"); w.classList.add("expanded"); }
    else { w.classList.remove("expanded"); w.classList.add("collapsed"); }
    if (anchorRight) {
      const newWidth = expand ? 220 : 56;
      w.style.left = (beforeRect.right - newWidth) + "px";
    }
  } else {
    if (expand) { w.classList.remove("collapsed"); w.classList.add("expanded"); }
    else { w.classList.remove("expanded"); w.classList.add("collapsed"); }
  }
  clampWidgetPosition();
}
function wireTimer() {
  restoreWidgetPosition();
  wireWidgetDrag();
  restoreTimerState();
  $("#timerCloseBtn").addEventListener("click", collapseTimerWidget);
  document.querySelectorAll(".mode-timer-btn").forEach(b => b.addEventListener("click", () => { widgetMode = "timer"; refreshAllTimerDisplays(); }));
  document.querySelectorAll(".mode-stopwatch-btn").forEach(b => b.addEventListener("click", () => { widgetMode = "stopwatch"; refreshAllTimerDisplays(); }));
  $("#timerStartBtn").addEventListener("click", () => toggleClock(widgetMode));
  $("#timerResetBtn").addEventListener("click", () => resetClock(widgetMode));
  $("#timerAdjustRow").querySelectorAll("button[data-adj]").forEach(btn => {
    btn.addEventListener("click", () => {
      const delta = parseInt(btn.dataset.adj, 10);
      restTimer.baseSeconds = Math.max(5, restTimer.baseSeconds + delta);
      if (restTimer.running && restTimer.endAt) { restTimer.endAt += delta * 1000; }
      else { restTimer.remaining = Math.max(0, restTimer.remaining + delta); }
      saveTimerState();
      refreshAllTimerDisplays();
    });
  });

  // Full-screen Timer view controls
  $("#restTimerStartBtnFull").addEventListener("click", () => toggleClock("timer"));
  $("#restTimerResetBtnFull").addEventListener("click", () => resetClock("timer"));
  $("#stopwatchStartBtnFull").addEventListener("click", () => toggleClock("stopwatch"));
  $("#stopwatchResetBtnFull").addEventListener("click", () => resetClock("stopwatch"));
  $("#restTimerAdjustFull").querySelectorAll("button[data-adj]").forEach(btn => {
    btn.addEventListener("click", () => {
      const delta = parseInt(btn.dataset.adj, 10);
      restTimer.baseSeconds = Math.max(5, restTimer.baseSeconds + delta);
      if (restTimer.running && restTimer.endAt) { restTimer.endAt += delta * 1000; }
      else { restTimer.remaining = Math.max(0, restTimer.remaining + delta); }
      saveTimerState();
      refreshAllTimerDisplays();
    });
  });
  const beepInput = $("#stopwatchBeepInterval");
  beepInput.value = stopwatch.beepIntervalSec || "";
  beepInput.addEventListener("change", () => {
    stopwatch.beepIntervalSec = Math.max(0, parseInt(beepInput.value, 10) || 0);
    localStorage.setItem("mca_stopwatch_beep", String(stopwatch.beepIntervalSec));
    saveTimerState();
    toast(stopwatch.beepIntervalSec ? `Avviso ogni ${stopwatch.beepIntervalSec}s attivato.` : "Avviso a intervalli disattivato.");
  });

  // Also catch up immediately whenever the tab/PWA becomes visible again,
  // rather than waiting for the next 1s tick.
  document.addEventListener("visibilitychange", () => { if (!document.hidden) refreshAllTimerDisplays(); });

  refreshAllTimerDisplays();
}

/* =========================================================
   AUDIO PLAYER — shuffled within category, sequential categories
   ========================================================= */
const audioEl = () => $("#audioEl");
let currentObjectUrl = null;

function playableTracks() { return state.tracks.filter(t => t.hasAudio || t.src); }

/* Best-effort: load just enough of an audio source to read its duration. */
function probeAudioDuration(url, timeoutMs) {
  return new Promise((resolve) => {
    let done = false;
    const probe = new Audio();
    const finish = (val) => { if (done) return; done = true; resolve(val); };
    const timer = setTimeout(() => finish(null), timeoutMs || 4000);
    probe.addEventListener("loadedmetadata", () => { clearTimeout(timer); finish(isFinite(probe.duration) ? probe.duration : null); });
    probe.addEventListener("error", () => { clearTimeout(timer); finish(null); });
    probe.preload = "metadata";
    probe.src = url;
  });
}
function totalDurationSec(tracks) { return tracks.reduce((sum, t) => sum + (t.durationSec || 0), 0); }
function fmtDurationOrDash(sec) { return sec ? fmtClock(sec) : "--:--"; }

function categoryOrder() {
  const cats = state.musicSections.slice();
  state.tracks.forEach(t => { if (!cats.includes(t.category)) cats.push(t.category); });
  return cats;
}
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function buildQueue(startTrackId) {
  const cats = categoryOrder();
  let queue = [];
  cats.forEach(cat => {
    let group = shuffle(playableTracks().filter(t => t.category === cat));
    if (startTrackId) {
      const idx = group.findIndex(t => t.id === startTrackId);
      if (idx > 0) { const [tr] = group.splice(idx, 1); group.unshift(tr); }
    }
    queue = queue.concat(group);
  });
  return queue;
}

async function playTrack(trackId) {
  const track = state.tracks.find(t => t.id === trackId);
  if (!track) return;
  if (!track.hasAudio && !track.src) { toast("Carica un file audio (o indica un percorso) per questa canzone nelle impostazioni."); return; }

  state.playQueue = buildQueue(trackId);
  state.queueIndex = state.playQueue.findIndex(t => t.id === trackId);

  const a = audioEl();
  if (track.src) {
    if (currentObjectUrl) { URL.revokeObjectURL(currentObjectUrl); currentObjectUrl = null; }
    a.src = track.src;
  } else {
    const blob = await AudioDB.get(trackId);
    if (!blob) { toast("File audio non trovato. Ricaricalo nelle impostazioni."); return; }
    if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = URL.createObjectURL(blob);
    a.src = currentObjectUrl;
  }
  a.play().catch(() => {});
  state.currentTrackId = trackId;
  updatePlayerBar(); updateMediaSession(track); renderPlaylistSheet();
}

function togglePlayPause() {
  const a = audioEl();
  if (!state.currentTrackId) {
    const first = playableTracks()[0];
    if (first) playTrack(first.id); else toast("Aggiungi una canzone nelle impostazioni per iniziare.");
    return;
  }
  if (a.paused) a.play().catch(() => {}); else a.pause();
}

function updatePlayerBar() {
  const track = state.tracks.find(t => t.id === state.currentTrackId);
  $("#playerTitle").textContent = track ? track.title : "Nessuna canzone";
  $("#playerArtist").textContent = track ? track.artist : "—";
  const a = audioEl();
  $("#playerPlayPause").textContent = (track && !a.paused) ? "⏸" : "▶";
}
function updateMediaSession(track) {
  if (!("mediaSession" in navigator)) return;
  navigator.mediaSession.metadata = new MediaMetadata({ title: track.title, artist: track.artist, album: "MyCalisthenicsApp" });
  navigator.mediaSession.setActionHandler("play", () => audioEl().play());
  navigator.mediaSession.setActionHandler("pause", () => audioEl().pause());
  navigator.mediaSession.setActionHandler("previoustrack", () => stepTrack(-1));
  navigator.mediaSession.setActionHandler("nexttrack", () => stepTrack(1));
}
function stepTrack(dir) {
  if (!state.playQueue.length) { const list = playableTracks(); if (!list.length) return; playTrack(list[0].id); return; }
  let nextIdx = state.queueIndex + dir;
  if (nextIdx >= state.playQueue.length) { state.playQueue = buildQueue(null); nextIdx = 0; }
  if (nextIdx < 0) nextIdx = 0;
  const next = state.playQueue[nextIdx];
  if (!next) return;
  state.queueIndex = nextIdx;
  playTrackDirect(next.id);
}
async function playTrackDirect(trackId) {
  // like playTrack but keeps the existing queue/index instead of rebuilding it
  const track = state.tracks.find(t => t.id === trackId);
  if (!track) return;
  const a = audioEl();
  if (track.src) {
    if (currentObjectUrl) { URL.revokeObjectURL(currentObjectUrl); currentObjectUrl = null; }
    a.src = track.src;
  } else {
    const blob = await AudioDB.get(trackId);
    if (!blob) return;
    if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = URL.createObjectURL(blob);
    a.src = currentObjectUrl;
  }
  a.play().catch(() => {});
  state.currentTrackId = trackId;
  updatePlayerBar(); updateMediaSession(track); renderPlaylistSheet();
}

function renderPlaylistSheet() {
  const sheet = $("#playlistSheet");
  sheet.innerHTML = "";
  categoryOrder().forEach(cat => {
    sheet.appendChild(el("div", "playlist-category", cat));
    const tracksInCat = state.tracks.filter(t => t.category === cat);
    if (!tracksInCat.length) {
      sheet.appendChild(el("div", "playlist-empty", "Nessuna canzone in questa sezione."));
      return;
    }
    tracksInCat.forEach(t => {
      const playable = t.hasAudio || t.src;
      const row = el("div", "playlist-track" + (t.id === state.currentTrackId ? " playing" : "") + (playable ? "" : " no-audio"));
      row.innerHTML = `<div class="t-info"><div class="t-title">${escapeHtml(t.title)}</div><div class="t-artist">${escapeHtml(t.artist)}</div></div><div class="t-bpm">${fmtDurationOrDash(t.durationSec)} · ${t.bpm} bpm${playable ? "" : " · no file"}</div>`;
      row.addEventListener("click", () => playTrack(t.id));
      sheet.appendChild(row);
    });
  });
}

function wirePlayer() {
  $("#playerPlayPause").addEventListener("click", togglePlayPause);
  $("#playerRestart").addEventListener("click", () => {
    const a = audioEl();
    if (!state.currentTrackId) return;
    a.currentTime = 0;
  });
  $("#playerNext").addEventListener("click", () => stepTrack(1));
  $("#playerExpand").addEventListener("click", () => {
    state.playlistOpen = !state.playlistOpen;
    $("#playlistSheet").classList.toggle("open", state.playlistOpen);
    $("#playerExpand").textContent = state.playlistOpen ? "▼" : "▲";
  });
  const a = audioEl();
  a.addEventListener("play", updatePlayerBar);
  a.addEventListener("pause", updatePlayerBar);
  a.addEventListener("ended", () => stepTrack(1));
  a.addEventListener("error", () => {
    if (state.currentTrackId) toast("Impossibile riprodurre questo brano. Controlla percorso/formato del file (in locale via doppio click alcuni percorsi non funzionano — prova dopo la pubblicazione online).");
  });
  a.addEventListener("loadedmetadata", () => {
    if (!state.currentTrackId || !isFinite(a.duration)) return;
    const track = state.tracks.find(t => t.id === state.currentTrackId);
    if (!track || track.durationSec) return;
    track.durationSec = Math.round(a.duration);
    saveTracks();
    renderSettingsTracks(); renderPlaylistSheet();
  });
}

/* =========================================================
   SETTINGS — plans (grouped, reorderable)
   ========================================================= */
const PLAN_GROUP_PRESETS = ["Skills", "Braccia", "Schiena", "Gambe", "Core", "Full body", "Generale"];

function renderSettingsPlans() {
  const list = $("#settingsPlansList");
  list.innerHTML = "";
  const groups = orderedGroups();
  groups.forEach((g, gIdx) => {
    const groupHeader = el("div", "group-header-row");
    groupHeader.appendChild(el("span", "", escapeHtml(g)));
    const groupReorder = el("div", "reorder-btns");
    const gUp = el("button", "", "▲"); gUp.addEventListener("click", () => moveGroup(gIdx, -1));
    const gDown = el("button", "", "▼"); gDown.addEventListener("click", () => moveGroup(gIdx, 1));
    groupReorder.appendChild(gUp); groupReorder.appendChild(gDown);
    groupHeader.appendChild(groupReorder);
    list.appendChild(groupHeader);
    const groupPlans = state.plans.filter(p => p.group === g && !p.archived);
    groupPlans.forEach((p) => {
      const globalIdx = state.plans.indexOf(p);
      const totalEx = p.phases.reduce((s, ph) => s + ph.exercises.length, 0);
      const row = el("div", "card-row");
      row.innerHTML = `<div class="r-info"><div class="r-title">${escapeHtml(p.title)}</div><div class="r-sub">${p.phases.length} fasi · ${totalEx} esercizi</div></div>`;
      const reorder = el("div", "reorder-btns");
      const up = el("button", "", "▲"); up.addEventListener("click", () => movePlan(globalIdx, -1));
      const down = el("button", "", "▼"); down.addEventListener("click", () => movePlan(globalIdx, 1));
      reorder.appendChild(up); reorder.appendChild(down);
      row.appendChild(reorder);
      const actions = el("div", "r-actions");
      const editBtn = el("button", "icon-mini", "✎"); editBtn.addEventListener("click", () => openPlanForm(p.id));
      const archBtn = el("button", "icon-mini", "🗄");
      archBtn.title = "Sposta in archivio";
      archBtn.addEventListener("click", () => {
        p.archived = true;
        savePlans();
        if (state.currentPlanId === p.id) {
          const next = state.plans.find(x => !x.archived);
          state.currentPlanId = next ? next.id : null;
          if (state.currentPlanId) localStorage.setItem(K_LAST_PLAN, state.currentPlanId);
          loadProgressForCurrentPlan();
        }
        renderSettingsPlans(); renderSettingsArchive(); renderDrawer(); renderWorkout();
        toast("Scheda spostata in archivio.");
      });
      const delBtn = el("button", "icon-mini danger", "🗑");
      delBtn.addEventListener("click", () => {
        if (!confirm(`Eliminare la scheda "${p.title}"?`)) return;
        state.plans = state.plans.filter(x => x.id !== p.id);
        savePlans();
        if (state.currentPlanId === p.id) state.currentPlanId = state.plans[0] ? state.plans[0].id : null;
        renderSettingsPlans(); renderDrawer(); renderWorkout();
      });
      actions.appendChild(editBtn); actions.appendChild(archBtn); actions.appendChild(delBtn);
      row.appendChild(actions);
      list.appendChild(row);
    });
  });
}

function renderSettingsArchive() {
  const list = $("#settingsArchiveList");
  if (!list) return;
  list.innerHTML = "";
  const archived = state.plans.filter(p => p.archived);
  if (!archived.length) { list.appendChild(el("div", "playlist-empty", "Nessuna scheda archiviata.")); return; }
  archived.forEach(p => {
    const totalEx = p.phases.reduce((s, ph) => s + ph.exercises.length, 0);
    const row = el("div", "card-row");
    row.innerHTML = `<div class="r-info"><div class="r-title">${escapeHtml(p.title)}</div><div class="r-sub">${escapeHtml(p.group)} · ${p.phases.length} fasi · ${totalEx} esercizi</div></div>`;
    const actions = el("div", "r-actions");
    const restoreBtn = el("button", "icon-mini", "↺");
    restoreBtn.title = "Ripristina";
    restoreBtn.addEventListener("click", () => {
      p.archived = false;
      ensureGroupInOrder(p.group);
      savePlans();
      renderSettingsPlans(); renderSettingsArchive(); renderDrawer(); renderWorkout();
      toast("Scheda ripristinata.");
    });
    const delBtn = el("button", "icon-mini danger", "🗑");
    delBtn.addEventListener("click", () => {
      if (!confirm(`Eliminare definitivamente "${p.title}"?`)) return;
      state.plans = state.plans.filter(x => x.id !== p.id);
      savePlans();
      renderSettingsArchive();
    });
    actions.appendChild(restoreBtn); actions.appendChild(delBtn);
    row.appendChild(actions);
    list.appendChild(row);
  });
}
function movePlan(idx, dir) {
  const newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= state.plans.length) return;
  const [p] = state.plans.splice(idx, 1);
  state.plans.splice(newIdx, 0, p);
  savePlans(); renderSettingsPlans(); renderDrawer();
}
function moveGroup(idx, dir) {
  const groups = orderedGroups();
  const newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= groups.length) return;
  const fullOrder = state.planGroupOrder.filter(g => groups.includes(g));
  const [g] = fullOrder.splice(idx, 1);
  fullOrder.splice(newIdx, 0, g);
  // merge back any group names not currently present in plans, preserving their relative spot
  const merged = state.planGroupOrder.filter(g2 => !groups.includes(g2));
  state.planGroupOrder = fullOrder.concat(merged);
  savePlanGroupOrder(); renderSettingsPlans(); renderDrawer();
}

function openPlanForm(planId) {
  const editing = !!planId;
  const plan = editing ? JSON.parse(JSON.stringify(state.plans.find(p => p.id === planId)))
    : { id: uid("plan"), title: "", group: "Generale", estimatedMinutes: 0, phases: [] };

  const content = $("#sheetContent");
  content.innerHTML = "";
  content.appendChild(el("h3", "", editing ? "Modifica scheda" : "Nuova scheda"));

  const titleField = el("div", "field", `<label>Titolo scheda</label>`);
  const titleInput = el("input"); titleInput.type = "text"; titleInput.value = plan.title; titleInput.placeholder = "Es. Scheda Statici";
  titleField.appendChild(titleInput); content.appendChild(titleField);

  const row0 = el("div", "field-row");
  const groupField = el("div", "field", `<label>Gruppo</label>`);
  const groupInput = el("input"); groupInput.type = "text"; groupInput.value = plan.group; groupInput.setAttribute("list", "groupPresets"); groupInput.placeholder = "Skills, Braccia, Schiena...";
  const datalist = el("datalist"); datalist.id = "groupPresets";
  PLAN_GROUP_PRESETS.forEach(g => { const o = document.createElement("option"); o.value = g; datalist.appendChild(o); });
  groupField.appendChild(groupInput); groupField.appendChild(datalist);
  row0.appendChild(groupField);

  const durationField = el("div", "field", `<label>Tempo stimato (minuti)</label>`);
  const durationInput = el("input"); durationInput.type = "number"; durationInput.min = "0"; durationInput.value = plan.estimatedMinutes || "";
  durationInput.placeholder = "es. 45";
  durationField.appendChild(durationInput); row0.appendChild(durationField);
  content.appendChild(row0);

  const phasesWrap = el("div");
  content.appendChild(phasesWrap);

  function renderPhases() {
    phasesWrap.innerHTML = "";
    plan.phases.forEach((phase, pIdx) => {
      const block = el("div", "subblock");
      const header = el("div", "subblock-header");
      header.innerHTML = `<span>FASE ${pIdx + 1}</span>`;
      const rm = el("button", "mini-remove", "Rimuovi fase");
      rm.addEventListener("click", () => { plan.phases.splice(pIdx, 1); renderPhases(); });
      header.appendChild(rm); block.appendChild(header);

      const nameField = el("div", "field", `<label>Nome fase</label>`);
      const nameInput = el("input"); nameInput.type = "text"; nameInput.value = phase.name;
      nameInput.addEventListener("input", () => phase.name = nameInput.value);
      nameField.appendChild(nameInput); block.appendChild(nameField);

      phase.exercises.forEach((ex, eIdx) => {
        const exBlock = el("div", "subblock"); exBlock.style.background = "var(--surface-3)";
        const exHeader = el("div", "subblock-header");
        exHeader.innerHTML = `<span>Esercizio ${eIdx + 1}</span>`;
        const exHeaderActions = el("div", "subblock-header-actions");
        const exReorder = el("div", "reorder-btns");
        const exUp = el("button", "", "▲"); exUp.addEventListener("click", () => {
          if (eIdx <= 0) return;
          const [moved] = phase.exercises.splice(eIdx, 1);
          phase.exercises.splice(eIdx - 1, 0, moved);
          renderPhases();
        });
        const exDown = el("button", "", "▼"); exDown.addEventListener("click", () => {
          if (eIdx >= phase.exercises.length - 1) return;
          const [moved] = phase.exercises.splice(eIdx, 1);
          phase.exercises.splice(eIdx + 1, 0, moved);
          renderPhases();
        });
        exReorder.appendChild(exUp); exReorder.appendChild(exDown);
        exHeaderActions.appendChild(exReorder);
        const rmEx = el("button", "mini-remove", "Rimuovi");
        rmEx.addEventListener("click", () => { phase.exercises.splice(eIdx, 1); renderPhases(); });
        exHeaderActions.appendChild(rmEx);
        exHeader.appendChild(exHeaderActions); exBlock.appendChild(exHeader);

        const nf = el("div", "field", "<label>Nome esercizio</label>");
        const ni = el("input"); ni.type = "text"; ni.value = ex.name; ni.addEventListener("input", () => ex.name = ni.value);
        nf.appendChild(ni); exBlock.appendChild(nf);

        const typeF = el("div", "field", "<label>Tipo di serie</label>");
        const typeI = el("select");
        [["standard", "Standard (serie × ripetizioni)"], ["custom", "Sequenza personalizzata (piramidale, a W, irregolare...)"]].forEach(([v, l]) => {
          const o = document.createElement("option"); o.value = v; o.textContent = l;
          if ((Array.isArray(ex.repScheme) && ex.repScheme.length ? "custom" : "standard") === v) o.selected = true;
          typeI.appendChild(o);
        });
        typeF.appendChild(typeI); exBlock.appendChild(typeF);

        const standardWrap = el("div");
        const row1 = el("div", "field-row");
        const setsF = el("div", "field", "<label>Serie</label>");
        const setsI = el("input"); setsI.type = "number"; setsI.min = "1"; setsI.value = ex.sets;
        setsI.addEventListener("input", () => ex.sets = parseInt(setsI.value, 10) || 1);
        setsF.appendChild(setsI);
        const repsF = el("div", "field", "<label>Ripetizioni / durata</label>");
        const repsI = el("input"); repsI.type = "text"; repsI.value = ex.reps; repsI.placeholder = "8-10 rip. / 30s";
        repsI.addEventListener("input", () => ex.reps = repsI.value);
        repsF.appendChild(repsI);
        row1.appendChild(setsF); row1.appendChild(repsF); standardWrap.appendChild(row1);
        exBlock.appendChild(standardWrap);

        const customWrap = el("div");
        const seqF = el("div", "field", "<label>Sequenza ripetizioni (separate da virgola)</label>");
        const seqI = el("input"); seqI.type = "text"; seqI.value = (ex.repScheme || []).join(","); seqI.placeholder = "5,4,3,2,1,2,3,4,5";
        seqI.addEventListener("input", () => {
          const parsed = seqI.value.split(",").map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n) && n > 0);
          ex.repScheme = parsed; ex.sets = parsed.length || 1;
        });
        seqF.appendChild(seqI); customWrap.appendChild(seqF);

        const genRow = el("div", "field-row");
        const genNumF = el("div", "field", "<label>Genera da N</label>");
        const genNumI = el("input"); genNumI.type = "number"; genNumI.min = "1"; genNumI.value = "5";
        genNumF.appendChild(genNumI); genRow.appendChild(genNumF);
        customWrap.appendChild(genRow);

        function appendToSeq(vals) {
          const cur = seqI.value.trim();
          seqI.value = cur ? cur + "," + vals.join(",") : vals.join(",");
          seqI.dispatchEvent(new Event("input"));
        }
        const genBtnsRow = el("div", "gen-btns-row");
        const descBtn = el("button", "mini-gen-btn", "↓ Discendente");
        descBtn.addEventListener("click", () => { const n = parseInt(genNumI.value, 10) || 1; const arr = []; for (let i = n; i >= 1; i--) arr.push(i); appendToSeq(arr); });
        const ascBtn = el("button", "mini-gen-btn", "↑ Ascendente");
        ascBtn.addEventListener("click", () => { const n = parseInt(genNumI.value, 10) || 1; const arr = []; for (let i = 1; i <= n; i++) arr.push(i); appendToSeq(arr); });
        const pyrBtn = el("button", "mini-gen-btn", "△ Piramide");
        pyrBtn.addEventListener("click", () => { const n = parseInt(genNumI.value, 10) || 1; const arr = []; for (let i = n; i >= 1; i--) arr.push(i); for (let i = 2; i <= n; i++) arr.push(i); appendToSeq(arr); });
        genBtnsRow.appendChild(descBtn); genBtnsRow.appendChild(ascBtn); genBtnsRow.appendChild(pyrBtn);
        customWrap.appendChild(genBtnsRow);
        const genHint = el("div", "gen-hint", "I pulsanti aggiungono alla sequenza esistente: componi schemi come la tecnica a W ripetendo Discendente/Ascendente più volte, poi modifica a mano se serve.");
        customWrap.appendChild(genHint);
        exBlock.appendChild(customWrap);

        function syncExerciseType() {
          const isCustom = typeI.value === "custom";
          standardWrap.style.display = isCustom ? "none" : "block";
          customWrap.style.display = isCustom ? "block" : "none";
          if (!isCustom) ex.repScheme = null;
        }
        typeI.addEventListener("change", syncExerciseType);
        syncExerciseType();

        const row2 = el("div", "field-row");
        const restF = el("div", "field", "<label>Recupero tra serie (s)</label>");
        const restI = el("input"); restI.type = "number"; restI.min = "0"; restI.value = ex.restSeconds;
        restI.addEventListener("input", () => ex.restSeconds = parseInt(restI.value, 10) || 0);
        restF.appendChild(restI);
        const restAfterF = el("div", "field", "<label>Recupero dopo l'esercizio (s)</label>");
        const restAfterI = el("input"); restAfterI.type = "number"; restAfterI.min = "0"; restAfterI.value = ex.restAfter || 0;
        restAfterI.addEventListener("input", () => ex.restAfter = parseInt(restAfterI.value, 10) || 0);
        restAfterF.appendChild(restAfterI);
        row2.appendChild(restF); row2.appendChild(restAfterF); exBlock.appendChild(row2);

        const noteF = el("div", "field", "<label>Nota (opzionale)</label>");
        const noteI = el("input"); noteI.type = "text"; noteI.value = ex.note || "";
        noteI.addEventListener("input", () => ex.note = noteI.value);
        noteF.appendChild(noteI); exBlock.appendChild(noteF);

        block.appendChild(exBlock);
      });

      const addExBtn = el("button", "btn-add", "+ Aggiungi esercizio");
      addExBtn.addEventListener("click", () => { phase.exercises.push({ id: uid("ex"), name: "", sets: 3, reps: "", restSeconds: 60, restAfter: 0, note: "", repScheme: null }); renderPhases(); });
      block.appendChild(addExBtn);

      const phaseRestF = el("div", "field", "<label>Recupero prima della fase successiva (s)</label>");
      const phaseRestI = el("input"); phaseRestI.type = "number"; phaseRestI.min = "0"; phaseRestI.value = phase.restAfter || 0;
      phaseRestI.addEventListener("input", () => phase.restAfter = parseInt(phaseRestI.value, 10) || 0);
      phaseRestF.appendChild(phaseRestI); block.appendChild(phaseRestF);

      phasesWrap.appendChild(block);
    });
  }
  renderPhases();

  const addPhaseBtn = el("button", "btn-add", "+ Aggiungi fase");
  addPhaseBtn.style.marginBottom = "14px";
  addPhaseBtn.addEventListener("click", () => { plan.phases.push({ name: "", restAfter: 0, exercises: [] }); renderPhases(); });
  content.appendChild(addPhaseBtn);

  const actions = el("div", "sheet-actions");
  const cancelBtn = el("button", "btn-secondary", "Annulla"); cancelBtn.addEventListener("click", closeSheet);
  const saveBtn = el("button", "btn-primary", "Salva");
  saveBtn.addEventListener("click", () => {
    plan.title = titleInput.value.trim() || "Scheda senza nome";
    plan.group = groupInput.value.trim() || "Generale";
    plan.estimatedMinutes = Math.max(0, parseInt(durationInput.value, 10) || 0);
    ensureGroupInOrder(plan.group);
    if (editing) { state.plans[state.plans.findIndex(p => p.id === planId)] = plan; }
    else { state.plans.push(plan); state.currentPlanId = plan.id; localStorage.setItem(K_LAST_PLAN, plan.id); loadProgressForCurrentPlan(); }
    savePlans();
    renderSettingsPlans(); renderDrawer(); renderWorkout();
    closeSheet(); toast("Scheda salvata.");
  });
  actions.appendChild(cancelBtn); actions.appendChild(saveBtn); content.appendChild(actions);
  openSheet();
}

/* =========================================================
   SETTINGS — music sections (renamed / added freely)
   ========================================================= */
function renderMusicSections() {
  const list = $("#settingsMusicSectionsList");
  list.innerHTML = "";
  state.musicSections.forEach((name, idx) => {
    const count = state.tracks.filter(t => t.category === name).length;
    const row = el("div", "card-row");
    const nameI = el("input"); nameI.type = "text"; nameI.value = name; nameI.style.cssText = "flex:1;min-width:0;background:transparent;border:none;color:var(--chalk);font-family:var(--font-body);font-size:14px;font-weight:600;padding:0;";
    nameI.addEventListener("change", () => {
      const newName = nameI.value.trim();
      if (!newName || newName === name) { nameI.value = name; return; }
      if (state.musicSections.includes(newName)) { toast("Esiste già una fase con questo nome."); nameI.value = name; return; }
      state.tracks.forEach(t => { if (t.category === name) t.category = newName; });
      state.musicSections[idx] = newName;
      saveMusicSections(); saveTracks();
      renderMusicSections(); renderSettingsTracks(); renderPlaylistSheet();
      toast("Fase rinominata.");
    });
    row.appendChild(nameI);
    const sub = el("div", "r-sub", `${count} canzoni`); sub.style.flexShrink = "0"; sub.style.marginRight = "8px";
    row.appendChild(sub);
    const reorder = el("div", "reorder-btns");
    const up = el("button", "", "▲"); up.addEventListener("click", () => moveMusicSection(idx, -1));
    const down = el("button", "", "▼"); down.addEventListener("click", () => moveMusicSection(idx, 1));
    reorder.appendChild(up); reorder.appendChild(down);
    row.appendChild(reorder);
    const delBtn = el("button", "icon-mini danger", "🗑");
    delBtn.addEventListener("click", () => {
      if (count > 0) { toast("Sposta prima le canzoni di questa fase in un'altra sezione."); return; }
      if (!confirm(`Eliminare la fase "${name}"?`)) return;
      state.musicSections.splice(idx, 1);
      saveMusicSections(); renderMusicSections(); renderPlaylistSheet();
    });
    row.appendChild(delBtn);
    list.appendChild(row);
  });
}
function moveMusicSection(idx, dir) {
  const newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= state.musicSections.length) return;
  const [s] = state.musicSections.splice(idx, 1);
  state.musicSections.splice(newIdx, 0, s);
  saveMusicSections(); renderMusicSections(); renderPlaylistSheet(); renderSettingsTracks();
}

/* =========================================================
   SETTINGS — tracks
   ========================================================= */
function renderSettingsTracks() {
  const list = $("#settingsTracksList");
  list.innerHTML = "";

  const totalSec = totalDurationSec(state.tracks);
  const unknownCount = state.tracks.filter(t => !t.durationSec).length;
  const summary = el("div", "playlist-total");
  summary.textContent = `${state.tracks.length} canzoni · ${fmtClock(totalSec)} totali` + (unknownCount ? ` (${unknownCount} durata non nota)` : "");
  list.appendChild(summary);

  categoryOrder().forEach(cat => {
    const tracksInCat = state.tracks.filter(t => t.category === cat);
    if (!tracksInCat.length) return;
    const secInCat = totalDurationSec(tracksInCat);
    list.appendChild(el("div", "group-header", `${escapeHtml(cat)} · ${tracksInCat.length} · ${fmtClock(secInCat)}`));
    tracksInCat.forEach(t => {
      const playable = t.hasAudio || t.src;
      const row = el("div", "card-row");
      row.innerHTML = `<div class="r-info"><div class="r-title">${escapeHtml(t.title)}</div><div class="r-sub">${escapeHtml(t.artist)} · ${fmtDurationOrDash(t.durationSec)} · ${t.bpm} bpm ${playable ? "· ✓ audio" : "· nessun file"}</div></div>`;
      const actions = el("div", "r-actions");
      const editBtn = el("button", "icon-mini", "✎"); editBtn.addEventListener("click", () => openTrackForm(t.id));
      const delBtn = el("button", "icon-mini danger", "🗑");
      delBtn.addEventListener("click", async () => {
        if (!confirm(`Eliminare "${t.title}"?`)) return;
        state.tracks = state.tracks.filter(x => x.id !== t.id);
        saveTracks(); await AudioDB.remove(t.id);
        if (state.currentTrackId === t.id) state.currentTrackId = null;
        renderSettingsTracks(); renderPlaylistSheet(); updatePlayerBar();
      });
      actions.appendChild(editBtn); actions.appendChild(delBtn);
      row.appendChild(actions); list.appendChild(row);
    });
  });
}

function openTrackForm(trackId) {
  const editing = !!trackId;
  const track = editing ? { ...state.tracks.find(t => t.id === trackId) } : { id: uid("trk"), title: "", artist: "", bpm: 120, category: state.musicSections[0] || "Generale", hasAudio: false, src: "", durationSec: null };
  let pendingFile = null;

  const content = $("#sheetContent");
  content.innerHTML = "";
  content.appendChild(el("h3", "", editing ? "Modifica canzone" : "Nuova canzone"));

  const titleF = el("div", "field", "<label>Titolo</label>");
  const titleI = el("input"); titleI.type = "text"; titleI.value = track.title; titleF.appendChild(titleI); content.appendChild(titleF);

  const artistF = el("div", "field", "<label>Artista</label>");
  const artistI = el("input"); artistI.type = "text"; artistI.value = track.artist; artistF.appendChild(artistI); content.appendChild(artistF);

  const row1 = el("div", "field-row");
  const bpmF = el("div", "field", "<label>BPM</label>");
  const bpmI = el("input"); bpmI.type = "number"; bpmI.min = "40"; bpmI.value = track.bpm; bpmF.appendChild(bpmI);
  const catF = el("div", "field", "<label>Fase / categoria</label>");
  const catI = el("select");
  state.musicSections.forEach(cat => { const o = document.createElement("option"); o.value = cat; o.textContent = cat; if (track.category === cat) o.selected = true; catI.appendChild(o); });
  if (track.category && !state.musicSections.includes(track.category)) { const o = document.createElement("option"); o.value = track.category; o.textContent = track.category; o.selected = true; catI.appendChild(o); }
  catF.appendChild(catI);
  row1.appendChild(bpmF); row1.appendChild(catF); content.appendChild(row1);

  const fileF = el("div", "field", "<label>Carica file audio (locale su questo dispositivo)</label>");
  const fileDrop = el("div", "file-drop" + (track.hasAudio ? " has-file" : ""), track.hasAudio ? "File audio già caricato — tocca per sostituirlo" : "Nessun file — tocca per selezionare un audio dal dispositivo");
  const fileInput = el("input"); fileInput.type = "file"; fileInput.accept = "audio/*"; fileInput.style.display = "none";
  fileDrop.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", () => {
    if (fileInput.files && fileInput.files[0]) {
      pendingFile = fileInput.files[0];
      fileDrop.textContent = "Selezionato: " + pendingFile.name;
      fileDrop.classList.add("has-file");
    }
  });
  fileF.appendChild(fileDrop); fileF.appendChild(fileInput); content.appendChild(fileF);

  const srcF = el("div", "field", "<label>Oppure: percorso file nel progetto (funziona su tutti i dispositivi)</label>");
  const srcI = el("input"); srcI.type = "text"; srcI.value = track.src || ""; srcI.placeholder = "audio/nomefile.mp3";
  srcF.appendChild(srcI); content.appendChild(srcF);

  const actions = el("div", "sheet-actions");
  const cancelBtn = el("button", "btn-secondary", "Annulla"); cancelBtn.addEventListener("click", closeSheet);
  const saveBtn = el("button", "btn-primary", "Salva");
  saveBtn.addEventListener("click", async () => {
    const originalSrc = track.src || "";
    saveBtn.disabled = true; saveBtn.textContent = "Salvataggio...";
    track.title = titleI.value.trim() || "Senza titolo";
    track.artist = artistI.value.trim() || "Sconosciuto";
    track.bpm = parseInt(bpmI.value, 10) || 120;
    track.category = catI.value.trim() || "Generale";
    track.src = srcI.value.trim();
    if (pendingFile) {
      await AudioDB.put(track.id, pendingFile);
      track.hasAudio = true;
      const tmpUrl = URL.createObjectURL(pendingFile);
      const dur = await probeAudioDuration(tmpUrl, 4000);
      URL.revokeObjectURL(tmpUrl);
      if (dur) track.durationSec = Math.round(dur);
    } else if (track.src && track.src !== originalSrc) {
      const dur = await probeAudioDuration(track.src, 4000);
      if (dur) track.durationSec = Math.round(dur);
    }
    if (editing) state.tracks[state.tracks.findIndex(t => t.id === trackId)] = track; else state.tracks.push(track);
    if (!state.musicSections.includes(track.category)) { state.musicSections.push(track.category); saveMusicSections(); }
    saveTracks();
    renderSettingsTracks(); renderPlaylistSheet();
    closeSheet(); toast("Canzone salvata.");
  });
  actions.appendChild(cancelBtn); actions.appendChild(saveBtn); content.appendChild(actions);
  openSheet();
}

/* =========================================================
   GOALS
   ========================================================= */
function renderGoals() {
  const q = randomQuote();
  $("#goalsQuoteBanner").innerHTML = `“${escapeHtml(q.text)}”<br><small style="opacity:.7">— ${escapeHtml(q.author)}</small>`;
  const active = state.goals.filter(g => !g.achievedDate);
  const achieved = state.goals.filter(g => g.achievedDate);

  const activeList = $("#goalsActiveList"); activeList.innerHTML = "";
  if (!active.length) activeList.appendChild(el("div", "playlist-empty", "Nessun obiettivo attivo."));
  active.forEach(g => activeList.appendChild(renderGoalCard(g, false)));

  const achievedList = $("#goalsAchievedList"); achievedList.innerHTML = "";
  if (!achieved.length) achievedList.appendChild(el("div", "playlist-empty", "Ancora nessun traguardo raggiunto."));
  achieved.forEach(g => achievedList.appendChild(renderGoalCard(g, true)));
}
function renderGoalCard(g, achieved) {
  const card = el("div", "goal-card" + (achieved ? " achieved" : ""));
  let html = `<div class="goal-title"><span>${escapeHtml(g.title)}</span>${achieved ? '<span class="badge-achieved">Raggiunto</span>' : ""}</div>`;
  if (g.description) html += `<div class="goal-desc">${escapeHtml(g.description)}</div>`;
  html += `<div class="goal-dates"><span>Inizio: ${fmtDate(g.startDate)}</span>`;
  if (achieved) html += `<span>Raggiunto: ${fmtDate(g.achievedDate)}</span>`;
  else if (g.targetDate) html += `<span>Scadenza: ${fmtDate(g.targetDate)}</span>`;
  html += `</div>`;
  card.innerHTML = html;
  const actionsRow = el("div", "goal-actions");
  if (!achieved) {
    const markBtn = el("button", "mark-achieved", "✓ Segna come raggiunto");
    markBtn.addEventListener("click", () => { g.achievedDate = todayIso(); saveGoals(); renderGoals(); toast("Obiettivo raggiunto! 🎉"); });
    actionsRow.appendChild(markBtn);
  }
  const editBtn = el("button", "", "Modifica"); editBtn.addEventListener("click", () => openGoalForm(g.id));
  const delBtn = el("button", "", "Elimina");
  delBtn.addEventListener("click", () => { if (!confirm("Eliminare l'obiettivo?")) return; state.goals = state.goals.filter(x => x.id !== g.id); saveGoals(); renderGoals(); });
  actionsRow.appendChild(editBtn); actionsRow.appendChild(delBtn);
  card.appendChild(actionsRow);
  return card;
}
function openGoalForm(goalId) {
  const editing = !!goalId;
  const goal = editing ? { ...state.goals.find(g => g.id === goalId) } : { id: uid("goal"), title: "", description: "", startDate: todayIso(), targetDate: "", achievedDate: null };

  const content = $("#sheetContent");
  content.innerHTML = "";
  content.appendChild(el("h3", "", editing ? "Modifica obiettivo" : "Nuovo obiettivo"));

  const titleF = el("div", "field", "<label>Obiettivo</label>");
  const titleI = el("input"); titleI.type = "text"; titleI.value = goal.title; titleI.placeholder = "Es. Front lever completo";
  titleF.appendChild(titleI); content.appendChild(titleF);

  const descF = el("div", "field", "<label>Descrizione (opzionale)</label>");
  const descI = el("textarea"); descI.value = goal.description || "";
  descF.appendChild(descI); content.appendChild(descF);

  const row1 = el("div", "field-row");
  const startF = el("div", "field", "<label>Data inizio</label>");
  const startI = el("input"); startI.type = "date"; startI.value = goal.startDate; startF.appendChild(startI);
  const targetF = el("div", "field", "<label>Scadenza (opzionale)</label>");
  const targetI = el("input"); targetI.type = "date"; targetI.value = goal.targetDate || ""; targetF.appendChild(targetI);
  row1.appendChild(startF); row1.appendChild(targetF); content.appendChild(row1);

  const actions = el("div", "sheet-actions");
  const cancelBtn = el("button", "btn-secondary", "Annulla"); cancelBtn.addEventListener("click", closeSheet);
  const saveBtn = el("button", "btn-primary", "Salva");
  saveBtn.addEventListener("click", () => {
    goal.title = titleI.value.trim() || "Obiettivo senza nome";
    goal.description = descI.value.trim();
    goal.startDate = startI.value || todayIso();
    goal.targetDate = targetI.value || "";
    if (editing) state.goals[state.goals.findIndex(g => g.id === goalId)] = goal; else state.goals.push(goal);
    saveGoals(); renderGoals(); closeSheet(); toast("Obiettivo salvato.");
  });
  actions.appendChild(cancelBtn); actions.appendChild(saveBtn); content.appendChild(actions);
  openSheet();
}

/* =========================================================
   CALENDAR
   ========================================================= */
const calState = { year: new Date().getFullYear(), month: new Date().getMonth() };
const CAL_TYPE_LABEL = { rest: "Rest day", cardio: "Cardio" };
function calEntryLabel(entry) {
  if (entry.type === "plan") { const p = state.plans.find(pl => pl.id === entry.planId); return p ? p.title : "Scheda"; }
  if (entry.type === "custom") return entry.label || "Personalizzato";
  return CAL_TYPE_LABEL[entry.type] || "";
}

function renderCalendar() {
  const label = new Date(calState.year, calState.month, 1).toLocaleDateString("it-IT", { month: "long", year: "numeric" });
  $("#calMonthLabel").textContent = label.charAt(0).toUpperCase() + label.slice(1);

  const grid = $("#calGrid");
  grid.innerHTML = "";
  ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"].forEach(d => grid.appendChild(el("div", "cal-dow", d)));

  const firstDay = new Date(calState.year, calState.month, 1);
  let startOffset = firstDay.getDay() - 1; if (startOffset < 0) startOffset = 6;
  const daysInMonth = new Date(calState.year, calState.month + 1, 0).getDate();
  const todayStr = todayIso();

  for (let i = 0; i < startOffset; i++) grid.appendChild(el("div", "cal-day empty"));
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${calState.year}-${String(calState.month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const entries = state.calendar[dateStr] || [];
    const typeClass = entries.length === 1 ? "type-" + entries[0].type : (entries.length > 1 ? "type-multi" : "");
    const cell = el("div", "cal-day" + (dateStr === todayStr ? " today" : "") + (typeClass ? " " + typeClass : ""));
    let tag = "";
    if (entries.length === 1) {
      tag = (entries[0].completed ? "✓ " : "") + calEntryLabel(entries[0]);
    } else if (entries.length > 1) {
      const allDone = entries.every(e => e.completed);
      tag = `${entries.length} allenamenti` + (allDone ? " ✓" : "");
    }
    cell.innerHTML = `<div class="dnum">${d}</div>` + (tag ? `<div class="dtag">${escapeHtml(tag)}</div>` : "");

    const dotsForDay = [];
    state.goals.forEach(g => {
      if (g.achievedDate === dateStr) dotsForDay.push({ kind: "achieved", goal: g });
      else if (!g.achievedDate && g.targetDate === dateStr) dotsForDay.push({ kind: "deadline", goal: g });
    });
    if (dotsForDay.length) {
      const dotsWrap = el("div", "cal-goal-dots");
      dotsForDay.forEach(d2 => dotsWrap.appendChild(el("div", "cal-goal-dot " + d2.kind)));
      dotsWrap.title = dotsForDay.map(d2 => d2.kind === "achieved" ? "Obiettivo raggiunto" : "Scadenza obiettivo").join(", ");
      dotsWrap.addEventListener("click", (e) => { e.stopPropagation(); openGoalDotInfo(dotsForDay); });
      cell.appendChild(dotsWrap);
    }

    cell.addEventListener("click", () => openCalendarForm(dateStr));
    grid.appendChild(cell);
  }

  const upcoming = $("#calUpcomingList"); upcoming.innerHTML = "";
  const upcomingDates = Object.keys(state.calendar).filter(ds => ds >= todayStr && state.calendar[ds].length).sort().slice(0, 10);
  if (!upcomingDates.length) upcoming.appendChild(el("div", "playlist-empty", "Nessun allenamento programmato."));
  upcomingDates.forEach(ds => {
    state.calendar[ds].forEach(entry => {
      const row = el("div", "cal-upcoming-row");
      row.innerHTML = `<span>${entry.completed ? "✓ " : ""}${escapeHtml(calEntryLabel(entry))}</span><span class="date">${fmtDate(ds)}</span>`;
      upcoming.appendChild(row);
    });
  });
}

function openGoalDotInfo(dots) {
  const content = $("#sheetContent");
  content.innerHTML = "";
  content.appendChild(el("h3", "", dots.length > 1 ? "Obiettivi in questa data" : "Obiettivo"));
  dots.forEach(d => {
    const card = el("div", "goal-card" + (d.kind === "achieved" ? " achieved" : ""));
    let html = `<div class="goal-title"><span>${escapeHtml(d.goal.title)}</span><span class="badge-achieved" style="${d.kind === 'achieved' ? '' : 'border-color:#c58bf2;color:#c58bf2;'}">${d.kind === "achieved" ? "Raggiunto" : "Scadenza"}</span></div>`;
    if (d.goal.description) html += `<div class="goal-desc">${escapeHtml(d.goal.description)}</div>`;
    html += `<div class="goal-dates"><span>Inizio: ${fmtDate(d.goal.startDate)}</span>${d.kind === "achieved" ? `<span>Raggiunto: ${fmtDate(d.goal.achievedDate)}</span>` : `<span>Scadenza: ${fmtDate(d.goal.targetDate)}</span>`}</div>`;
    card.innerHTML = html;
    content.appendChild(card);
  });
  const actions = el("div", "sheet-actions");
  const goBtn = el("button", "btn-primary", "Vai a Obiettivi");
  goBtn.addEventListener("click", () => { closeSheet(); switchView("goals"); });
  const closeBtn = el("button", "btn-secondary", "Chiudi"); closeBtn.addEventListener("click", closeSheet);
  actions.appendChild(closeBtn); actions.appendChild(goBtn);
  content.appendChild(actions);
  openSheet();
}

function openCalendarForm(dateStr) {
  if (!state.calendar[dateStr]) state.calendar[dateStr] = [];
  const entries = state.calendar[dateStr];

  const content = $("#sheetContent");
  content.innerHTML = "";
  content.appendChild(el("h3", "", fmtDate(dateStr)));

  const entriesWrap = el("div");
  content.appendChild(entriesWrap);

  function renderEntries() {
    entriesWrap.innerHTML = "";
    if (!entries.length) entriesWrap.appendChild(el("div", "playlist-empty", "Nessun allenamento programmato per questo giorno."));
    entries.forEach((entry) => {
      const row = el("div", "card-row");
      row.innerHTML = `<div class="r-info"><div class="r-title">${entry.completed ? "✓ " : ""}${escapeHtml(calEntryLabel(entry))}</div></div>`;
      const actions = el("div", "r-actions");
      const doneBtn = el("button", "icon-mini" + (entry.completed ? "" : ""), entry.completed ? "↺" : "✓");
      doneBtn.title = entry.completed ? "Segna come non completato" : "Segna come completato";
      doneBtn.addEventListener("click", () => { entry.completed = !entry.completed; saveCalendar(); renderEntries(); renderCalendar(); });
      const delBtn = el("button", "icon-mini danger", "🗑");
      delBtn.addEventListener("click", () => {
        state.calendar[dateStr] = state.calendar[dateStr].filter(e => e.id !== entry.id);
        if (!state.calendar[dateStr].length) delete state.calendar[dateStr];
        saveCalendar(); renderCalendar(); closeSheet();
      });
      actions.appendChild(doneBtn); actions.appendChild(delBtn);
      row.appendChild(actions);
      entriesWrap.appendChild(row);
    });
  }
  renderEntries();

  const addBlock = el("div", "subblock");
  addBlock.appendChild(el("div", "subblock-header", "<span>AGGIUNGI ALLENAMENTO</span>"));

  const typeF = el("div", "field", "<label>Tipo</label>");
  const typeI = el("select");
  [["plan", "Scheda di allenamento"], ["rest", "Rest day"], ["cardio", "Cardio"], ["custom", "Personalizzato"]].forEach(([v, l]) => {
    const o = document.createElement("option"); o.value = v; o.textContent = l; typeI.appendChild(o);
  });
  typeF.appendChild(typeI); addBlock.appendChild(typeF);

  const planF = el("div", "field", "<label>Scheda</label>");
  const planI = el("select");
  state.plans.forEach(p => { const o = document.createElement("option"); o.value = p.id; o.textContent = p.title; planI.appendChild(o); });
  planF.appendChild(planI); addBlock.appendChild(planF);

  const labelF = el("div", "field", "<label>Etichetta</label>");
  const labelI = el("input"); labelI.type = "text"; labelI.placeholder = "Es. Nuoto, escursione...";
  labelF.appendChild(labelI); addBlock.appendChild(labelF);

  function syncVisibility() {
    planF.style.display = typeI.value === "plan" ? "block" : "none";
    labelF.style.display = typeI.value === "custom" ? "block" : "none";
  }
  typeI.addEventListener("change", syncVisibility); syncVisibility();

  const addBtn = el("button", "btn-add", "+ Aggiungi a questo giorno");
  addBtn.addEventListener("click", () => {
    if (typeI.value === "plan" && !planI.value) { toast("Crea prima una scheda di allenamento."); return; }
    entries.push({ id: uid("cal"), type: typeI.value, planId: planI.value || "", label: labelI.value.trim(), completed: false });
    saveCalendar(); renderEntries(); renderCalendar();
    labelI.value = ""; typeI.value = "plan"; syncVisibility();
    toast("Aggiunto.");
  });
  addBlock.appendChild(addBtn);
  content.appendChild(addBlock);

  const actions = el("div", "sheet-actions");
  const closeBtn = el("button", "btn-primary", "Chiudi");
  closeBtn.addEventListener("click", () => { if (!state.calendar[dateStr] || !state.calendar[dateStr].length) delete state.calendar[dateStr]; saveCalendar(); renderCalendar(); closeSheet(); });
  actions.appendChild(closeBtn); content.appendChild(actions);
  openSheet();
}

/* =========================================================
   JOURNAL
   ========================================================= */
function renderJournal() {
  const list = $("#journalList"); list.innerHTML = "";
  const sorted = state.journal.slice().sort((a, b) => {
    const byDate = b.date.localeCompare(a.date);
    if (byDate !== 0) return byDate;
    return (b.createdAt || 0) - (a.createdAt || 0);
  });
  if (!sorted.length) { list.appendChild(el("div", "playlist-empty", "Nessuna nota. Scrivi la prima!")); return; }
  sorted.forEach(n => {
    const card = el("div", "note-card");
    card.innerHTML = `<div class="n-head"><div class="n-title">${escapeHtml(n.title)}</div><div class="n-date">${fmtDate(n.date)}</div></div><div class="n-body">${escapeHtml(n.body)}</div>`;
    const actions = el("div", "n-actions");
    const editBtn = el("button", "", "Modifica"); editBtn.addEventListener("click", () => openNoteForm(n.id));
    const delBtn = el("button", "", "Elimina");
    delBtn.addEventListener("click", () => { if (!confirm("Eliminare la nota?")) return; state.journal = state.journal.filter(x => x.id !== n.id); saveJournal(); renderJournal(); });
    actions.appendChild(editBtn); actions.appendChild(delBtn);
    card.appendChild(actions);
    list.appendChild(card);
  });
}
function openNoteForm(noteId) {
  const editing = !!noteId;
  const note = editing ? { ...state.journal.find(n => n.id === noteId) } : { id: uid("note"), title: "", date: todayIso(), body: "", createdAt: Date.now() };

  const content = $("#sheetContent");
  content.innerHTML = "";
  content.appendChild(el("h3", "", editing ? "Modifica nota" : "Nuova nota"));

  const row1 = el("div", "field-row");
  const titleF = el("div", "field", "<label>Titolo</label>");
  const titleI = el("input"); titleI.type = "text"; titleI.value = note.title; titleF.appendChild(titleI);
  const dateF = el("div", "field", "<label>Data</label>");
  const dateI = el("input"); dateI.type = "date"; dateI.value = note.date; dateF.appendChild(dateI);
  row1.appendChild(titleF); row1.appendChild(dateF); content.appendChild(row1);

  const bodyF = el("div", "field", "<label>Nota</label>");
  const bodyI = el("textarea"); bodyI.value = note.body; bodyI.style.minHeight = "120px";
  bodyF.appendChild(bodyI); content.appendChild(bodyF);

  const actions = el("div", "sheet-actions");
  const cancelBtn = el("button", "btn-secondary", "Annulla"); cancelBtn.addEventListener("click", closeSheet);
  const saveBtn = el("button", "btn-primary", "Salva");
  saveBtn.addEventListener("click", () => {
    note.title = titleI.value.trim() || "Senza titolo";
    note.date = dateI.value || todayIso();
    note.body = bodyI.value.trim();
    if (editing) state.journal[state.journal.findIndex(n => n.id === noteId)] = note; else state.journal.push(note);
    saveJournal(); renderJournal(); closeSheet(); toast("Nota salvata.");
  });
  actions.appendChild(cancelBtn); actions.appendChild(saveBtn); content.appendChild(actions);
  openSheet();
}

/* =========================================================
   TECH NOTES — like the journal, but manually reorderable and
   searchable by title. New notes go to the top of the list.
   ========================================================= */
let techNotesQuery = "";
function renderTechNotes() {
  const list = $("#techNotesList"); list.innerHTML = "";
  const q = techNotesQuery.trim().toLowerCase();
  const filtered = q ? state.techNotes.filter(n => n.title.toLowerCase().includes(q)) : state.techNotes;
  if (!filtered.length) {
    list.appendChild(el("div", "playlist-empty", q ? "Nessuna nota tecnica trovata." : "Nessuna nota tecnica. Scrivi la prima!"));
    return;
  }
  filtered.forEach(n => {
    const globalIdx = state.techNotes.indexOf(n);
    const card = el("div", "note-card");
    card.innerHTML = `<div class="n-head"><div class="n-title">${escapeHtml(n.title)}</div><div class="n-date">${fmtDate(n.date)}</div></div><div class="n-body">${escapeHtml(n.body)}</div>`;
    const actions = el("div", "n-actions");
    if (!q) {
      const up = el("button", "", "▲"); up.addEventListener("click", () => moveTechNote(globalIdx, -1));
      const down = el("button", "", "▼"); down.addEventListener("click", () => moveTechNote(globalIdx, 1));
      actions.appendChild(up); actions.appendChild(down);
    }
    const editBtn = el("button", "", "Modifica"); editBtn.addEventListener("click", () => openTechNoteForm(n.id));
    const delBtn = el("button", "", "Elimina");
    delBtn.addEventListener("click", () => { if (!confirm("Eliminare la nota tecnica?")) return; state.techNotes = state.techNotes.filter(x => x.id !== n.id); saveTechNotes(); renderTechNotes(); });
    actions.appendChild(editBtn); actions.appendChild(delBtn);
    card.appendChild(actions);
    list.appendChild(card);
  });
}
function moveTechNote(idx, dir) {
  const newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= state.techNotes.length) return;
  const [n] = state.techNotes.splice(idx, 1);
  state.techNotes.splice(newIdx, 0, n);
  saveTechNotes(); renderTechNotes();
}
function openTechNoteForm(noteId) {
  const editing = !!noteId;
  const note = editing ? { ...state.techNotes.find(n => n.id === noteId) } : { id: uid("tnote"), title: "", date: todayIso(), body: "" };

  const content = $("#sheetContent");
  content.innerHTML = "";
  content.appendChild(el("h3", "", editing ? "Modifica nota tecnica" : "Nuova nota tecnica"));

  const row1b = el("div", "field-row");
  const titleF2 = el("div", "field", "<label>Titolo</label>");
  const titleI2 = el("input"); titleI2.type = "text"; titleI2.value = note.title; titleF2.appendChild(titleI2);
  const dateF2 = el("div", "field", "<label>Data</label>");
  const dateI2 = el("input"); dateI2.type = "date"; dateI2.value = note.date; dateF2.appendChild(dateI2);
  row1b.appendChild(titleF2); row1b.appendChild(dateF2); content.appendChild(row1b);

  const bodyF2 = el("div", "field", "<label>Nota</label>");
  const bodyI2 = el("textarea"); bodyI2.value = note.body; bodyI2.style.minHeight = "120px";
  bodyF2.appendChild(bodyI2); content.appendChild(bodyF2);

  const actions2 = el("div", "sheet-actions");
  const cancelBtn2 = el("button", "btn-secondary", "Annulla"); cancelBtn2.addEventListener("click", closeSheet);
  const saveBtn2 = el("button", "btn-primary", "Salva");
  saveBtn2.addEventListener("click", () => {
    note.title = titleI2.value.trim() || "Senza titolo";
    note.date = dateI2.value || todayIso();
    note.body = bodyI2.value.trim();
    if (editing) { state.techNotes[state.techNotes.findIndex(n => n.id === noteId)] = note; }
    else { state.techNotes.unshift(note); }
    saveTechNotes(); renderTechNotes(); closeSheet(); toast("Nota tecnica salvata.");
  });
  actions2.appendChild(cancelBtn2); actions2.appendChild(saveBtn2); content.appendChild(actions2);
  openSheet();
}

/* =========================================================
   GENERIC BOTTOM SHEET
   ========================================================= */
function openSheet() { $("#sheetOverlay").classList.add("open"); }
function closeSheet() { $("#sheetOverlay").classList.remove("open"); }

/* =========================================================
   WIRING & INIT
   ========================================================= */
function wireGlobal() {
  $("#btnMenu").addEventListener("click", openDrawer);
  $("#drawerOverlay").addEventListener("click", closeDrawer);
  $("#btnSettings").addEventListener("click", () => switchView("settings"));
  $("#autoRestToggle").addEventListener("click", () => {
    setAutoRestSetting(!getAutoRestSetting());
    syncAutoRestToggleUI();
  });
  document.querySelectorAll(".nav-tab").forEach(btn => btn.addEventListener("click", () => switchView(btn.dataset.view)));
  $("#drawerAddPlan").addEventListener("click", () => { closeDrawer(); openPlanForm(null); });
  $("#btnAddPlanSettings").addEventListener("click", () => openPlanForm(null));
  $("#btnAddTrack").addEventListener("click", () => openTrackForm(null));
  $("#btnAddMusicSection").addEventListener("click", () => {
    let n = 1; let name = "Nuova fase";
    while (state.musicSections.includes(name)) { n++; name = "Nuova fase " + n; }
    state.musicSections.push(name); saveMusicSections(); renderMusicSections();
  });
  $("#btnAddGoal").addEventListener("click", () => openGoalForm(null));
  $("#btnAddNote").addEventListener("click", () => openNoteForm(null));
  $("#btnAddTechNote").addEventListener("click", () => openTechNoteForm(null));
  $("#techNotesSearch").addEventListener("input", (e) => { techNotesQuery = e.target.value; renderTechNotes(); });
  $("#calPrev").addEventListener("click", () => { calState.month--; if (calState.month < 0) { calState.month = 11; calState.year--; } renderCalendar(); });
  $("#calNext").addEventListener("click", () => { calState.month++; if (calState.month > 11) { calState.month = 0; calState.year++; } renderCalendar(); });
  $("#celebrationCloseBtn").addEventListener("click", hideCelebration);
  $("#btnExportBackup").addEventListener("click", exportBackup);
  $("#btnImportBackup").addEventListener("click", () => $("#importBackupInput").click());
  $("#importBackupInput").addEventListener("change", () => {
    const f = $("#importBackupInput").files[0];
    if (f) importBackup(f);
    $("#importBackupInput").value = "";
  });
  $("#btnResetPlans").addEventListener("click", () => {
    if (!confirm("Ripristinare le schede di esempio? Le schede personalizzate andranno perse.")) return;
    state.plans = seedPlans(); savePlans();
    state.currentPlanId = state.plans[0].id; localStorage.setItem(K_LAST_PLAN, state.currentPlanId);
    loadProgressForCurrentPlan();
    renderSettingsPlans(); renderDrawer(); renderWorkout();
    toast("Schede ripristinate.");
  });
  $("#sheetOverlay").addEventListener("click", (e) => { if (e.target.id === "sheetOverlay") closeSheet(); });
}

/* =========================================================
   BACKUP — export / import everything stored in localStorage
   (uploaded audio files themselves are not included: they live in
   IndexedDB and can be large; path-based audio in the project's
   audio/ folder is unaffected either way since it's not app data)
   ========================================================= */
function exportBackup() {
  const payload = {
    exportedAt: new Date().toISOString(),
    plans: state.plans,
    tracks: state.tracks,
    goals: state.goals,
    calendar: state.calendar,
    journal: state.journal,
    techNotes: state.techNotes,
    musicSections: state.musicSections,
    planGroupOrder: state.planGroupOrder
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "mycalisthenicsapp-backup-" + todayIso() + ".json";
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  toast("Backup scaricato.");
}
function mergeById(existing, incoming) {
  if (!Array.isArray(incoming)) return existing;
  const ids = new Set(existing.map(x => x.id));
  let added = 0;
  incoming.forEach(item => { if (item && item.id && !ids.has(item.id)) { existing.push(item); ids.add(item.id); added++; } });
  return added;
}
function mergeStrings(existing, incoming) {
  if (!Array.isArray(incoming)) return 0;
  let added = 0;
  incoming.forEach(s => { if (s && !existing.includes(s)) { existing.push(s); added++; } });
  return added;
}
function importBackup(file) {
  const reader = new FileReader();
  reader.onload = () => {
    let data;
    try { data = JSON.parse(reader.result); } catch (e) { toast("File non valido."); return; }
    if (!confirm("Importare questo backup? Verrà UNITO ai dati già presenti (nulla verrà cancellato) — eventuali canzoni/schede duplicate potrai eliminarle a mano dopo, se vuoi.")) return;

    const addedPlans = mergeById(state.plans, data.plans);
    const addedTracks = mergeById(state.tracks, data.tracks);
    const addedGoals = mergeById(state.goals, data.goals);
    const addedNotes = mergeById(state.journal, data.journal);
    const addedTechNotes = mergeById(state.techNotes, data.techNotes);
    const addedSections = mergeStrings(state.musicSections, data.musicSections);
    mergeStrings(state.planGroupOrder, data.planGroupOrder);

    let addedCalEntries = 0;
    if (data.calendar && typeof data.calendar === "object") {
      Object.keys(data.calendar).forEach(dateStr => {
        if (!Array.isArray(data.calendar[dateStr])) return;
        if (!state.calendar[dateStr]) state.calendar[dateStr] = [];
        addedCalEntries += mergeById(state.calendar[dateStr], data.calendar[dateStr]);
      });
    }

    savePlans(); saveTracks(); saveGoals(); saveJournal(); saveTechNotes(); saveMusicSections(); savePlanGroupOrder(); saveCalendar();
    state.plans.forEach(p => ensureGroupInOrder(p.group));
    if (!state.currentPlanId && state.plans[0]) { state.currentPlanId = state.plans[0].id; localStorage.setItem(K_LAST_PLAN, state.currentPlanId); }
    loadProgressForCurrentPlan();
    renderDrawer(); renderWorkout(); renderSettingsPlans(); renderSettingsArchive(); renderSettingsTracks(); renderMusicSections(); renderPlaylistSheet();
    toast(`Uniti: +${addedPlans} schede, +${addedTracks} canzoni, +${addedGoals} obiettivi, +${addedNotes} note, +${addedTechNotes} note tecniche, +${addedCalEntries} eventi calendario.`);
  };
  reader.readAsText(file);
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => { navigator.serviceWorker.register("service-worker.js").catch(() => {}); });
  }
}

function init() {
  loadState();
  wireGlobal();
  wireTimer();
  wirePlayer();
  renderDrawer();
  renderWorkout();
  renderPlaylistSheet();
  updatePlayerBar();
  registerServiceWorker();
}

document.addEventListener("DOMContentLoaded", init);
})();
