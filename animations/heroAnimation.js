import gsap from "gsap";

export function createHeroTimeline() {
  const hero = document.querySelector(".hero");

  if (!hero) {
    console.warn("Hero não encontrado.");

    return null;
  }

  const nameLines = hero.querySelectorAll(".hero-name-line");

  const role = hero.querySelector(".hero-role");

  const description = hero.querySelector(".hero-description");

  const actions = hero.querySelector(".hero-actions");

  const terminal = hero.querySelector(".hero-terminal");

  const progress = hero.querySelector(".terminal-progress-bar");

  const bottom = hero.querySelector(".hero-bottom");

  const scan = hero.querySelector(".hero-scan");

  const cursor = hero.querySelector(".hero-cursor");

  // ============================================================
  // TIMELINE
  // ============================================================

  const tl = gsap.timeline({
    defaults: {
      ease: "power3.out",
    },
  });

  // ============================================================
  // NOME
  // ============================================================

  tl.fromTo(
    nameLines[0],

    {
      x: -80,

      opacity: 0,

      filter: "blur(5px)",
    },

    {
      x: 0,

      opacity: 1,

      filter: "blur(0px)",

      duration: 0.75,
    },
  );

  tl.fromTo(
    nameLines[1],

    {
      x: 80,

      opacity: 0,

      filter: "blur(5px)",
    },

    {
      x: 0,

      opacity: 1,

      filter: "blur(0px)",

      duration: 0.75,
    },

    "-=0.5",
  );

  // ============================================================
  // PEQUENO GLITCH NO NOME
  // ============================================================

  tl.to(
    nameLines,

    {
      x: () => gsap.utils.random(-4, 4),

      duration: 0.04,

      repeat: 2,

      yoyo: true,

      ease: "steps(1)",
    },

    "-=0.18",
  );

  tl.set(
    nameLines,

    {
      x: 0,
    },
  );

  // ============================================================
  // ROLE
  // ============================================================

  tl.fromTo(
    role,

    {
      opacity: 0,

      y: 20,
    },

    {
      opacity: 1,

      y: 0,

      duration: 0.4,
    },

    "-=0.12",
  );

  // ============================================================
  // DESCRIPTION
  // ============================================================

  tl.fromTo(
    description,

    {
      opacity: 0,

      y: 18,
    },

    {
      opacity: 1,

      y: 0,

      duration: 0.5,
    },

    "-=0.15",
  );

  // ============================================================
  // BUTTONS
  // ============================================================

  tl.fromTo(
    actions,

    {
      opacity: 0,

      y: 18,
    },

    {
      opacity: 1,

      y: 0,

      duration: 0.45,
    },

    "-=0.25",
  );

  // ============================================================
  // TERMINAL
  // ============================================================

  tl.fromTo(
    terminal,

    {
      opacity: 0,

      x: 50,

      clipPath: "inset(0 100% 0 0)",
    },

    {
      opacity: 1,

      x: 0,

      clipPath: "inset(0 0% 0 0)",

      duration: 0.75,

      ease: "power3.inOut",
    },

    "-=0.5",
  );

  // ============================================================
  // TERMINAL LOADING
  // ============================================================

  tl.to(
    progress,

    {
      scaleX: 1,

      duration: 0.7,

      ease: "power2.inOut",
    },

    "-=0.3",
  );

  // ============================================================
  // BOTTOM
  // ============================================================

  tl.fromTo(
    bottom,

    {
      opacity: 0,

      y: 15,
    },

    {
      opacity: 1,

      y: 0,

      duration: 0.45,
    },

    "-=0.25",
  );

  // ============================================================
  // SCANNER
  // ============================================================

  tl.fromTo(
    scan,

    {
      top: "-4%",

      opacity: 0,
    },

    {
      top: "105%",

      opacity: 0.45,

      duration: 1,

      ease: "power1.inOut",
    },

    "-=0.2",
  );

  tl.set(
    scan,

    {
      opacity: 0,
    },
  );

  // ============================================================
  // CURSOR INFINITO
  // ============================================================

  gsap.to(
    cursor,

    {
      opacity: 0,

      duration: 0.45,

      repeat: -1,

      yoyo: true,

      ease: "steps(1)",
    },
  );

  return tl;
}
