import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function initProjectTilt(card) {
  if (window.matchMedia("(pointer: coarse)").matches) return;

  const visual = card.querySelector(".project-visual");
  if (!visual) return;

  const rotateX = gsap.quickTo(visual, "rotationX", { duration: 0.38, ease: "power3.out" });
  const rotateY = gsap.quickTo(visual, "rotationY", { duration: 0.38, ease: "power3.out" });
  const x = gsap.quickTo(visual, "x", { duration: 0.38, ease: "power3.out" });
  const y = gsap.quickTo(visual, "y", { duration: 0.38, ease: "power3.out" });

  visual.addEventListener("pointermove", (event) => {
    const rect = visual.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;

    rotateY(px * 5);
    rotateX(py * -5);
    x(px * 5);
    y(py * 5);
  });

  visual.addEventListener("pointerleave", () => {
    rotateX(0);
    rotateY(0);
    x(0);
    y(0);
  });
}

export function initProjectsAnimation() {
  const section = document.querySelector("#projetos");
  if (!section) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = section.querySelector(".projects-header");
  const kicker = section.querySelector(".section-kicker");
  const title = section.querySelector(".section-title");
  const lead = section.querySelector(".section-lead");
  const cards = section.querySelectorAll("[data-project-card]");

  if (!reduced) {
    const intro = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 72%",
        toggleActions: "play none none none",
      },
    });

    intro
      .fromTo(header, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.4 })
      .fromTo(kicker, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.35 }, "-=0.18")
      .fromTo(
        title,
        { opacity: 0, y: 55, filter: "blur(6px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.72, ease: "power4.out" },
        "-=0.08",
      )
      .fromTo(lead, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.45 }, "-=0.32");

    cards.forEach((card, index) => {
      const info = card.querySelector(".project-info");
      const visual = card.querySelector(".project-visual");
      const reverse = card.classList.contains("project-card-reverse");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: card,
          start: "top 78%",
          toggleActions: "play none none none",
        },
      });

      tl.fromTo(
        info,
        { opacity: 0, x: reverse ? 48 : -48 },
        { opacity: 1, x: 0, duration: 0.65, ease: "power3.out" },
      ).fromTo(
        visual,
        {
          opacity: 0,
          x: reverse ? -55 : 55,
          clipPath: reverse ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)",
        },
        {
          opacity: 1,
          x: 0,
          clipPath: "inset(0 0% 0 0%)",
          duration: 0.82,
          ease: "power3.inOut",
        },
        "-=0.42",
      );

      if (index === 0) {
        tl.fromTo(
          visual.querySelectorAll(".eab-products i"),
          { scaleY: 0, transformOrigin: "bottom" },
          { scaleY: 1, duration: 0.32, stagger: 0.08, ease: "back.out(1.6)" },
          "-=0.28",
        );
      }
    });

    gsap.to(section.querySelector(".projects-grid-bg"), {
      xPercent: -3,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
      },
    });
  } else {
    gsap.set([header, kicker, title, lead, cards], { opacity: 1, clearProps: "transform,filter,clipPath" });
  }

  cards.forEach(initProjectTilt);

  const bars = section.querySelectorAll(".music-wave i");
  if (bars.length && !reduced) {
    bars.forEach((bar, index) => {
      gsap.to(bar, {
        scaleY: () => gsap.utils.random(0.55, 1.35),
        transformOrigin: "center",
        duration: 0.45 + index * 0.025,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    });
  }

  const orbit = section.querySelector(".login-orbit");
  if (orbit && !reduced) {
    gsap.to(orbit, { rotation: 360, duration: 34, repeat: -1, ease: "none" });
  }
}
