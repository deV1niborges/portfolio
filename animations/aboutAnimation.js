import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initAboutAnimation() {
  const about = document.querySelector(".about");
  if (!about) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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

  if (reduced) {
    gsap.set([header, label, title, texts, profile, rows, avatar, stats], {
      opacity: 1,
      clearProps: "transform,filter,clipPath",
    });
    return;
  }

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: about,
      start: "top 72%",
      toggleActions: "play none none none",
    },
  });

  tl.fromTo(header, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.42, ease: "power3.out" })
    .fromTo(label, { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 0.34 }, "-=0.16")
    .fromTo(
      title,
      { opacity: 0, y: 55, filter: "blur(6px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.72, ease: "power4.out" },
      "-=0.08",
    )
    .to(
      titleAccent,
      {
        x: () => gsap.utils.random(-4, 4),
        duration: 0.04,
        repeat: 3,
        yoyo: true,
        ease: "steps(1)",
      },
      "-=0.12",
    )
    .set(titleAccent, { x: 0 })
    .fromTo(
      texts,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.42, stagger: 0.1, ease: "power3.out" },
      "-=0.12",
    )
    .fromTo(
      profile,
      { opacity: 0, x: 55, clipPath: "inset(0 0 100% 0)" },
      { opacity: 1, x: 0, clipPath: "inset(0 0 0% 0)", duration: 0.78, ease: "power3.inOut" },
      "-=0.62",
    )
    .fromTo(
      rows,
      { opacity: 0, x: 18 },
      { opacity: 1, x: 0, duration: 0.28, stagger: 0.06, ease: "power2.out" },
      "-=0.28",
    )
    .fromTo(
      avatar,
      { opacity: 0, scale: 0.68 },
      { opacity: 1, scale: 1, duration: 0.42, ease: "back.out(1.8)" },
      "-=0.18",
    )
    .fromTo(
      scan,
      { top: "-5%", opacity: 0 },
      { top: "105%", opacity: 0.75, duration: 0.78, ease: "power1.inOut" },
      "-=0.28",
    )
    .to(scan, { opacity: 0, duration: 0.08 }, "-=0.08")
    .fromTo(
      stats,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.09, ease: "power3.out" },
      "-=0.22",
    );

  gsap.to(about.querySelector(".about-grid"), {
    backgroundPosition: "0px 80px",
    ease: "none",
    scrollTrigger: {
      trigger: about,
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
    },
  });
}
