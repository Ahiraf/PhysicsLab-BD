"use client";

import Link from "next/link";
import TopicGrid from "./TopicGrid";
import { useLanguage } from "./LanguageContext";

const bnNum = (n) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);

// Client body for a single chapter's simulation list (e.g.
// /first-paper/ch/dynamics). The server page keeps SEO metadata + static params
// and passes the chapter here so headings and cards follow the language toggle.
export default function ChapterView({ paper, chapter }) {
  const { lang } = useLanguage();
  const bn = lang === "bn";

  const paperLabel = bn ? paper.label_bn : paper.label;
  const chapterName = bn && chapter.name_bn ? chapter.name_bn : chapter.name;
  const count = chapter.sims.length;

  // Adapt the chapter's sims to the shape TopicGrid expects.
  const topics = chapter.sims.map((s) => ({
    ...s,
    ready: true,
    chapter: `Chapter ${chapter.num}`,
  }));

  return (
    <>
      <nav className="breadcrumb">
        <Link href="/">{bn ? "হোম" : "Home"}</Link>
        {" › "}
        <Link href={paper.path}>{paperLabel}</Link>
        {" › "}
        {chapterName}
      </nav>
      <h1 className="section-title" style={{ marginTop: 4 }}>
        {chapter.emoji} {chapterName}
      </h1>
      <p className="section-sub">
        {bn
          ? `অধ্যায় ${bnNum(chapter.num)} · ${bnNum(count)}টি সিমুলেশন — খুলতে যেকোনো একটিতে চাপ দাও।`
          : `Chapter ${chapter.num} · ${count} simulation${count > 1 ? "s" : ""} — tap one to open it.`}
      </p>
      <TopicGrid basePath={paper.path} topics={topics} />
    </>
  );
}
