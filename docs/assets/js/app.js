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

const appState = {
	menuData: null,
	dishConfig: null,
	insights: [...fallbackInsights],
	activeCategory: "all",
	syncSource: "static"
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
	return pool
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
	summaryEl.textContent = `${totalMeals} meals across ${totalCategories} categories. Synced from ${sourceLabel} on load.`;
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
						<p>${meal.protein || "Protein"} + ${(meal.plants || []).slice(0, 2).join(", ") || "plants"}</p>
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
	const meals = appState.activeCategory === "all"
		? allMeals
		: allMeals.filter((meal) => meal.category === appState.activeCategory);
	const previewMeals = [...meals].sort(() => Math.random() - 0.5);
	renderMenuCards("menuPreviewGrid", previewMeals, 6);
	renderCategoryFilters("menuCategoryChips", () => {
		renderPreviewMenu();
	});
}

function renderFullMenu() {
	if (!appState.menuData) return;
	const allMeals = appState.menuData.meals || [];
	const visible = appState.activeCategory === "all"
		? allMeals
		: allMeals.filter((meal) => meal.category === appState.activeCategory);
	renderMenuCards("menuFullGrid", visible, 0);
	renderCategoryFilters("menuCategoryFilters", renderFullMenu);
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
	document.querySelector("#newInsightBtn")?.addEventListener("click", nextInsight);
	document.querySelectorAll("[data-mode]").forEach((btn) => {
		btn.addEventListener("click", () => {
			setMascotMode(btn.dataset.mode);
			if (btn.dataset.mode === "suggest") nextInsight();
		});
	});

	setupNavigation();
	setupReveal();
	setMascotMode("meditate");
	loadMenuData();

	window.setInterval(nextInsight, 12000);
});