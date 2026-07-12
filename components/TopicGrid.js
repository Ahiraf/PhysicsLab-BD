"use client";

import Link from "next/link";
import { useLanguage } from "./LanguageContext";

// Renders a grid of topic cards. Reused by BOTH paper menu pages and the home
// page — write once, use many. `basePath` is e.g. "/first-paper".
//
// Each topic carries both English and Bangla text (title/title_bn,
// blurb/blurb_bn). The navbar language toggle decides which shows. The optional
// `chapter` label is passed already-built as "Chapter N"; we localise it here.
export default function TopicGrid({ basePath, topics }) {
  const { lang } = useLanguage();
  const bn = lang === "bn";

  const chapterLabel = (label) => {
    if (!label || !bn) return label;
    // Turn "Chapter 4" into "অধ্যায় ৪" when in Bangla.
    const digits = "০১২৩৪৫৬৭৮৯";
    return label.replace("Chapter", "অধ্যায়").replace(/\d/g, (d) => digits[d]);
  };

  return (
    <div className="grid-3">
      {topics.map((t) => {
        const inner = (
          <>
            <div className="emoji">{t.emoji}</div>
            <div className="chapter">{chapterLabel(t.chapter)}</div>
            <h3>{bn && t.title_bn ? t.title_bn : t.title}</h3>
            <p>{bn && t.blurb_bn ? t.blurb_bn : t.blurb}</p>
            {!t.ready && (
              <span className="badge">{bn ? "শীঘ্রই আসছে" : "Coming soon"}</span>
            )}
          </>
        );

        // Ready topics link to their simulation; others are just shown greyed.
        return t.ready ? (
          <Link key={t.slug} href={`${basePath}/${t.slug}`} className="card">
            {inner}
          </Link>
        ) : (
          <div key={t.slug} className="card soon">
            {inner}
          </div>
        );
      })}
    </div>
  );
}
