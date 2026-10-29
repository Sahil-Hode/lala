'use client';

import { useEffect, useRef } from 'react';

interface HeroProps {
  siteName: string;
  siteTagline: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCta: string;
}

export default function Hero({
  siteName,
  siteTagline,
  heroTitle,
  heroSubtitle,
  heroCta,
}: HeroProps) {
  const glitchRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = glitchRef.current;
    if (!el) return;
    const interval = setInterval(() => {
      el.style.transform = `translate(${(Math.random() - 0.5) * 4}px, ${(Math.random() - 0.5) * 2}px)`;
      setTimeout(() => {
        if (el) el.style.transform = '';
      }, 80);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="hero">
      <div className="hero-visual" aria-hidden="true" />
      <div className="hero-radar" aria-hidden="true">
        <div className="radar-sweep" />
      </div>
      <div className="hero-content">
        <p className="hero-tagline">{siteTagline}</p>
        <h1 className="brand-mark">
          {siteName} <span ref={glitchRef} className="glitch">◆</span>
        </h1>
        <h2 className="hero-title">{heroTitle}</h2>
        <p className="hero-sub">{heroSubtitle}</p>
        <a className="btn" href="#intel">
          {heroCta} <span className="btn-arrow">→</span>
        </a>
      </div>
    </section>
  );
}
