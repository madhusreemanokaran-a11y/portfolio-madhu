(() => {
  "use strict";

  const root = document.documentElement;
  const header = document.querySelector(".site-header");
  const menuToggle = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector(".nav-menu");
  const navLinks = [...document.querySelectorAll(".nav-link")];
  const themeToggle = document.querySelector(".theme-toggle");
  const themeIcon = document.querySelector(".theme-icon");
  const backToTop = document.querySelector("#back-to-top");
  const sections = [...document.querySelectorAll("main section[id]")];
  const year = document.querySelector("#year");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Current year
  year.textContent = new Date().getFullYear();

  // Theme
  const savedTheme = localStorage.getItem("portfolio-theme");
  if (savedTheme === "dark") root.dataset.theme = "dark";
  updateThemeButton();

  function updateThemeButton() {
    const dark = root.dataset.theme === "dark";
    themeIcon.textContent = dark ? "☀" : "☾";
    themeToggle.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
  }

  themeToggle.addEventListener("click", () => {
    const dark = root.dataset.theme === "dark";
    if (dark) {
      delete root.dataset.theme;
      localStorage.setItem("portfolio-theme", "light");
    } else {
      root.dataset.theme = "dark";
      localStorage.setItem("portfolio-theme", "dark");
    }
    updateThemeButton();
  });

  // Mobile navigation
  function closeMenu() {
    navMenu.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
  }

  menuToggle.addEventListener("click", () => {
    const open = navMenu.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });

  navLinks.forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("click", (event) => {
    if (window.innerWidth <= 760 && navMenu.classList.contains("open") &&
        !navMenu.contains(event.target) && !menuToggle.contains(event.target)) {
      closeMenu();
    }
  });

  // Header + back-to-top
  function onScroll() {
    header.classList.toggle("scrolled", window.scrollY > 20);
    backToTop.classList.toggle("show", window.scrollY > 550);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

  // Active navigation
  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visible) {
      navLinks.forEach(link => link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`));
    }
  }, { rootMargin: "-25% 0px -60% 0px", threshold: [0, .2, .5, 1] });

  sections.forEach(section => observer.observe(section));

  // Scroll reveal
  if (!reduceMotion) {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));
  } else {
    document.querySelectorAll(".reveal").forEach(el => el.classList.add("visible"));
  }

  // Certificate lightbox
  const lightbox = document.querySelector("#lightbox");
  const lightboxImage = document.querySelector("#lightbox-image");
  const lightboxTitle = document.querySelector("#lightbox-title");
  const closeButton = document.querySelector(".lightbox-close");
  let lastFocused = null;

  function closeLightbox() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImage.src = "";
    if (lastFocused) lastFocused.focus();
  }

  document.querySelectorAll("[data-lightbox]").forEach(button => {
    button.addEventListener("click", () => {
      lastFocused = button;
      lightboxImage.src = button.dataset.lightbox;
      lightboxImage.alt = button.dataset.title || "Certificate preview";
      lightboxTitle.textContent = button.dataset.title || "Certificate preview";
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
      closeButton.focus();
    });
  });

  closeButton.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", event => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && lightbox.classList.contains("open")) closeLightbox();
  });

  // Mailto contact form — no fake backend.
  document.querySelector("#contact-form").addEventListener("submit", event => {
    event.preventDefault();
    const name = document.querySelector("#name").value.trim();
    const email = document.querySelector("#email").value.trim();
    const message = document.querySelector("#message").value.trim();

    const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    );
    window.location.href = `mailto:madhusreemanokaran@gmail.com?subject=${subject}&body=${body}`;
  });
})();
