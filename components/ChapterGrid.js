"use client";

import Link from "next/link";
import { useLanguage } from "./LanguageContext";

// Renders a grid of CHAPTER cards for a paper. Each card links to that
// chapter's simulation list at `${basePath}/ch/${chapter.slug}`. Chapter names
// and blurbs are shown in the site language chosen from the navbar toggle.
const bnDigits = (n) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);

export default function ChapterGrid({ basePath, chapters }) {
  const { lang } = useLanguage();
  const bn = lang === "bn";

  return (
    <div className="grid-3">
      {chapters.map((c) => (
        <Link key={c.slug} href={`${basePath}/ch/${c.slug}`} className="card">
          <div className="emoji">{c.emoji}</div>
          <div className="chapter">
            {bn ? `অধ্যায় ${bnDigits(c.num)}` : `Chapter ${c.num}`}
          </div>
          <h3>{bn && c.name_bn ? c.name_bn : c.name}</h3>
          <p>{bn && c.blurb_bn ? c.blurb_bn : c.blurb}</p>
          <span className="badge">
            {bn
              ? `${bnDigits(c.sims.length)}টি সিমুলেশন`
              : `${c.sims.length} simulation${c.sims.length > 1 ? "s" : ""}`}
          </span>
        </Link>
      ))}
    </div>
  );
}
