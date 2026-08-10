import gsap from "gsap";

import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initAboutAnimation() {
  const about = document.querySelector(".about");

  if (!about) {
    console.warn("Seção About não encontrada.");

    return;
  }

  const header = about.querySelector(".about-header");

  const label = about.querySelector(".about-label");

  const title = about.querySelector(".about-title");

  const titleAccent = about.querySelector(".about-title span");

  const texts = about.querySelectorAll(".about-text");

  const profile = about.querySelector(".about-profile");

  const rows = about.querySelectorAll(".profile-row");

  const avatar = about.querySelector(".profile-avatar");

  const stats = about.querySelectorAll(".about-stat");

  const scan = about.querySelector(".profile-scan");

  // ============================================================
  // TIMELINE PRINCIPAL
  // ============================================================

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: about,

      start: "top 72%",

      end: "top 20%",

      toggleActions: "play none none reverse",
    },
  });

  // ============================================================
  // HEADER
  // ============================================================

  tl.fromTo(
    header,

    {
      opacity: 0,

      y: 20,
    },

    {
      opacity: 1,

      y: 0,

      duration: 0.45,

      ease: "power3.out",
    },
  );

  // ============================================================
  // LABEL
  // ============================================================

  tl.fromTo(
    label,

    {
      opacity: 0,

      x: -25,
    },

    {
      opacity: 1,

      x: 0,

      duration: 0.35,
    },

    "-=0.15",
  );

  // ============================================================
  // TÍTULO
  // ============================================================

  tl.fromTo(
    title,

    {
      opacity: 0,

      y: 60,

      filter: "blur(7px)",
    },

    {
      opacity: 1,

      y: 0,

      filter: "blur(0px)",

      duration: 0.75,

      ease: "power4.out",
    },

    "-=0.1",
  );

  // ============================================================
  // PEQUENO GLITCH NA PALAVRA IDEIAS
  // ============================================================

  tl.to(
    titleAccent,

    {
      x: () => gsap.utils.random(-5, 5),

      duration: 0.04,

      repeat: 3,

      yoyo: true,

      ease: "steps(1)",
    },

    "-=0.15",
  );

  tl.set(
    titleAccent,

    {
      x: 0,
    },
  );

  // ============================================================
  // TEXTOS
  // ============================================================

  tl.fromTo(
    texts,

    {
      opacity: 0,

      y: 20,
    },

    {
      opacity: 1,

      y: 0,

      duration: 0.45,

      stagger: 0.12,

      ease: "power3.out",
    },

    "-=0.2",
  );

  // ============================================================
  // DOSSIÊ APARECE
  // ============================================================

  tl.fromTo(
    profile,

    {
      opacity: 0,

      x: 60,

      clipPath: "inset(0 0 100% 0)",
    },

    {
      opacity: 1,

      x: 0,

      clipPath: "inset(0 0 0% 0)",

      duration: 0.8,

      ease: "power3.inOut",
    },

    "-=0.65",
  );

  // ============================================================
  // LINHAS DO DOSSIÊ
  // ============================================================

  tl.fromTo(
    rows,

    {
      opacity: 0,

      x: 20,
    },

    {
      opacity: 1,

      x: 0,

      duration: 0.3,

      stagger: 0.07,

      ease: "power2.out",
    },

    "-=0.3",
  );

  // ============================================================
  // AVATAR V
  // ============================================================

  tl.fromTo(
    avatar,

    {
      opacity: 0,

      scale: 0.65,
    },

    {
      opacity: 1,

      scale: 1,

      duration: 0.45,

      ease: "back.out(1.8)",
    },

    "-=0.2",
  );

  // ============================================================
  // SCANNER DO DOSSIÊ
  // ============================================================

  tl.fromTo(
    scan,

    {
      top: "-5%",

      opacity: 0,
    },

    {
      top: "105%",

      opacity: 0.75,

      duration: 0.8,

      ease: "power1.inOut",
    },

    "-=0.3",
  );

  tl.to(
    scan,

    {
      opacity: 0,

      duration: 0.08,
    },

    "-=0.08",
  );

  // ============================================================
  // STATS
  // ============================================================

  tl.fromTo(
    stats,

    {
      opacity: 0,

      y: 35,
    },

    {
      opacity: 1,

      y: 0,

      duration: 0.45,

      stagger: 0.1,

      ease: "power3.out",
    },

    "-=0.3",
  );

  // ============================================================
  // PARALLAX MUITO LEVE
  // ============================================================

  gsap.to(
    ".about-grid",

    {
      backgroundPosition: "0px 80px",

      ease: "none",

      scrollTrigger: {
        trigger: about,

        start: "top bottom",

        end: "bottom top",

        scrub: 1,
      },
    },
  );
}
