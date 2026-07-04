// ---- Hamburger menu ----
function toggleMenu() {
  document.querySelector(".menu-links")?.classList.toggle("open");
  document.querySelector(".hamburger-icon")?.classList.toggle("open");
}
document.addEventListener("click", (e) => {
  const nav = document.getElementById("hamburger-nav");
  if (nav && !nav.contains(e.target)) {
    document.querySelector(".menu-links")?.classList.remove("open");
    document.querySelector(".hamburger-icon")?.classList.remove("open");
  }
});

// ---- Sticky nav shadow on scroll ----
window.addEventListener("scroll", () => {
  const scrolled = window.scrollY > 20;
  document.getElementById("desktop-nav").classList.toggle("scrolled", scrolled);
  document.getElementById("hamburger-nav").classList.toggle("scrolled", scrolled);
}, { passive: true });

// ---- Active nav link on scroll ----
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-links a");
window.addEventListener("scroll", () => {
  let current = "";
  sections.forEach((s) => { if (window.scrollY >= s.offsetTop - 90) current = s.id; });
  navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${current}`));
}, { passive: true });

// ---- Typing animation ----
const phrases = [
  "React.js & TypeScript",
  "Python & FastAPI",
  "AI Feature Builder",
  "Full-Stack Engineer",
];
let phraseIdx = 0, charIdx = 0, deleting = false;
const typedEl = document.querySelector(".typed-text");

function typeLoop() {
  if (!typedEl) return;
  const current = phrases[phraseIdx];
  typedEl.textContent = deleting
    ? current.substring(0, --charIdx)
    : current.substring(0, ++charIdx);

  let delay = deleting ? 45 : 80;
  if (!deleting && charIdx === current.length)  { delay = 1800; deleting = true; }
  else if (deleting && charIdx === 0)           { deleting = false; phraseIdx = (phraseIdx + 1) % phrases.length; delay = 350; }
  setTimeout(typeLoop, delay);
}
setTimeout(typeLoop, 700);

// ---- Counter animation for stats ----
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting || entry.target.dataset.done) return;
    entry.target.dataset.done = "1";
    const target = parseInt(entry.target.dataset.count);
    const suffix = entry.target.dataset.suffix || "";
    let count = 0;
    const step = Math.max(1, Math.ceil(target / 35));
    const timer = setInterval(() => {
      count = Math.min(count + step, target);
      entry.target.textContent = count + suffix;
      if (count >= target) clearInterval(timer);
    }, 40);
  });
}, { threshold: 0.6 });

document.querySelectorAll(".stat-number[data-count]").forEach((el) => counterObserver.observe(el));

// ---- Scroll animations ----
const animObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("anim-done"); });
}, { threshold: 0.09 });

// Section headers — title reveal + shimmer tingle
document.querySelectorAll(".section-header").forEach(el => {
  el.classList.add("pre-anim");
  animObserver.observe(el);
});

// About columns — slide in from opposite sides
const statCol = document.querySelector(".about-stats-col");
const textCol = document.querySelector(".about-text-col");
if (statCol) { statCol.classList.add("slide-left");  animObserver.observe(statCol); }
if (textCol) { textCol.classList.add("slide-right"); animObserver.observe(textCol); }

// Timeline cards — slide from left with stagger
document.querySelectorAll(".timeline-card").forEach((el, i) => {
  el.classList.add("slide-left");
  el.style.setProperty("--anim-delay", `${i * 0.13}s`);
  animObserver.observe(el);
});

// Cards — slide up with stagger (each group independent)
[".skill-category", ".project-card", ".cert-card", ".contact-card"].forEach(sel => {
  document.querySelectorAll(sel).forEach((el, i) => {
    el.classList.add("slide-up");
    el.style.setProperty("--anim-delay", `${i * 0.1}s`);
    animObserver.observe(el);
  });
});

// ---- Project View More / View Less ----
function toggleExpand(id, btn) {
  const panel = document.getElementById(id);
  const isOpen = panel.classList.toggle("open");
  btn.classList.toggle("open", isOpen);
  btn.querySelector("span").textContent = isOpen ? "View Less" : "View More";
}

// ---- Dark / Light theme toggle ----
function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const icon = theme === "light" ? "fa-solid fa-sun" : "fa-solid fa-moon";
  document.querySelectorAll(".theme-icon").forEach(el => el.className = icon + " theme-icon");
  localStorage.setItem("theme", theme);
}

// Apply saved theme on load
setTheme(localStorage.getItem("theme") || "dark");

document.querySelectorAll(".theme-toggle").forEach(btn => {
  btn.addEventListener("click", () => {
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    setTheme(isLight ? "dark" : "light");
  });
});
