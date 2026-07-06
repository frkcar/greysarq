/**
 * Greys Carvalho — Landing Page
 * Tweaks configuráveis (PRD §8)
 */
const TWEAKS = {
  accentColor: "#1E3A47",
  whatsappNumber: "5534984240159",
  whatsappDisplay: "+55 34 98424 0159",
  contatoEmail: "contato@greys.arq.br",
  enableMotion: true,
  heroVideoSpeed: 1,
};

(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const motionEnabled = TWEAKS.enableMotion && !prefersReducedMotion;

  if (!motionEnabled) {
    document.documentElement.classList.add("no-motion");
  }

  applyAccentColor();
  applyContactInfo();
  initNav();
  initMobileMenu();
  initHeroReverseVideo();
  initProcessScrub();
  initReveals();
  initContactForm();
  initWhatsappFloat();

  function applyAccentColor() {
    document.documentElement.style.setProperty("--accent", TWEAKS.accentColor);
  }

  function applyContactInfo() {
    const waDisplay = document.getElementById("whatsapp-display");
    const email = document.getElementById("contato-email");
    if (waDisplay) {
      waDisplay.textContent = TWEAKS.whatsappDisplay;
      waDisplay.href = `https://wa.me/${TWEAKS.whatsappNumber}`;
    }
    if (email) {
      email.textContent = TWEAKS.contatoEmail;
      email.href = `mailto:${TWEAKS.contatoEmail}`;
    }
  }

  /* ── Navigation ── */
  function initNav() {
    const nav = document.getElementById("nav");
    if (!nav) return;

    const hero = document.getElementById("hero");
    const threshold = hero ? hero.offsetHeight * 0.15 : 80;

    function updateNav() {
      nav.classList.toggle("is-scrolled", window.scrollY > threshold);
    }

    updateNav();
    window.addEventListener("scroll", updateNav, { passive: true });
  }

  function initMobileMenu() {
    const toggle = document.getElementById("nav-toggle");
    const menu = document.getElementById("nav-mobile");
    if (!toggle || !menu) return;

    toggle.addEventListener("click", () => {
      const isOpen = toggle.classList.toggle("is-open");
      menu.classList.toggle("is-open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        toggle.classList.remove("is-open");
        menu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  /* ── Hero reverse loop ── */
  function initHeroReverseVideo() {
    const video = document.getElementById("hero-video");
    if (!video) return;

    let rafId = null;
    let lastTimestamp = 0;
    let isRunning = false;
    const speed = TWEAKS.heroVideoSpeed ?? 1;

    function reverseStep(timestamp) {
      if (!isRunning) return;

      if (!lastTimestamp) lastTimestamp = timestamp;
      const delta = Math.min((timestamp - lastTimestamp) / 1000, 0.1);
      lastTimestamp = timestamp;

      if (video.readyState >= 2 && video.duration) {
        const next = video.currentTime - delta * speed;
        video.currentTime = next <= 0.05 ? video.duration - 0.05 : next;
      }

      rafId = requestAnimationFrame(reverseStep);
    }

    function startReverse() {
      if (!motionEnabled) {
        video.pause();
        return;
      }

      video.pause();
      isRunning = true;
      lastTimestamp = 0;

      if (video.duration) {
        video.currentTime = video.duration - 0.05;
      }

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(reverseStep);
    }

    function primeAndStart() {
      if (!video.duration) return;

      video.pause();
      video.currentTime = video.duration - 0.05;

      video.addEventListener(
        "seeked",
        () => startReverse(),
        { once: true }
      );
    }

    video.addEventListener("loadedmetadata", primeAndStart, { once: true });

    if (video.readyState >= 1 && video.duration) {
      primeAndStart();
    }

    video.addEventListener("error", () => {
      isRunning = false;
      if (rafId) cancelAnimationFrame(rafId);
      const wrap = video.closest(".hero__video-wrap");
      if (wrap) wrap.style.background = "var(--espresso)";
    });
  }

  /* ── Process scroll scrub (reverse) ── */
  function initProcessScrub() {
    const section = document.getElementById("processo");
    const video = document.getElementById("process-video");
    const progressBar = document.getElementById("process-progress");
    if (!section || !video || !progressBar) return;

    let ticking = false;

    function updateScrub() {
      const rect = section.getBoundingClientRect();
      const scrollable = section.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), scrollable);
      const progress = scrollable > 0 ? scrolled / scrollable : 0;

      progressBar.style.width = `${progress * 100}%`;

      if (video.readyState >= 2 && video.duration) {
        video.currentTime = video.duration * (1 - progress);
      }

      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(updateScrub);
        ticking = true;
      }
    }

    video.addEventListener("loadedmetadata", () => {
      video.pause();
      video.currentTime = video.duration;
      updateScrub();
    });

    if (video.readyState >= 1) {
      video.pause();
      if (video.duration) video.currentTime = video.duration;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    updateScrub();
  }

  /* ── Scroll reveals ── */
  function initReveals() {
    const items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (!motionEnabled) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = entry.target.dataset.delay || "0";
            entry.target.style.transitionDelay = `${delay}ms`;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    items.forEach((el) => observer.observe(el));
  }

  /* ── Contact form → WhatsApp ── */
  function initContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const nome = form.querySelector("#nome");
      const contato = form.querySelector("#contato");
      const mensagem = form.querySelector("#mensagem");

      let valid = true;

      [nome, contato, mensagem].forEach((field) => {
        const group = field.closest(".form-group");
        if (!field.value.trim()) {
          group.classList.add("is-invalid");
          valid = false;
        } else {
          group.classList.remove("is-invalid");
        }
      });

      if (!valid) return;

      const text = [
        `Olá, Greys! Meu nome é ${nome.value.trim()}.`,
        `Contato: ${contato.value.trim()}.`,
        "",
        mensagem.value.trim(),
      ].join("\n");

      const url = `https://wa.me/${TWEAKS.whatsappNumber}?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank", "noopener,noreferrer");
    });

    form.querySelectorAll("input, textarea").forEach((field) => {
      field.addEventListener("input", () => {
        field.closest(".form-group")?.classList.remove("is-invalid");
      });
    });
  }

  function initWhatsappFloat() {
    const btn = document.getElementById("whatsapp-float");
    if (!btn) return;

    btn.href = `https://wa.me/${TWEAKS.whatsappNumber}`;
    if (motionEnabled) btn.classList.add("is-animated");
  }
})();
