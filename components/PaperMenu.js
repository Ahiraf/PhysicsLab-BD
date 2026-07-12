"use client";

import ChapterGrid from "./ChapterGrid";
import { useLanguage } from "./LanguageContext";

// Client body for a paper's chapter menu (e.g. /first-paper). The server page
// keeps the SEO metadata and passes the paper object in here so the heading,
// breadcrumb and chapter grid can all follow the language toggle.
export default function PaperMenu({ paper }) {
  const { lang } = useLanguage();
  const bn = lang === "bn";
  const paperLabel = bn ? paper.label_bn : paper.label;

  return (
    <>
      <nav className="breadcrumb">
        {bn ? "হোম" : "Home"} › {paperLabel}
      </nav>
      <h1 className="section-title" style={{ marginTop: 4 }}>
        {paper.emoji} {paperLabel}
      </h1>
      <p className="section-sub">
        {bn
          ? "সিমুলেশন দেখতে একটি অধ্যায় বেছে নাও।"
          : "Pick a chapter to see its simulations."}
      </p>
      <ChapterGrid basePath={paper.path} chapters={paper.chapters} />
    </>
  );
}
