// =============================================
//  UI interactions — Aparna K V Portfolio
// =============================================
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const hasGSAP = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

// ---- Smooth scroll (Lenis) ----
let lenis = null;
if (!reduceMotion && typeof window.Lenis !== "undefined") {
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  if (hasGSAP) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
}

document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const hash = a.getAttribute("href");
    const el = hash.length > 1 && document.querySelector(hash);
    if (!el) return;
    e.preventDefault();
    closeMenu();
    if (lenis) lenis.scrollTo(el, { offset: hash === "#profile" ? 0 : -40, duration: 1.4 });
    else el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  });
});

// ---- Mobile menu ----
const menuBtn = document.querySelector(".menu-btn");
const mobileMenu = document.querySelector(".mobile-menu");
function closeMenu() {
  document.body.classList.remove("menu-open");
  menuBtn.setAttribute("aria-expanded", "false");
  mobileMenu.setAttribute("aria-hidden", "true");
}
menuBtn.addEventListener("click", () => {
  const open = document.body.classList.toggle("menu-open");
  menuBtn.setAttribute("aria-expanded", String(open));
  mobileMenu.setAttribute("aria-hidden", String(!open));
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });

// ---- Nav state + progress bar + active link ----
const nav = document.querySelector(".nav");
const progress = document.querySelector(".scroll-progress span");
const sections = [...document.querySelectorAll("main > section[id]")];
const navLinks = [...document.querySelectorAll(".nav-pill a")];
const hero = document.getElementById("profile");
const contact = document.getElementById("contact");
function onScroll() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  // over the coloured hero the nav is light-on-colour; past it, it turns solid
  nav.classList.toggle("solid", y > hero.offsetHeight - 80 && y < contact.offsetTop - 80);
  progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  let current = "";
  sections.forEach((s) => { if (y >= s.offsetTop - window.innerHeight * 0.4) current = s.id; });
  navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${current}`));
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// ---- Typing animation ----
const phrases = ["AI-powered products", "Next.js & NestJS platforms", "React & TypeScript apps", "Python & FastAPI services"];
const typedEl = document.querySelector(".typed-text");
if (typedEl && !reduceMotion) {
  let phraseIdx = 0, charIdx = phrases[0].length, deleting = true;
  const typeLoop = () => {
    const current = phrases[phraseIdx];
    typedEl.textContent = current.substring(0, deleting ? --charIdx : ++charIdx);
    let delay = deleting ? 40 : 75;
    if (!deleting && charIdx === current.length) { delay = 1900; deleting = true; }
    else if (deleting && charIdx === 0) { deleting = false; phraseIdx = (phraseIdx + 1) % phrases.length; delay = 300; }
    setTimeout(typeLoop, delay);
  };
  setTimeout(typeLoop, 2600);
}

// ---- Skill layers (highlight a layer of the 3D stack) ----
const tabs = [...document.querySelectorAll(".flavor-tab")];
const panels = [...document.querySelectorAll(".flavor-panel")];
function setFlavor(name) {
  tabs.forEach((t) => {
    const on = t.dataset.flavor === name;
    t.classList.toggle("active", on);
    t.setAttribute("aria-selected", String(on));
  });
  panels.forEach((p) => p.classList.toggle("active", p.dataset.panel === name));
  if (hasGSAP && !reduceMotion) {
    gsap.fromTo(`.flavor-panel[data-panel="${name}"] .skill-tag`,
      { y: 14, opacity: 0, scale: 0.9 },
      { y: 0, opacity: 1, scale: 1, duration: 0.45, stagger: 0.03, ease: "back.out(2)" });
  }
}
tabs.forEach((t) => {
  t.addEventListener("click", () => setFlavor(t.dataset.flavor));
  t.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const i = tabs.indexOf(t) + (e.key === "ArrowRight" ? 1 : -1);
    const next = tabs[(i + tabs.length) % tabs.length];
    next.focus();
    setFlavor(next.dataset.flavor);
  });
});

// ---- Project View More / View Less ----
document.querySelectorAll(".view-more-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const isOpen = document.getElementById(btn.dataset.expand).classList.toggle("open");
    btn.classList.toggle("open", isOpen);
    btn.setAttribute("aria-expanded", String(isOpen));
    btn.querySelector("span").textContent = isOpen ? "View Less" : "View More";
    setTimeout(() => window.ScrollTrigger?.refresh(), 600);
  });
});

// ---- Hover: 3D tilt + spotlight ----
if (finePointer && !reduceMotion) {
  document.querySelectorAll("[data-tilt]").forEach((card) => {
    const strength = card.classList.contains("project-card") ? 5 : 9;
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      // rotateX + rotateY expressed as one axis-angle for the CSS `rotate` property
      const ax = (0.5 - py) * strength, ay = (px - 0.5) * strength;
      card.style.setProperty("--tx", ax || 0.001);
      card.style.setProperty("--ty", ay);
      card.style.setProperty("--ta", `${Math.hypot(ax, ay)}deg`);
      card.style.setProperty("--mx", `${px * 100}%`);
      card.style.setProperty("--my", `${py * 100}%`);
    });
    card.addEventListener("pointerenter", () => card.classList.add("is-hover"));
    card.addEventListener("pointerleave", () => {
      card.classList.remove("is-hover");
      card.style.setProperty("--ta", "0deg");
    });
  });

  // Magnetic buttons
  document.querySelectorAll(".magnetic").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
    });
    el.addEventListener("pointerleave", () => (el.style.transform = ""));
  });
}

// ---- Laptop screen: code types itself, then an AI suggestion asks for approval ----
const codeEl = document.querySelector(".ls-code code");
const aiCard = document.querySelector(".ai-card");
if (codeEl) {
  const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  // [text, css class] tokens per line
  const lines = [
    [["// confidence-aware summary", "c"]],
    [["export async function ", "k"], ["summarise", "f"], ["(need) {", ""]],
    [["  const ", "k"], ["evidence = ", ""], ["await ", "k"], ["rank", "f"], ["(need.sources);", ""]],
    [["  const ", "k"], ["draft = ", ""], ["await ", "k"], ["llm", "f"], [".generate({", ""]],
    [["    tone: ", ""], ["evidence.weak ? ", ""], ["\"cautious\"", "s"], [" : ", ""], ["\"clear\"", "s"], [",", ""]],
    [["    locale: ", ""], ["\"ar\" | \"en\"", "s"], [",", ""]],
    [["  });", ""]],
    [["  return ", "k"], ["review", "f"], ["(draft); ", ""], ["// human in the loop", "c"]],
    [["}", ""]],
  ];
  const render = (upto) => {
    let left = upto, html = "";
    for (const line of lines) {
      for (const [text, cls] of line) {
        if (left <= 0) break;
        const part = text.slice(0, left);
        left -= text.length;
        html += cls ? `<span class="${cls}">${esc(part)}</span>` : esc(part);
      }
      if (left <= 0) break;
      html += "\n";
    }
    codeEl.innerHTML = html;
  };
  const total = lines.reduce((n, l) => n + l.reduce((m, [t]) => m + t.length, 0), 0);
  if (reduceMotion) { render(total); aiCard.classList.add("show"); }
  else {
    let i = 0;
    const step = () => {
      i += 2;
      render(i);
      if (i < total) return setTimeout(step, 28);
      setTimeout(() => aiCard.classList.add("show"), 300);
      setTimeout(() => aiCard.classList.add("approved"), 1900);
      setTimeout(() => { aiCard.classList.remove("show", "approved"); i = 0; setTimeout(step, 600); }, 5200);
    };
    setTimeout(step, 1600);
  }
}

// ---- Laptop: depth parallax that follows the cursor ----
const laptopTilt = document.querySelector(".laptop-tilt");
const halo = document.querySelector(".halo");
const outline = document.querySelector(".hero-outline");
if (laptopTilt && finePointer && !reduceMotion) {
  const m = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
  hero.addEventListener("pointermove", (e) => {
    m.x = e.clientX / window.innerWidth - 0.5;
    m.y = e.clientY / window.innerHeight - 0.5;
  });
  hero.addEventListener("pointerleave", () => { m.x = 0; m.y = 0; });
  const loop = () => {
    cur.x += (m.x - cur.x) * 0.08;
    cur.y += (m.y - cur.y) * 0.08;
    laptopTilt.style.transform = `translate3d(${cur.x * 26}px, ${cur.y * 14}px, 0) rotateY(${cur.x * 10}deg) rotateX(${-cur.y * 6}deg)`;
    halo.style.transform = `translate3d(${-cur.x * 40}px, ${-cur.y * 30}px, 0)`;
    outline.style.translate = `${-cur.x * 60}px 0`;
    requestAnimationFrame(loop);
  };
  loop();
}

// ---- Scroll-driven animations (GSAP) ----
if (hasGSAP && !reduceMotion) {
  gsap.registerPlugin(ScrollTrigger);

  // Hero entrance
  // Hero entrance: laptop rises, name is "written" left to right
  gsap.timeline({ defaults: { ease: "expo.out" } })
    .from(".nav", { y: -30, opacity: 0, duration: 1 })
    .from(".laptop-tilt", { yPercent: 14, opacity: 0, duration: 1.6 }, 0.1)
    .from(".halo", { scale: 0.6, opacity: 0, duration: 1.8 }, 0.1)
    .from(".hero-outline", { xPercent: 12, opacity: 0, duration: 1.8 }, 0.2)
    .from([".eyebrow", ".hi"], { y: 24, opacity: 0, duration: 0.9, stagger: 0.08 }, 0.35)
    .fromTo(".script-name .ink", { clipPath: "inset(-20% 100% -20% 0)" }, { clipPath: "inset(-20% 0% -20% 0)", duration: 1.6, ease: "power2.inOut", clearProps: "clipPath" }, 0.55)
    .from([".hero-role", ".hero-desc", ".hero-buttons", ".hero-socials"], { y: 26, opacity: 0, duration: 1, stagger: 0.08 }, 0.9)
    .from(".float-chip", { scale: 0.6, opacity: 0, duration: 0.9, stagger: 0.15, ease: "back.out(2)", clearProps: "transform,opacity" }, 1.3);

  // Leaving the hero: laptop zooms in slightly, text drifts away, the next section slides over it
  gsap.timeline({ scrollTrigger: { trigger: "#profile", start: "top top", end: "bottom top", scrub: true } })
    .to(".laptop-stage", { scale: 1.12, yPercent: 10, ease: "none" }, 0)
    .to(".hero-copy", { yPercent: -14, opacity: 0.2, ease: "none" }, 0)
    .to(".hero-outline", { xPercent: -18, ease: "none" }, 0);

  // Section titles: split into words that rise in
  document.querySelectorAll("[data-split]").forEach((el) => {
    el.innerHTML = el.textContent.trim().split(/\s+/)
      .map((w) => `<span class="line"><span class="word">${w}</span></span>`).join(" ");
    gsap.from(el.querySelectorAll(".word"), {
      yPercent: 110, duration: 1.1, stagger: 0.06, ease: "expo.out",
      scrollTrigger: { trigger: el, start: "top 85%" },
    });
  });

  // Contact headline is "written" like the hero name
  gsap.fromTo(".contact-script", { clipPath: "inset(-20% 100% -20% 0)" }, {
    clipPath: "inset(-20% 0% -20% 0)", duration: 1.8, ease: "power2.inOut", clearProps: "clipPath",
    scrollTrigger: { trigger: ".contact-script", start: "top 80%" },
  });

  gsap.utils.toArray(".section-tag, .section-sub, .reveal").forEach((el) => {
    gsap.from(el, { y: 28, opacity: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" } });
  });

  // Staggered groups
  [".about-stats .stat-card", ".flavor-tab", ".cert-card", ".contact-card", ".edu-item", ".skill-tag"].forEach((sel) => {
    const items = gsap.utils.toArray(sel);
    if (!items.length) return;
    gsap.from(items, {
      y: 40, opacity: 0, duration: 0.9, stagger: 0.08, ease: "power3.out", clearProps: "transform,opacity",
      scrollTrigger: { trigger: items[0], start: "top 88%" },
    });
  });

  // Project cards rise and un-tilt as they scroll in
  gsap.utils.toArray(".project-card").forEach((card) => {
    gsap.from(card, {
      y: 90, rotateX: 12, transformPerspective: 1200, opacity: 0, duration: 1.2, ease: "expo.out",
      scrollTrigger: { trigger: card, start: "top 90%" },
    });
  });

  // Timeline: line draws as you scroll, cards slide in
  gsap.to(".timeline-fill", {
    scaleY: 1, ease: "none",
    scrollTrigger: { trigger: ".timeline", start: "top 70%", end: "bottom 60%", scrub: true },
  });
  gsap.utils.toArray(".timeline-item").forEach((item) => {
    gsap.from(item.querySelector(".timeline-card"), {
      x: 60, opacity: 0, duration: 1.1, ease: "expo.out",
      scrollTrigger: { trigger: item, start: "top 80%" },
    });
    gsap.from(item.querySelector(".timeline-dot"), {
      scale: 0, duration: 0.6, ease: "back.out(3)",
      scrollTrigger: { trigger: item, start: "top 75%" },
    });
  });

  // Stat counters
  document.querySelectorAll(".stat-number[data-count]").forEach((el) => {
    const obj = { v: 0 };
    gsap.to(obj, {
      v: +el.dataset.count, duration: 1.6, ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 90%" },
      onUpdate: () => (el.textContent = Math.round(obj.v) + (el.dataset.suffix || "")),
    });
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());
} else {
  document.querySelector(".timeline-fill")?.style.setProperty("transform", "scaleY(1)");
}
