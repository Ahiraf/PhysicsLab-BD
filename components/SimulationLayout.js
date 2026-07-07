"use client";

import Link from "next/link";
import { useLanguage } from "./LanguageContext";

// The shared template for EVERY simulation page:
//   animation (left) + controls (right) + explanation (below).
// Each simulation passes in its own canvas, controls and explanation.
//
// Explanations are bilingual: pass the English JSX as `explanation` and the
// Bangla JSX as `explanationBn`. The site language (from the navbar toggle)
// decides which one shows. If a Bangla version isn't given yet, English shows.
export default function SimulationLayout({
  title,
  breadcrumb = [],
  canvas,
  controls,
  explanation,
  explanationBn,
}) {
  const { lang } = useLanguage();
  const bn = lang === "bn";
  const body = bn && explanationBn ? explanationBn : explanation;

  return (
    <article className="sim">
      <nav className="breadcrumb">
        <Link href="/">{bn ? "হোম" : "Home"}</Link>
        {breadcrumb.map((b, i) => (
          <span key={i}>
            {" › "}
            {b.href ? <Link href={b.href}>{b.label}</Link> : b.label}
          </span>
        ))}
      </nav>

      <h1 className="sim-title">{title}</h1>

      <div className="sim-grid">
        <div className="sim-canvas-wrap">{canvas}</div>
        <aside className="sim-controls">{controls}</aside>
      </div>

      <section className="sim-explain">
        <h2>{bn ? "📖 পদার্থবিজ্ঞান" : "📖 The Physics"}</h2>
        {body}
      </section>
    </article>
  );
}
