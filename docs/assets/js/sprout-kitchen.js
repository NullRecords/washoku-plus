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
    breakUntil: 0,
    misses: 0,
    hitsThisRound: 0,
    score: 0,
    bestScore: 0,
    timerSeconds: 90,
    timeLeft: 0,
    roundStartedAt: 0,
    requiredIds: [],
    platedCounts: {},
    prepQueue: [],
    prepIndex: -1,
    stepHits: 0,
    stepHitsRequired: 0,
    stepActionMode: "slice",
    stepRequiredTool: "knife",
    heldTool: "knife",
    stepTimeSeconds: 7,
    stepEndsAt: 0,
    stepTimeLeft: 0,
    stepTitle: "",
    stirAngleProgress: 0,
    stirLastAngle: null,
    lastToolWarningAt: 0
  },
  completedSteps: { protein: false, plants: false, starch: false, flavor: false, prep: false },
  communityLocal: [],
  communityTracked: [],
  activeStation: "protein",
  celebrateUntil: 0
};

const STATION_X = { protein: 110, plants: 270, starch: 430, flavor: 590 };
const stepOrder = ["protein", "plants", "starch", "flavor", "prep"];
const storageKey = "washoku-community-recipes-v2";
const bestSliceScoreKey = "washoku-slice-best-v1";
const voteRegistryKey = "washoku-community-votes-v1";
const mobileBreakpointPx = 980;
const landingIntroSpeech = "Three quick steps: pick your bowl ingredients, confirm prep plan, then start slicing and plate every pick.";
const musicEnabledKey = "washoku-audio-music-enabled-v1";
const sfxEnabledKey = "washoku-audio-sfx-enabled-v1";
const muteAllEnabledKey = "washoku-audio-mute-all-enabled-v1";
const managedMenuFile = "assets/data/menu-content.json";
const managedCommunityFile = "assets/data/community-submissions.json";

const canvas = document.getElementById("kitchenCanvas");
const ctx = canvas.getContext("2d");

const dom = {
  status: document.getElementById("stageStatus"),
  activeStation: document.getElementById("activeStationLabel"),
  gameHero: document.getElementById("gameHero"),
  kitchenStage: document.getElementById("kitchenStage"),
  sliceControlPanel: document.querySelector(".slice-control-panel"),
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
  panelStatus: document.getElementById("panelStatus"),
  panelSproutText: document.getElementById("panelSproutText"),
  panelSproutAvatar: document.getElementById("panelSproutAvatar"),
  toolRack: document.getElementById("toolRack"),
  floatingStartBtn: document.getElementById("floatingStartBtn"),
  prepStepTitle: document.getElementById("prepStepTitle"),
  startStepBuild: document.getElementById("startStepBuild"),
  startStepPrep: document.getElementById("startStepPrep"),
  startStepSlice: document.getElementById("startStepSlice"),
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
  communityExportBtn: document.getElementById("communityExportBtn"),
  communityImportBtn: document.getElementById("communityImportBtn"),
  communityLoadTrackedBtn: document.getElementById("communityLoadTrackedBtn"),
  communityImportInput: document.getElementById("communityImportInput"),
  submitBtn: document.getElementById("submitRecipeBtn"),
  dishReveal: document.getElementById("dishReveal"),
  dishRevealImage: document.getElementById("dishRevealImage"),
  dishRevealText: document.getElementById("dishRevealText")
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

const kitchenBoardImage = new Image();
const kitchenBoardImageCandidates = [
  "assets/images/sprout/cooking-board.png",
  "assets/images/cooking-board.png",
  "assets/images/washoku-plus-app-image.png"
];
let kitchenBoardImageIndex = 0;

function loadKitchenBoardImage() {
  const nextPath = kitchenBoardImageCandidates[kitchenBoardImageIndex];
  if (!nextPath) return;
  kitchenBoardImage.src = nextPath;
}

kitchenBoardImage.addEventListener("error", () => {
  kitchenBoardImageIndex += 1;
  loadKitchenBoardImage();
});

loadKitchenBoardImage();

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

const menuSyncState = {
  source: "defaults",
  dynamicCounts: { protein: 0, plants: 0, starch: 0, flavor: 0 }
};

const baseStatsByGroup = {
  protein: { kcal: 190, protein: 24, plants: 0, taste: 7 },
  plants: { kcal: 28, protein: 2, plants: 1, taste: 6 },
  starch: { kcal: 200, protein: 4, plants: 0, taste: 7 },
  flavor: { kcal: 20, protein: 1, plants: 0, taste: 7 }
};

function toApiLoadUrl(filePath) {
  return `/api/load-file?file=${encodeURIComponent(filePath)}&_=${Date.now()}`;
}

function toStaticSyncUrl(path) {
  const joiner = path.includes("?") ? "&" : "?";
  return `${path}${joiner}sync=${Date.now()}`;
}

async function fetchManagedJson(filePath) {
  try {
    const apiResponse = await fetch(toApiLoadUrl(filePath), { cache: "no-store" });
    if (apiResponse.ok) {
      const payload = await apiResponse.json();
      const parsed = JSON.parse(payload.content || "{}");
      return { source: "api", payload: parsed };
    }
  } catch {
    // Fall through to static payload.
  }

  const staticResponse = await fetch(toStaticSyncUrl(filePath), { cache: "no-store" });
  if (!staticResponse.ok) {
    throw new Error(`managed payload load failed for ${filePath}: ${staticResponse.status}`);
  }
  return { source: "static", payload: await staticResponse.json() };
}

async function fetchManagedMenuPayload() {
  return fetchManagedJson(managedMenuFile);
}

function slugifyIngredient(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function cleanIngredientName(raw) {
  return String(raw || "")
    .replace(/\s+/g, " ")
    .replace(/[()]/g, "")
    .trim();
}

function splitIngredientText(raw) {
  if (Array.isArray(raw)) {
    return raw.map(cleanIngredientName).filter(Boolean);
  }
  return String(raw || "")
    .split(/[;,/]|\band\b/gi)
    .map(cleanIngredientName)
    .filter((item) => item.length >= 2 && item.length <= 40);
}

function cuisineTagFromMeal(meal) {
  const cuisine = String(meal?.cuisine || "").toLowerCase();
  if (cuisine.includes("japanese")) return "japanese";
  if (cuisine.includes("korean")) return "korean";
  if (cuisine.includes("thai")) return "thai";
  if (cuisine.includes("mediterranean")) return "mediterranean";
  if (cuisine.includes("mexican")) return "mexican";
  return "global";
}

function hasCatalogMatch(group, name, id) {
  const lower = name.toLowerCase();
  return ingredientCatalog[group].some((item) => item.id === id || item.name.toLowerCase() === lower);
}

function addIngredientToCatalog(group, rawName, tags) {
  const name = cleanIngredientName(rawName);
  if (!name) return false;

  const baseId = slugifyIngredient(name);
  if (!baseId) return false;

  const id = `${group}-${baseId}`;
  if (hasCatalogMatch(group, name, id)) return false;

  const base = baseStatsByGroup[group];
  ingredientCatalog[group].push({
    id,
    name,
    kcal: base.kcal,
    protein: base.protein,
    plants: base.plants,
    taste: base.taste,
    tags: Array.from(new Set([...(tags || []), "menu-sync"]))
  });
  return true;
}

function mergeCatalogFromManagedMeals(meals) {
  const added = { protein: 0, plants: 0, starch: 0, flavor: 0 };
  if (!Array.isArray(meals)) return added;

  meals.forEach((meal) => {
    const baseTags = [cuisineTagFromMeal(meal)];

    if (addIngredientToCatalog("protein", meal?.protein, [...baseTags, "protein"])) added.protein += 1;

    splitIngredientText(meal?.plants).forEach((item) => {
      if (addIngredientToCatalog("plants", item, [...baseTags, "plants"])) added.plants += 1;
    });

    if (addIngredientToCatalog("starch", meal?.smartStarch, [...baseTags, "starch"])) added.starch += 1;

    splitIngredientText(meal?.flavor).forEach((item) => {
      if (addIngredientToCatalog("flavor", item, [...baseTags, "flavor"])) added.flavor += 1;
    });
  });

  return added;
}

async function loadDynamicIngredientCatalog() {
  try {
    const { source, payload } = await fetchManagedMenuPayload();
    const added = mergeCatalogFromManagedMeals(payload?.meals || []);
    menuSyncState.source = source;
    menuSyncState.dynamicCounts = added;
  } catch (error) {
    console.warn("Sprout Kitchen menu sync failed; using built-in catalog.", error);
    menuSyncState.source = "defaults";
    menuSyncState.dynamicCounts = { protein: 0, plants: 0, starch: 0, flavor: 0 };
  }
}

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
  const guidedInProgress = state.slicing.prepQueue.length > 0
    && state.slicing.prepIndex >= 0
    && state.slicing.prepIndex < state.slicing.prepQueue.length;
  return hasRequiredBuildSelections()
    && state.prepPlan.confirmed
    && !state.slicing.active
    && !state.slicing.countdownActive
    && !guidedInProgress
    && !state.slicing.breakUntil;
}

function prepActionMode(action) {
  const normalized = String(action || "").toLowerCase();
  if (["mix", "whisk", "simmer", "drizzle", "marinate"].includes(normalized)) return "stir";
  if (["juice", "pound"].includes(normalized)) return "pound";
  return "slice";
}

function prepActionVerb(mode) {
  if (mode === "stir") return "Stir";
  if (mode === "pound") return "Pound";
  return "Slice";
}

function requiredToolForStep(step) {
  const action = String(step?.action || "").toLowerCase();
  if (action.includes("juice")) return "juicer";
  if (step?.mode === "stir") return "spoon";
  if (step?.mode === "pound") return "masher";
  return "knife";
}

function toolLabel(tool) {
  if (tool === "juicer") return "juicer";
  if (tool === "spoon") return "spoon + bowl";
  if (tool === "masher") return "mash bowl";
  return "knife";
}

function stepTimeBudgetSeconds(step) {
  const base = 4;
  const byHits = Math.ceil((step?.hitsRequired || 2) * 1.15);
  return Math.max(4, Math.min(9, base + byHits));
}

function getToolSurfaceCenter() {
  const t = performance.now() * 0.001;
  const baseX = canvas.width * 0.48;
  const baseY = 246;

  if (!state.slicing.active) {
    return { x: baseX, y: baseY };
  }

  if (state.slicing.stepActionMode === "stir") {
    return {
      x: baseX + Math.sin(t * 1.7) * 28,
      y: baseY + Math.cos(t * 2.1) * 17
    };
  }

  if (state.slicing.stepActionMode === "pound") {
    return {
      x: baseX + Math.sin(t * 2.4) * 14,
      y: baseY + Math.cos(t * 2.2) * 8
    };
  }

  return { x: baseX, y: baseY };
}

function refreshToolRackUI() {
  if (!dom.toolRack) return;
  dom.toolRack.querySelectorAll("[data-tool]").forEach((btn) => {
    const tool = btn.dataset.tool;
    btn.classList.toggle("is-active", tool === state.slicing.heldTool);
    btn.classList.toggle("is-required", state.slicing.active && tool === state.slicing.stepRequiredTool);
  });
}

function setHeldTool(tool) {
  state.slicing.heldTool = tool;
  refreshToolRackUI();
}

function markToolMismatch(requiredTool) {
  const now = performance.now();
  if (now - state.slicing.lastToolWarningAt < 420) return;
  state.slicing.lastToolWarningAt = now;
  state.slicing.score = Math.max(0, state.slicing.score - 2);
  dom.status.textContent = `Pick up the ${toolLabel(requiredTool)} for this step.`;
}

function prepHitsForRow(row) {
  const unitScale = { cup: 0.9, tbsp: 0.45, tsp: 0.2, g: 1 / 70, oz: 0.34, piece: 0.85 };
  const scaled = Math.max(0.5, Number(row.qty || 0)) * (unitScale[row.unit] || 0.7);
  const mode = prepActionMode(row.action);
  const base = mode === "stir" ? 3 : 4;
  return Math.max(3, Math.min(6, Math.round(base + scaled)));
}

function buildGuidedPrepQueue() {
  return state.prepPlan.rows.map((row) => {
    const mode = prepActionMode(row.action);
    const item = getById(row.group, row.id);
    return {
      ...row,
      mode,
      actionVerb: prepActionVerb(mode),
      hitsRequired: prepHitsForRow(row),
      item
    };
  });
}

function currentPrepStep() {
  if (state.slicing.prepIndex < 0) return null;
  return state.slicing.prepQueue[state.slicing.prepIndex] || null;
}

function startNextPrepStep() {
  state.slicing.prepIndex += 1;
  state.slicing.stepHits = 0;
  state.slicing.stirAngleProgress = 0;
  state.slicing.stirLastAngle = null;
  flyingIngredients.length = 0;

  const step = currentPrepStep();
  if (!step) {
    finishSliceRound("prep queue complete");
    return;
  }

  state.slicing.stepHitsRequired = step.hitsRequired;
  state.slicing.stepActionMode = step.mode;
  state.slicing.stepRequiredTool = requiredToolForStep(step);
  state.slicing.stepTimeSeconds = stepTimeBudgetSeconds(step);
  state.slicing.stepTimeLeft = state.slicing.stepTimeSeconds;
  state.slicing.stepEndsAt = 0;
  state.slicing.stepTitle = `${step.actionVerb} ${step.name}`;
  state.slicing.countdownActive = true;
  state.slicing.countdownEndsAt = performance.now() + state.slicing.countdownSeconds * 1000;
  dom.status.textContent = `${step.actionVerb} step coming up: ${step.name}. Pick ${toolLabel(state.slicing.stepRequiredTool)}.`;
  refreshToolRackUI();
}

function completeCurrentPrepStep(sourceX = canvas.width * 0.5, sourceY = 248, timedOut = false) {
  const step = currentPrepStep();
  if (!step) return;

  const plateX = canvas.width - 132;
  const plateY = 278;
  plateTransfers.push({
    x: sourceX,
    y: sourceY,
    tx: plateX - 34 + Math.random() * 68,
    ty: plateY - 22 + Math.random() * 44,
    itemId: step.id,
    color: colorForItem(step.item),
    progress: 0,
    done: false
  });

  state.slicing.score += timedOut ? 6 : 16;
  if (timedOut) {
    dom.status.textContent = `${step.actionVerb} ${step.name}: time up, plated with a small penalty.`;
  } else {
    dom.status.textContent = `${step.actionVerb} ${step.name}: complete. Nice rhythm, chef.`;
  }
  currentSproutMood = "happy";
  state.slicing.active = false;
  state.slicing.stepEndsAt = 0;
  state.slicing.stepTimeLeft = 0;
  state.slicing.breakUntil = performance.now() + 900;
}

function registerPrepInteraction(itemId, hitX, hitY) {
  const step = currentPrepStep();
  if (!step || !state.slicing.active) return;

  const requiredTool = state.slicing.stepRequiredTool;
  if (state.slicing.heldTool !== requiredTool) {
    markToolMismatch(requiredTool);
    updateScoreUI();
    return;
  }

  state.prep.currentSlices = Math.min(state.prep.targetSlices, state.prep.currentSlices + 1);
  state.slicing.hitsThisRound += 1;
  state.slicing.score = Math.max(0, state.slicing.score + 10);
  state.slicing.stepHits += 1;
  playSliceSfx();

  if (state.slicing.stepHits >= state.slicing.stepHitsRequired) {
    completeCurrentPrepStep(hitX, hitY);
  }

  if (step.id !== itemId) {
    state.slicing.score = Math.max(0, state.slicing.score - 4);
  }
}

function updateStartStepState(element, done) {
  if (!element) return;
  element.classList.toggle("is-done", done);
}

function updateStartGuideUI(countdown = 0) {
  const hasBuild = hasRequiredBuildSelections();
  const prepConfirmed = state.prepPlan.confirmed;
  const readyToStart = canStartSliceRound();
  const onboardingActive = !state.slicing.active && !state.slicing.countdownActive && !readyToStart;

  if (dom.sliceControlPanel) {
    dom.sliceControlPanel.classList.toggle("is-onboarding", onboardingActive);
  }

  updateStartStepState(dom.startStepBuild, hasBuild);
  updateStartStepState(dom.startStepPrep, prepConfirmed);
  updateStartStepState(dom.startStepSlice, state.slicing.active || readyToStart || state.completedSteps.prep);

  if (dom.sliceBtn) {
    dom.sliceBtn.classList.toggle("start-attention", readyToStart && !state.slicing.active && !state.slicing.countdownActive);
  }

  if (dom.panelSproutText) {
    if (state.slicing.active) {
      dom.panelSproutText.textContent = "Sprout says: keep swiping and plate every selected ingredient.";
    } else if (state.slicing.countdownActive) {
      dom.panelSproutText.textContent = `Sprout says: get ready, slicing starts in ${countdown}.`;
    } else if (!hasBuild) {
      dom.panelSproutText.textContent = "Sprout's quick start";
    } else if (!prepConfirmed) {
      dom.panelSproutText.textContent = "Step 2 is next: tap Confirm Prep Plan to unlock slicing.";
    } else {
      dom.panelSproutText.textContent = "Step 3 unlocked: hit Start Slice Round and swipe fast.";
    }
  }
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
    protein: ["slice", "dice", "cube", "marinate", "pound"],
    plants: ["slice", "chop", "shred", "quick-pickle", "juice"],
    starch: ["steam", "boil", "warm", "toast"],
    flavor: ["mix", "whisk", "drizzle", "simmer", "juice"]
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
  const currentStep = currentPrepStep();
  const platedNeed = Math.max(1, state.slicing.requiredIds.length || selectedForSlicing().length);
  const stepSeconds = state.slicing.active ? Math.max(0, Math.ceil(state.slicing.stepTimeLeft || 0)) : 0;
  const timerText = state.slicing.active ? `${seconds}s` : "--";
  const stepTimerText = state.slicing.active ? `Step ${stepSeconds}s` : "Step --";
  dom.sliceStats.textContent = `Score ${state.slicing.score} | Time ${timerText} | Plated ${platedUniqueCount()}/${platedNeed}`;
  dom.liveTimer.textContent = `Time ${timerText} | ${stepTimerText}`;
  dom.liveScore.textContent = `Score ${state.slicing.score}`;
  dom.livePlated.textContent = `Plated ${platedUniqueCount()}/${platedNeed}`;

  if (state.slicing.active) {
    const actionVerb = prepActionVerb(state.slicing.stepActionMode);
    dom.sliceBtn.textContent = actionVerb;
    dom.sliceCountdownBadge.textContent = "Live";
    dom.panelStatus.textContent = `${currentStep?.name || "Prep step"}: ${actionVerb} ${state.slicing.stepHits}/${state.slicing.stepHitsRequired} with ${toolLabel(state.slicing.stepRequiredTool)}.`;
  } else if (state.slicing.countdownActive) {
    dom.sliceBtn.textContent = "Get Ready";
    dom.sliceCountdownBadge.textContent = `${countdown}`;
    dom.panelStatus.textContent = `${currentStep?.actionVerb || "Prep"} ${currentStep?.name || "step"} in ${countdown}...`;
  } else {
    dom.sliceBtn.textContent = "Start Slice Round";
    dom.sliceCountdownBadge.textContent = "Ready";
    if (!hasRequiredBuildSelections()) {
      dom.panelStatus.textContent = "Step 1 of 3: Pick 1 protein, 2 plants, 1 starch, and 1 flavor.";
    } else if (!state.prepPlan.confirmed) {
      dom.panelStatus.textContent = "Step 2 of 3: Tap Confirm Prep Plan to unlock Start Slice Round.";
    } else {
      dom.panelStatus.textContent = "Step 3 of 3: Tap Start Slice Round, then swipe ingredients onto the plate.";
    }
  }

  if (state.slicing.active) {
    if (state.slicing.stepActionMode === "stir") {
      dom.sliceHint.textContent = "Pick Spoon + Bowl, then draw circles while the bowl drifts around.";
    } else if (state.slicing.stepActionMode === "pound") {
      dom.sliceHint.textContent = state.slicing.stepRequiredTool === "juicer"
        ? "Pick Juicer, then tap the moving bowl target to squeeze fast."
        : "Pick Mash Bowl, then tap the moving target for even prep.";
    } else {
      dom.sliceHint.textContent = "Pick Knife, then swipe evenly across the rolling ingredient in order.";
    }
  } else if (state.slicing.countdownActive) {
    dom.sliceHint.textContent = "3-2-1 countdown running. Get ready for this specific prep step.";
  } else if (!state.prepPlan.confirmed) {
    dom.sliceHint.textContent = hasRequiredBuildSelections()
      ? "Nice picks. Next tap Confirm Prep Plan."
      : "Start with your ingredient picks to unlock prep.";
  } else if (state.prep.currentSlices >= state.prep.targetSlices && allIngredientsPlated()) {
    dom.sliceHint.textContent = "Prep cleared. You can submit your dish now.";
  } else {
    dom.sliceHint.textContent = "Start guided prep. Steps run in recipe order with short pauses between them.";
  }

  if (dom.prepStepTitle) {
    if (state.slicing.active || state.slicing.countdownActive) {
      const verb = currentStep?.actionVerb || prepActionVerb(state.slicing.stepActionMode);
      const idx = Math.max(0, state.slicing.prepIndex) + 1;
      const total = Math.max(1, state.slicing.prepQueue.length || state.prepPlan.rows.length);
      dom.prepStepTitle.textContent = `Step ${idx}/${total}: ${verb} ${currentStep?.name || "ingredient"} (${state.slicing.stepHits}/${state.slicing.stepHitsRequired})`;
    } else if (state.prepPlan.confirmed) {
      dom.prepStepTitle.textContent = "Prep flow ready: press Start Slice Round for guided steps.";
    } else {
      dom.prepStepTitle.textContent = "Prep flow: waiting for a confirmed prep plan.";
    }
  }

  updateStartGuideUI(countdown);
  dom.sliceBtn.disabled = !canStartSliceRound() && !state.slicing.active;

  const showFloatingStart = canStartSliceRound() && !state.slicing.active && !state.slicing.countdownActive;
  if (dom.floatingStartBtn) {
    dom.floatingStartBtn.hidden = !showFloatingStart;
  }
  if (dom.kitchenStage) {
    dom.kitchenStage.classList.toggle("is-start-ready", showFloatingStart);
  }
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
    dom.mobileSproutCoach.classList.toggle("is-onboarding", !state.slicing.active && !state.slicing.countdownActive && !canStartSliceRound());
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

const cuisineHeroDishById = {
  japanese: "meal-cat-10",
  korean: "meal-cat-11",
  thai: "meal-cat-18",
  mediterranean: "meal-cat-15",
  mexican: "meal-cat-14",
  global: "meal-cat-24"
};

const ingredientIconById = {
  salmon: "salmon.png",
  chicken: "chicken.png",
  tofu: "tofu.png",
  shrimp: "shrimp.png",
  edamame: "edamame.png",
  tuna: "beef.png",
  turkey: "chicken.png",
  chickpeas: "chickpeas.png",
  cabbage: "cabbage.png",
  spinach: "spinach.png",
  mushroom: "mushroom.png",
  carrot: "carrot.png",
  cucumber: "cucumber.png",
  seaweed: "herb-flakes.png",
  "kimchi-veg": "salsa.png",
  "bell-pepper": "tomato.png",
  broccoli: "broccoli.png",
  "brown-rice": "white-rice.png",
  "white-rice": "white-rice.png",
  "rice-noodle": "rice-noodle.png",
  potato: "potato.png",
  quinoa: "white-rice.png",
  "corn-tortilla": "corn-tortilla.png",
  tamari: "tamari.png",
  miso: "tamari.png",
  kimchi: "chili-flakes.png",
  ginger: "orange.png",
  herb: "herb-flakes.png",
  gochujang: "chili-flakes.png",
  salsa: "salsa.png",
  apple: "apple.png",
  banana: "banana.png",
  strawberry: "strawberry.png",
  blueberries: "blueberries.png",
  grapes: "grapes.png",
  orange: "orange.png",
  lime: "lime.png",
  bread: "bread.png",
  baguette: "baguette.png",
  salt: "salt.png",
  pepper: "pepper.png"
};

const ingredientIconAliases = {
  "protein-salmon": "salmon.png",
  "protein-chicken-breast": "chicken.png",
  "protein-chicken": "chicken.png",
  "protein-shrimp": "shrimp.png",
  "protein-tofu": "tofu.png",
  "protein-edamame": "edamame.png",
  "protein-tuna": "beef.png",
  "protein-turkey": "chicken.png",
  "protein-chickpeas": "chickpeas.png",
  "plants-cabbage": "cabbage.png",
  "plants-spinach": "spinach.png",
  "plants-mushroom": "mushroom.png",
  "plants-carrot": "carrot.png",
  "plants-cucumber": "cucumber.png",
  "plants-seaweed": "herb-flakes.png",
  "plants-kimchi-veg-mix": "salsa.png",
  "plants-bell-pepper": "tomato.png",
  "plants-broccoli": "broccoli.png",
  "starch-brown-rice": "white-rice.png",
  "starch-white-rice": "white-rice.png",
  "starch-rice-noodles": "rice-noodle.png",
  "starch-potato": "potato.png",
  "starch-quinoa": "white-rice.png",
  "starch-corn-tortilla": "corn-tortilla.png",
  "flavor-wheat-free-tamari": "tamari.png",
  "flavor-miso-broth": "tamari.png",
  "flavor-kimchi-style-chili": "chili-flakes.png",
  "flavor-ginger-citrus": "orange.png",
  "flavor-herb-lemon": "herb-flakes.png",
  "flavor-gochujang-style": "chili-flakes.png",
  "flavor-fresh-salsa": "salsa.png"
};

const defaultIconByGroup = {
  protein: "chicken.png",
  plants: "spinach.png",
  starch: "white-rice.png",
  flavor: "tamari.png"
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
  const iconFile = resolveIngredientIconFile(item);
  if (iconFile) {
    const iconPath = `assets/images/ingredient-icons/${iconFile}`;
    if (!mealPhotoCache.has(iconPath)) {
      const icon = new Image();
      icon.src = iconPath;
      mealPhotoCache.set(iconPath, icon);
    }
    return mealPhotoCache.get(iconPath);
  }

  const path = "assets/images/ingredient-icons/spinach.png";
  if (!mealPhotoCache.has(path)) {
    const img = new Image();
    img.src = path;
    mealPhotoCache.set(path, img);
  }
  return mealPhotoCache.get(path);
}

function resolveIngredientIconFile(item) {
  if (!item) return "";

  if (ingredientIconById[item.id]) {
    return ingredientIconById[item.id];
  }

  const rawId = String(item.id || "").toLowerCase();
  const group = ingredientGroupForId(item.id);
  const strippedId = rawId.replace(/^(protein|plants|starch|flavor)-/, "");
  if (ingredientIconById[strippedId]) {
    return ingredientIconById[strippedId];
  }

  const byAliasId = ingredientIconAliases[rawId] || ingredientIconAliases[`${group}-${strippedId}`];
  if (byAliasId) {
    return byAliasId;
  }

  const nameSlug = slugifyIngredient(item.name || "");
  if (nameSlug) {
    if (ingredientIconById[nameSlug]) {
      return ingredientIconById[nameSlug];
    }
    const byAliasName = ingredientIconAliases[nameSlug] || ingredientIconAliases[`${group}-${nameSlug}`];
    if (byAliasName) {
      return byAliasName;
    }
  }

  return defaultIconByGroup[group] || "spinach.png";
}

function heroMealPhotoForCuisine() {
  const dishId = cuisineHeroDishById[state.cuisine] || cuisineHeroDishById.global;
  const path = `assets/images/dishes/${dishId}.png`;
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

function ingredientShortLabel(item) {
  if (!item || !item.name) return "";
  const firstWord = String(item.name).split(" ")[0] || "";
  return firstWord.toUpperCase().slice(0, 8);
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
  const usePhoto = options.usePhoto !== false;
  const showLabel = options.showLabel === true;

  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = opacity;

  traceIngredientShapePath(group, size);
  ctx.fillStyle = color;
  ctx.fill();

  if (usePhoto && photo && photo.complete && photo.naturalWidth > 0) {
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

  if (showLabel) {
    const label = ingredientShortLabel(item);
    if (label) {
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.beginPath();
      ctx.roundRect(-size * 0.72, size * 0.82, size * 1.44, size * 0.58, size * 0.22);
      ctx.fill();
      ctx.fillStyle = "#1d3a2d";
      ctx.font = `900 ${Math.max(8, Math.round(size * 0.3))}px 'Trebuchet MS', sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(label, 0, size * 1.22);
    }
  }

  ctx.restore();
}

function drawIngredientSprite(x, y, size, item) {
  drawPhotoFoodPiece(x, y, size, item);
}

function spawnIngredientTarget() {
  const step = currentPrepStep();
  const id = step?.id;
  const item = step?.item || (id ? (getById("protein", id) || getById("plants", id) || getById("starch", id) || getById("flavor", id)) : null);
  if (!item) return;

  const hasActiveTarget = flyingIngredients.some((target) => !target.sliced && target.item.id === item.id);
  if (hasActiveTarget) return;

  const startX = 70 + Math.random() * (canvas.width - 240);
  flyingIngredients.push({
    id: `${item.id}-${Date.now()}-${Math.random()}`,
    item,
    x: startX,
    y: canvas.height - 30,
    vx: (Math.random() - 0.5) * 2.2,
    vy: -(8.5 + Math.random() * 2.9),
    radius: 20 + Math.random() * 5,
    roll: false,
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

function registerSliceHit(target, distance = 0) {
  target.sliced = true;
  target.life = 0.15;
  registerPrepInteraction(target.item.id, target.x, target.y);
  const precisionBonus = Math.max(0, 5 - Math.round(distance / 3));
  if (precisionBonus > 0) {
    state.slicing.score += precisionBonus;
  }
  currentSproutMood = "happy";
  state.celebrateUntil = Date.now() + 520;

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
    const distance = distanceToSegment(target.x, target.y, ax, ay, bx, by);
    if (distance <= target.radius + 8) {
      registerSliceHit(target, distance);
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
  state.slicing.countdownActive = false;
  state.slicing.breakUntil = 0;
  state.slicing.stepEndsAt = 0;
  state.slicing.stepTimeLeft = 0;
  state.slicing.countdownEndsAt = 0;
  const newTopScore = saveBestSliceScoreIfNeeded();
  if (allIngredientsPlated() && state.prep.currentSlices >= state.prep.targetSlices) {
    celebrateStep("prep");
    showDishReveal();
    if (newTopScore) {
      currentSproutMood = "celebrate";
      triggerTopScoreCelebration();
      dom.status.textContent = `Wow good job, your meal is complete! Personal best score: ${state.slicing.score}.`;
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
  state.slicing.roundStartedAt = 0;
  state.slicing.prepQueue = [];
  state.slicing.prepIndex = -1;
  state.slicing.stepHits = 0;
  state.slicing.stepHitsRequired = 0;
  state.slicing.stepActionMode = "slice";
  state.slicing.stepRequiredTool = "knife";
  state.slicing.stirAngleProgress = 0;
  state.slicing.stirLastAngle = null;
  refreshToolRackUI();
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
      state.slicing.stepEndsAt = performance.now() + state.slicing.stepTimeSeconds * 1000;
      if (!state.slicing.roundStartedAt) state.slicing.roundStartedAt = performance.now();
      dom.status.textContent = `${prepActionVerb(state.slicing.stepActionMode)} now: ${currentPrepStep()?.name || "ingredient"}!`;
      if (state.slicing.stepActionMode === "slice") spawnIngredientTarget();
    } else {
      const count = Math.max(1, Math.ceil(remainingMs / 1000));
      const step = currentPrepStep();
      dom.status.textContent = `${step?.actionVerb || "Prep"} ${step?.name || "step"}: ${count}...`;
    }
  }

  if (state.slicing.roundStartedAt) {
    const elapsed = (performance.now() - state.slicing.roundStartedAt) / 1000;
    state.slicing.timeLeft = Math.max(0, state.slicing.timerSeconds - elapsed);
  } else {
    state.slicing.timeLeft = state.slicing.timerSeconds;
  }

  if (state.slicing.active && state.slicing.stepEndsAt > 0) {
    state.slicing.stepTimeLeft = Math.max(0, (state.slicing.stepEndsAt - performance.now()) / 1000);
    if (state.slicing.stepTimeLeft <= 0) {
      state.slicing.misses += 1;
      state.slicing.score = Math.max(0, state.slicing.score - 5);
      const center = getToolSurfaceCenter();
      completeCurrentPrepStep(center.x, center.y, true);
    }
  }

  if (state.slicing.timeLeft <= 0 && (state.slicing.active || state.slicing.countdownActive || state.slicing.breakUntil > 0)) {
    finishSliceRound("time up");
  }

  if (state.slicing.active && state.slicing.stepActionMode !== "stir") {
    spawnAccumulator += 1;
    if (spawnAccumulator >= 21) {
      spawnIngredientTarget();
      spawnAccumulator = 0;
    }
  }

  if (!state.slicing.active && !state.slicing.countdownActive && state.slicing.breakUntil > 0 && performance.now() >= state.slicing.breakUntil) {
    state.slicing.breakUntil = 0;
    startNextPrepStep();
  }

  for (let i = flyingIngredients.length - 1; i >= 0; i -= 1) {
    const target = flyingIngredients[i];
    if (target.roll) {
      target.x += target.vx;
      target.y += Math.sin((performance.now() + i * 60) * 0.008) * 0.5;
      if (target.x > canvas.width - 220 || target.x < 60) target.vx *= -1;
    } else {
      target.x += target.vx;
      target.y += target.vy;
      target.vy += 0.2;
    }
    if (target.sliced) target.life -= 0.05;

    if (target.y > canvas.height + 40) {
      if (!target.sliced && state.slicing.active) {
        state.slicing.misses += 1;
        state.slicing.score = Math.max(0, state.slicing.score - 4);
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

  if (state.slicing.active) {
    const step = currentPrepStep();
    if (!step) {
      finishSliceRound("prep queue complete");
    }
  }

  if (!state.slicing.active && !state.slicing.countdownActive && state.slicing.prepIndex >= state.slicing.prepQueue.length && state.slicing.prepQueue.length > 0) {
    const timeBonus = Math.round(state.slicing.timeLeft * 2);
    state.slicing.score += timeBonus;
    finishSliceRound(`guided prep complete (+${timeBonus} time bonus)`);
  }

  updateSliceStatsUI();
}

function drawGuidedStepOverlay() {
  const step = currentPrepStep();
  if (!step) return;

  const overlayW = 420;
  const overlayH = 44;
  const ox = (canvas.width - overlayW) / 2;
  const oy = 24;
  ctx.save();
  ctx.fillStyle = "rgba(255, 249, 232, 0.95)";
  ctx.strokeStyle = "rgba(152, 92, 23, 0.45)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(ox, oy, overlayW, overlayH, 12);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#793100";
  ctx.font = "900 18px 'Trebuchet MS', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${step.actionVerb.toUpperCase()} ${step.name.toUpperCase()}`, canvas.width / 2, oy + 29);
  ctx.restore();

  if (state.slicing.countdownActive) {
    const c = Math.max(1, Math.ceil((state.slicing.countdownEndsAt - performance.now()) / 1000));
    ctx.save();
    ctx.fillStyle = "rgba(22,54,41,0.75)";
    ctx.font = "900 72px 'Trebuchet MS', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(String(c), canvas.width / 2, 210);
    ctx.fillStyle = "rgba(245, 170, 70, 0.95)";
    ctx.font = "900 42px 'Trebuchet MS', sans-serif";
    ctx.fillText(step.actionVerb.toUpperCase(), canvas.width / 2, 258);
    ctx.restore();
  }
}

function drawActionToolSurface() {
  if (!state.slicing.active) return;
  if (state.slicing.stepActionMode === "slice") return;

  const center = getToolSurfaceCenter();
  const cx = center.x;
  const cy = center.y;
  const progress = state.slicing.stepHitsRequired > 0 ? state.slicing.stepHits / state.slicing.stepHitsRequired : 0;
  const ringColor = state.slicing.stepActionMode === "stir" ? "#4c8f73" : "#8b5f3c";

  if (state.slicing.stepActionMode === "stir") {
    ctx.save();
    ctx.fillStyle = "rgba(234, 248, 241, 0.95)";
    ctx.beginPath();
    ctx.arc(cx, cy, 78, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(35, 83, 62, 0.45)";
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.strokeStyle = "rgba(76, 143, 115, 0.85)";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(cx, cy, 86, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, progress));
    ctx.stroke();
    ctx.fillStyle = "#1f3f31";
    ctx.font = "800 16px 'Trebuchet MS', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("STIR BOWL", cx, cy + 6);
    ctx.font = "700 12px 'Trebuchet MS', sans-serif";
    ctx.fillText(`Tool: ${toolLabel(state.slicing.stepRequiredTool).toUpperCase()}`, cx, cy + 24);
    ctx.restore();
    return;
  }

  ctx.save();
  ctx.fillStyle = "rgba(246, 238, 225, 0.96)";
  ctx.beginPath();
  ctx.roundRect(cx - 74, cy - 46, 148, 94, 26);
  ctx.fill();
  ctx.strokeStyle = "rgba(84, 56, 33, 0.42)";
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.strokeStyle = ringColor;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(cx - 64, cy + 56);
  ctx.lineTo(cx - 64 + 128 * Math.min(1, progress), cy + 56);
  ctx.stroke();
  ctx.fillStyle = "#593621";
  ctx.font = "800 16px 'Trebuchet MS', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("POUND / JUICE", cx, cy + 6);
  ctx.font = "700 12px 'Trebuchet MS', sans-serif";
  ctx.fillText(`Tool: ${toolLabel(state.slicing.stepRequiredTool).toUpperCase()}`, cx, cy + 24);
  ctx.restore();
}

function drawSlicingLayer() {
  flyingIngredients.forEach((target) => {
    ctx.globalAlpha = Math.max(0.22, target.life);
    drawPhotoFoodPiece(target.x, target.y, target.radius, target.item, { usePhoto: true, showLabel: true });
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

  drawActionToolSurface();
  drawGuidedStepOverlay();
}

function drawKitchenBackdrop() {
  if (kitchenBoardImage.complete && kitchenBoardImage.naturalWidth > 0) {
    const imgW = kitchenBoardImage.naturalWidth;
    const imgH = kitchenBoardImage.naturalHeight;
    const scale = Math.min(canvas.width / imgW, canvas.height / imgH);
    const drawW = imgW * scale;
    const drawH = imgH * scale;
    const dx = (canvas.width - drawW) / 2;
    const dy = (canvas.height - drawH) / 2;
    ctx.drawImage(kitchenBoardImage, dx, dy, drawW, drawH);

    const vignette = ctx.createRadialGradient(canvas.width * 0.5, canvas.height * 0.54, 120, canvas.width * 0.5, canvas.height * 0.58, canvas.width * 0.58);
    vignette.addColorStop(0, "rgba(255, 255, 255, 0)");
    vignette.addColorStop(1, "rgba(0, 0, 0, 0.11)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return;
  }

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

function drawSelectedBoardIngredients() {
  const selected = selectedIdsInOrder().map((entry) => getById(entry.group, entry.id)).filter(Boolean);
  if (!selected.length) return;

  const startX = 94;
  const startY = 286;
  selected.slice(0, 7).forEach((item, index) => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    const x = startX + col * 48 + (row % 2) * 6;
    const y = startY + row * 43;
    drawPhotoFoodPiece(x, y, 14, item, { opacity: 0.92 });
  });
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

  drawSelectedBoardIngredients();

  advanceSlicingFrame();
  drawSlicingLayer();
  drawPlatedMealPreview();

  sprout.t += 0.09;
  const bob = Math.sin(sprout.t) * 4;
  sprout.x += (sprout.targetX - sprout.x) * 0.08;

  const introCoachVisible = !state.slicing.active && !state.slicing.countdownActive && !canStartSliceRound();
  const sproutSize = state.slicing.active ? 136 : (introCoachVisible ? 152 : 126);

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
    const step = currentPrepStep();
    dom.status.textContent = `Countdown is on. ${step?.actionVerb || "Prep"} ${step?.name || "step"} next.`;
    return;
  }

  if (!state.slicing.active) {
    hideDishReveal();
    state.prep.currentSlices = 0;
    state.completedSteps.prep = false;
    state.slicing.score = 0;
    state.slicing.hitsThisRound = 0;
    state.slicing.misses = 0;
    state.slicing.timeLeft = state.slicing.timerSeconds;
    state.slicing.roundStartedAt = performance.now();
    state.slicing.prepQueue = buildGuidedPrepQueue();
    state.prep.targetSlices = state.slicing.prepQueue.reduce((sum, step) => sum + step.hitsRequired, 0);
    state.slicing.prepIndex = -1;
    state.slicing.stepHits = 0;
    state.slicing.stepHitsRequired = 0;
    state.slicing.stepActionMode = "slice";
    state.slicing.stepRequiredTool = "knife";
    state.slicing.stepEndsAt = 0;
    state.slicing.stepTimeLeft = 0;
    state.slicing.stepTitle = "";
    state.slicing.breakUntil = 0;
    state.slicing.stirAngleProgress = 0;
    state.slicing.stirLastAngle = null;
    state.slicing.requiredIds = [...new Set(selectedForSlicing())];
    state.slicing.platedCounts = Object.fromEntries(state.slicing.requiredIds.map((id) => [id, 0]));
    flyingIngredients.length = 0;
    spawnAccumulator = 0;
    plateTransfers.length = 0;
    sliceBits.length = 0;
    slashTrail.length = 0;

    if (!state.slicing.prepQueue.length) {
      dom.status.textContent = "Your prep plan is empty. Add at least one prep step.";
      return;
    }

    startNextPrepStep();
    updateScoreUI();
    return;
  }

  if (state.slicing.stepActionMode === "slice") {
    if (state.slicing.heldTool !== "knife") {
      markToolMismatch("knife");
      updateScoreUI();
      return;
    }
    const nearest = flyingIngredients.filter((target) => !target.sliced).sort((a, b) => a.y - b.y)[0];
    if (nearest) registerSliceHit(nearest);
    else spawnIngredientTarget();
  }
  updateScoreUI();
}

function resetPrep() {
  state.slicing.active = false;
  state.slicing.countdownActive = false;
  state.slicing.countdownEndsAt = 0;
  state.slicing.breakUntil = 0;
  state.slicing.stepEndsAt = 0;
  state.slicing.stepTimeLeft = 0;
  state.prep.currentSlices = 0;
  state.completedSteps.prep = false;
  state.slicing.score = 0;
  state.slicing.hitsThisRound = 0;
  state.slicing.misses = 0;
  state.slicing.timeLeft = 0;
  state.slicing.roundStartedAt = 0;
  state.slicing.prepQueue = [];
  state.slicing.prepIndex = -1;
  state.slicing.stepHits = 0;
  state.slicing.stepHitsRequired = 0;
  state.slicing.stepActionMode = "slice";
  state.slicing.stepRequiredTool = "knife";
  state.slicing.stepTitle = "";
  state.slicing.stirAngleProgress = 0;
  state.slicing.stirLastAngle = null;
  state.slicing.requiredIds = [...new Set(selectedForSlicing())];
  state.slicing.platedCounts = Object.fromEntries(state.slicing.requiredIds.map((id) => [id, 0]));
  flyingIngredients.length = 0;
  spawnAccumulator = 0;
  plateTransfers.length = 0;
  sliceBits.length = 0;
  slashTrail.length = 0;
  hideDishReveal();
  refreshToolRackUI();
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

  const toolCenter = () => getToolSurfaceCenter();

  const registerPoundHit = (point) => {
    const center = toolCenter();
    const dist = Math.hypot(point.x - center.x, point.y - center.y);
    if (dist > 88) return;
    registerPrepInteraction(currentPrepStep()?.id, point.x, point.y);
    sliceBits.push({
      x: point.x,
      y: point.y,
      vx: (Math.random() - 0.5) * 2,
      vy: -0.7 - Math.random() * 1.2,
      life: 1,
      color: "#8b5f3c"
    });
    updateScoreUI();
  };

  canvas.addEventListener("pointerdown", (event) => {
    pointerDown = true;
    pointerLast = canvasPointFromEvent(event);

    if (!state.slicing.active) return;
    if (state.slicing.stepActionMode === "pound") {
      if (state.slicing.heldTool !== state.slicing.stepRequiredTool) {
        markToolMismatch(state.slicing.stepRequiredTool);
        return;
      }
      const nearest = flyingIngredients
        .filter((target) => !target.sliced)
        .sort((a, b) => Math.hypot(pointerLast.x - a.x, pointerLast.y - a.y) - Math.hypot(pointerLast.x - b.x, pointerLast.y - b.y))[0];
      if (nearest) {
        const dist = Math.hypot(pointerLast.x - nearest.x, pointerLast.y - nearest.y);
        if (dist <= nearest.radius + 16) {
          registerSliceHit(nearest, dist);
          return;
        }
      }
      registerPoundHit(pointerLast);
    }
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!pointerDown || !state.slicing.active) return;
    const point = canvasPointFromEvent(event);

    if (state.slicing.stepActionMode === "stir") {
      if (state.slicing.heldTool !== state.slicing.stepRequiredTool) {
        markToolMismatch(state.slicing.stepRequiredTool);
        pointerLast = point;
        return;
      }
      const center = toolCenter();
      const dist = Math.hypot(point.x - center.x, point.y - center.y);
      if (dist > 34 && dist < 104) {
        const angle = Math.atan2(point.y - center.y, point.x - center.x);
        if (state.slicing.stirLastAngle !== null) {
          let delta = angle - state.slicing.stirLastAngle;
          if (delta > Math.PI) delta -= Math.PI * 2;
          if (delta < -Math.PI) delta += Math.PI * 2;
          state.slicing.stirAngleProgress += Math.abs(delta);
          if (state.slicing.stirAngleProgress >= Math.PI * 2) {
            state.slicing.stirAngleProgress -= Math.PI * 2;
            registerPrepInteraction(currentPrepStep()?.id, center.x, center.y);
            updateScoreUI();
          }
        }
        state.slicing.stirLastAngle = angle;
      }
      pointerLast = point;
      slashTrail.push({ ax: center.x, ay: center.y, bx: point.x, by: point.y, life: 0.45 });
      return;
    }

    if (pointerLast && state.slicing.stepActionMode === "slice") {
      if (state.slicing.heldTool !== state.slicing.stepRequiredTool) {
        markToolMismatch(state.slicing.stepRequiredTool);
        pointerLast = point;
        return;
      }
      sliceAlongSegment(pointerLast.x, pointerLast.y, point.x, point.y);
      slashTrail.push({ ax: pointerLast.x, ay: pointerLast.y, bx: point.x, by: point.y, life: 1 });
    }
    pointerLast = point;
  });

  const stop = () => {
    pointerDown = false;
    pointerLast = null;
    state.slicing.stirLastAngle = null;
  };

  canvas.addEventListener("pointerup", stop);
  canvas.addEventListener("pointercancel", stop);
  canvas.addEventListener("pointerleave", stop);
}

function bindToolRack() {
  if (!dom.toolRack) return;
  dom.toolRack.querySelectorAll("[data-tool]").forEach((btn) => {
    btn.addEventListener("click", () => {
      setHeldTool(btn.dataset.tool);
    });
  });
  refreshToolRackUI();
}

function hideDishReveal() {
  if (!dom.dishReveal) return;
  dom.dishReveal.hidden = true;
  if (dom.dishRevealImage) dom.dishRevealImage.removeAttribute("src");
  if (dom.dishRevealText) dom.dishRevealText.textContent = "Finish prep to reveal your final plate image.";
}

function showDishReveal() {
  if (!dom.dishReveal || !dom.dishRevealImage) return;
  const name = (dom.recipeName.value || "Your Dish").trim() || "Your Dish";
  dom.dishRevealImage.src = generateDishPreviewDataUrl(name);
  dom.dishReveal.hidden = false;
  if (dom.dishRevealText) {
    dom.dishRevealText.textContent = `${name} is plated. Submit to add it to the community board.`;
  }
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

function normalizeCommunityRecipe(recipe, extras = {}) {
  const normalized = {
    ...recipe,
    votes: Number(recipe?.votes || 0),
    score: {
      tastiness: Number(recipe?.score?.tastiness || 0),
      protein: Number(recipe?.score?.protein || 0),
      nutrition: Number(recipe?.score?.nutrition || 0),
      washoku: Number(recipe?.score?.washoku || 0),
      overall: Number(recipe?.score?.overall || 0)
    },
    nutrition: {
      kcal: Number(recipe?.nutrition?.kcal || 0),
      protein: Number(recipe?.nutrition?.protein || 0),
      plants: Number(recipe?.nutrition?.plants || 0)
    },
    reviewStatus: recipe?.reviewStatus || "pending",
    sourceLabel: recipe?.sourceLabel || "",
    importedAt: recipe?.importedAt || "",
    readOnly: Boolean(recipe?.readOnly),
    ...extras
  };
  normalized.eligibleForReview = normalized.votes >= 5 && normalized.score.overall >= 78;
  return normalized;
}

function mergeCommunityRecipe(existing, incoming) {
  const merged = {
    ...existing,
    ...incoming,
    votes: Math.max(Number(existing?.votes || 0), Number(incoming?.votes || 0)),
    readOnly: Boolean(incoming?.readOnly),
    reviewStatus: existing?.reviewStatus && existing.reviewStatus !== "pending"
      ? existing.reviewStatus
      : incoming?.reviewStatus || existing?.reviewStatus || "pending",
    sourceLabel: incoming?.sourceLabel || existing?.sourceLabel || ""
  };

  if ((existing?.score?.overall || 0) > (incoming?.score?.overall || 0)) {
    merged.score = existing.score;
  }
  if ((existing?.nutrition?.protein || 0) > (incoming?.nutrition?.protein || 0)) {
    merged.nutrition = existing.nutrition;
  }

  merged.eligibleForReview = merged.votes >= 5 && merged.score.overall >= 78;
  return merged;
}

function getAllCommunityRecipes() {
  const merged = new Map();

  state.communityTracked.forEach((recipe) => {
    if (!recipe?.id) return;
    merged.set(recipe.id, normalizeCommunityRecipe(recipe, { readOnly: true }));
  });

  state.communityLocal.forEach((recipe) => {
    if (!recipe?.id) return;
    const normalized = normalizeCommunityRecipe(recipe, {
      readOnly: false,
      sourceLabel: recipe?.sourceLabel || "Local board"
    });
    const existing = merged.get(recipe.id);
    merged.set(recipe.id, existing ? mergeCommunityRecipe(existing, normalized) : normalized);
  });

  return Array.from(merged.values());
}

function extractRecipesFromImportPayload(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (Array.isArray(payload?.recipes)) {
    return payload.recipes;
  }
  if (Array.isArray(payload?.community)) {
    return payload.community;
  }
  return [];
}

function mergeImportedRecipes(recipes, sourceLabel = "Imported snapshot") {
  if (!Array.isArray(recipes) || !recipes.length) return 0;

  const localById = new Map(state.communityLocal.map((recipe) => [recipe.id, normalizeCommunityRecipe(recipe, { readOnly: false })]));
  let addedCount = 0;

  recipes.forEach((recipe) => {
    if (!recipe?.id) return;
    const normalized = normalizeCommunityRecipe(recipe, {
      readOnly: false,
      sourceLabel: recipe?.sourceLabel || sourceLabel
    });
    const existing = localById.get(recipe.id);
    if (existing) {
      localById.set(recipe.id, mergeCommunityRecipe(existing, normalized));
    } else {
      localById.set(recipe.id, normalized);
      addedCount += 1;
    }
  });

  state.communityLocal = Array.from(localById.values()).map((recipe) => ({
    ...recipe,
    readOnly: false
  }));
  return addedCount;
}

function downloadCommunitySnapshot() {
  const payload = {
    version: "1.0.0",
    exportedAt: new Date().toISOString(),
    source: "sprout-kitchen-local-export",
    recipeCount: state.communityLocal.length,
    recipes: state.communityLocal
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `sprout-community-snapshot-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

async function importCommunitySnapshotFiles(fileList) {
  const files = Array.from(fileList || []);
  if (!files.length) return;

  let importedCount = 0;
  for (const file of files) {
    const text = await file.text();
    const payload = JSON.parse(text);
    const recipes = extractRecipesFromImportPayload(payload);
    importedCount += mergeImportedRecipes(recipes, file.name || "Imported snapshot");
  }

  saveCommunity();
  renderCommunity();
  dom.status.textContent = importedCount
    ? `Imported ${importedCount} community recipes into your local review board.`
    : "Import completed, but no recipes were found in the selected file.";
}

async function loadTrackedCommunity() {
  try {
    const { source, payload } = await fetchManagedJson(managedCommunityFile);
    const recipes = extractRecipesFromImportPayload(payload);
    state.communityTracked = recipes
      .filter((recipe) => recipe?.id)
      .map((recipe) => normalizeCommunityRecipe(recipe, {
        readOnly: true,
        sourceLabel: recipe?.sourceLabel || `Checked-in ${source === "api" ? "admin" : "site"} data`
      }));
  } catch (error) {
    console.warn("Community submission sync failed; continuing with local board only.", error);
    state.communityTracked = [];
  }
}

function bindCommunityControls() {
  dom.communityExportBtn?.addEventListener("click", () => {
    downloadCommunitySnapshot();
    dom.status.textContent = "Downloaded your local community board snapshot as JSON.";
  });

  dom.communityImportBtn?.addEventListener("click", () => {
    dom.communityImportInput?.click();
  });

  dom.communityImportInput?.addEventListener("change", async (event) => {
    try {
      await importCommunitySnapshotFiles(event.target.files);
    } catch (error) {
      console.error(error);
      dom.status.textContent = "Snapshot import failed. Check the JSON file format.";
    } finally {
      event.target.value = "";
    }
  });

  dom.communityLoadTrackedBtn?.addEventListener("click", async () => {
    await loadTrackedCommunity();
    renderCommunity();
    dom.status.textContent = state.communityTracked.length
      ? `Loaded ${state.communityTracked.length} checked-in community submissions for review.`
      : "No checked-in community submissions were found yet.";
  });
}

function loadCommunity() {
  try {
    const raw = localStorage.getItem(storageKey);
    state.communityLocal = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(state.communityLocal)) state.communityLocal = [];
    state.communityLocal = state.communityLocal.map((recipe) => normalizeCommunityRecipe(recipe, { readOnly: false }));
  } catch {
    state.communityLocal = [];
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
  localStorage.setItem(storageKey, JSON.stringify(state.communityLocal));
}

function renderCommunity() {
  const voteRegistry = loadVoteRegistry();
  const recipes = getAllCommunityRecipes();
  if (!recipes.length) {
    dom.communityList.innerHTML = "<p class='help-note'>No community recipes yet. Submit one to start.</p>";
    return;
  }

  const sorted = [...recipes].sort((a, b) => (b.votes + b.score.overall / 10) - (a.votes + a.score.overall / 10));
  dom.communityList.innerHTML = sorted.map((recipe) => {
    const hasVoted = Boolean(voteRegistry[recipe.id]);
    const eligible = recipe.eligibleForReview;
    const isTracked = Boolean(recipe.readOnly);
    const prepLine = Array.isArray(recipe.prepPlan) && recipe.prepPlan.length
      ? `<p>Prep: ${recipe.prepPlan.map((row) => `${row.action} ${row.name} ${row.qty} ${row.unit}`).join(" | ")}</p>`
      : "";
    const sliceLine = recipe.sliceRound
      ? `<p>Slice score ${recipe.sliceRound.score} | misses ${recipe.sliceRound.misses}</p>`
      : "";
    const sourceBits = [];
    if (recipe.sourceLabel) {
      sourceBits.push(recipe.sourceLabel);
    }
    if (recipe.importedAt) {
      sourceBits.push(`Imported ${new Date(recipe.importedAt).toLocaleDateString()}`);
    }
    if (isTracked) {
      sourceBits.push(`Review ${recipe.reviewStatus}`);
    }
    const image = recipe.dishImage
      ? `<img src="${recipe.dishImage}" alt="${recipe.name} preview" style="width:74px;height:74px;border-radius:10px;border:1px solid rgba(22,54,41,0.14);object-fit:cover;">`
      : "";
    const buttonLabel = isTracked ? "Tracked" : hasVoted ? "Voted" : `Vote (${recipe.votes})`;
    const disabledAttr = isTracked || hasVoted ? "disabled" : "";
    const sourceLine = sourceBits.length ? `<p class="community-source-note">${sourceBits.join(" · ")}</p>` : "";
    const trackedBadge = isTracked ? `<span class="badge tracked">Checked-in</span>` : "";
    const reviewBadge = isTracked ? `<span class="badge ${recipe.reviewStatus}">${recipe.reviewStatus}</span>` : "";

    return `<article class="community-item"><div><strong>${recipe.name}</strong><p>${recipe.cuisine} | ${recipe.nutrition.kcal} kcal | ${recipe.nutrition.protein}g protein | score ${recipe.score.overall}</p>${prepLine}${sliceLine}<span class="badge">Tastiness ${recipe.score.tastiness}</span><span class="badge">Protein ${recipe.score.protein}</span><span class="badge">Nutrition ${recipe.score.nutrition}</span><span class="badge">Washoku ${recipe.score.washoku}</span>${eligible ? '<span class="badge">Eligible for app review</span>' : ''}${trackedBadge}${reviewBadge}${sourceLine}</div><div class="community-item-actions">${image}<button class="vote-btn" data-vote="${recipe.id}" ${disabledAttr}>${buttonLabel}</button></div></article>`;
  }).join("");

  dom.communityList.querySelectorAll("[data-vote]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const registry = loadVoteRegistry();
      if (registry[btn.dataset.vote]) {
        return;
      }
      const recipe = state.communityLocal.find((item) => item.id === btn.dataset.vote);
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

  if (dom.dishReveal?.hidden) {
    showDishReveal();
  }

  const payload = recipePayloadFromState();
  state.communityLocal.push(normalizeCommunityRecipe(payload, { readOnly: false, sourceLabel: "Local board" }));
  saveCommunity();
  renderCommunity();
  celebrateStep("prep");
  currentSproutMood = "celebrate";
  dom.status.textContent = `Submitted ${payload.name}. Sprinkle those community votes!`;
}

async function initGame() {
  mobileGuide.enabled = isMobileViewport();
  dom.status.textContent = landingIntroSpeech;
  loadAudioPreferences();
  await loadDynamicIngredientCatalog();
  state.slicing.bestScore = Number(localStorage.getItem(bestSliceScoreKey) || 0);
  loadCommunity();
  await loadTrackedCommunity();
  bindCommunityControls();
  bindToolRack();
  bindStationButtons();
  refreshButtonState();
  hideDishReveal();
  renderRecipeSummary();
  renderCommunity();
  updateScoreUI();

  const syncedCount = Object.values(menuSyncState.dynamicCounts).reduce((sum, value) => sum + value, 0);
  if (syncedCount > 0) {
    dom.status.textContent = `${landingIntroSpeech} Synced ${syncedCount} menu ingredients from ${menuSyncState.source === "api" ? "Menu Manager API" : "site data"}.`;
  }

  dom.cuisineSelect.addEventListener("change", () => {
    state.cuisine = dom.cuisineSelect.value;
    renderRecipeSummary();
  });
  dom.submitBtn.addEventListener("click", submitRecipe);
  dom.sliceBtn.addEventListener("click", runSliceAction);
  if (dom.floatingStartBtn) {
    dom.floatingStartBtn.addEventListener("click", runSliceAction);
  }
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
