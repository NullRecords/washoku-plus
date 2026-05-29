const fallbackInsights = [
	"Breathe in. Today's next meal can be simple: protein, plants, smart starch, and one bright flavor.",
	"A balanced bowl does not need to be perfect. It only needs to be kind enough to repeat.",
	"Try adding one colorful vegetable to your next meal before changing anything else.",
	"If weight changes suddenly, look for sleep, sodium, movement, digestion, and stress before blaming yourself.",
	"A wheat-aware swap for soy sauce: certified wheat-free tamari, coconut aminos, or ginger rice-vinegar sauce.",
	"Vegetarian day idea: tofu, edamame, rice, cucumber, greens, sesame if tolerated, and citrus.",
	"Washoku Plus is about meal architecture: enough protein, enough plants, enough satisfaction."
];

const captions = {
	meditate: "One balanced meal at a time.",
	suggest: "Next idea: build a bowl from protein, plants, rice or beans, and one bright sauce.",
	celebrate: "Small wins count. Consistency beats intensity."
};

const sproutModeImage = {
	meditate: "assets/images/sprout/sprout-meditate.png",
	suggest: "assets/images/sprout/sprout-happy.png",
	celebrate: "assets/images/sprout/sprout-celebrate.png",
	default: "assets/images/sprout/sprout-neutral.png"
};

const dishHints = {
	"meal-cat-01": ["bowl", "rice", "fish", "salmon", "japanese"],
	"meal-cat-02": ["soup", "noodle", "ramen", "broth", "japanese"],
	"meal-cat-03": ["salad", "greens", "bowl"],
	"meal-cat-04": ["soup", "miso", "broth", "japanese"],
	"meal-cat-05": ["bowl", "rice", "poke", "fish", "japanese"],
	"meal-cat-06": ["bowl", "rice", "curry", "stew"],
	"meal-cat-07": ["wrap", "roll", "burrito"],
	"meal-cat-08": ["sushi", "plate", "japanese"],
	"meal-cat-09": ["roll", "hand-roll", "sushi", "japanese"],
	"meal-cat-10": ["bento", "plate", "rice", "japanese"],
	"meal-cat-11": ["plate", "stir-fry", "protein"],
	"meal-cat-12": ["plate", "dumpling"],
	"meal-cat-13": ["bowl", "grain", "salad"],
	"meal-cat-14": ["bowl", "mexican", "taco", "corn", "beans"],
	"meal-cat-15": ["salad", "greens", "mediterranean"],
	"meal-cat-16": ["wrap", "burrito", "roll"],
	"meal-cat-17": ["soup", "stew", "broth"],
	"meal-cat-18": ["pasta", "noodle", "italian"],
	"meal-cat-19": ["sandwich", "toast", "bread"],
	"meal-cat-20": ["burger"],
	"meal-cat-21": ["plate", "breakfast", "eggs"],
	"meal-cat-22": ["plate", "steak", "potato"],
	"meal-cat-23": ["pizza"],
	"meal-cat-24": ["bowl", "rice", "stir-fry", "plate"]
};

const categoryShowcaseHeroAssetById = {
	"bowls": "meal-cat-01",
	"burgers": "meal-cat-20",
	"global-favorites": "meal-cat-24",
	"plates-and-bento": "meal-cat-10",
	"salads": "meal-cat-15",
	"soups-and-noodles": "meal-cat-02",
	"wraps-and-rolls": "meal-cat-07",
	"default": "meal-cat-13"
};

const appState = {
	menuData: null,
	dishConfig: null,
	insights: [...fallbackInsights],
	activeCategory: "all",
	syncSource: "static",
	planner: {
		ingredientQuery: "",
		season: "auto",
		region: "global",
		zipCode: "",
		seasonalOnly: false,
		locationNote: ""
	},
	plannerSignalsByMealId: new Map(),
	plannerContext: {
		region: "global",
		season: "spring",
		isPlannerActive: false
	},
	visibleMealCount: 0,
	plannerQuestSeed: 0
};

const syncPaths = {
	menu: {
		apiFile: "assets/data/menu-content.json",
		staticPath: "assets/data/menu-content.json"
	},
	dishMap: {
		apiFile: "assets/data/dish-map.json",
		staticPath: "assets/data/dish-map.json"
	}
};

const regionLabelById = {
	global: "Global",
	"north-america": "North America",
	"us-northeast": "US Northeast",
	"us-midwest": "US Midwest",
	"us-south": "US South",
	"us-west": "US West",
	"east-asia": "East Asia",
	mediterranean: "Mediterranean",
	"latin-america": "Latin America",
	europe: "Europe",
	oceania: "Oceania"
};

const regionParentById = {
	"us-northeast": "north-america",
	"us-midwest": "north-america",
	"us-south": "north-america",
	"us-west": "north-america"
};

const seasonalIngredientsBySeason = {
	spring: ["asparagus", "spinach", "peas", "radish", "scallions", "bok choy", "strawberry"],
	summer: ["tomato", "cucumber", "zucchini", "corn", "berries", "peppers", "eggplant", "edamame"],
	fall: ["mushrooms", "pumpkin", "sweet potato", "broccoli", "cauliflower", "apple", "pear"],
	winter: ["cabbage", "carrots", "kale", "spinach", "mushrooms", "beets", "citrus"]
};

const regionalIngredientsByRegion = {
	global: ["rice", "cabbage", "carrots", "spinach", "mushrooms", "beans", "potato"],
	"north-america": ["salmon", "corn", "beans", "sweet potato", "kale", "blueberries"],
	"us-northeast": ["salmon", "cod", "mushrooms", "spinach", "apple", "potato"],
	"us-midwest": ["corn", "beans", "cabbage", "carrots", "mushrooms", "beets"],
	"us-south": ["shrimp", "sweet potato", "okra", "greens", "beans", "corn"],
	"us-west": ["avocado", "salmon", "citrus", "leafy greens", "tomato", "berries"],
	"east-asia": ["bok choy", "daikon", "seaweed", "mushrooms", "edamame", "scallions"],
	mediterranean: ["tomato", "cucumber", "chickpeas", "eggplant", "olive", "lemon"],
	"latin-america": ["corn", "beans", "avocado", "lime", "tomato", "peppers"],
	europe: ["potato", "mushrooms", "cabbage", "beets", "carrots", "peas"],
	oceania: ["fish", "sweet potato", "greens", "avocado", "pumpkin", "citrus"]
};

function pickRandom(items) {
	if (!Array.isArray(items) || items.length === 0) return null;
	return items[Math.floor(Math.random() * items.length)];
}

function toApiLoadUrl(filePath) {
	return `/api/load-file?file=${encodeURIComponent(filePath)}&_=${Date.now()}`;
}

function toStaticSyncUrl(path) {
	const joiner = path.includes("?") ? "&" : "?";
	return `${path}${joiner}sync=${Date.now()}`;
}

async function tryLoadViaApi(filePath) {
	try {
		const response = await fetch(toApiLoadUrl(filePath), { cache: "no-store" });
		if (!response.ok) return null;
		const payload = await response.json();
		if (!payload || typeof payload.content !== "string") return null;
		return JSON.parse(payload.content);
	} catch {
		return null;
	}
}

async function loadManagedJson({ apiFile, staticPath }) {
	const apiPayload = await tryLoadViaApi(apiFile);
	if (apiPayload) {
		return { data: apiPayload, source: "api" };
	}

	const response = await fetch(toStaticSyncUrl(staticPath), { cache: "no-store" });
	if (!response.ok) throw new Error(`load failed for ${staticPath}: ${response.status}`);
	const data = await response.json();
	return { data, source: "static" };
}

function buildMealMeta(meal) {
	const bits = [];
	if (meal.mealType) bits.push(meal.mealType);
	if (typeof meal.prepMinutes === "number") bits.push(`${meal.prepMinutes} min`);
	if (typeof meal.estimatedProteinG === "number") bits.push(`${meal.estimatedProteinG}g protein`);
	return bits.join(" · ");
}

function cleanLowerText(value) {
	return String(value || "").trim().toLowerCase();
}

function splitIngredientText(raw) {
	return String(raw || "")
		.toLowerCase()
		.split(/[,+/&]/)
		.map((part) => part.replace(/\([^)]*\)/g, "").trim())
		.filter(Boolean);
}

function mealIngredients(meal) {
	const items = [];
	if (meal?.protein) items.push(...splitIngredientText(meal.protein));
	if (Array.isArray(meal?.plants)) meal.plants.forEach((item) => items.push(...splitIngredientText(item)));
	if (meal?.smartStarch) items.push(...splitIngredientText(meal.smartStarch));
	if (meal?.flavor) items.push(...splitIngredientText(meal.flavor));
	return Array.from(new Set(items));
}

function inferHemisphere(regionId) {
	return regionId === "oceania" ? "south" : "north";
}

function seasonFromDate(date = new Date(), hemisphere = "north") {
	const month = date.getMonth() + 1;
	let season = "spring";
	if (month >= 3 && month <= 5) season = "spring";
	if (month >= 6 && month <= 8) season = "summer";
	if (month >= 9 && month <= 11) season = "fall";
	if (month === 12 || month <= 2) season = "winter";
	if (hemisphere === "north") return season;
	if (season === "spring") return "fall";
	if (season === "summer") return "winter";
	if (season === "fall") return "spring";
	return "summer";
}

function inferUsRegionFromZip(zipCode) {
	const zip = String(zipCode || "").trim();
	if (!/^\d{5}$/.test(zip)) return "";
	const lead = Number(zip[0]);
	if (lead <= 1) return "us-northeast";
	if (lead <= 4) return "us-south";
	if (lead <= 6) return "us-midwest";
	return "us-west";
}

function inferRegionFromCoordinates(lat, lon) {
	if (!Number.isFinite(lat) || !Number.isFinite(lon)) return "global";
	if (lat >= 14 && lat <= 72 && lon >= -170 && lon <= -50) return "north-america";
	if (lat >= 35 && lat <= 72 && lon >= -10 && lon <= 60) return "europe";
	if (lat >= 5 && lat <= 55 && lon >= 60 && lon <= 150) return "east-asia";
	if (lat >= -45 && lat <= 15 && lon >= 95 && lon <= 180) return "oceania";
	if (lat >= -55 && lat <= 15 && lon >= -90 && lon <= -30) return "latin-america";
	return "global";
}

function resolvePlannerRegion(planner = appState.planner) {
	const zipRegion = inferUsRegionFromZip(planner.zipCode);
	return zipRegion || planner.region || "global";
}

function plannerActiveSeason(planner = appState.planner, resolvedRegion = resolvePlannerRegion(planner)) {
	if (planner.season && planner.season !== "auto") return planner.season;
	return seasonFromDate(new Date(), inferHemisphere(resolvedRegion));
}

function seasonalSetFor(regionId, seasonId) {
	const seasonSet = new Set(seasonalIngredientsBySeason[seasonId] || []);
	(regionalIngredientsByRegion.global || []).forEach((item) => seasonSet.add(item));
	if (regionParentById[regionId]) {
		(regionalIngredientsByRegion[regionParentById[regionId]] || []).forEach((item) => seasonSet.add(item));
	}
	(regionalIngredientsByRegion[regionId] || []).forEach((item) => seasonSet.add(item));
	return seasonSet;
}

function ingredientTokensFromQuery(query) {
	return cleanLowerText(query)
		.split(/[\s,]+/)
		.map((token) => token.trim())
		.filter((token) => token.length >= 2);
}

function findIngredientHits(ingredients, candidates) {
	if (!ingredients.length || !candidates.length) return [];
	const hits = new Set();
	ingredients.forEach((ingredient) => {
		candidates.forEach((candidate) => {
			if (ingredient.includes(candidate) || candidate.includes(ingredient)) {
				hits.add(ingredient);
			}
		});
	});
	return Array.from(hits);
}

function plannerSignalsForMeal(meal, planner = appState.planner, resolvedRegion = resolvePlannerRegion(planner), activeSeason = plannerActiveSeason(planner, resolvedRegion)) {
	const ingredients = mealIngredients(meal);
	const queryTokens = ingredientTokensFromQuery(planner.ingredientQuery);
	const seasonalReference = seasonalSetFor(resolvedRegion, activeSeason);
	const regionalReference = new Set([
		...(regionalIngredientsByRegion[regionParentById[resolvedRegion]] || []),
		...(regionalIngredientsByRegion[resolvedRegion] || [])
	]);

	const ingredientHits = findIngredientHits(ingredients, queryTokens);
	const seasonalHits = findIngredientHits(ingredients, Array.from(seasonalReference));
	const regionalHits = findIngredientHits(ingredients, Array.from(regionalReference));

	const score = ingredientHits.length * 4 + seasonalHits.length * 2 + regionalHits.length;
	return {
		ingredientHits,
		seasonalHits,
		regionalHits,
		score
	};
}

function plannerFilteredMeals(meals) {
	const planner = appState.planner;
	const resolvedRegion = resolvePlannerRegion(planner);
	const activeSeason = plannerActiveSeason(planner, resolvedRegion);
	const queryTokens = ingredientTokensFromQuery(planner.ingredientQuery);
	const plannerEnabled = Boolean(
		queryTokens.length || planner.seasonalOnly || planner.region !== "global" || planner.zipCode || planner.season !== "auto"
	);

	const rows = meals.map((meal) => ({
		meal,
		signals: plannerSignalsForMeal(meal, planner, resolvedRegion, activeSeason)
	}));

	let filtered = rows;
	if (queryTokens.length) {
		filtered = filtered.filter((row) => row.signals.ingredientHits.length > 0);
	}
	if (planner.seasonalOnly) {
		filtered = filtered.filter((row) => row.signals.seasonalHits.length > 0 || row.signals.regionalHits.length > 0);
	}

	if (plannerEnabled) {
		filtered.sort((a, b) => {
			if (b.signals.score !== a.signals.score) return b.signals.score - a.signals.score;
			return (a.meal?.name || "").localeCompare(b.meal?.name || "");
		});
	}

	const signalsByMealId = new Map();
	filtered.forEach((row) => {
		signalsByMealId.set(row.meal.id, row.signals);
	});

	appState.plannerSignalsByMealId = signalsByMealId;
	appState.plannerContext = {
		region: resolvedRegion,
		season: activeSeason,
		isPlannerActive: plannerEnabled
	};

	return filtered.map((row) => row.meal);
}

function capitalize(text) {
	if (!text) return "";
	return text.charAt(0).toUpperCase() + text.slice(1);
}

function plannerMissionPool() {
	const season = appState.plannerContext.season || "spring";
	const region = regionLabelById[appState.plannerContext.region] || regionLabelById.global;
	const seasonalLines = {
		spring: [
			"Spring quest: pair one crisp green with one warming flavor for a balanced plate.",
			"Quest target: choose one spring-forward bowl you can make in under 20 minutes."
		],
		summer: [
			"Summer quest: keep it cool with hydrating plants and a citrus finish.",
			"Quest target: build a summer bowl with three colorful plants."
		],
		fall: [
			"Fall quest: combine one earthy ingredient with one bright acid for balance.",
			"Quest target: choose a fall plate with one roasted-style plant."
		],
		winter: [
			"Winter quest: pair comforting textures with one bright flavor.",
			"Quest target: make a warming bowl with one sturdy winter vegetable."
		]
	};

	const base = seasonalLines[season] || seasonalLines.spring;
	return [
		...base,
		`Local quest: use one ingredient that fits ${region} and one familiar favorite.`,
		"Quick quest start: pick one protein first, then use the planner for the rest.",
		"Consistency quest: try one new ingredient and keep everything else familiar."
	];
}

function plannerLevel(score) {
	if (score >= 40) return { value: 4, label: "Season Strategist" };
	if (score >= 25) return { value: 3, label: "Local Curator" };
	if (score >= 12) return { value: 2, label: "Pattern Builder" };
	return { value: 1, label: "Pathfinder" };
}

function plannerBadgeSummary(meals, totalCount) {
	let seasonal = 0;
	let regional = 0;
	let ingredient = 0;
	meals.forEach((meal) => {
		const signals = appState.plannerSignalsByMealId.get(meal.id) || { seasonalHits: [], regionalHits: [], ingredientHits: [] };
		seasonal += signals.seasonalHits.length;
		regional += signals.regionalHits.length;
		ingredient += signals.ingredientHits.length;
	});

	const coverage = Math.round((meals.length / Math.max(totalCount, 1)) * 100);
	const score = seasonal * 2 + regional + ingredient * 2 + Math.floor(coverage / 20);
	const badges = [];
	if (seasonal >= 4) badges.push("Season Signal");
	if (regional >= 3) badges.push("Regional Match");
	if (ingredient >= 3) badges.push("Ingredient Focus");
	if (coverage >= 60) badges.push("Planner Coverage");

	return {
		score,
		level: plannerLevel(score),
		badges: badges.length ? badges : ["In Progress"],
		seasonal,
		regional,
		ingredient,
		coverage
	};
}

function updatePlannerGameFeedback(meals, totalCount) {
	const scoreEl = document.querySelector("#menuPlannerGameScore");
	const badgesEl = document.querySelector("#menuPlannerGameBadges");
	if (!scoreEl && !badgesEl) return;

	const stats = plannerBadgeSummary(meals, totalCount);
	if (scoreEl) {
		scoreEl.textContent = `Planner score: ${stats.score} · Level ${stats.level.value} ${stats.level.label}`;
	}
	if (badgesEl) {
		badgesEl.textContent = `Badges: ${stats.badges.join(" · ")} (seasonal ${stats.seasonal}, regional ${stats.regional}, ingredient ${stats.ingredient})`;
	}
}

function plannerCoachCopy(meals, totalCount, forceQuest = false) {
	const season = capitalize(appState.plannerContext.season);
	const region = regionLabelById[appState.plannerContext.region] || regionLabelById.global;
	const pool = plannerMissionPool();
	const questLine = pool[appState.plannerQuestSeed % pool.length];

	if (forceQuest) return `Sprout suggestion: ${questLine}`;
	if (!appState.plannerContext.isPlannerActive) {
		return `Sprout suggestion: ${questLine} Choose a season or ingredient to tune results.`;
	}
	if (!meals.length) {
		return `No matches yet. Try a nearby ingredient swap while keeping ${season} + ${region} active.`;
	}

	const topMeal = meals[0];
	const topSignals = appState.plannerSignalsByMealId.get(topMeal.id) || { seasonalHits: [], regionalHits: [], ingredientHits: [] };
	const firstSeasonal = topSignals.seasonalHits[0];
	const firstRegional = topSignals.regionalHits[0];

	if (firstSeasonal && firstRegional) {
		return `Top match combines seasonal + local signals: ${firstSeasonal} and ${firstRegional}.`;
	}
	if (firstSeasonal) {
		return `Top match highlights an in-season ingredient: ${firstSeasonal} for ${season}.`;
	}
	if (firstRegional) {
		return `Top match aligns with your region (${region}) via ${firstRegional}.`;
	}

	const coverage = Math.round((meals.length / Math.max(totalCount, 1)) * 100);
	return `You unlocked ${coverage}% of this category with current filters. ${questLine}`;
}

function updatePlannerStatus(filteredCount, totalCount, meals = []) {
	const statusEl = document.querySelector("#menuPlannerStatus");
	const coachEl = document.querySelector("#menuPlannerCoach");
	if (!statusEl && !coachEl) return;

	const regionLabel = regionLabelById[appState.plannerContext.region] || regionLabelById.global;
	const seasonLabel = capitalize(appState.plannerContext.season);
	const ingredientLine = cleanLowerText(appState.planner.ingredientQuery)
		? `Ingredient filter: ${appState.planner.ingredientQuery.trim()}.`
		: "Ingredient filter: none.";
	const localLine = appState.planner.zipCode
		? `ZIP ${appState.planner.zipCode.trim()} mapped to ${regionLabel}.`
		: `Region: ${regionLabel}.`;
	if (statusEl) statusEl.textContent = `${filteredCount}/${totalCount} meals match. ${ingredientLine} Season: ${seasonLabel}. ${localLine}`;
	if (coachEl) coachEl.textContent = plannerCoachCopy(meals, totalCount, false);
	updatePlannerGameFeedback(meals, totalCount);
}

function categoryMealsForCurrentView() {
	if (!appState.menuData?.meals?.length) return [];
	return appState.activeCategory === "all"
		? appState.menuData.meals
		: appState.menuData.meals.filter((meal) => meal.category === appState.activeCategory);
}

function plannerVisibleMeals() {
	return plannerFilteredMeals(categoryMealsForCurrentView());
}

function plannerShareParams() {
	const params = new URLSearchParams();
	if (appState.activeCategory && appState.activeCategory !== "all") params.set("category", appState.activeCategory);
	if (appState.planner.ingredientQuery.trim()) params.set("q", appState.planner.ingredientQuery.trim());
	if (appState.planner.season && appState.planner.season !== "auto") params.set("season", appState.planner.season);
	if (appState.planner.region && appState.planner.region !== "global") params.set("region", appState.planner.region);
	if (appState.planner.zipCode.trim()) params.set("zip", appState.planner.zipCode.trim());
	if (appState.planner.seasonalOnly) params.set("seasonalOnly", "1");
	return params;
}

function plannerShareUrl() {
	const url = new URL(window.location.href);
	url.search = plannerShareParams().toString();
	return url.toString();
}

function plannerCsvContent(meals) {
	const rows = [[
		"Meal",
		"Category",
		"Cuisine",
		"Protein",
		"Plants",
		"Smart Starch",
		"Flavor",
		"Prep Minutes",
		"Est Protein (g)",
		"Seasonal Matches",
		"Regional Matches",
		"Ingredient Matches"
	]];

	meals.forEach((meal) => {
		const signals = appState.plannerSignalsByMealId.get(meal.id) || {
			seasonalHits: [],
			regionalHits: [],
			ingredientHits: []
		};
		rows.push([
			meal.name || "",
			meal.category || "",
			meal.cuisine || "",
			meal.protein || "",
			Array.isArray(meal.plants) ? meal.plants.join("; ") : "",
			meal.smartStarch || "",
			meal.flavor || "",
			Number.isFinite(meal.prepMinutes) ? String(meal.prepMinutes) : "",
			Number.isFinite(meal.estimatedProteinG) ? String(meal.estimatedProteinG) : "",
			signals.seasonalHits.join("; "),
			signals.regionalHits.join("; "),
			signals.ingredientHits.join("; ")
		]);
	});

	return rows
		.map((row) => row.map((cell) => `"${String(cell || "").replace(/"/g, '""')}"`).join(","))
		.join("\n");
}

function downloadTextFile(filename, content, mimeType) {
	const blob = new Blob([content], { type: mimeType });
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = filename;
	document.body.appendChild(anchor);
	anchor.click();
	anchor.remove();
	window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function plannerPlanTitle() {
	const region = regionLabelById[appState.plannerContext.region] || regionLabelById.global;
	const season = capitalize(appState.plannerContext.season);
	return `Washoku Plus planner - ${season} - ${region}`;
}

function exportPlannerCsv() {
	const meals = plannerVisibleMeals();
	if (!meals.length) {
		const statusEl = document.querySelector("#menuPlannerStatus");
		if (statusEl) statusEl.textContent = "No matching meals to export. Adjust filters and try again.";
		return;
	}
	const dateKey = new Date().toISOString().slice(0, 10);
	const csv = plannerCsvContent(meals);
	downloadTextFile(`washoku-planner-${dateKey}.csv`, csv, "text/csv;charset=utf-8");
}

function plannerJsonPayload(meals) {
	const region = appState.plannerContext.region;
	const season = appState.plannerContext.season;
	return {
		schemaVersion: "1.0.0",
		generatedAt: new Date().toISOString(),
		source: {
			origin: window.location.origin,
			path: window.location.pathname,
			shareUrl: plannerShareUrl()
		},
		filters: {
			category: appState.activeCategory,
			ingredientQuery: appState.planner.ingredientQuery.trim(),
			season,
			region,
			regionLabel: regionLabelById[region] || regionLabelById.global,
			zipCode: appState.planner.zipCode.trim(),
			seasonalOnly: appState.planner.seasonalOnly
		},
		counts: {
			totalMealsInCategory: categoryMealsForCurrentView().length,
			matchedMeals: meals.length
		},
		meals: meals.map((meal) => {
			const signals = appState.plannerSignalsByMealId.get(meal.id) || {
				ingredientHits: [],
				seasonalHits: [],
				regionalHits: []
			};
			return {
				id: meal.id,
				name: meal.name,
				category: meal.category,
				cuisine: meal.cuisine,
				mealType: meal.mealType,
				protein: meal.protein,
				plants: Array.isArray(meal.plants) ? meal.plants : [],
				smartStarch: meal.smartStarch,
				flavor: meal.flavor,
				prepMinutes: Number.isFinite(meal.prepMinutes) ? meal.prepMinutes : null,
				estimatedProteinG: Number.isFinite(meal.estimatedProteinG) ? meal.estimatedProteinG : null,
				estimatedCalories: Number.isFinite(meal.estimatedCalories) ? meal.estimatedCalories : null,
				tags: Array.isArray(meal.tags) ? meal.tags : [],
				plannerSignals: {
					ingredientHits: signals.ingredientHits,
					seasonalHits: signals.seasonalHits,
					regionalHits: signals.regionalHits
				}
			};
		})
	};
}

function exportPlannerJson() {
	const meals = plannerVisibleMeals();
	if (!meals.length) {
		const statusEl = document.querySelector("#menuPlannerStatus");
		if (statusEl) statusEl.textContent = "No matching meals to export. Adjust filters and try again.";
		return;
	}
	const dateKey = new Date().toISOString().slice(0, 10);
	const payload = plannerJsonPayload(meals);
	downloadTextFile(`washoku-planner-${dateKey}.json`, `${JSON.stringify(payload, null, 2)}\n`, "application/json;charset=utf-8");
}

function escapeHtml(value) {
	return String(value || "")
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/\"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

function openPlannerPrintView() {
	const meals = plannerVisibleMeals();
	if (!meals.length) {
		const statusEl = document.querySelector("#menuPlannerStatus");
		if (statusEl) statusEl.textContent = "No matching meals to include in a PDF. Adjust filters and try again.";
		return;
	}

	const filters = [
		`Season: ${capitalize(appState.plannerContext.season)}`,
		`Region: ${regionLabelById[appState.plannerContext.region] || regionLabelById.global}`,
		`Category: ${appState.activeCategory}`,
		appState.planner.ingredientQuery.trim() ? `Ingredient query: ${appState.planner.ingredientQuery.trim()}` : "Ingredient query: none",
		appState.planner.seasonalOnly ? "Seasonal-only mode: on" : "Seasonal-only mode: off"
	];

	const rows = meals.slice(0, 60).map((meal) => {
		const signals = appState.plannerSignalsByMealId.get(meal.id) || { seasonalHits: [], regionalHits: [], ingredientHits: [] };
		return `<tr>
			<td>${escapeHtml(meal.name)}</td>
			<td>${escapeHtml(meal.cuisine || "")}</td>
			<td>${escapeHtml(meal.protein || "")}</td>
			<td>${escapeHtml(Array.isArray(meal.plants) ? meal.plants.join(", ") : "")}</td>
			<td>${escapeHtml(meal.smartStarch || "")}</td>
			<td>${escapeHtml(signals.seasonalHits.join(", "))}</td>
			<td>${escapeHtml(signals.regionalHits.join(", "))}</td>
		</tr>`;
	}).join("");

	const printWindow = window.open("", "_blank", "noopener,noreferrer,width=1000,height=800");
	if (!printWindow) return;

	printWindow.document.write(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(plannerPlanTitle())}</title>
<style>
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;margin:24px;color:#142f26}
h1{margin:0 0 8px;font-size:24px}
p{margin:0 0 10px;color:#325447}
.meta{font-size:13px;margin-bottom:14px}
table{width:100%;border-collapse:collapse;font-size:12px}
th,td{border:1px solid #d6dfda;padding:7px 8px;vertical-align:top}
th{background:#eef5f0;text-align:left}
@media print{body{margin:10mm}}
</style>
</head>
<body>
<h1>${escapeHtml(plannerPlanTitle())}</h1>
<p class="meta">Generated ${escapeHtml(new Date().toLocaleString())}. Save as PDF from your print dialog.</p>
<p>${escapeHtml(filters.join(" | "))}</p>
<table>
<thead>
<tr><th>Meal</th><th>Cuisine</th><th>Protein</th><th>Plants</th><th>Smart Starch</th><th>Seasonal</th><th>Regional</th></tr>
</thead>
<tbody>${rows}</tbody>
</table>
</body>
</html>`);
 	printWindow.document.close();
	printWindow.focus();
	printWindow.print();
}

async function sharePlanner() {
	const meals = plannerVisibleMeals();
	const url = plannerShareUrl();
	const summary = meals.length
		? `I built a Washoku Plus meal plan with ${meals.length} matches for ${capitalize(appState.plannerContext.season)} in ${regionLabelById[appState.plannerContext.region] || regionLabelById.global}.`
		: "I built a Washoku Plus meal plan.";

	try {
		if (navigator.share) {
			await navigator.share({
				title: plannerPlanTitle(),
				text: summary,
				url
			});
			return;
		}
		await navigator.clipboard.writeText(url);
		const statusEl = document.querySelector("#menuPlannerStatus");
		if (statusEl) statusEl.textContent = "Share link copied to clipboard.";
	} catch {
		const statusEl = document.querySelector("#menuPlannerStatus");
		if (statusEl) statusEl.textContent = "Could not share automatically. Copy the URL from your browser to share.";
	}
}

function hydratePlannerFromQueryParams() {
	const params = new URLSearchParams(window.location.search);
	const category = params.get("category");
	const season = params.get("season");
	const region = params.get("region");

	if (category) appState.activeCategory = category;
	if (params.get("q")) appState.planner.ingredientQuery = params.get("q");
	if (season && ["spring", "summer", "fall", "winter"].includes(season)) appState.planner.season = season;
	if (region && regionLabelById[region]) appState.planner.region = region;
	if (params.get("zip")) appState.planner.zipCode = params.get("zip");
	appState.planner.seasonalOnly = params.get("seasonalOnly") === "1";
}

function pickFromPool(pool, cursors, key) {
	if (!Array.isArray(pool) || !pool.length) return "";
	const idx = cursors[key] || 0;
	const value = pool[idx % pool.length];
	cursors[key] = idx + 1;
	return value;
}

function tokenizeMeal(meal) {
	const text = `${meal?.name || ""} ${meal?.category || ""} ${meal?.cuisine || ""} ${meal?.mealType || ""} ${meal?.flavor || ""}`
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, " ");
	return new Set(text.split(/\s+/).filter(Boolean));
}

function inferMealShape(tokens) {
	if (["burger"].some((k) => tokens.has(k))) return "burger";
	if (["sandwich", "toast"].some((k) => tokens.has(k))) return "sandwich";
	if (["pizza", "flatbread"].some((k) => tokens.has(k))) return "pizza";
	if (["wrap", "burrito", "roll"].some((k) => tokens.has(k))) return "wrap";
	if (["salad", "greens"].some((k) => tokens.has(k))) return "salad";
	if (["soup", "broth", "miso", "pho", "ramen", "udon"].some((k) => tokens.has(k))) return "soup";
	if (["noodle", "pasta", "soba"].some((k) => tokens.has(k))) return "noodle";
	if (["plate", "bento", "steak"].some((k) => tokens.has(k))) return "plate";
	if (["sushi", "onigiri", "maki", "nigiri", "poke"].some((k) => tokens.has(k))) return "sushi";
	return "bowl";
}

function scoreAssetForMeal(assetId, meal, usedCountsByCategory) {
	const hints = dishHints[assetId] || [];
	const hintSet = new Set(hints);
	const tokens = tokenizeMeal(meal);
	const shape = inferMealShape(tokens);

	let score = 0;
	if (hintSet.has(shape)) score += 8;

	for (const token of tokens) {
		if (hintSet.has(token)) score += 2;
	}

	if (tokens.has("japanese") && hintSet.has("japanese")) score += 2;
	if (tokens.has("korean") && (hintSet.has("japanese") || hintSet.has("bowl"))) score += 1;
	if (tokens.has("thai") && hintSet.has("bowl")) score += 1;
	if (tokens.has("mexican") && hintSet.has("mexican")) score += 2;
	if (tokens.has("mediterranean") && hintSet.has("mediterranean")) score += 2;

	if (shape === "bowl" && ["burger", "sandwich", "pizza", "wrap"].some((k) => hintSet.has(k))) score -= 10;
	if (shape === "plate" && ["wrap", "burger", "pizza"].some((k) => hintSet.has(k))) score -= 8;
	if (shape === "soup" && !["soup", "noodle", "broth"].some((k) => hintSet.has(k))) score -= 4;

	const usage = usedCountsByCategory[assetId] || 0;
	score -= usage * 0.8;

	return score;
}

function pickBestAssetForMeal(pool, meal, usedCountsByCategory) {
	if (!Array.isArray(pool) || !pool.length) return "";
	let bestId = "";
	let bestScore = -Infinity;
	for (const assetId of pool) {
		const currentScore = scoreAssetForMeal(assetId, meal, usedCountsByCategory);
		if (currentScore > bestScore) {
			bestScore = currentScore;
			bestId = assetId;
		}
	}
	if (bestId) {
		usedCountsByCategory[bestId] = (usedCountsByCategory[bestId] || 0) + 1;
	}
	return bestId;
}

async function loadDishConfig() {
	try {
		const { data: map } = await loadManagedJson(syncPaths.dishMap);

		let assets = Array.isArray(map.assets) ? map.assets : [];
		if (!assets.length && map.assetsManifest) {
			const assetsResponse = await fetch(toStaticSyncUrl(map.assetsManifest), { cache: "no-store" });
			if (assetsResponse.ok) {
				const manifest = await assetsResponse.json();
				assets = Array.isArray(manifest.assets) ? manifest.assets : [];
			}
		}

		return {
			categoryPools: map.categoryPools || {},
			mealImageOverrides: map.mealImageOverrides || {},
			assets
		};
	} catch (error) {
		console.warn("Dish config unavailable; continuing without dish cutouts:", error);
		return null;
	}
}

function applyDishImages(menuData, dishConfig) {
	if (!menuData || !Array.isArray(menuData.meals) || !dishConfig) return;

	const assetById = new Map((dishConfig.assets || []).map((asset) => [asset.id, asset.image]));
	const pools = dishConfig.categoryPools || {};
	const overrides = dishConfig.mealImageOverrides || {};
	const usedByCategory = {};
	const cursors = {};

	menuData.meals.forEach((meal) => {
		if (!meal || meal.image) return;

		const overrideId = overrides[meal.id];
		if (overrideId && assetById.has(overrideId)) {
			meal.image = assetById.get(overrideId);
			return;
		}

		const pool = pools[meal.category] || pools.default || [];
		const dishId = pickBestAssetForMeal(pool, meal, usedByCategory) || pickFromPool(pool, cursors, meal.category || "default");
		if (dishId && assetById.has(dishId)) {
			meal.image = assetById.get(dishId);
		}
	});
}

function getDishAssetById(assetId) {
	if (!appState.dishConfig?.assets?.length || !assetId) return null;
	return appState.dishConfig.assets.find((asset) => asset.id === assetId) || null;
}

function getCategoryDishAssets(categoryId, limit = 3) {
	const pool = appState.dishConfig?.categoryPools?.[categoryId] || [];
	const heroId = categoryShowcaseHeroAssetById[categoryId] || categoryShowcaseHeroAssetById.default;
	const prioritized = heroId ? [heroId, ...pool.filter((id) => id !== heroId)] : pool;
	return prioritized
		.map((assetId) => getDishAssetById(assetId))
		.filter(Boolean)
		.slice(0, limit);
}

function renderCategoryShowcase() {
	const wrap = document.querySelector("#menuCategoryShowcase");
	if (!wrap || !appState.menuData) return;

	const categories = appState.menuData.categories || [];
	if (!categories.length) {
		wrap.innerHTML = "<p>No categories available yet.</p>";
		return;
	}

	wrap.innerHTML = categories
		.map((category) => {
			const assets = getCategoryDishAssets(category.id, 3);
			const imageMarkup = assets.length
				? assets
					.map((asset) => `<img src="${asset.image}" alt="${category.name} dish" loading="lazy">`)
					.join("")
				: "<div class=\"menu-category-showcase-empty\">Images sync from dish-map.json</div>";
			return `
				<article class="menu-category-showcase-card">
					<div class="menu-category-showcase-art">${imageMarkup}</div>
					<div class="menu-category-showcase-copy">
						<p class="menu-category-showcase-name">${category.name}</p>
						<p class="menu-category-showcase-meta">${category.mealCount || 0} meals · ${category.id}</p>
					</div>
				</article>
			`;
		})
		.join("");
}

function renderDishStrip() {
	const wrap = document.querySelector("#menuDishStrip");
	if (!wrap) return;

	const assets = appState.dishConfig?.assets || [];
	if (!assets.length) {
		wrap.innerHTML = "<p>No dish assets published yet.</p>";
		return;
	}

	wrap.innerHTML = assets
		.slice(0, 18)
		.map((asset) => `
			<figure class="menu-dish-pill">
				<img src="${asset.image}" alt="${asset.id}" loading="lazy">
				<figcaption>${asset.id}</figcaption>
			</figure>
		`)
		.join("");
}

function updateNextMealCard(meal) {
	if (!meal) return;
	const nameEl = document.querySelector("#nextMealName");
	const metaEl = document.querySelector("#nextMealMeta");
	if (nameEl) nameEl.textContent = meal.name || "Suggested meal";
	if (metaEl) metaEl.textContent = buildMealMeta(meal) || "Balanced meal suggestion";
}

function nextInsight() {
	const el = document.querySelector("#insightText");
	if (!el) return;
	const line = pickRandom(appState.insights) || pickRandom(fallbackInsights);
	if (line) el.textContent = line;
}

function setMascotMode(mode) {
	[document.querySelector("#mascot"), document.querySelector("#largeMascot")]
		.filter(Boolean)
		.forEach((mascot) => {
			mascot.classList.remove("mascot-meditate", "mascot-suggest", "mascot-celebrate");
			mascot.classList.add(`mascot-${mode}`);
		});

	document.querySelectorAll("#mascot .mascot-image, #largeMascot .mascot-image").forEach((img) => {
		img.setAttribute("src", sproutModeImage[mode] || sproutModeImage.default);
	});

	const caption = document.querySelector("#companionCaption");
	if (caption) caption.textContent = captions[mode] || captions.meditate;

	if (mode === "suggest" && appState.menuData?.meals?.length) {
		const meal = pickRandom(appState.menuData.meals);
		if (meal) {
			updateNextMealCard(meal);
			const insightEl = document.querySelector("#insightText");
			if (insightEl) {
				const line = pickRandom(appState.insights) || "Let's pick your next balanced meal.";
				insightEl.textContent = `${line} Try: ${meal.name}.`;
			}
		}
	}
}

function renderMenuSummary() {
	const summaryEl = document.querySelector("#menuSummary");
	if (!summaryEl || !appState.menuData) return;

	const totalMeals = appState.menuData.meals?.length || 0;
	const totalCategories = appState.menuData.categories?.length || 0;
	const sourceLabel = appState.syncSource === "api" ? "Menu Manager API" : "published site data";
	const visible = appState.visibleMealCount || totalMeals;
	summaryEl.textContent = `${visible}/${totalMeals} meals across ${totalCategories} categories. Synced from ${sourceLabel} on load.`;
}

function renderMenuCards(targetId, meals, limit = 0) {
	const grid = document.querySelector(`#${targetId}`);
	if (!grid) return;

	const list = limit > 0 ? meals.slice(0, limit) : meals;
	if (!list.length) {
		grid.innerHTML = "<p>No menu items available for this category yet.</p>";
		return;
	}

	grid.innerHTML = list
		.map((meal) => {
			const tags = Array.isArray(meal.tags) ? meal.tags.slice(0, 3).join(" · ") : "";
			const cuisine = meal.cuisine || "Global-inspired";
			const plannerSignals = appState.plannerSignalsByMealId.get(meal.id);
			const plannerHighlights = [];
			if (plannerSignals?.ingredientHits?.length) plannerHighlights.push(`Ingredient match: ${plannerSignals.ingredientHits.slice(0, 3).join(", ")}`);
			if (plannerSignals?.seasonalHits?.length) plannerHighlights.push(`In season: ${plannerSignals.seasonalHits.slice(0, 3).join(", ")}`);
			if (plannerSignals?.regionalHits?.length) plannerHighlights.push(`Regional picks: ${plannerSignals.regionalHits.slice(0, 3).join(", ")}`);
			const plannerNote = plannerHighlights.length ? `<p class="menu-planner-note">${plannerHighlights.join(" · ")}</p>` : "";
			const hasNutritionEstimate = typeof meal.estimatedProteinG === "number" || typeof meal.estimatedCalories === "number";
			const nutritionSourceNote = hasNutritionEstimate
				? `<p class="nutrition-source-note">Nutrition source: <a href="https://fdc.nal.usda.gov/" target="_blank" rel="noopener">USDA FoodData Central</a> estimates. <a href="sources-methodology.html">Sources</a></p>`
				: "";
			const imageMarkup = meal.image
				? `<figure class="menu-card-media"><img src="${meal.image}" alt="${meal.name || "Meal"} dish"></figure>`
				: "";
			const cardClass = meal.image ? "menu-card" : "menu-card menu-card-no-image";
			return `
				<article class="${cardClass}">
					${imageMarkup}
					<div class="menu-card-body">
						<h3>${meal.name || "Unnamed meal"}</h3>
						<p class="menu-cuisine">${cuisine}</p>
						<p class="menu-meta">${buildMealMeta(meal)}</p>
						${plannerNote}
						<p>${meal.protein || "Protein"} + ${(meal.plants || []).slice(0, 2).join(", ") || "plants"}</p>
						${nutritionSourceNote}
						${tags ? `<p class="menu-tags">${tags}</p>` : ""}
					</div>
				</article>
			`;
		})
		.join("");
}

function renderCategoryFilters(targetId, onSelect) {
	const wrap = document.querySelector(`#${targetId}`);
	if (!wrap || !appState.menuData) return;

	const categories = appState.menuData.categories || [];
	const allChips = [{ id: "all", name: "All" }, ...categories];

	wrap.innerHTML = allChips
		.map((category) => {
			const activeClass = category.id === appState.activeCategory ? "menu-chip is-active" : "menu-chip";
			return `<span class="${activeClass}"><button type="button" data-category-id="${category.id}">${category.name}</button></span>`;
		})
		.join("");

	wrap.querySelectorAll("button[data-category-id]").forEach((btn) => {
		btn.addEventListener("click", () => {
			appState.activeCategory = btn.dataset.categoryId;
			onSelect();
		});
	});
}

function renderPreviewMenu() {
	if (!appState.menuData) return;
	const allMeals = appState.menuData.meals || [];
	const categoryMeals = appState.activeCategory === "all"
		? allMeals
		: allMeals.filter((meal) => meal.category === appState.activeCategory);
	const meals = plannerFilteredMeals(categoryMeals);
	const previewMeals = appState.plannerContext.isPlannerActive
		? meals
		: [...meals].sort(() => Math.random() - 0.5);
	renderMenuCards("menuPreviewGrid", previewMeals, 6);
	renderCategoryFilters("menuCategoryChips", () => {
		renderPreviewMenu();
	});
	updatePlannerStatus(meals.length, categoryMeals.length, meals);
}

function renderFullMenu() {
	if (!appState.menuData) return;
	const allMeals = appState.menuData.meals || [];
	const categoryMeals = appState.activeCategory === "all"
		? allMeals
		: allMeals.filter((meal) => meal.category === appState.activeCategory);
	const visible = plannerFilteredMeals(categoryMeals);
	appState.visibleMealCount = visible.length;
	renderMenuCards("menuFullGrid", visible, 0);
	renderCategoryFilters("menuCategoryFilters", renderFullMenu);
	updatePlannerStatus(visible.length, categoryMeals.length, visible);
}

function rerenderMenuViews() {
	renderMenuSummary();
	renderPreviewMenu();
	renderFullMenu();
}

function setupMenuPlannerControls() {
	const ingredientInput = document.querySelector("#menuIngredientSearch");
	const seasonSelect = document.querySelector("#menuSeasonSelect");
	const regionSelect = document.querySelector("#menuRegionSelect");
	const zipInput = document.querySelector("#menuZipInput");
	const seasonalOnlyInput = document.querySelector("#menuSeasonalOnly");
	const autoRegionBtn = document.querySelector("#menuAutoRegionBtn");
	const resetBtn = document.querySelector("#menuPlannerResetBtn");
	const questBtn = document.querySelector("#menuPlannerQuestBtn");
	const shareBtn = document.querySelector("#menuPlannerShareBtn");
	const csvBtn = document.querySelector("#menuPlannerCsvBtn");
	const jsonBtn = document.querySelector("#menuPlannerJsonBtn");
	const pdfBtn = document.querySelector("#menuPlannerPdfBtn");

	if (!ingredientInput && !seasonSelect && !regionSelect && !zipInput && !seasonalOnlyInput) return;

	if (ingredientInput) ingredientInput.value = appState.planner.ingredientQuery;
	if (seasonSelect) seasonSelect.value = appState.planner.season;
	if (regionSelect) regionSelect.value = appState.planner.region;
	if (zipInput) zipInput.value = appState.planner.zipCode;
	if (seasonalOnlyInput) seasonalOnlyInput.checked = appState.planner.seasonalOnly;

	const applyFromInputs = () => {
		appState.planner.ingredientQuery = ingredientInput?.value || "";
		appState.planner.season = seasonSelect?.value || "auto";
		appState.planner.region = regionSelect?.value || "global";
		appState.planner.zipCode = (zipInput?.value || "").trim();
		appState.planner.seasonalOnly = Boolean(seasonalOnlyInput?.checked);
		rerenderMenuViews();
	};

	ingredientInput?.addEventListener("input", applyFromInputs);
	seasonSelect?.addEventListener("change", applyFromInputs);
	regionSelect?.addEventListener("change", applyFromInputs);
	zipInput?.addEventListener("input", applyFromInputs);
	seasonalOnlyInput?.addEventListener("change", applyFromInputs);

	autoRegionBtn?.addEventListener("click", () => {
		if (!navigator.geolocation) {
			const statusEl = document.querySelector("#menuPlannerStatus");
			if (statusEl) statusEl.textContent = "Location is not available in this browser. Use region or ZIP instead.";
			return;
		}

		navigator.geolocation.getCurrentPosition(
			(position) => {
				const inferredRegion = inferRegionFromCoordinates(position.coords.latitude, position.coords.longitude);
				appState.planner.region = inferredRegion;
				appState.planner.zipCode = "";
				if (regionSelect) regionSelect.value = inferredRegion;
				if (zipInput) zipInput.value = "";
				const statusEl = document.querySelector("#menuPlannerStatus");
				if (statusEl) {
					const regionLabel = regionLabelById[inferredRegion] || regionLabelById.global;
					statusEl.textContent = `Location detected. Region updated to ${regionLabel}.`;
				}
				rerenderMenuViews();
			},
			() => {
				const statusEl = document.querySelector("#menuPlannerStatus");
				if (statusEl) statusEl.textContent = "Could not use location. Enter ZIP or pick a region manually.";
			},
			{ enableHighAccuracy: false, timeout: 6000, maximumAge: 300000 }
		);
	});

	resetBtn?.addEventListener("click", () => {
		appState.planner = {
			ingredientQuery: "",
			season: "auto",
			region: "global",
			zipCode: "",
			seasonalOnly: false,
			locationNote: ""
		};
		if (ingredientInput) ingredientInput.value = "";
		if (seasonSelect) seasonSelect.value = "auto";
		if (regionSelect) regionSelect.value = "global";
		if (zipInput) zipInput.value = "";
		if (seasonalOnlyInput) seasonalOnlyInput.checked = false;
		rerenderMenuViews();
	});

	questBtn?.addEventListener("click", () => {
		appState.plannerQuestSeed += 1;
		const coachEl = document.querySelector("#menuPlannerCoach");
		if (coachEl) {
			const meals = plannerVisibleMeals();
			coachEl.textContent = plannerCoachCopy(meals, categoryMealsForCurrentView().length, true);
		}
	});

	shareBtn?.addEventListener("click", () => {
		sharePlanner();
	});

	csvBtn?.addEventListener("click", () => {
		exportPlannerCsv();
	});

	jsonBtn?.addEventListener("click", () => {
		exportPlannerJson();
	});

	pdfBtn?.addEventListener("click", () => {
		openPlannerPrintView();
	});
}

async function loadMenuData() {
	try {
		const [menuPayload, dishConfig] = await Promise.all([
			loadManagedJson(syncPaths.menu),
			loadDishConfig()
		]);
		const payload = menuPayload.data;
		if (!payload || !Array.isArray(payload.meals) || !Array.isArray(payload.categories)) {
			throw new Error("menu payload missing meals/categories arrays");
		}
		appState.dishConfig = dishConfig;
		appState.syncSource = menuPayload.source;
		applyDishImages(payload, dishConfig);
		appState.menuData = payload;

		if (Array.isArray(payload.sproutSayings) && payload.sproutSayings.length) {
			appState.insights = Array.from(new Set([...fallbackInsights, ...payload.sproutSayings]));
		}

		const welcomeMessage = pickRandom(payload.welcomeMessages);
		const insightEl = document.querySelector("#insightText");
		if (welcomeMessage && insightEl) insightEl.textContent = welcomeMessage;

		renderMenuSummary();
		renderPreviewMenu();
		renderFullMenu();
		renderCategoryShowcase();
		renderDishStrip();

		if (payload.meals?.length) {
			updateNextMealCard(pickRandom(payload.meals));
		}
	} catch (error) {
		console.error("Failed to load menu content:", error);
		renderMenuSummary();
	}
}

function setupNavigation() {
	const menuBtn = document.querySelector(".menu-button");
	const links = document.querySelector("#nav-links");
	menuBtn?.addEventListener("click", () => {
		const open = links.classList.toggle("open");
		menuBtn.setAttribute("aria-expanded", String(open));
	});
}

function setupReveal() {
	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) entry.target.classList.add("is-visible");
		});
	}, { threshold: 0.12 });
	document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

document.addEventListener("DOMContentLoaded", () => {
	hydratePlannerFromQueryParams();
	document.querySelector("#newInsightBtn")?.addEventListener("click", nextInsight);
	document.querySelectorAll("[data-mode]").forEach((btn) => {
		btn.addEventListener("click", () => {
			setMascotMode(btn.dataset.mode);
			if (btn.dataset.mode === "suggest") nextInsight();
		});
	});

	setupNavigation();
	setupReveal();
	setupMenuPlannerControls();
	setMascotMode("meditate");
	loadMenuData();

	window.setInterval(nextInsight, 12000);
});