"use client";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

/** Entrance and scroll motion for the About page; skipped for reduced-motion visitors. */
export function AboutMotion() {
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const title = new SplitText(".about-hero h1", { type: "words", mask: "words" });
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .fromTo(".about-hero .eyebrow", { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4 })
        .fromTo(title.words, { yPercent: 110 }, { yPercent: 0, duration: 0.6, stagger: 0.05 }, "-=0.2")
        .fromTo(".about-hero-intro", { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5 }, "-=0.4");

      gsap.utils.toArray<HTMLElement>(".about-split").forEach((section) => {
        const media = section.querySelector<HTMLElement>(".about-split-media");
        const img = media?.querySelector("img");
        const fromLeft = section.classList.contains("about-split-reverse");
        if (media && img) {
          gsap.fromTo(
            media,
            { clipPath: fromLeft ? "inset(0% 100% 0% 0%)" : "inset(0% 0% 0% 100%)" },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 0.9,
              ease: "power3.inOut",
              scrollTrigger: { trigger: section, start: "top 90%", once: true },
            },
          );
          gsap.fromTo(
            img,
            { scale: 1.2, yPercent: -5 },
            {
              scale: 1.2,
              yPercent: 5,
              ease: "none",
              scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true },
            },
          );
        }
        gsap
          .timeline({ scrollTrigger: { trigger: section, start: "top 88%", once: true } })
          .fromTo(
            section.querySelector(".about-split-number"),
            { x: fromLeft ? 40 : -40, autoAlpha: 0 },
            { x: 0, autoAlpha: 1, duration: 0.5, ease: "power2.out" },
          )
          .fromTo(
            section.querySelectorAll(".about-split-copy > :not(.about-split-number)"),
            { y: 20, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.5, ease: "power2.out", stagger: 0.04 },
            0.1,
          );
      });

      gsap.fromTo(
        ".about-cta-inner > *",
        { y: 20, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.5,
          ease: "power2.out",
          stagger: 0.06,
          scrollTrigger: { trigger: ".about-cta", start: "top 92%", once: true },
        },
      );
    });
    return () => mm.revert();
  });
  return null;
}
