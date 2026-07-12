"use client";

import Link from "next/link";
import TopicGrid from "../components/TopicGrid";
import { firstPaper, secondPaper } from "../data/topics";
import { useLanguage } from "../components/LanguageContext";

const bnNum = (n) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);

export default function Home() {
  const { lang } = useLanguage();
  const bn = lang === "bn";

  // A few featured simulations, pulled from the chapter data by slug.
  const pick = (paper, slugs) =>
    paper.chapters
      .flatMap((c) => c.sims)
      .filter((s) => slugs.includes(s.slug))
      .map((s) => ({ ...s, ready: true, chapter: "" }));

  const featuredFirst = pick(firstPaper, ["projectile-motion", "orbits", "waves"]);
  const featuredSecond = pick(secondPaper, ["ohms-law", "lens", "hubble-law"]);

  const countSims = (paper) => paper.chapters.reduce((n, c) => n + c.sims.length, 0);
  const num = (n) => (bn ? bnNum(n) : n);

  return (
    <>
      <section className="hero">
        <span className="pill">
          {bn ? "বাংলাদেশের HSC শিক্ষার্থীদের জন্য" : "For Bangladesh HSC students"}
        </span>
        <h1>{bn ? "খেলার ছলে পদার্থবিজ্ঞান শেখো 🧪" : "Learn physics by playing with it 🧪"}</h1>
        <p>
          {bn
            ? "পদার্থবিজ্ঞান ১ম ও ২য় পত্রের ইন্টারেক্টিভ সিমুলেশন, অধ্যায় অনুসারে সাজানো। স্লাইডার নাড়াও, অ্যানিমেশন দেখো, আর সূত্রগুলো জীবন্ত হয়ে উঠতে দেখো।"
            : "Interactive simulations for Physics 1st & 2nd paper, organised chapter by chapter. Move the sliders, watch the animation, and see the formulas come alive."}
        </p>
      </section>

      <div className="grid">
        <Link href="/first-paper" className="card">
          <div className="emoji">📘</div>
          <h3>{bn ? firstPaper.label_bn : firstPaper.label}</h3>
          <p>
            {bn
              ? `${num(firstPaper.chapters.length)}টি অধ্যায় · ${num(countSims(firstPaper))}টি সিমুলেশন — গতি, শক্তি, মহাকর্ষ, তরঙ্গ ও আরও অনেক কিছু।`
              : `${firstPaper.chapters.length} chapters · ${countSims(firstPaper)} simulations — motion, energy, gravitation, waves and more.`}
          </p>
        </Link>
        <Link href="/second-paper" className="card">
          <div className="emoji">📗</div>
          <h3>{bn ? secondPaper.label_bn : secondPaper.label}</h3>
          <p>
            {bn
              ? `${num(secondPaper.chapters.length)}টি অধ্যায় · ${num(countSims(secondPaper))}টি সিমুলেশন — তড়িৎ, আলোকবিজ্ঞান, আধুনিক পদার্থবিজ্ঞান ও জ্যোতির্পদার্থবিজ্ঞান।`
              : `${secondPaper.chapters.length} chapters · ${countSims(secondPaper)} simulations — electricity, optics, modern physics and astrophysics.`}
          </p>
        </Link>
      </div>

      <h2 className="section-title">{bn ? "জনপ্রিয় সিমুলেশন" : "Popular simulations"}</h2>
      <p className="section-sub">
        {bn ? "সরাসরি একটি চালু সিমুলেশনে ঢুকে পড়ো।" : "Jump straight into a working simulation."}
      </p>
      <TopicGrid basePath="/first-paper" topics={featuredFirst} />
      <div style={{ height: 16 }} />
      <TopicGrid basePath="/second-paper" topics={featuredSecond} />
    </>
  );
}
