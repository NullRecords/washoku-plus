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

const appState = {
	menuData: null,
	insights: [...fallbackInsights],
	activeCategory: "all"
};

function pickRandom(items) {
	if (!Array.isArray(items) || items.length === 0) return null;
	return items[Math.floor(Math.random() * items.length)];
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

async function loadDishConfig() {
	try {
		const response = await fetch("assets/data/dish-map.json", { cache: "no-store" });
		if (!response.ok) throw new Error(`dish map load failed: ${response.status}`);
		const map = await response.json();

		let assets = Array.isArray(map.assets) ? map.assets : [];
		if (!assets.length && map.assetsManifest) {
			const assetsResponse = await fetch(map.assetsManifest, { cache: "no-store" });
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
	const cursors = {};

	menuData.meals.forEach((meal) => {
		if (!meal || meal.image) return;

		const overrideId = overrides[meal.id];
		if (overrideId && assetById.has(overrideId)) {
			meal.image = assetById.get(overrideId);
			return;
		}

		const pool = pools[meal.category] || pools.default || [];
		const dishId = pickFromPool(pool, cursors, meal.category || "default");
		if (dishId && assetById.has(dishId)) {
			meal.image = assetById.get(dishId);
		}
	});
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
	summaryEl.textContent = `${totalMeals} meals across ${totalCategories} categories. Sprout surfaces rotating options so you see helpful variety, not the full list all at once.`;
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
			const imageMarkup = meal.image
				? `<figure class="menu-card-media"><img src="${meal.image}" alt="${meal.name || "Meal"} dish"></figure>`
				: "";
			const cardClass = meal.image ? "menu-card" : "menu-card menu-card-no-image";
			return `
				<article class="${cardClass}">
					${imageMarkup}
					<div class="menu-card-body">
						<h3>${meal.name || "Unnamed meal"}</h3>
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
		const [response, dishConfig] = await Promise.all([
			fetch("assets/data/menu-content.json", { cache: "no-store" }),
			loadDishConfig()
		]);
		if (!response.ok) throw new Error(`menu load failed: ${response.status}`);
		const payload = await response.json();
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
	loadMenuData();

	window.setInterval(nextInsight, 12000);
});