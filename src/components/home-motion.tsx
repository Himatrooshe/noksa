"use client";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

/**
 * Scroll and entrance animations for the home page. The page is server-rendered
 * and fully visible without JavaScript; this only layers motion on top, and
 * does nothing for visitors who prefer reduced motion. Everything is reverted
 * on unmount, so client-side navigation leaves no inline styles behind.
 */
export function HomeMotion() {
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const q = <T extends Element = HTMLElement>(selector: string) => gsap.utils.toArray<T>(selector);
      const exists = (selector: string) => document.querySelector(selector) !== null;
      // The hero is intentionally static; only its sun rises, via CSS (see .hero-sun).

      // Section copy fades up as it enters.
      const revealTargets = q(
        ".categories-head > div > *, .categories-intro > *, .video-showcase-copy > *, .about-teaser-copy > :not(.about-teaser-watermark), .values-eyebrow, .bulk-copy > *",
      );
      gsap.set(revealTargets, { y: 20, autoAlpha: 0 });
      ScrollTrigger.batch(revealTargets, {
        start: "top 95%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, { y: 0, autoAlpha: 1, duration: 0.5, ease: "power2.out", stagger: 0.04, overwrite: true }),
      });

      // Category panels rise one after another.
      if (exists(".cat-panels")) {
        gsap.fromTo(
          ".cat-panel",
          { y: 32, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.6,
            ease: "power2.out",
            stagger: 0.06,
            // Clear inline transforms so hover expansion is never fighting the entrance tween.
            clearProps: "transform,opacity,visibility",
            scrollTrigger: { trigger: ".cat-panels", start: "top 92%", once: true },
          },
        );
      }

      // Video opens from a smaller rounded window as it scrolls into view.
      if (exists(".video-showcase-frame video")) {
        gsap.fromTo(
          ".video-showcase-frame video",
          { clipPath: "inset(14% 10% 14% 10% round 28px)", scale: 0.94 },
          {
            clipPath: "inset(0% 0% 0% 0% round 28px)",
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: ".video-showcase", start: "top 85%", end: "center 55%", scrub: 0.6 },
          },
        );
      }

      // About: the photo is unveiled left to right, the tag slides in, the watermark drifts.
      if (exists(".about-teaser")) {
        gsap
          .timeline({ scrollTrigger: { trigger: ".about-teaser-visual", start: "top 90%", once: true } })
          .fromTo(
            ".about-teaser-frame",
            { clipPath: "inset(0% 100% 0% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 0.85, ease: "power3.inOut" },
          )
          .fromTo(".about-teaser-frame img", { scale: 1.15 }, { scale: 1, duration: 1, ease: "power3.out" }, 0)
          .fromTo(
            ".about-teaser-tag",
            { x: -40, autoAlpha: 0 },
            { x: 0, autoAlpha: 1, duration: 0.45, ease: "power2.out" },
            0.45,
          );
        gsap.fromTo(
          ".about-teaser-watermark",
          { yPercent: 40 },
          {
            yPercent: -40,
            ease: "none",
            scrollTrigger: { trigger: ".about-teaser", start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      }

      // Custom & bulk: the photo opens upward inside its arch.
      if (exists(".bulk-visual img")) {
        gsap.fromTo(
          ".bulk-visual img",
          { clipPath: "inset(100% 0% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.2,
            ease: "power3.inOut",
            scrollTrigger: { trigger: ".bulk-card", start: "top 80%", once: true },
          },
        );
      }

      // Values: the statement fills in word by word with the scroll, then the three values draw in.
      const statement = document.querySelector("[data-scrub-words]");
      if (statement) {
        const words = new SplitText(statement, { type: "words" });
        gsap.fromTo(
          words.words,
          { opacity: 0.3 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.1,
            scrollTrigger: { trigger: statement, start: "top 90%", end: "center 60%", scrub: 0.3 },
          },
        );
        gsap
          .timeline({ scrollTrigger: { trigger: ".values-row", start: "top 92%", once: true } })
          .fromTo(".value-line", { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power2.inOut", stagger: 0.08 })
          .fromTo(
            ".value-icon",
            { scale: 0, rotation: -90 },
            { scale: 1, rotation: 0, duration: 0.45, ease: "back.out(1.6)", stagger: 0.08 },
            0.15,
          )
          .fromTo(
            ".value h3, .value p",
            { y: 20, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.45, ease: "power2.out", stagger: 0.04 },
            0.2,
          );
      }
    });
    return () => mm.revert();
  });

  return null;
}
