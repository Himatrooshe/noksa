"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "./icons";

type Props = { title: string; caption: string; url: string };

/**
 * Home page video section. The clip plays muted and looped only while it is on
 * screen, never autoplays for visitors who prefer reduced motion, and offers a
 * sound toggle plus a pause control.
 */
/** ImageKit resizes, crops to landscape and compresses the clip; other hosts get the original. */
function deliveryUrls(url: string) {
  if (!url.startsWith("https://ik.imagekit.io/")) return { src: url, poster: undefined };
  return {
    src: `${url}?tr=w-1600,h-1000,q-60`,
    poster: `${url}/ik-thumbnail.jpg?tr=w-1600,h-1000`,
  };
}

export function VideoShowcase({ title, caption, url }: Props) {
  const { src, poster } = deliveryUrls(url);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReducedMotion(reduce);
    if (reduce) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => setPlaying(false));
        else video.pause();
      },
      { threshold: 0.35 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  function toggleSound() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
    if (video.paused) video.play().catch(() => undefined);
  }

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => undefined);
    else video.pause();
  }

  return (
    <section className="video-showcase" aria-labelledby="video-showcase-title">
      <div className="container video-showcase-inner">
        <div className="video-showcase-copy">
          <p className="eyebrow">Noksa in motion</p>
          <h2 id="video-showcase-title">{title}</h2>
          {caption && <p className="video-showcase-caption">{caption}</p>}
          <Link href="/shop" className="button video-showcase-button">
            Shop the collection <Icon name="arrow" />
          </Link>
        </div>
        <div className="video-showcase-frame">
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            muted
            loop
            playsInline
            preload="metadata"
            controls={reducedMotion}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            aria-label={title}
          />
          {!reducedMotion && (
            <div className="video-showcase-controls">
              <button type="button" onClick={togglePlay} aria-label={playing ? "Pause video" : "Play video"}>
                {playing ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3v14H7zM14 5h3v14h-3z" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
                )}
              </button>
              <button type="button" onClick={toggleSound} aria-label={muted ? "Turn sound on" : "Turn sound off"}>
                {muted ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" /><path className="stroke" d="M16 9l5 6M21 9l-5 6" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" /><path className="stroke" d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" /></svg>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
