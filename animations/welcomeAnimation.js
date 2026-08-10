import gsap from "gsap";

// ============================================================
// SEPARA O TEXTO EM LETRAS
// ============================================================

function splitTextIntoLetters(element) {
  const text = element.textContent;

  element.textContent = "";

  const letters = [];

  [...text].forEach((character) => {
    const span = document.createElement("span");

    span.classList.add("welcome-letter");

    if (character === " ") {
      span.innerHTML = "&nbsp;";
    } else {
      span.textContent = character;
    }

    element.appendChild(span);

    letters.push(span);
  });

  return letters;
}

// ============================================================
// WELCOME TIMELINE
// ============================================================

export function createWelcomeTimeline({ onComplete } = {}) {
  const screen = document.getElementById("welcome-screen");

  const title = document.getElementById("welcome-title");

  const subtitle = document.getElementById("welcome-subtitle");

  const divider = document.querySelector(".welcome-divider");

  const scanline = document.querySelector(".welcome-scanline");

  const pixels = document.querySelectorAll(".welcome-pixels span");

  const glitchA = document.querySelector(".welcome-title-glitch-a");

  const glitchB = document.querySelector(".welcome-title-glitch-b");

  if (!screen || !title || !subtitle) {
    console.warn("Elementos da welcome screen não encontrados.");

    return null;
  }

  // ============================================================
  // LETRAS
  // ============================================================

  const letters = splitTextIntoLetters(title);

  // ============================================================
  // TIMELINE
  // ============================================================

  const tl = gsap.timeline({
    defaults: {
      ease: "power3.out",
    },

    onStart() {
      screen.setAttribute("aria-hidden", "false");
    },

    onComplete() {
      screen.setAttribute("aria-hidden", "true");

      window.dispatchEvent(new CustomEvent("welcomeComplete"));

      if (typeof onComplete === "function") {
        onComplete();
      }
    },
  });

  // ============================================================
  // TELA APARECE
  // ============================================================

  tl.set(screen, {
    visibility: "visible",
  });

  tl.to(screen, {
    opacity: 1,

    duration: 0.18,
  });

  // ============================================================
  // PIXELS COMEÇAM A SURGIR
  // ============================================================

  tl.fromTo(
    pixels,

    {
      opacity: 0,

      scale: 0,
    },

    {
      opacity: () => gsap.utils.random(0.25, 0.75),

      scale: 1,

      duration: 0.18,

      stagger: {
        each: 0.04,

        from: "random",
      },
    },

    0.06,
  );

  // ============================================================
  // LETRAS ENTRAM
  // ============================================================

  tl.fromTo(
    letters,

    {
      yPercent: 120,

      opacity: 0,

      filter: "blur(4px)",
    },

    {
      yPercent: 0,

      opacity: 1,

      filter: "blur(0px)",

      duration: 0.42,

      stagger: {
        each: 0.035,

        from: "start",
      },

      ease: "back.out(1.8)",
    },

    0.16,
  );

  // ============================================================
  // MICRO GLITCH NO TÍTULO
  // ============================================================

  tl.set(
    [glitchA, glitchB],

    {
      opacity: 0.65,
    },
  );

  tl.fromTo(
    glitchA,

    {
      x: -7,
    },

    {
      x: 5,

      duration: 0.055,

      repeat: 2,

      yoyo: true,

      ease: "steps(1)",
    },
  );

  tl.fromTo(
    glitchB,

    {
      x: 6,
    },

    {
      x: -4,

      duration: 0.05,

      repeat: 2,

      yoyo: true,

      ease: "steps(1)",
    },

    "<",
  );

  tl.set(
    [glitchA, glitchB],

    {
      opacity: 0,
    },
  );

  // ============================================================
  // LINHA CENTRAL
  // ============================================================

  tl.to(
    divider,

    {
      scaleX: 1,

      opacity: 1,

      duration: 0.36,

      ease: "power3.out",
    },

    "-=0.05",
  );

  // ============================================================
  // SUBTÍTULO
  // ============================================================

  tl.to(
    subtitle,

    {
      opacity: 1,

      y: 0,

      duration: 0.38,
    },

    "-=0.12",
  );

  // ============================================================
  // SCANNER
  // ============================================================

  tl.fromTo(
    scanline,

    {
      top: "-8%",

      opacity: 0,
    },

    {
      top: "108%",

      opacity: 0.75,

      duration: 0.75,

      ease: "power1.inOut",
    },

    "-=0.05",
  );

  tl.to(
    scanline,

    {
      opacity: 0,

      duration: 0.08,
    },

    "-=0.08",
  );

  // ============================================================
  // SEGURA O TEXTO
  // ============================================================

  tl.to(
    {},
    {
      duration: 0.78,
    },
  );

  // ============================================================
  // SAÍDA DOS PIXELS
  // ============================================================

  tl.to(
    pixels,

    {
      opacity: 0,

      y: () => gsap.utils.random(-20, 20),

      x: () => gsap.utils.random(-20, 20),

      duration: 0.2,

      stagger: 0.018,
    },
  );

  // ============================================================
  // SUBTÍTULO DESAPARECE
  // ============================================================

  tl.to(
    subtitle,

    {
      opacity: 0,

      y: -8,

      duration: 0.22,
    },

    "<",
  );

  // ============================================================
  // LINHA FECHA
  // ============================================================

  tl.to(
    divider,

    {
      scaleX: 0,

      opacity: 0,

      duration: 0.28,

      ease: "power2.in",
    },

    "-=0.12",
  );

  // ============================================================
  // TÍTULO SE DESMONTA
  // ============================================================

  tl.to(
    letters,

    {
      opacity: 0,

      yPercent: -80,

      duration: 0.3,

      stagger: {
        each: 0.018,

        from: "edges",
      },

      ease: "power2.in",
    },

    "-=0.18",
  );

  // ============================================================
  // TELA SOME
  // ============================================================

  tl.to(
    screen,

    {
      opacity: 0,

      duration: 0.25,
    },
  );

  tl.set(
    screen,

    {
      visibility: "hidden",
    },
  );

  return tl;
}
