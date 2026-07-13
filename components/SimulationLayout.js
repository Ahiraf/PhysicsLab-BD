"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "./LanguageContext";
import { findSimNeighbours } from "../data/topics";
import AskAI from "./AskAI";

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

  // Look up the previous/next simulation from the current URL so students can
  // step through a paper without going back to the chapter list each time.
  const pathname = usePathname();
  const { prev, next } = findSimNeighbours(pathname);
  const simTitle = (s) => (bn && s.title_bn ? s.title_bn : s.title);

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

      {/* Strip a leading emoji from the title so the AI gets a clean topic. */}
      <AskAI topic={title.replace(/^[^\p{L}]+/u, "").trim() || title} />

      {/* Step to the previous / next simulation in this paper. */}
      {(prev || next) && (
        <nav className="sim-nav" aria-label={bn ? "সিমুলেশন নেভিগেশন" : "Simulation navigation"}>
          {prev ? (
            <Link href={prev.href} className="sim-nav-link prev">
              <span className="sim-nav-dir">{bn ? "‹ পূর্ববর্তী" : "‹ Previous"}</span>
              <span className="sim-nav-title">
                {prev.emoji} {simTitle(prev)}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={next.href} className="sim-nav-link next">
              <span className="sim-nav-dir">{bn ? "পরবর্তী ›" : "Next ›"}</span>
              <span className="sim-nav-title">
                {next.emoji} {simTitle(next)}
              </span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </article>
  );
}
