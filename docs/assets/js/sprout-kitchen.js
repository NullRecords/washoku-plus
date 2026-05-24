const ingredientCatalog = {
  protein: [
    { id: "salmon", name: "Salmon", kcal: 210, protein: 25, plants: 0, tags: ["japanese", "omega3", "umami"], taste: 8 },
    { id: "chicken", name: "Chicken Breast", kcal: 190, protein: 33, plants: 0, tags: ["global", "lean"], taste: 7 },
    { id: "tofu", name: "Tofu", kcal: 140, protein: 16, plants: 0, tags: ["japanese", "vegetarian"], taste: 6 },
    { id: "shrimp", name: "Shrimp", kcal: 160, protein: 30, plants: 0, tags: ["japanese", "korean", "lean"], taste: 8 },
    { id: "edamame", name: "Edamame", kcal: 180, protein: 17, plants: 1, tags: ["japanese", "vegetarian", "bean"], taste: 7 },
    { id: "tuna", name: "Tuna", kcal: 170, protein: 32, plants: 0, tags: ["japanese", "omega3"], taste: 7 },
    { id: "turkey", name: "Turkey", kcal: 175, protein: 31, plants: 0, tags: ["global", "lean"], taste: 7 },
    { id: "chickpeas", name: "Chickpeas", kcal: 190, protein: 12, plants: 1, tags: ["vegetarian", "mediterranean", "bean"], taste: 6 }
  ],
  plants: [
    { id: "cabbage", name: "Cabbage", kcal: 28, protein: 1, plants: 1, tags: ["japanese", "korean"], taste: 6 },
    { id: "spinach", name: "Spinach", kcal: 24, protein: 2, plants: 1, tags: ["japanese", "global"], taste: 6 },
    { id: "mushroom", name: "Mushroom", kcal: 30, protein: 2, plants: 1, tags: ["japanese"], taste: 8 },
    { id: "carrot", name: "Carrot", kcal: 26, protein: 1, plants: 1, tags: ["global"], taste: 6 },
    { id: "cucumber", name: "Cucumber", kcal: 20, protein: 1, plants: 1, tags: ["japanese", "mediterranean"], taste: 6 },
    { id: "seaweed", name: "Seaweed", kcal: 16, protein: 1, plants: 1, tags: ["japanese"], taste: 8 },
    { id: "kimchi-veg", name: "Kimchi Veg Mix", kcal: 32, protein: 1, plants: 1, tags: ["korean", "fermented"], taste: 9 },
    { id: "bell-pepper", name: "Bell Pepper", kcal: 24, protein: 1, plants: 1, tags: ["mexican", "global"], taste: 7 },
    { id: "broccoli", name: "Broccoli", kcal: 35, protein: 3, plants: 1, tags: ["global"], taste: 6 }
  ],
  starch: [
    { id: "brown-rice", name: "Brown Rice", kcal: 215, protein: 5, plants: 0, tags: ["japanese", "washoku"], taste: 7 },
    { id: "white-rice", name: "White Rice", kcal: 205, protein: 4, plants: 0, tags: ["japanese", "washoku"], taste: 7 },
    { id: "rice-noodle", name: "Rice Noodles", kcal: 195, protein: 4, plants: 0, tags: ["korean", "thai"], taste: 8 },
    { id: "potato", name: "Potato", kcal: 165, protein: 4, plants: 0, tags: ["global", "comfort"], taste: 7 },
    { id: "quinoa", name: "Quinoa", kcal: 210, protein: 8, plants: 0, tags: ["global", "fiber"], taste: 6 },
    { id: "corn-tortilla", name: "Corn Tortilla", kcal: 170, protein: 4, plants: 0, tags: ["mexican", "wrap"], taste: 7 }
  ],
  flavor: [
    { id: "tamari", name: "Wheat-free Tamari", kcal: 18, protein: 2, plants: 0, tags: ["japanese", "umami", "washoku"], taste: 8 },
    { id: "miso", name: "Miso Broth", kcal: 24, protein: 2, plants: 0, tags: ["japanese", "umami", "soup"], taste: 8 },
    { id: "kimchi", name: "Kimchi-style Chili", kcal: 28, protein: 1, plants: 0, tags: ["korean", "fermented"], taste: 9 },
    { id: "ginger", name: "Ginger Citrus", kcal: 16, protein: 0, plants: 0, tags: ["japanese", "bright"], taste: 7 },
    { id: "herb", name: "Herb Lemon", kcal: 14, protein: 0, plants: 0, tags: ["mediterranean", "bright"], taste: 7 },
    { id: "gochujang", name: "Gochujang-style", kcal: 30, protein: 1, plants: 0, tags: ["korean", "spicy"], taste: 9 },
    { id: "salsa", name: "Fresh Salsa", kcal: 20, protein: 1, plants: 0, tags: ["mexican", "bright"], taste: 8 }
  ]
};

const state = {
  recipeName: "",
  cuisine: "japanese",
  selected: { protein: [], plants: [], starch: [], flavor: [] },
  prep: { targetSlices: 6, currentSlices: 0, targetLabel: "" },
  prepPlan: { rows: [], confirmed: false },
  slicing: {
    active: false,
    countdownActive: false,
    countdownSeconds: 3,
    countdownEndsAt: 0,
    misses: 0,
    hitsThisRound: 0,
    score: 0,
    bestScore: 0,
    timerSeconds: 26,
    timeLeft: 0,
    roundStartedAt: 0,
    requiredIds: [],
    platedCounts: {},
    topScoreFlashUntil: 0
  },
  completedSteps: { protein: false, plants: false, starch: false, flavor: false, prep: false },
  community: [],
  activeStation: "protein",
  celebrateUntil: 0
};

const STATION_X = { protein: 110, plants: 270, starch: 430, flavor: 590 };
const stepOrder = ["protein", "plants", "starch", "flavor", "prep"];
const storageKey = "washoku-community-recipes-v2";
const bestSliceScoreKey = "washoku-slice-best-v1";
const voteRegistryKey = "washoku-community-votes-v1";
const mobileBreakpointPx = 980;
const landingIntroSpeech = "Hi chef. Build your bowl, balance the score, then slice and serve your best idea.";
const musicEnabledKey = "washoku-audio-music-enabled-v1";
const sfxEnabledKey = "washoku-audio-sfx-enabled-v1";
const muteAllEnabledKey = "washoku-audio-mute-all-enabled-v1";

const canvas = document.getElementById("kitchenCanvas");
const ctx = canvas.getContext("2d");

const dom = {
  status: document.getElementById("stageStatus"),
  activeStation: document.getElementById("activeStationLabel"),
  gameHero: document.getElementById("gameHero"),
  kitchenStage: document.getElementById("kitchenStage"),
  recipePanel: document.getElementById("recipePanel"),
  builderGrid: document.getElementById("builderGrid"),
  prepPlanCard: document.getElementById("prepPlanCard"),
  mobileSproutCoach: document.getElementById("mobileSproutCoach"),
  mobileSproutAvatar: document.getElementById("mobileSproutAvatar"),
  mobileSproutText: document.getElementById("mobileSproutText"),
  cuisineSelect: document.getElementById("cuisineSelect"),
  recipeName: document.getElementById("recipeName"),
  recipeList: document.getElementById("recipeList"),
  stepBadges: document.getElementById("stepBadges"),
  prepTarget: document.getElementById("prepTarget"),
  sliceStats: document.getElementById("sliceStats"),
  sliceHint: document.getElementById("sliceHint"),
  liveTimer: document.getElementById("liveTimer"),
  liveScore: document.getElementById("liveScore"),
  livePlated: document.getElementById("livePlated"),
  sliceCountdownBadge: document.getElementById("sliceCountdownBadge"),
  topScorePulse: document.getElementById("topScorePulse"),
  panelStatus: document.getElementById("panelStatus"),
  panelSproutAvatar: document.getElementById("panelSproutAvatar"),
  prepBar: document.getElementById("prepBar"),
  sliceBtn: document.getElementById("sliceBtn"),
  resetPrepBtn: document.getElementById("resetPrepBtn"),
  musicToggleBtn: document.getElementById("musicToggleBtn"),
  sfxToggleBtn: document.getElementById("sfxToggleBtn"),
  muteAllAudioBtn: document.getElementById("muteAllAudioBtn"),
  prepPlanList: document.getElementById("prepPlanList"),
  prepPlanStatus: document.getElementById("prepPlanStatus"),
  applyPrepPlanBtn: document.getElementById("applyPrepPlanBtn"),
  tastinessScore: document.getElementById("tastinessScore"),
  proteinScore: document.getElementById("proteinScore"),
  nutritionScore: document.getElementById("nutritionScore"),
  washokuScore: document.getElementById("washokuScore"),
  totalScore: document.getElementById("totalScore"),
  tastinessBar: document.getElementById("tastinessBar"),
  proteinBar: document.getElementById("proteinBar"),
  nutritionBar: document.getElementById("nutritionBar"),
  washokuBar: document.getElementById("washokuBar"),
  totalBar: document.getElementById("totalBar"),
  totals: document.getElementById("totalsLine"),
  communityList: document.getElementById("communityList"),
  submitBtn: document.getElementById("submitRecipeBtn")
};

const sproutExpressions = {
  neutral: new Image(),
  happy: new Image(),
  celebrate: new Image(),
  sad: new Image()
};
sproutExpressions.neutral.src = "assets/images/sprout/sprout-neutral.png";
sproutExpressions.happy.src = "assets/images/sprout/sprout-happy.png";
sproutExpressions.celebrate.src = "assets/images/sprout/sprout-celebrate.png";
sproutExpressions.sad.src = "assets/images/sprout/sprout-sad.png";

let currentSproutMood = "neutral";
const sprout = { x: STATION_X.protein, y: 468, targetX: STATION_X.protein, t: 0 };

const flyingIngredients = [];
const sliceBits = [];
const slashTrail = [];
const plateTransfers = [];
const celebrationConfetti = [];
let pointerDown = false;
let pointerLast = null;
let spawnAccumulator = 0;
const mobileGuide = {
  enabled: false,
  nameFocused: false,
  movedToSelection: false,
  movedToPrep: false,
  movedBackToGame: false
};
const audioState = {
  initialized: false,
  audioCtx: null,
  dreamTrack: new Audio("assets/audio/Dream State.mp3"),
  dustTrack: new Audio("assets/audio/Dust Bunnies.mp3"),
  currentMusic: "none",
  lastSliceAt: 0,
  musicEnabled: true,
  sfxEnabled: true,
  muteAll: false
};

function updateAudioToggleButtons() {
  if (dom.musicToggleBtn) {
    dom.musicToggleBtn.textContent = audioState.musicEnabled ? "Music On" : "Music Off";
    dom.musicToggleBtn.setAttribute("aria-pressed", String(audioState.musicEnabled));
  }
  if (dom.sfxToggleBtn) {
    dom.sfxToggleBtn.textContent = audioState.sfxEnabled ? "SFX On" : "SFX Off";
    dom.sfxToggleBtn.setAttribute("aria-pressed", String(audioState.sfxEnabled));
  }
  if (dom.muteAllAudioBtn) {
    dom.muteAllAudioBtn.textContent = audioState.muteAll ? "Unmute" : "Mute All";
    dom.muteAllAudioBtn.setAttribute("aria-pressed", String(audioState.muteAll));
  }
}

function loadAudioPreferences() {
  const musicPref = localStorage.getItem(musicEnabledKey);
  const sfxPref = localStorage.getItem(sfxEnabledKey);
  const muteAllPref = localStorage.getItem(muteAllEnabledKey);
  if (musicPref !== null) audioState.musicEnabled = musicPref === "1";
  if (sfxPref !== null) audioState.sfxEnabled = sfxPref === "1";
  if (muteAllPref !== null) audioState.muteAll = muteAllPref === "1";
  updateAudioToggleButtons();
}

function setMusicEnabled(enabled) {
  audioState.musicEnabled = Boolean(enabled);
  localStorage.setItem(musicEnabledKey, audioState.musicEnabled ? "1" : "0");
  if (!audioState.musicEnabled) {
    audioState.dreamTrack.pause();
    audioState.dustTrack.pause();
    audioState.currentMusic = "none";
  } else {
    syncMusicForGameState();
  }
  updateAudioToggleButtons();
}

function setSfxEnabled(enabled) {
  audioState.sfxEnabled = Boolean(enabled);
  localStorage.setItem(sfxEnabledKey, audioState.sfxEnabled ? "1" : "0");
  updateAudioToggleButtons();
}

function setMuteAllEnabled(enabled) {
  audioState.muteAll = Boolean(enabled);
  localStorage.setItem(muteAllEnabledKey, audioState.muteAll ? "1" : "0");
  if (audioState.muteAll) {
    audioState.dreamTrack.pause();
    audioState.dustTrack.pause();
    audioState.currentMusic = "none";
  } else {
    syncMusicForGameState();
  }
  updateAudioToggleButtons();
}

function hasAnySelection() {
  return state.selected.protein.length
    || state.selected.plants.length
    || state.selected.starch.length
    || state.selected.flavor.length;
}

function playMusicTrack(name) {
  if (!audioState.initialized) return;
  if (audioState.muteAll) name = "none";
  if (!audioState.musicEnabled) name = "none";
  if (audioState.currentMusic === name) return;

  const dream = audioState.dreamTrack;
  const dust = audioState.dustTrack;
  dream.pause();
  dust.pause();

  if (name === "dream") {
    dream.volume = 0.14;
    dream.play().catch(() => {});
  } else if (name === "dust") {
    dust.volume = 0.2;
    dust.play().catch(() => {});
  }

  audioState.currentMusic = name;
}

function syncMusicForGameState() {
  if (!audioState.initialized) return;
  if (audioState.muteAll) {
    playMusicTrack("none");
    return;
  }
  if (!audioState.musicEnabled) {
    playMusicTrack("none");
    return;
  }
  if (state.slicing.active) {
    playMusicTrack("dust");
    return;
  }
  if (hasAnySelection()) {
    playMusicTrack("dream");
    return;
  }
  playMusicTrack("none");
}

function initAudioFromUserGesture() {
  if (audioState.initialized) return;
  audioState.initialized = true;

  [audioState.dreamTrack, audioState.dustTrack].forEach((track) => {
    track.preload = "auto";
    track.loop = true;
  });

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (AudioContextClass) {
    try {
      audioState.audioCtx = new AudioContextClass();
    } catch {
      audioState.audioCtx = null;
    }
  }

  syncMusicForGameState();
}

function playTone(freq, duration, type, peakGain) {
  if (audioState.muteAll) return;
  if (!audioState.sfxEnabled) return;
  const ctxAudio = audioState.audioCtx;
  if (!ctxAudio) return;
  if (ctxAudio.state === "suspended") ctxAudio.resume().catch(() => {});
  const now = ctxAudio.currentTime;
  const osc = ctxAudio.createOscillator();
  const gainNode = ctxAudio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  gainNode.gain.setValueAtTime(0.0001, now);
  gainNode.gain.linearRampToValueAtTime(peakGain, now + 0.006);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(gainNode);
  gainNode.connect(ctxAudio.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

function playSliceSfx() {
  const now = performance.now();
  if (now - audioState.lastSliceAt < 48) return;
  audioState.lastSliceAt = now;
  playTone(620, 0.065, "triangle", 0.05);
  playTone(840, 0.055, "triangle", 0.028);
}

function playPlateSfx() {
  playTone(190, 0.09, "sine", 0.045);
  playTone(120, 0.12, "triangle", 0.024);
}

function hasRequiredBuildSelections() {
  return state.selected.protein.length > 0
    && state.selected.plants.length >= 2
    && state.selected.starch.length > 0
    && state.selected.flavor.length > 0;
}

function canStartSliceRound() {
  return hasRequiredBuildSelections() && state.prepPlan.confirmed && !state.slicing.active && !state.slicing.countdownActive;
}

function isMobileViewport() {
  return window.matchMedia(`(max-width: ${mobileBreakpointPx}px)`).matches;
}

function smoothScrollTo(element) {
  if (!element) return;
  element.scrollIntoView({ behavior: "smooth", block: "start" });
}

function tryFocusRecipeNameForMobile() {
  if (!mobileGuide.enabled || mobileGuide.nameFocused) return;
  mobileGuide.nameFocused = true;
  setTimeout(() => {
    smoothScrollTo(dom.recipePanel);
    if (dom.recipeName) {
      dom.recipeName.focus({ preventScroll: true });
      dom.recipeName.select();
    }
  }, 120);
}

function updateMobileGuidedFlow() {
  if (!mobileGuide.enabled) return;

  const hasName = (dom.recipeName.value || "").trim().length > 0;
  if (hasName && !mobileGuide.movedToSelection) {
    mobileGuide.movedToSelection = true;
    setTimeout(() => smoothScrollTo(dom.builderGrid), 120);
  }

  if (hasRequiredBuildSelections() && !state.prepPlan.confirmed && !mobileGuide.movedToPrep) {
    mobileGuide.movedToPrep = true;
    setTimeout(() => smoothScrollTo(dom.prepPlanCard), 120);
  }

  if (canStartSliceRound() && !mobileGuide.movedBackToGame) {
    mobileGuide.movedBackToGame = true;
    setTimeout(() => {
      smoothScrollTo(dom.kitchenStage);
      if (dom.sliceBtn) dom.sliceBtn.focus({ preventScroll: true });
    }, 180);
  }
}

function getById(group, id) {
  return ingredientCatalog[group].find((item) => item.id === id) || null;
}

function allSelectedItems() {
  const items = [];
  state.selected.protein.forEach((id) => items.push(getById("protein", id)));
  state.selected.plants.forEach((id) => items.push(getById("plants", id)));
  state.selected.starch.forEach((id) => items.push(getById("starch", id)));
  state.selected.flavor.forEach((id) => items.push(getById("flavor", id)));
  return items.filter(Boolean);
}

function nutritionTotals() {
  return allSelectedItems().reduce((acc, item) => {
    acc.kcal += item.kcal || 0;
    acc.protein += item.protein || 0;
    acc.plants += item.plants || 0;
    return acc;
  }, { kcal: 0, protein: 0, plants: 0 });
}

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function flavorItems() {
  return state.selected.flavor.map((id) => getById("flavor", id)).filter(Boolean);
}

function isAcidicFlavor(item) {
  if (!item) return false;
  const text = `${item.name} ${(item.tags || []).join(" ")}`.toLowerCase();
  return text.includes("bright")
    || text.includes("citrus")
    || text.includes("lemon")
    || text.includes("salsa")
    || text.includes("vinegar")
    || text.includes("kimchi");
}

function selectionPenaltyStats() {
  const acidicCount = flavorItems().filter((item) => isAcidicFlavor(item)).length;
  return {
    extraProtein: Math.max(0, state.selected.protein.length - 1),
    extraStarch: Math.max(0, state.selected.starch.length - 1),
    extraAcidic: Math.max(0, acidicCount - 1)
  };
}

function calorieScoreBreakdown() {
  const kcal = nutritionTotals().kcal;
  if (!kcal) return 0;
  if (kcal >= 460 && kcal <= 720) return 100;
  if (kcal >= 380 && kcal <= 820) return 86;
  if (kcal >= 320 && kcal <= 900) return 70;
  if (kcal >= 260 && kcal <= 980) return 52;
  return 30;
}

function proteinScoreBreakdown() {
  const grams = nutritionTotals().protein;
  const { extraProtein } = selectionPenaltyStats();
  let score = 20;
  if (grams >= 40) score = 100;
  else if (grams >= 32) score = 86;
  else if (grams >= 26) score = 74;
  else if (grams >= 20) score = 58;
  else if (grams >= 14) score = 40;

  if (grams > 82) score -= 16;
  score -= extraProtein * 12;
  return clampScore(score);
}

function nutritionScoreBreakdown() {
  const totals = nutritionTotals();
  const calorieScore = calorieScoreBreakdown();
  const penalties = selectionPenaltyStats();
  let score = 0;
  if (totals.plants >= 4) score += 30;
  else if (totals.plants >= 3) score += 24;
  else if (totals.plants >= 2) score += 16;
  if (state.selected.starch.length) score += 14;
  score += Math.round(calorieScore * 0.24);
  if (state.prep.currentSlices >= state.prep.targetSlices) score += 12;
  if (state.selected.flavor.length) score += 10;
  if (state.selected.protein.length) score += 10;
  score -= penalties.extraProtein * 8;
  score -= penalties.extraStarch * 11;
  score -= penalties.extraAcidic * 9;
  if (totals.kcal > 900) score -= 12;
  return clampScore(score);
}

function washokuScoreBreakdown() {
  const tags = new Set(allSelectedItems().flatMap((item) => item.tags || []));
  let score = 0;
  if (state.selected.protein.length && state.selected.starch.length && state.selected.flavor.length && state.selected.plants.length >= 2) score += 30;
  if (tags.has("japanese") || tags.has("washoku")) score += 24;
  if (tags.has("umami") || tags.has("fermented")) score += 12;
  if (tags.has("bright")) score += 8;
  if (state.prep.currentSlices >= state.prep.targetSlices) score += 10;
  if (state.cuisine === "japanese" || state.cuisine === "korean") score += 8;
  return Math.min(100, score);
}

function tastinessScoreBreakdown() {
  const items = allSelectedItems();
  if (!items.length) return 0;
  const penalties = selectionPenaltyStats();
  const tagSet = new Set(items.flatMap((item) => item.tags || []));
  const baseTaste = Math.round((items.reduce((sum, item) => sum + (item.taste || 6), 0) / items.length) * 10);
  let bonus = 0;
  let penalty = 0;
  if (tagSet.has(state.cuisine)) bonus += 10;
  if (tagSet.has("umami") && tagSet.has("bright")) bonus += 8;
  if (tagSet.has("spicy") && (state.cuisine === "korean" || state.cuisine === "mexican")) bonus += 7;
  if (state.selected.plants.length >= 3) bonus += 6;
  if (state.prep.currentSlices >= state.prep.targetSlices) bonus += 8;
  penalty += penalties.extraProtein * 6;
  penalty += penalties.extraStarch * 8;
  penalty += penalties.extraAcidic * 10;
  return clampScore(baseTaste + bonus - penalty);
}

function combinedScore() {
  const tastiness = tastinessScoreBreakdown();
  const protein = proteinScoreBreakdown();
  const nutrition = nutritionScoreBreakdown();
  const washoku = washokuScoreBreakdown();
  const calorie = calorieScoreBreakdown();
  const overall = Math.round(tastiness * 0.26 + nutrition * 0.26 + calorie * 0.2 + protein * 0.16 + washoku * 0.12);
  return { tastiness, protein, nutrition, washoku, calorie, overall };
}

function selectedIdsInOrder() {
  const ids = [];
  state.selected.protein.forEach((id) => ids.push({ id, group: "protein" }));
  state.selected.plants.forEach((id) => ids.push({ id, group: "plants" }));
  state.selected.starch.forEach((id) => ids.push({ id, group: "starch" }));
  state.selected.flavor.forEach((id) => ids.push({ id, group: "flavor" }));
  return ids;
}

function defaultPrepAction(group, itemId) {
  if (group === "protein") {
    if (itemId === "tofu" || itemId === "edamame" || itemId === "chickpeas") return "cube";
    return "slice";
  }
  if (group === "plants") {
    if (itemId === "seaweed") return "shred";
    return "slice";
  }
  if (group === "starch") {
    if (itemId === "rice-noodle") return "boil";
    if (itemId === "corn-tortilla") return "warm";
    return "steam";
  }
  return "mix";
}

function defaultPrepSize(group) {
  if (group === "protein") return { qty: 120, unit: "g" };
  if (group === "plants") return { qty: 1, unit: "cup" };
  if (group === "starch") return { qty: 1, unit: "cup" };
  return { qty: 2, unit: "tbsp" };
}

function prepActionOptions(group) {
  const options = {
    protein: ["slice", "dice", "cube", "marinate"],
    plants: ["slice", "chop", "shred", "quick-pickle"],
    starch: ["steam", "boil", "warm", "toast"],
    flavor: ["mix", "whisk", "drizzle", "simmer"]
  };
  return options[group] || ["prep"];
}

function prepUnitOptions(group) {
  const options = {
    protein: ["g", "oz", "piece"],
    plants: ["cup", "tbsp", "piece"],
    starch: ["cup", "g", "piece"],
    flavor: ["tbsp", "tsp", "cup"]
  };
  return options[group] || ["unit"];
}

function syncPrepPlanWithSelection() {
  const existing = new Map(state.prepPlan.rows.map((row) => [row.id, row]));
  const nextRows = [];
  selectedIdsInOrder().forEach(({ id, group }) => {
    const item = getById(group, id);
    if (!item) return;
    const keep = existing.get(id);
    if (keep) {
      nextRows.push({ ...keep, name: item.name, group });
      return;
    }
    const size = defaultPrepSize(group);
    nextRows.push({
      id,
      name: item.name,
      group,
      action: defaultPrepAction(group, id),
      qty: size.qty,
      unit: size.unit
    });
  });

  const changed = JSON.stringify(nextRows.map((row) => [row.id, row.action, row.qty, row.unit])) !== JSON.stringify(state.prepPlan.rows.map((row) => [row.id, row.action, row.qty, row.unit]));
  state.prepPlan.rows = nextRows;
  if (changed) state.prepPlan.confirmed = false;
}

function renderPrepPlan() {
  syncPrepPlanWithSelection();
  if (!state.prepPlan.rows.length) {
    dom.prepPlanList.innerHTML = "<p class='help-note'>Select ingredients to generate prep steps with editable sizes.</p>";
    dom.prepPlanStatus.textContent = "Choose ingredients, adjust sizes and prep actions, then confirm before slicing.";
    return;
  }

  dom.prepPlanList.innerHTML = state.prepPlan.rows.map((row) => {
    const actions = prepActionOptions(row.group).map((value) => `<option value=\"${value}\" ${row.action === value ? "selected" : ""}>${value}</option>`).join("");
    const units = prepUnitOptions(row.group).map((value) => `<option value=\"${value}\" ${row.unit === value ? "selected" : ""}>${value}</option>`).join("");
    return `<div class=\"prep-row\" data-prep-id=\"${row.id}\"><div><strong>${row.name}</strong><small>${row.group}</small></div><select data-field=\"action\">${actions}</select><input data-field=\"qty\" type=\"number\" min=\"0.1\" step=\"0.1\" value=\"${row.qty}\"><select data-field=\"unit\">${units}</select></div>`;
  }).join("");

  dom.prepPlanStatus.textContent = state.prepPlan.confirmed
    ? "Prep plan confirmed. Start slice mode and complete prep hits before submitting."
    : "Prep plan pending confirmation.";
}

function bindPrepPlanEditor() {
  dom.prepPlanList.addEventListener("input", (event) => {
    const target = event.target;
    const rowWrap = target.closest("[data-prep-id]");
    if (!rowWrap) return;
    const row = state.prepPlan.rows.find((item) => item.id === rowWrap.dataset.prepId);
    if (!row) return;
    const field = target.dataset.field;
    if (field === "qty") row.qty = Number(target.value || 0);
    if (field === "action") row.action = target.value;
    if (field === "unit") row.unit = target.value;
    state.prepPlan.confirmed = false;
    dom.prepPlanStatus.textContent = "Prep edited. Confirm prep plan again before slicing/submitting.";
    updateScoreUI();
    updateMobileGuidedFlow();
  });

  dom.applyPrepPlanBtn.addEventListener("click", () => {
    if (!state.prepPlan.rows.length) {
      dom.prepPlanStatus.textContent = "Pick ingredients first so prep steps can be generated.";
      return;
    }
    const invalid = state.prepPlan.rows.some((row) => !row.qty || row.qty <= 0 || !row.action || !row.unit);
    if (invalid) {
      dom.prepPlanStatus.textContent = "Every prep step needs action + positive size.";
      return;
    }
    state.prepPlan.confirmed = true;
    dom.prepPlanStatus.textContent = "Prep plan confirmed. Slice game unlocked.";
    updateScoreUI();
    updateMobileGuidedFlow();
  });
}

function selectedForSlicing() {
  const ids = [];
  state.selected.protein.forEach((id) => ids.push(id));
  state.selected.plants.forEach((id) => ids.push(id));
  state.selected.starch.forEach((id) => ids.push(id));
  state.selected.flavor.forEach((id) => ids.push(id));
  if (ids.length) return ids;
  return ingredientCatalog[state.activeStation].slice(0, 4).map((item) => item.id);
}

function computePrepTargetSlices() {
  const unitFactor = { cup: 2.2, tbsp: 0.6, tsp: 0.3, g: 1 / 85, oz: 0.36, piece: 0.95 };
  const workload = state.prepPlan.rows.reduce((sum, row) => {
    const unitScale = unitFactor[row.unit] || 1;
    return sum + Math.max(0.1, Number(row.qty || 0)) * unitScale;
  }, 0);
  const target = Math.round(workload * 1.25 + state.prepPlan.rows.length * 0.5);
  return Math.max(6, Math.min(12, target));
}

function platedUniqueCount() {
  return state.slicing.requiredIds.filter((id) => (state.slicing.platedCounts[id] || 0) > 0).length;
}

function allIngredientsPlated() {
  if (!state.slicing.requiredIds.length) return false;
  return state.slicing.requiredIds.every((id) => (state.slicing.platedCounts[id] || 0) > 0);
}

function updateSliceStatsUI() {
  canvas.style.touchAction = state.slicing.active ? "none" : "pan-y";
  syncMusicForGameState();
  const now = performance.now();
  const seconds = state.slicing.active ? Math.max(0, Math.ceil(state.slicing.timeLeft)) : 0;
  const countdown = state.slicing.countdownActive ? Math.max(0, Math.ceil((state.slicing.countdownEndsAt - now) / 1000)) : 0;
  const platedNeed = Math.max(1, state.slicing.requiredIds.length || selectedForSlicing().length);
  const timerText = state.slicing.active ? `${seconds}s` : "--";
  dom.sliceStats.textContent = `Score ${state.slicing.score} | Best ${state.slicing.bestScore} | Time ${timerText} | Plated ${platedUniqueCount()}/${platedNeed}`;
  dom.liveTimer.textContent = `Time ${timerText}`;
  dom.liveScore.textContent = `Score ${state.slicing.score}`;
  dom.livePlated.textContent = `Plated ${platedUniqueCount()}/${platedNeed}`;
  const topScoreActive = Date.now() < state.slicing.topScoreFlashUntil;
  if (dom.topScorePulse) dom.topScorePulse.hidden = !topScoreActive;

  if (state.slicing.active) {
    dom.sliceBtn.textContent = "Quick Chop";
    dom.sliceCountdownBadge.textContent = "Live";
    dom.panelStatus.textContent = "Swipe and slice. Every hit should land on the plate.";
  } else if (state.slicing.countdownActive) {
    dom.sliceBtn.textContent = "Get Ready";
    dom.sliceCountdownBadge.textContent = `Starts in ${countdown}`;
    dom.panelStatus.textContent = `Round starts in ${countdown}...`;
  } else {
    dom.sliceBtn.textContent = "Start Slice Round";
    dom.sliceCountdownBadge.textContent = "Ready";
    dom.panelStatus.textContent = "Confirm prep plan, then start a timed slice round.";
  }

  if (state.slicing.active) {
    dom.sliceHint.textContent = "Swipe through flying ingredients. Plate every selected ingredient before time runs out.";
  } else if (state.slicing.countdownActive) {
    dom.sliceHint.textContent = "Round begins after countdown. Keep your finger near the canvas.";
  } else if (!state.prepPlan.confirmed) {
    dom.sliceHint.textContent = "Confirm prep plan, then start a timed slice round.";
  } else if (state.prep.currentSlices >= state.prep.targetSlices && allIngredientsPlated()) {
    dom.sliceHint.textContent = "Prep cleared. You can submit your dish now.";
  } else {
    dom.sliceHint.textContent = "Press Slice to start a timed prep round.";
  }

  dom.sliceBtn.disabled = !canStartSliceRound() && !state.slicing.active;
}

function celebrateStep(step) {
  state.completedSteps[step] = true;
  state.celebrateUntil = Date.now() + 1300;
  currentSproutMood = "celebrate";
  const cheers = {
    protein: "Yum, protein picked. Tiny victory dance!",
    plants: "Greens glow-up. Your bowl looks happy.",
    starch: "Cozy carbs locked in. Nice balance!",
    flavor: "Flavor spark added. Chef magic!",
    prep: "Prep complete. Plate looks amazing!"
  };
  dom.status.textContent = cheers[step] || "Cute progress unlocked!";
}

function updateStepCompletion() {
  if (state.selected.protein.length && !state.completedSteps.protein) celebrateStep("protein");
  if (state.selected.plants.length >= 2 && !state.completedSteps.plants) celebrateStep("plants");
  if (state.selected.starch.length && !state.completedSteps.starch) celebrateStep("starch");
  if (state.selected.flavor.length && !state.completedSteps.flavor) celebrateStep("flavor");
  if (state.prep.currentSlices >= state.prep.targetSlices && state.prepPlan.confirmed && allIngredientsPlated() && !state.completedSteps.prep) celebrateStep("prep");
}

function renderStepBadges() {
  const labels = { protein: "Protein", plants: "Plants", starch: "Starch", flavor: "Flavor", prep: "Prep" };
  dom.stepBadges.innerHTML = stepOrder.map((step) => `<span class="step-badge ${state.completedSteps[step] ? "done" : ""}">${labels[step]}</span>`).join("");
}

function updatePrepTarget() {
  const picked = state.selected.protein[0] || state.selected.starch[0] || state.selected.flavor[0] || state.selected.plants[0];
  const targetItem = getById("protein", picked) || getById("starch", picked) || getById("flavor", picked) || getById("plants", picked);
  state.prep.targetLabel = targetItem?.name || "Ingredient";
  const prepHint = state.prepPlan.confirmed ? "plan confirmed" : "plan not confirmed";
  const required = state.slicing.requiredIds.length || selectedForSlicing().length;
  dom.prepTarget.textContent = `${state.prep.targetLabel}: ${state.prep.currentSlices}/${state.prep.targetSlices} cuts | plated ${platedUniqueCount()}/${required} (${prepHint})`;
  dom.prepBar.style.setProperty("--score", `${Math.min(100, (state.prep.currentSlices / state.prep.targetSlices) * 100)}%`);
}

function updateScoreUI() {
  updateStepCompletion();
  renderStepBadges();
  updatePrepTarget();

  const totals = nutritionTotals();
  const score = combinedScore();
  const complete = hasRequiredBuildSelections();

  dom.tastinessScore.textContent = String(score.tastiness);
  dom.proteinScore.textContent = String(score.protein);
  dom.nutritionScore.textContent = String(score.nutrition);
  dom.washokuScore.textContent = String(score.washoku);
  dom.totalScore.textContent = String(score.overall);

  dom.tastinessBar.style.setProperty("--score", `${score.tastiness}%`);
  dom.proteinBar.style.setProperty("--score", `${score.protein}%`);
  dom.nutritionBar.style.setProperty("--score", `${score.nutrition}%`);
  dom.washokuBar.style.setProperty("--score", `${score.washoku}%`);
  dom.totalBar.style.setProperty("--score", `${score.overall}%`);

  dom.totals.textContent = `${totals.kcal} kcal | ${totals.protein}g protein | ${totals.plants} plant points | ${state.cuisine}`;
  updateSliceStatsUI();

  if (state.slicing.active) {
    currentSproutMood = Date.now() < state.celebrateUntil ? "happy" : "neutral";
    dom.status.textContent = `Slice mode: ${state.prep.currentSlices}/${state.prep.targetSlices} cuts | score ${state.slicing.score}`;
    if (dom.panelSproutAvatar) dom.panelSproutAvatar.src = sproutExpressions[currentSproutMood].src;
    return;
  }

  if (Date.now() < state.celebrateUntil) {
    currentSproutMood = "celebrate";
    dom.status.textContent = "Wow good job, your meal is complete!";
    return;
  }

  if (!complete && (state.selected.protein.length || state.selected.starch.length || state.selected.flavor.length || state.selected.plants.length)) {
    currentSproutMood = "sad";
    dom.status.textContent = "Almost there. Finish each station and I'll cheer loudly.";
  } else if (complete && score.overall >= 84) {
    currentSproutMood = "celebrate";
    dom.status.textContent = "Wow, chef-level bowl. Community spotlight ready!";
  } else if (complete && score.overall >= 64) {
    currentSproutMood = "happy";
    dom.status.textContent = "Tasty! Add one bold contrast for extra sparkle.";
  } else if (complete) {
    currentSproutMood = "sad";
    dom.status.textContent = "Good start. A little prep and contrast will boost it.";
  } else {
    currentSproutMood = "neutral";
    dom.status.textContent = landingIntroSpeech;
  }

  if (dom.panelSproutAvatar) dom.panelSproutAvatar.src = sproutExpressions[currentSproutMood].src;
  dom.sliceBtn.disabled = !canStartSliceRound() && !state.slicing.active;
}

function setStation(station) {
  state.activeStation = station;
  sprout.targetX = STATION_X[station] || STATION_X.protein;
  dom.activeStation.textContent = station.charAt(0).toUpperCase() + station.slice(1);
  document.querySelectorAll(".station-pill").forEach((pill) => {
    pill.classList.toggle("is-active", pill.dataset.station === station);
  });
}

function colorForItem(item) {
  if (!item) return "#7c8c84";
  const palette = {
    salmon: "#d98066",
    chicken: "#d8b178",
    tofu: "#f0e3b1",
    shrimp: "#f39b7a",
    edamame: "#7fad4c",
    tuna: "#b56666",
    turkey: "#d0ad7e",
    chickpeas: "#d4be6e",
    cabbage: "#77ab62",
    spinach: "#3f8c4f",
    mushroom: "#917357",
    carrot: "#e98a3b",
    cucumber: "#60aa61",
    seaweed: "#2f5442",
    "kimchi-veg": "#d46443",
    "bell-pepper": "#db5c4c",
    broccoli: "#3f9a49",
    "brown-rice": "#b08a59",
    "white-rice": "#e7dbc5",
    "rice-noodle": "#efe3cc",
    potato: "#c8a770",
    quinoa: "#dbc98a",
    "corn-tortilla": "#ddbf62",
    tamari: "#7e4b33",
    miso: "#b77a4d",
    kimchi: "#bf4a3e",
    ginger: "#f0ca82",
    herb: "#8bb17d",
    gochujang: "#a43c2f",
    salsa: "#cb5f42"
  };
  return palette[item.id] || "#7c8c84";
}

function drawIngredientDot(x, y, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 9, 0, Math.PI * 2);
  ctx.fill();
}

function wrapCanvasText(text, maxWidth) {
  const clean = (text || "").replace(/\s+/g, " ").trim();
  if (!clean) return [];
  const words = clean.split(" ");
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth || !line) {
      line = next;
      return;
    }
    lines.push(line);
    line = word;
  });
  if (line) lines.push(line);
  return lines.slice(0, 5);
}

function drawSproutSpeechBubble(message, sproutX, sproutY) {
  const text = (message || "").trim();
  if (!text) return;

  ctx.save();
  const bubbleW = Math.min(360, canvas.width * 0.52);
  ctx.font = "700 15px 'Marker Felt', 'Comic Sans MS', 'Trebuchet MS', cursive";
  const lines = wrapCanvasText(text, bubbleW - 26);
  if (!lines.length) {
    ctx.restore();
    return;
  }

  const lineHeight = 18;
  const bubbleH = lines.length * lineHeight + 24;
  const leftBound = 12;
  const rightBound = canvas.width - bubbleW - 12;
  const bx = Math.max(leftBound, Math.min(rightBound, sproutX - bubbleW * 0.52));
  const by = Math.max(12, sproutY - 178 - lines.length * 1.5);

  ctx.shadowColor = "rgba(0,0,0,0.16)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = "rgba(255,255,255,0.97)";
  ctx.beginPath();
  ctx.roundRect(bx, by, bubbleW, bubbleH, 16);
  ctx.fill();

  const tailX = Math.max(bx + 28, Math.min(bx + bubbleW - 28, sproutX - 10));
  ctx.beginPath();
  ctx.moveTo(tailX, by + bubbleH - 1);
  ctx.lineTo(tailX + 18, by + bubbleH - 1);
  ctx.lineTo(sproutX - 2, sproutY - 54);
  ctx.closePath();
  ctx.fill();

  ctx.shadowColor = "transparent";
  ctx.strokeStyle = "rgba(22,54,41,0.24)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(bx, by, bubbleW, bubbleH, 16);
  ctx.stroke();

  ctx.fillStyle = "#163629";
  lines.forEach((line, index) => {
    ctx.fillText(line, bx + 13, by + 18 + index * lineHeight);
  });
  ctx.restore();
}

function syncSproutCoachUI() {
  const text = (dom.status?.textContent || "").trim();
  if (dom.mobileSproutText && text) dom.mobileSproutText.textContent = text;
  if (dom.mobileSproutAvatar) dom.mobileSproutAvatar.src = sproutExpressions[currentSproutMood].src;
  if (dom.mobileSproutCoach) {
    const canvasRect = canvas.getBoundingClientRect();
    const originalSproutVisible = mobileGuide.enabled
      && canvasRect.top < window.innerHeight * 0.88
      && canvasRect.bottom > 120;
    dom.mobileSproutCoach.classList.toggle("is-hidden", originalSproutVisible);
    dom.mobileSproutCoach.classList.toggle("is-ready", canStartSliceRound());
  }
}

function ingredientGroupForId(id) {
  if (getById("protein", id)) return "protein";
  if (getById("plants", id)) return "plants";
  if (getById("starch", id)) return "starch";
  return "flavor";
}

const mealPhotoPoolsByGroup = {
  protein: [11, 12, 21, 22, 24],
  plants: [3, 13, 15],
  starch: [1, 6, 10, 14, 18],
  flavor: [2, 4, 5, 17]
};
const mealPhotoCache = new Map();

function hashText(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) - hash + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function mealPhotoPathByIndex(index) {
  const padded = String(index).padStart(2, "0");
  return `assets/images/dishes/meal-cat-${padded}.png`;
}

function mealPhotoForItem(item) {
  const group = ingredientGroupForId(item.id);
  const pool = mealPhotoPoolsByGroup[group] || [1, 3, 13, 24];
  const idx = pool[hashText(item.id) % pool.length];
  const path = mealPhotoPathByIndex(idx);
  if (!mealPhotoCache.has(path)) {
    const img = new Image();
    img.src = path;
    mealPhotoCache.set(path, img);
  }
  return mealPhotoCache.get(path);
}

function heroMealPhotoForCuisine() {
  const pools = {
    japanese: [1, 2, 4, 8, 10],
    korean: [11, 14, 17, 24],
    thai: [2, 14, 17, 18],
    mediterranean: [3, 13, 15, 19],
    mexican: [7, 14, 16, 24],
    global: [11, 12, 21, 22, 24]
  };
  const selectedIds = selectedIdsInOrder().map((entry) => entry.id).join("|");
  const pool = pools[state.cuisine] || pools.global;
  const idx = pool[hashText(`${state.cuisine}|${selectedIds}`) % pool.length];
  const path = mealPhotoPathByIndex(idx);
  if (!mealPhotoCache.has(path)) {
    const img = new Image();
    img.src = path;
    mealPhotoCache.set(path, img);
  }
  return mealPhotoCache.get(path);
}

function drawPreviewFoodPiece(drawCtx, x, y, size, item, opacity = 1) {
  if (!item) return;
  const photo = mealPhotoForItem(item);
  drawCtx.save();
  drawCtx.globalAlpha = opacity;
  drawCtx.fillStyle = colorForItem(item);
  drawCtx.beginPath();
  drawCtx.arc(x, y, size, 0, Math.PI * 2);
  drawCtx.fill();
  if (photo && photo.complete && photo.naturalWidth > 0) {
    drawCtx.beginPath();
    drawCtx.arc(x, y, size, 0, Math.PI * 2);
    drawCtx.clip();
    drawCtx.globalAlpha = Math.min(1, opacity * 0.86);
    drawCtx.drawImage(photo, x - size * 1.15, y - size * 1.15, size * 2.3, size * 2.3);
  }
  drawCtx.restore();
}

function traceIngredientShapePath(group, size) {
  if (group === "protein") {
    ctx.rotate(-0.22);
    ctx.beginPath();
    ctx.roundRect(-size * 0.85, -size * 0.46, size * 1.7, size * 0.92, size * 0.26);
    return;
  }

  if (group === "plants") {
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.92);
    ctx.bezierCurveTo(size * 0.98, -size * 0.5, size * 0.78, size * 0.88, 0, size * 0.98);
    ctx.bezierCurveTo(-size * 0.78, size * 0.88, -size * 0.98, -size * 0.5, 0, -size * 0.92);
    return;
  }

  if (group === "starch") {
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.95, size * 0.68, 0.12, 0, Math.PI * 2);
    return;
  }

  ctx.beginPath();
  ctx.moveTo(0, -size * 0.92);
  ctx.bezierCurveTo(size * 0.88, -size * 0.3, size * 0.58, size * 0.92, 0, size * 0.98);
  ctx.bezierCurveTo(-size * 0.58, size * 0.92, -size * 0.88, -size * 0.3, 0, -size * 0.92);
}

function drawPhotoFoodPiece(x, y, size, item, options = {}) {
  const group = ingredientGroupForId(item.id);
  const color = colorForItem(item);
  const photo = mealPhotoForItem(item);
  const opacity = options.opacity ?? 1;

  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = opacity;

  traceIngredientShapePath(group, size);
  ctx.fillStyle = color;
  ctx.fill();

  if (photo && photo.complete && photo.naturalWidth > 0) {
    ctx.save();
    traceIngredientShapePath(group, size);
    ctx.clip();
    const sw = size * 2.2;
    const sh = size * 2.2;
    ctx.globalAlpha = 0.82;
    ctx.drawImage(photo, -sw / 2, -sh / 2, sw, sh);
    ctx.restore();
  }

  ctx.strokeStyle = "rgba(255,255,255,0.45)";
  ctx.lineWidth = Math.max(1.4, size * 0.08);
  traceIngredientShapePath(group, size);
  ctx.stroke();

  ctx.restore();
}

function drawIngredientSprite(x, y, size, item) {
  drawPhotoFoodPiece(x, y, size, item);
}

function spawnIngredientTarget() {
  const ids = state.slicing.requiredIds.length ? state.slicing.requiredIds : selectedForSlicing();
  const id = ids[Math.floor(Math.random() * ids.length)];
  const item = getById("protein", id) || getById("plants", id) || getById("starch", id) || getById("flavor", id);
  if (!item) return;
  flyingIngredients.push({
    id: `${item.id}-${Date.now()}-${Math.random()}`,
    item,
    x: 70 + Math.random() * (canvas.width - 240),
    y: canvas.height - 36,
    vx: (Math.random() - 0.5) * 1.8,
    vy: -(7.4 + Math.random() * 2.6),
    radius: 24 + Math.random() * 8,
    sliced: false,
    life: 1
  });
}

function distanceToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  if (!dx && !dy) return Math.hypot(px - ax, py - ay);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  const cx = ax + t * dx;
  const cy = ay + t * dy;
  return Math.hypot(px - cx, py - cy);
}

function registerSliceHit(target) {
  target.sliced = true;
  target.life = 0.15;
  playSliceSfx();
  state.prep.currentSlices = Math.min(state.prep.targetSlices, state.prep.currentSlices + 1);
  state.slicing.hitsThisRound += 1;
  state.slicing.score = Math.max(0, state.slicing.score + 12);
  if (!state.slicing.platedCounts[target.item.id]) state.slicing.score += 20;
  currentSproutMood = "happy";
  state.celebrateUntil = Date.now() + 520;

  const plateX = canvas.width - 132;
  const plateY = 278;
  plateTransfers.push({
    x: target.x,
    y: target.y,
    tx: plateX - 34 + Math.random() * 68,
    ty: plateY - 22 + Math.random() * 44,
    itemId: target.item.id,
    color: colorForItem(target.item),
    progress: 0,
    done: false
  });

  for (let i = 0; i < 8; i += 1) {
    sliceBits.push({
      x: target.x,
      y: target.y,
      vx: (Math.random() - 0.5) * 4,
      vy: -1.2 - Math.random() * 2.6,
      life: 1,
      color: colorForItem(target.item)
    });
  }
}

function sliceAlongSegment(ax, ay, bx, by) {
  flyingIngredients.forEach((target) => {
    if (target.sliced) return;
    if (distanceToSegment(target.x, target.y, ax, ay, bx, by) <= target.radius + 8) {
      registerSliceHit(target);
    }
  });
  updateScoreUI();
}

function triggerTopScoreCelebration() {
  const colors = ["#f25f5c", "#ffe066", "#70c1b3", "#247ba0", "#b388eb", "#ff9f1c"];
  celebrationConfetti.length = 0;
  for (let i = 0; i < 96; i += 1) {
    celebrationConfetti.push({
      x: 24 + Math.random() * (canvas.width - 48),
      y: 42 + Math.random() * 40,
      vx: (Math.random() - 0.5) * 4.2,
      vy: 1.2 + Math.random() * 3.1,
      rot: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.22,
      size: 5 + Math.random() * 5,
      life: 1,
      color: colors[i % colors.length]
    });
  }
}

function saveBestSliceScoreIfNeeded() {
  if (state.slicing.score <= state.slicing.bestScore) return false;
  state.slicing.bestScore = state.slicing.score;
  localStorage.setItem(bestSliceScoreKey, String(state.slicing.bestScore));
  return true;
}

function finishSliceRound(reason) {
  state.slicing.active = false;
  const newTopScore = saveBestSliceScoreIfNeeded();
  if (allIngredientsPlated() && state.prep.currentSlices >= state.prep.targetSlices) {
    celebrateStep("prep");
    if (newTopScore) {
      currentSproutMood = "celebrate";
      triggerTopScoreCelebration();
      state.slicing.topScoreFlashUntil = Date.now() + 3200;
      dom.status.textContent = `Wow good job, your meal is complete! NEW TOP SCORE ${state.slicing.score}!`;
    } else if (state.slicing.score >= 170) {
      currentSproutMood = "celebrate";
      dom.status.textContent = `Wow good job, your meal is complete! Incredible score ${state.slicing.score}!`;
    } else if (state.slicing.score >= 120) {
      currentSproutMood = "happy";
      dom.status.textContent = `Wow good job, your meal is complete! Great score ${state.slicing.score}!`;
    } else {
      currentSproutMood = "happy";
      dom.status.textContent = `Wow good job, your meal is complete! Score ${state.slicing.score}.`;
    }
  } else {
    currentSproutMood = "sad";
    dom.status.textContent = `Round ended: ${reason}. Plate all picks and hit prep target next round.`;
  }
  updateScoreUI();
}

function drawPlatedMealPreview() {
  const plateX = canvas.width - 132;
  const plateY = 278;
  const progress = Math.min(1, state.prep.currentSlices / Math.max(1, state.prep.targetSlices));

  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.beginPath();
  ctx.arc(plateX, plateY, 100, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(120,98,71,0.35)";
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = "#e9dfca";
  ctx.beginPath();
  ctx.arc(plateX, plateY + 4, 72, 0, Math.PI * 2);
  ctx.fill();

  const platedCounts = state.slicing.platedCounts;
  const hasIngredientOnPlate = (id) => (platedCounts[id] || 0) > 0;

  const starchItem = getById("starch", state.selected.starch[0]);
  if (starchItem && hasIngredientOnPlate(starchItem.id)) {
    drawPhotoFoodPiece(plateX, plateY + 8, 56, starchItem, { opacity: 0.56 + progress * 0.35 });
  }

  const proteinItem = getById("protein", state.selected.protein[0]);
  if (proteinItem && hasIngredientOnPlate(proteinItem.id)) {
    drawPhotoFoodPiece(plateX + 24, plateY - 14, 34, proteinItem, { opacity: 0.92 });
  }

  const plantItems = state.selected.plants.map((id) => getById("plants", id)).filter(Boolean);
  plantItems.forEach((item, index) => {
    if (!hasIngredientOnPlate(item.id)) return;
    const angle = (Math.PI * 2 * index) / Math.max(1, plantItems.length);
    const px = plateX + Math.cos(angle) * 40;
    const py = plateY + Math.sin(angle) * 30;
    drawPhotoFoodPiece(px, py, 18, item, { opacity: 0.9 });
  });

  const flavorItem = getById("flavor", state.selected.flavor[0]);
  if (flavorItem && hasIngredientOnPlate(flavorItem.id)) {
    ctx.save();
    ctx.globalAlpha = 0.75;
    drawPhotoFoodPiece(plateX - 20, plateY + 2, 16, flavorItem, { opacity: 0.76 });
    drawPhotoFoodPiece(plateX + 16, plateY + 30, 13, flavorItem, { opacity: 0.7 });
    ctx.restore();
  }

  Object.entries(platedCounts).forEach(([id, count], index) => {
    if (!count) return;
    const item = getById("protein", id) || getById("plants", id) || getById("starch", id) || getById("flavor", id);
    if (!item) return;
    const base = Math.min(4, count);
    for (let i = 0; i < base; i += 1) {
      const px = plateX - 32 + ((index * 13 + i * 11) % 64);
      const py = plateY - 22 + ((index * 9 + i * 13) % 44);
      drawPhotoFoodPiece(px, py, 6, item, { opacity: 0.78 });
    }
  });

  ctx.fillStyle = "#5f4a35";
  ctx.font = "bold 12px sans-serif";
  ctx.fillText("Plated Meal", plateX - 30, plateY + 118);
}

function advanceSlicingFrame() {
  if (state.slicing.countdownActive) {
    const remainingMs = state.slicing.countdownEndsAt - performance.now();
    if (remainingMs <= 0) {
      state.slicing.countdownActive = false;
      state.slicing.active = true;
      state.slicing.roundStartedAt = performance.now();
      state.slicing.timeLeft = state.slicing.timerSeconds;
      for (let i = 0; i < 4; i += 1) spawnIngredientTarget();
      dom.status.textContent = "Slice mode ON. Catch every ingredient and plate it!";
    } else {
      dom.status.textContent = `Slice starts in ${Math.ceil(remainingMs / 1000)}...`;
    }
  }

  if (state.slicing.active) {
    const elapsed = (performance.now() - state.slicing.roundStartedAt) / 1000;
    state.slicing.timeLeft = Math.max(0, state.slicing.timerSeconds - elapsed);
    if (state.slicing.timeLeft <= 0) {
      finishSliceRound("time up");
    }
  }

  spawnAccumulator += 1;
  if (state.slicing.active && spawnAccumulator >= 26) {
    spawnIngredientTarget();
    if (Math.random() < 0.35) spawnIngredientTarget();
    spawnAccumulator = 0;
  }

  for (let i = flyingIngredients.length - 1; i >= 0; i -= 1) {
    const target = flyingIngredients[i];
    target.x += target.vx;
    target.y += target.vy;
    target.vy += 0.2;
    if (target.sliced) target.life -= 0.05;

    if (target.y > canvas.height + 40) {
      if (!target.sliced && state.slicing.active) {
        state.slicing.misses += 1;
        state.slicing.score = Math.max(0, state.slicing.score - 2);
      }
      flyingIngredients.splice(i, 1);
      continue;
    }
    if (target.life <= 0) flyingIngredients.splice(i, 1);
  }

  for (let i = sliceBits.length - 1; i >= 0; i -= 1) {
    const bit = sliceBits[i];
    bit.x += bit.vx;
    bit.y += bit.vy;
    bit.vy += 0.14;
    bit.life -= 0.05;
    if (bit.life <= 0) sliceBits.splice(i, 1);
  }

  for (let i = slashTrail.length - 1; i >= 0; i -= 1) {
    slashTrail[i].life -= 0.08;
    if (slashTrail[i].life <= 0) slashTrail.splice(i, 1);
  }

  for (let i = plateTransfers.length - 1; i >= 0; i -= 1) {
    const transfer = plateTransfers[i];
    transfer.progress += 0.08;
    transfer.x += (transfer.tx - transfer.x) * 0.15;
    transfer.y += (transfer.ty - transfer.y) * 0.15;
    if (transfer.progress >= 1 && !transfer.done) {
      transfer.done = true;
      state.slicing.platedCounts[transfer.itemId] = (state.slicing.platedCounts[transfer.itemId] || 0) + 1;
      playPlateSfx();
    }
    if (transfer.progress >= 1.1) plateTransfers.splice(i, 1);
  }

  for (let i = celebrationConfetti.length - 1; i >= 0; i -= 1) {
    const bit = celebrationConfetti[i];
    bit.x += bit.vx;
    bit.y += bit.vy;
    bit.vy += 0.05;
    bit.rot += bit.spin;
    bit.life -= 0.014;
    if (bit.life <= 0 || bit.y > canvas.height + 28) celebrationConfetti.splice(i, 1);
  }

  if (state.slicing.active && state.prep.currentSlices >= state.prep.targetSlices && allIngredientsPlated()) {
    const timeBonus = Math.round(state.slicing.timeLeft * 3);
    state.slicing.score += timeBonus;
    finishSliceRound(`all ingredients plated (+${timeBonus} time bonus)`);
  }

  updateSliceStatsUI();
}

function drawSlicingLayer() {
  flyingIngredients.forEach((target) => {
    ctx.globalAlpha = Math.max(0.22, target.life);
    drawIngredientSprite(target.x, target.y, target.radius, target.item);
    ctx.globalAlpha = 1;
  });

  sliceBits.forEach((bit) => {
    ctx.globalAlpha = Math.max(0, bit.life);
    ctx.fillStyle = bit.color;
    ctx.fillRect(bit.x, bit.y, 4, 4);
    ctx.globalAlpha = 1;
  });

  slashTrail.forEach((trail) => {
    ctx.globalAlpha = Math.max(0, trail.life);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(trail.ax, trail.ay);
    ctx.lineTo(trail.bx, trail.by);
    ctx.stroke();
    ctx.globalAlpha = 1;
  });

  plateTransfers.forEach((transfer) => {
    ctx.globalAlpha = Math.max(0.35, 1 - transfer.progress * 0.6);
    const transferItem = getById("protein", transfer.itemId)
      || getById("plants", transfer.itemId)
      || getById("starch", transfer.itemId)
      || getById("flavor", transfer.itemId);
    if (transferItem) drawPhotoFoodPiece(transfer.x, transfer.y, 11, transferItem, { opacity: Math.max(0.46, 1 - transfer.progress * 0.5) });
    ctx.globalAlpha = 1;
  });

  celebrationConfetti.forEach((bit) => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, bit.life);
    ctx.translate(bit.x, bit.y);
    ctx.rotate(bit.rot);
    ctx.fillStyle = bit.color;
    ctx.fillRect(-bit.size * 0.55, -bit.size * 0.25, bit.size, bit.size * 0.5);
    ctx.restore();
  });
}

function drawKitchenBackdrop() {
  const t = performance.now() * 0.001;
  const hueShift = Math.sin(t * 0.4) * 4;
  const wallGradient = ctx.createLinearGradient(0, 0, 0, 220);
  wallGradient.addColorStop(0, `hsl(${40 + hueShift}, 66%, 90%)`);
  wallGradient.addColorStop(1, "#efd8b2");
  ctx.fillStyle = wallGradient;
  ctx.fillRect(0, 0, canvas.width, 220);

  ctx.fillStyle = "rgba(104, 78, 49, 0.16)";
  for (let x = 18; x < canvas.width; x += 56) ctx.fillRect(x, 20, 4, 160);
  for (let y = 24; y < 200; y += 44) ctx.fillRect(12, y, canvas.width - 24, 3);

  ctx.fillStyle = "#d2b187";
  ctx.fillRect(0, 220, canvas.width, 76);

  const counterGradient = ctx.createLinearGradient(0, 296, 0, 420);
  counterGradient.addColorStop(0, "#bc9462");
  counterGradient.addColorStop(1, "#8d6439");
  ctx.fillStyle = counterGradient;
  ctx.fillRect(0, 296, canvas.width, 124);

  ctx.fillStyle = "rgba(255,255,255,0.08)";
  for (let y = 308; y < 416; y += 17) ctx.fillRect(0, y, canvas.width, 2);

  ctx.fillStyle = "rgba(255,255,255,0.22)";
  for (let i = 0; i < 3; i += 1) {
    const steamX = 84 + i * 26 + Math.sin(t + i) * 8;
    const steamY = 248 + Math.cos(t * 1.4 + i) * 8;
    ctx.beginPath();
    ctx.arc(steamX, steamY, 8 + i * 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawKitchen() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawKitchenBackdrop();

  const labels = [["Protein", STATION_X.protein], ["Plants", STATION_X.plants], ["Starch", STATION_X.starch], ["Flavor", STATION_X.flavor]];
  ctx.fillStyle = "#6c5338";
  ctx.font = "bold 14px sans-serif";
  labels.forEach(([label, x]) => {
    ctx.fillRect(x - 60, 132, 120, 10);
    ctx.fillText(label, x - 28, 156);
  });

  state.selected.protein.length && drawIngredientDot(STATION_X.protein, 120, "#2a6f57");
  state.selected.plants.length && drawIngredientDot(STATION_X.plants, 120, "#6f9a4a");
  state.selected.starch.length && drawIngredientDot(STATION_X.starch, 120, "#a57d3e");
  state.selected.flavor.length && drawIngredientDot(STATION_X.flavor, 120, "#b4623f");

  advanceSlicingFrame();
  drawSlicingLayer();
  drawPlatedMealPreview();

  sprout.t += 0.09;
  const bob = Math.sin(sprout.t) * 4;
  sprout.x += (sprout.targetX - sprout.x) * 0.08;

  const sproutSize = state.slicing.active ? 136 : 118;

  const activeSprout = sproutExpressions[currentSproutMood] || sproutExpressions.neutral;
  if (activeSprout && activeSprout.complete) {
    ctx.drawImage(activeSprout, sprout.x - sproutSize / 2, sprout.y - sproutSize / 2 + bob, sproutSize, sproutSize);
  } else {
    ctx.fillStyle = "#2f7e57";
    ctx.beginPath();
    ctx.arc(sprout.x, sprout.y + bob, sproutSize * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }

  drawSproutSpeechBubble(dom.status?.textContent || "", sprout.x, sprout.y + bob);
  syncSproutCoachUI();

  requestAnimationFrame(drawKitchen);
}

function renderRecipeSummary() {
  renderPrepPlan();
  const lines = [];
  if (state.selected.protein.length) lines.push(`Protein: ${state.selected.protein.map((id) => getById("protein", id)?.name).filter(Boolean).join(", ")}`);
  if (state.selected.plants.length) lines.push(`Plants: ${state.selected.plants.map((id) => getById("plants", id)?.name).filter(Boolean).join(", ")}`);
  if (state.selected.starch.length) lines.push(`Starch: ${state.selected.starch.map((id) => getById("starch", id)?.name).filter(Boolean).join(", ")}`);
  if (state.selected.flavor.length) lines.push(`Flavor: ${state.selected.flavor.map((id) => getById("flavor", id)?.name).filter(Boolean).join(", ")}`);
  dom.recipeList.innerHTML = lines.length ? lines.map((line) => `<li>${line}</li>`).join("") : "<li>Pick ingredients from each station to build your dish.</li>";
  updateScoreUI();
}

function buttonLabel(item) {
  return `${item.name}<small>${item.protein}g protein | ${item.kcal} kcal</small>`;
}

function bindStationButtons() {
  ["protein", "plants", "starch", "flavor"].forEach((group) => {
    const wrap = document.getElementById(`${group}Choices`);
    wrap.innerHTML = ingredientCatalog[group].map((item) => `<button class=\"item-btn\" data-group=\"${group}\" data-id=\"${item.id}\">${buttonLabel(item)}</button>`).join("");
  });

  document.querySelectorAll(".item-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      initAudioFromUserGesture();
      const group = btn.dataset.group;
      const id = btn.dataset.id;
      const has = state.selected[group].includes(id);
      if (has) state.selected[group] = state.selected[group].filter((value) => value !== id);
      else state.selected[group].push(id);
      setStation(group);
      refreshButtonState();
      renderRecipeSummary();
      updateMobileGuidedFlow();
    });
  });

  document.querySelectorAll(".station-pill").forEach((pill) => {
    pill.addEventListener("click", () => setStation(pill.dataset.station));
  });
}

function refreshButtonState() {
  document.querySelectorAll(".item-btn").forEach((btn) => {
    const group = btn.dataset.group;
    const id = btn.dataset.id;
    const picked = state.selected[group].includes(id);
    btn.classList.toggle("is-picked", picked);
  });
}

function runSliceAction() {
  initAudioFromUserGesture();
  if (!state.selected.protein.length && !state.selected.starch.length && !state.selected.flavor.length && !state.selected.plants.length) {
    dom.status.textContent = "Pick your ingredients first, then we slice like ninjas.";
    return;
  }
  if (!state.prepPlan.confirmed) {
    dom.status.textContent = "Tap Confirm Prep Plan first so our slice round can start.";
    currentSproutMood = "sad";
    return;
  }

  if (state.slicing.countdownActive) {
    dom.status.textContent = "Countdown is on. Blades ready, chef!";
    return;
  }

  if (!state.slicing.active) {
    state.prep.targetSlices = computePrepTargetSlices();
    state.prep.currentSlices = 0;
    state.completedSteps.prep = false;
    state.slicing.score = 0;
    state.slicing.hitsThisRound = 0;
    state.slicing.misses = 0;
    state.slicing.requiredIds = [...new Set(selectedForSlicing())];
    state.slicing.platedCounts = Object.fromEntries(state.slicing.requiredIds.map((id) => [id, 0]));
    flyingIngredients.length = 0;
    plateTransfers.length = 0;
    sliceBits.length = 0;
    slashTrail.length = 0;

    state.slicing.countdownActive = true;
    state.slicing.countdownEndsAt = performance.now() + state.slicing.countdownSeconds * 1000;
    dom.status.textContent = `Slice starts in ${state.slicing.countdownSeconds}... Deep breath!`;
    updateScoreUI();
    return;
  }

  const nearest = flyingIngredients.filter((target) => !target.sliced).sort((a, b) => a.y - b.y)[0];
  if (nearest) registerSliceHit(nearest);
  else spawnIngredientTarget();
  updateScoreUI();
}

function resetPrep() {
  state.slicing.active = false;
  state.slicing.countdownActive = false;
  state.slicing.countdownEndsAt = 0;
  state.prep.currentSlices = 0;
  state.completedSteps.prep = false;
  state.slicing.score = 0;
  state.slicing.hitsThisRound = 0;
  state.slicing.misses = 0;
  state.slicing.timeLeft = 0;
  state.slicing.requiredIds = [...new Set(selectedForSlicing())];
  state.slicing.platedCounts = Object.fromEntries(state.slicing.requiredIds.map((id) => [id, 0]));
  flyingIngredients.length = 0;
  plateTransfers.length = 0;
  sliceBits.length = 0;
  slashTrail.length = 0;
  updateScoreUI();
}

function canvasPointFromEvent(event) {
  const rect = canvas.getBoundingClientRect();
  const sx = canvas.width / rect.width;
  const sy = canvas.height / rect.height;
  return {
    x: (event.clientX - rect.left) * sx,
    y: (event.clientY - rect.top) * sy
  };
}

function bindCanvasSlicing() {
  canvas.style.touchAction = "pan-y";

  canvas.addEventListener("pointerdown", (event) => {
    pointerDown = true;
    pointerLast = canvasPointFromEvent(event);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!pointerDown || !state.slicing.active) return;
    const point = canvasPointFromEvent(event);
    if (pointerLast) {
      sliceAlongSegment(pointerLast.x, pointerLast.y, point.x, point.y);
      slashTrail.push({ ax: pointerLast.x, ay: pointerLast.y, bx: point.x, by: point.y, life: 1 });
    }
    pointerLast = point;
  });

  const stop = () => {
    pointerDown = false;
    pointerLast = null;
  };

  canvas.addEventListener("pointerup", stop);
  canvas.addEventListener("pointercancel", stop);
  canvas.addEventListener("pointerleave", stop);
}

function generateDishPreviewDataUrl(recipeName) {
  const off = document.createElement("canvas");
  off.width = 220;
  off.height = 220;
  const ptx = off.getContext("2d");

  const heroPhoto = heroMealPhotoForCuisine();
  const dishCx = 110;
  const dishCy = 108;
  const dishR = 79;

  ptx.fillStyle = "#f5ebd7";
  ptx.fillRect(0, 0, off.width, off.height);

  ptx.save();
  ptx.beginPath();
  ptx.arc(dishCx, dishCy, dishR, 0, Math.PI * 2);
  ptx.clip();
  if (heroPhoto && heroPhoto.complete && heroPhoto.naturalWidth > 0) {
    ptx.drawImage(heroPhoto, dishCx - 88, dishCy - 88, 176, 176);
  } else {
    ptx.fillStyle = "#e9ddc8";
    ptx.fillRect(dishCx - 88, dishCy - 88, 176, 176);
  }
  ptx.restore();

  ptx.strokeStyle = "rgba(92,70,45,0.35)";
  ptx.lineWidth = 5;
  ptx.beginPath();
  ptx.arc(dishCx, dishCy, dishR, 0, Math.PI * 2);
  ptx.stroke();

  ptx.fillStyle = "rgba(255,255,255,0.18)";
  ptx.beginPath();
  ptx.arc(dishCx - 20, dishCy - 26, 36, 0, Math.PI * 2);
  ptx.fill();

  const platedCounts = state.slicing.platedCounts;
  const hasOnPlate = (id) => (platedCounts[id] || 0) > 0;

  const starch = getById("starch", state.selected.starch[0]);
  if (starch && hasOnPlate(starch.id)) {
    drawPreviewFoodPiece(ptx, dishCx, dishCy + 8, 44, starch, 0.82);
  }

  const protein = getById("protein", state.selected.protein[0]);
  if (protein && hasOnPlate(protein.id)) {
    drawPreviewFoodPiece(ptx, dishCx + 24, dishCy - 16, 24, protein, 0.92);
  }

  const plants = state.selected.plants.map((id) => getById("plants", id)).filter(Boolean);
  plants.forEach((item, index) => {
    if (!hasOnPlate(item.id)) return;
    const angle = (Math.PI * 2 * index) / Math.max(1, plants.length);
    drawPreviewFoodPiece(ptx, dishCx + Math.cos(angle) * 35, dishCy + 8 + Math.sin(angle) * 26, 11, item, 0.9);
  });

  const flavor = getById("flavor", state.selected.flavor[0]);
  if (flavor && hasOnPlate(flavor.id)) {
    drawPreviewFoodPiece(ptx, dishCx - 20, dishCy + 4, 9, flavor, 0.8);
    drawPreviewFoodPiece(ptx, dishCx + 17, dishCy + 30, 8, flavor, 0.75);
  }

  ptx.fillStyle = "#524133";
  ptx.font = "bold 13px sans-serif";
  ptx.fillText(state.cuisine.toUpperCase(), 18, 30);
  ptx.font = "12px sans-serif";
  ptx.fillText((recipeName || "Dish").slice(0, 22), 18, 202);

  return off.toDataURL("image/png");
}

function recipePayloadFromState() {
  const score = combinedScore();
  const totals = nutritionTotals();
  const name = (dom.recipeName.value || "").trim() || "Sprout Kitchen Recipe";
  return {
    id: `r_${Date.now()}`,
    name,
    createdAt: new Date().toISOString(),
    cuisine: state.cuisine,
    selection: JSON.parse(JSON.stringify(state.selected)),
    prepPlan: JSON.parse(JSON.stringify(state.prepPlan.rows)),
    prep: { ...state.prep },
    sliceRound: {
      score: state.slicing.score,
      misses: state.slicing.misses,
      plated: JSON.parse(JSON.stringify(state.slicing.platedCounts)),
      bestScore: state.slicing.bestScore
    },
    nutrition: totals,
    score,
    dishImage: generateDishPreviewDataUrl(name),
    votes: 0
  };
}

function loadCommunity() {
  try {
    const raw = localStorage.getItem(storageKey);
    state.community = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(state.community)) state.community = [];
  } catch {
    state.community = [];
  }
}

function loadVoteRegistry() {
  try {
    const raw = localStorage.getItem(voteRegistryKey);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveVoteRegistry(registry) {
  localStorage.setItem(voteRegistryKey, JSON.stringify(registry));
}

function saveCommunity() {
  localStorage.setItem(storageKey, JSON.stringify(state.community));
}

function renderCommunity() {
  const voteRegistry = loadVoteRegistry();
  if (!state.community.length) {
    dom.communityList.innerHTML = "<p class='help-note'>No community recipes yet. Submit one to start.</p>";
    return;
  }

  const sorted = [...state.community].sort((a, b) => (b.votes + b.score.overall / 10) - (a.votes + a.score.overall / 10));
  dom.communityList.innerHTML = sorted.map((recipe) => {
    const hasVoted = Boolean(voteRegistry[recipe.id]);
    const eligible = recipe.votes >= 5 && recipe.score.overall >= 78;
    const prepLine = Array.isArray(recipe.prepPlan) && recipe.prepPlan.length
      ? `<p>Prep: ${recipe.prepPlan.map((row) => `${row.action} ${row.name} ${row.qty} ${row.unit}`).join(" | ")}</p>`
      : "";
    const sliceLine = recipe.sliceRound
      ? `<p>Slice score ${recipe.sliceRound.score} | misses ${recipe.sliceRound.misses}</p>`
      : "";
    const image = recipe.dishImage
      ? `<img src="${recipe.dishImage}" alt="${recipe.name} preview" style="width:74px;height:74px;border-radius:10px;border:1px solid rgba(22,54,41,0.14);object-fit:cover;">`
      : "";

    return `<article class="community-item"><div><strong>${recipe.name}</strong><p>${recipe.cuisine} | ${recipe.nutrition.kcal} kcal | ${recipe.nutrition.protein}g protein | score ${recipe.score.overall}</p>${prepLine}${sliceLine}<span class="badge">Tastiness ${recipe.score.tastiness}</span><span class="badge">Protein ${recipe.score.protein}</span><span class="badge">Nutrition ${recipe.score.nutrition}</span><span class="badge">Washoku ${recipe.score.washoku}</span>${eligible ? '<span class="badge">Eligible for app review</span>' : ''}</div><div>${image}<button class="vote-btn" data-vote="${recipe.id}" ${hasVoted ? "disabled" : ""}>${hasVoted ? "Voted" : `Vote (${recipe.votes})`}</button></div></article>`;
  }).join("");

  dom.communityList.querySelectorAll("[data-vote]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const registry = loadVoteRegistry();
      if (registry[btn.dataset.vote]) {
        return;
      }
      const recipe = state.community.find((item) => item.id === btn.dataset.vote);
      if (!recipe) return;
      recipe.votes += 1;
      registry[btn.dataset.vote] = true;
      saveVoteRegistry(registry);
      saveCommunity();
      renderCommunity();
    });
  });
}

function submitRecipe() {
  const ready = state.selected.protein.length
    && state.selected.starch.length
    && state.selected.flavor.length
    && state.selected.plants.length >= 2
    && state.prep.currentSlices >= state.prep.targetSlices
    && allIngredientsPlated()
    && state.prepPlan.confirmed;

  if (!ready) {
    dom.status.textContent = "One more step: finish picks, confirm prep, and plate everything.";
    currentSproutMood = "sad";
    return;
  }

  const payload = recipePayloadFromState();
  state.community.push(payload);
  saveCommunity();
  renderCommunity();
  celebrateStep("prep");
  currentSproutMood = "celebrate";
  dom.status.textContent = `Submitted ${payload.name}. Sprinkle those community votes!`;
}

function initGame() {
  mobileGuide.enabled = isMobileViewport();
  dom.status.textContent = landingIntroSpeech;
  loadAudioPreferences();
  state.slicing.bestScore = Number(localStorage.getItem(bestSliceScoreKey) || 0);
  loadCommunity();
  bindStationButtons();
  refreshButtonState();
  renderRecipeSummary();
  renderCommunity();
  updateScoreUI();

  dom.cuisineSelect.addEventListener("change", () => {
    state.cuisine = dom.cuisineSelect.value;
    renderRecipeSummary();
  });
  dom.submitBtn.addEventListener("click", submitRecipe);
  dom.sliceBtn.addEventListener("click", runSliceAction);
  dom.resetPrepBtn.addEventListener("click", resetPrep);
  if (dom.musicToggleBtn) {
    dom.musicToggleBtn.addEventListener("click", () => {
      initAudioFromUserGesture();
      setMusicEnabled(!audioState.musicEnabled);
    });
  }
  if (dom.sfxToggleBtn) {
    dom.sfxToggleBtn.addEventListener("click", () => {
      initAudioFromUserGesture();
      setSfxEnabled(!audioState.sfxEnabled);
    });
  }
  if (dom.muteAllAudioBtn) {
    dom.muteAllAudioBtn.addEventListener("click", () => {
      initAudioFromUserGesture();
      setMuteAllEnabled(!audioState.muteAll);
    });
  }
  dom.recipeName.addEventListener("input", () => {
    state.recipeName = dom.recipeName.value;
    updateMobileGuidedFlow();
  });

  window.addEventListener("resize", () => {
    mobileGuide.enabled = isMobileViewport();
  });

  const primeAudio = () => {
    initAudioFromUserGesture();
    document.removeEventListener("pointerdown", primeAudio);
    document.removeEventListener("touchstart", primeAudio);
    document.removeEventListener("keydown", primeAudio);
  };
  document.addEventListener("pointerdown", primeAudio, { passive: true });
  document.addEventListener("touchstart", primeAudio, { passive: true });
  document.addEventListener("keydown", primeAudio);

  bindPrepPlanEditor();
  bindCanvasSlicing();
  tryFocusRecipeNameForMobile();
  updateMobileGuidedFlow();
  drawKitchen();
}

document.addEventListener("DOMContentLoaded", initGame);
