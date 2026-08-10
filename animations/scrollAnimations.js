import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function initNavigation() {
  const nav = document.querySelector(".site-nav");
  const toggle = document.querySelector(".nav-toggle");
  const links = [...document.querySelectorAll(".nav-links a")];
  const sections = [...document.querySelectorAll("main section[id]")];

  if (!nav) return;

  const syncNavState = () => {
    nav.classList.toggle("is-scrolled", window.scrollY > 30);
  };

  syncNavState();
  window.addEventListener("scroll", syncNavState, { passive: true });

  toggle?.addEventListener("click", () => {
    const open = nav.classList.toggle("menu-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  });

  links.forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("menu-open");
      toggle?.setAttribute("aria-expanded", "false");
      toggle?.setAttribute("aria-label", "Abrir menu");
    });
  });

  sections.forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: "top 45%",
      end: "bottom 45%",
      onToggle(self) {
        if (!self.isActive) return;
        links.forEach((link) => {
          link.classList.toggle("is-active", link.dataset.section === section.id);
        });
      },
    });
  });
}

function initPageProgress() {
  const bar = document.querySelector(".site-progress-bar");
  if (!bar) return;

  const update = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
    bar.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
}

function initMouseGlow() {
  if (window.matchMedia("(pointer: coarse)").matches || reducedMotion()) return;

  const glow = document.querySelector(".mouse-glow");
  if (!glow) return;

  const xTo = gsap.quickTo(glow, "x", { duration: 0.55, ease: "power3.out" });
  const yTo = gsap.quickTo(glow, "y", { duration: 0.55, ease: "power3.out" });

  window.addEventListener("pointermove", (event) => {
    xTo(event.clientX);
    yTo(event.clientY);
  });
}

function initGenericReveals() {
  const elements = document.querySelectorAll("[data-reveal]");

  if (reducedMotion()) {
    gsap.set(elements, { opacity: 1, clearProps: "transform,filter" });
    return;
  }

  elements.forEach((element) => {
    gsap.fromTo(
      element,
      { opacity: 0, y: 28, filter: "blur(3px)" },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.55,
        ease: "power3.out",
        scrollTrigger: {
          trigger: element,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      },
    );
  });
}

function getEducationProgress() {
  const start = new Date(2024, 0, 1).getTime();
  const end = new Date(2027, 6, 31).getTime();
  const now = Date.now();
  return Math.min(1, Math.max(0, (now - start) / (end - start)));
}

function initEducation() {
  const section = document.querySelector("#formacao");
  if (!section) return;

  const progressValue = getEducationProgress();
  const progressPercent = Math.round(progressValue * 100);
  const terminal = section.querySelector(".education-terminal");
  const progress = section.querySelector(".education-progress");
  const label = section.querySelector("#education-progress-label");
  const title = section.querySelector(".section-title");
  const kicker = section.querySelector(".section-kicker");
  const lead = section.querySelector(".section-lead");

  section.style.setProperty("--education-progress", `${progressPercent}%`);
  if (label) label.textContent = `${progressPercent}%`;

  if (reducedMotion()) {
    gsap.set(progress, { scaleX: progressValue });
    return;
  }

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top 72%",
      toggleActions: "play none none none",
    },
  });

  tl.fromTo(kicker, { opacity: 0, x: -22 }, { opacity: 1, x: 0, duration: 0.35 })
    .fromTo(
      title,
      { opacity: 0, y: 50, filter: "blur(6px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.7, ease: "power4.out" },
      "-=0.1",
    )
    .fromTo(lead, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 }, "-=0.32")
    .fromTo(
      terminal,
      { opacity: 0, x: 55, clipPath: "inset(0 0 100% 0)" },
      { opacity: 1, x: 0, clipPath: "inset(0 0 0% 0)", duration: 0.75, ease: "power3.inOut" },
      "-=0.5",
    )
    .to(progress, { scaleX: progressValue, duration: 1.15, ease: "power2.inOut" }, "-=0.2");
}

function initCourses() {
  const section = document.querySelector("#cursos");
  if (!section) return;

  const header = section.querySelector(".courses-header");
  const kicker = section.querySelector(".section-kicker");
  const title = section.querySelector(".section-title");
  const consoleEl = section.querySelector(".learning-console");
  const load = section.querySelector(".console-loading-bar");
  const rows = section.querySelectorAll("[data-course]");

  if (reducedMotion()) {
    gsap.set([header, kicker, title, consoleEl, rows], { opacity: 1, clearProps: "transform,filter,clipPath" });
    gsap.set(load, { scaleX: 1 });
    return;
  }

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top 72%",
      toggleActions: "play none none none",
    },
  });

  tl.fromTo(header, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.38 })
    .fromTo(kicker, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.34 }, "-=0.15")
    .fromTo(
      title,
      { opacity: 0, y: 48, filter: "blur(6px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.68, ease: "power4.out" },
      "-=0.08",
    )
    .fromTo(
      consoleEl,
      { opacity: 0, y: 38, clipPath: "inset(0 0 100% 0)" },
      { opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: 0.7, ease: "power3.inOut" },
      "-=0.25",
    )
    .to(load, { scaleX: 1, duration: 0.65, ease: "power2.inOut" }, "-=0.15")
    .fromTo(
      rows,
      { opacity: 0, x: -18 },
      { opacity: 1, x: 0, duration: 0.32, stagger: 0.065, ease: "power2.out" },
      "-=0.2",
    );
}

function initContact() {
  const section = document.querySelector("#contato");
  if (!section) return;

  const header = section.querySelector(".contact-header");
  const kicker = section.querySelector(".section-kicker");
  const title = section.querySelector(".contact-title");
  const copy = section.querySelector(".contact-copy");
  const email = section.querySelector(".contact-email");
  const actions = section.querySelectorAll(".contact-actions a");
  const bottom = section.querySelector(".contact-bottom");
  const radar = section.querySelector(".contact-radar");

  if (reducedMotion()) {
    gsap.set([header, kicker, title, copy, email, actions, bottom], { opacity: 1, clearProps: "transform,filter" });
    return;
  }

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top 70%",
      toggleActions: "play none none none",
    },
  });

  tl.fromTo(header, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.4 })
    .fromTo(kicker, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.35 }, "-=0.15")
    .fromTo(
      title,
      { opacity: 0, y: 60, filter: "blur(7px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.78, ease: "power4.out" },
      "-=0.08",
    )
    .fromTo(copy, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.42 }, "-=0.35")
    .fromTo(email, { opacity: 0, scaleX: 0.88, transformOrigin: "left" }, { opacity: 1, scaleX: 1, duration: 0.48 }, "-=0.15")
    .fromTo(actions, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.34, stagger: 0.07 }, "-=0.18")
    .fromTo(bottom, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.42 }, "-=0.1");

  if (radar) {
    gsap.to(radar, {
      rotation: 16,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        scrub: 1.2,
      },
    });
  }
}

function initFooter() {
  const footer = document.querySelector(".site-footer");
  if (!footer || reducedMotion()) return;

  gsap.fromTo(
    footer.querySelector(".footer-inner"),
    { opacity: 0, y: 22 },
    {
      opacity: 1,
      y: 0,
      duration: 0.5,
      scrollTrigger: {
        trigger: footer,
        start: "top 92%",
        toggleActions: "play none none none",
      },
    },
  );
}

export function initPortfolioAnimations() {
  initNavigation();
  initPageProgress();
  initMouseGlow();
  initGenericReveals();
  initEducation();
  initCourses();
  initContact();
  initFooter();

  const year = document.querySelector("#current-year");
  if (year) year.textContent = String(new Date().getFullYear());

  requestAnimationFrame(() => ScrollTrigger.refresh());
}
