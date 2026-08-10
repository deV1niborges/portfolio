import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initSkillsAnimation() {
  const section = document.querySelector("#stack");
  if (!section) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = section.querySelector(".stack-header");
  const kicker = section.querySelector(".section-kicker");
  const title = section.querySelector(".section-title");
  const lead = section.querySelector(".section-lead");
  const nodes = section.querySelectorAll("[data-stack-node]");
  const paths = section.querySelectorAll("[data-connection]");
  const cards = section.querySelectorAll(".tool-card");
  const pulse = section.querySelector(".stack-node-pulse");

  if (reduced) {
    gsap.set([header, kicker, title, lead, nodes, cards], { opacity: 1, clearProps: "transform,filter" });
    return;
  }

  paths.forEach((path) => {
    const length = path.getTotalLength();
    gsap.set(path, {
      strokeDasharray: length,
      strokeDashoffset: length,
    });
  });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top 70%",
      toggleActions: "play none none none",
    },
  });

  tl.fromTo(header, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.4 })
    .fromTo(kicker, { opacity: 0, x: -22 }, { opacity: 1, x: 0, duration: 0.35 }, "-=0.18")
    .fromTo(
      title,
      { opacity: 0, y: 55, filter: "blur(6px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.72, ease: "power4.out" },
      "-=0.08",
    )
    .fromTo(lead, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.45 }, "-=0.35")
    .to(
      paths,
      {
        strokeDashoffset: 0,
        duration: 0.8,
        stagger: 0.06,
        ease: "power2.inOut",
      },
      "-=0.08",
    )
    .fromTo(
      nodes,
      { opacity: 0, scale: 0.72, filter: "blur(4px)" },
      {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        duration: 0.42,
        stagger: { each: 0.06, from: "center" },
        ease: "back.out(1.7)",
      },
      "-=0.58",
    )
    .fromTo(
      cards,
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.42, stagger: 0.07, ease: "power3.out" },
      "-=0.05",
    );

  if (pulse) {
    gsap.to(pulse, {
      scale: 2.5,
      opacity: 0.15,
      duration: 1.15,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }

  gsap.to(section.querySelector(".section-noise"), {
    backgroundPosition: "80px 80px",
    ease: "none",
    scrollTrigger: {
      trigger: section,
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
    },
  });
}
