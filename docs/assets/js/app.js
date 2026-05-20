const insights=[
"Breathe in. Today’s next meal can be simple: protein, plants, smart starch, and one bright flavor.",
"A balanced bowl does not need to be perfect. It only needs to be kind enough to repeat.",
"Try adding one colorful vegetable to your next meal before changing anything else.",
"If weight changes suddenly, look for sleep, sodium, movement, digestion, and stress before blaming yourself.",
"A wheat-aware swap for soy sauce: certified wheat-free tamari, coconut aminos, or ginger rice-vinegar sauce.",
"Vegetarian day idea: tofu, edamame, rice, cucumber, greens, sesame if tolerated, and citrus.",
"Washoku Plus is about meal architecture: enough protein, enough plants, enough satisfaction."
];
const captions={meditate:"One balanced meal at a time.",suggest:"Next idea: build a bowl from protein, plants, rice or beans, and one bright sauce.",celebrate:"Small wins count. Consistency beats intensity."};
function nextInsight(){const el=document.querySelector("#insightText");if(el)el.textContent=insights[Math.floor(Math.random()*insights.length)];}
function setMascotMode(mode){[document.querySelector("#mascot"),document.querySelector("#largeMascot")].filter(Boolean).forEach(m=>{m.classList.remove("mascot-meditate","mascot-suggest","mascot-celebrate");m.classList.add(`mascot-${mode}`)});const caption=document.querySelector("#companionCaption");if(caption)caption.textContent=captions[mode]||captions.meditate;}
document.addEventListener("DOMContentLoaded",()=>{document.querySelector("#newInsightBtn")?.addEventListener("click",nextInsight);document.querySelectorAll("[data-mode]").forEach(btn=>{btn.addEventListener("click",()=>{setMascotMode(btn.dataset.mode);if(btn.dataset.mode==="suggest")nextInsight();});});const menu=document.querySelector(".menu-button");const links=document.querySelector("#nav-links");menu?.addEventListener("click",()=>{const open=links.classList.toggle("open");menu.setAttribute("aria-expanded",String(open));});const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting)entry.target.classList.add("is-visible");});},{threshold:.12});document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));window.setInterval(nextInsight,12000);});