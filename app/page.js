import Link from "next/link";
import TopicGrid from "../components/TopicGrid";
import { firstPaper, secondPaper } from "../data/topics";

export default function Home() {
  // A few featured simulations, pulled from the chapter data by slug.
  const pick = (paper, slugs) =>
    paper.chapters
      .flatMap((c) => c.sims)
      .filter((s) => slugs.includes(s.slug))
      .map((s) => ({ ...s, ready: true, chapter: "" }));

  const featuredFirst = pick(firstPaper, ["projectile-motion", "orbits", "waves"]);
  const featuredSecond = pick(secondPaper, ["ohms-law", "lens", "hubble-law"]);

  const countSims = (paper) => paper.chapters.reduce((n, c) => n + c.sims.length, 0);

  return (
    <>
      <section className="hero">
        <span className="pill">For Bangladesh HSC students</span>
        <h1>Learn physics by playing with it 🧪</h1>
        <p>
          Interactive simulations for Physics 1st &amp; 2nd paper, organised
          chapter by chapter. Move the sliders, watch the animation, and see the
          formulas come alive.
        </p>
      </section>

      <div className="grid">
        <Link href="/first-paper" className="card">
          <div className="emoji">📘</div>
          <h3>Physics 1st Paper</h3>
          <p>
            {firstPaper.chapters.length} chapters · {countSims(firstPaper)} simulations —
            motion, energy, gravitation, waves and more.
          </p>
        </Link>
        <Link href="/second-paper" className="card">
          <div className="emoji">📗</div>
          <h3>Physics 2nd Paper</h3>
          <p>
            {secondPaper.chapters.length} chapters · {countSims(secondPaper)} simulations —
            electricity, optics, modern physics and astrophysics.
          </p>
        </Link>
      </div>

      <h2 className="section-title">Popular simulations</h2>
      <p className="section-sub">Jump straight into a working simulation.</p>
      <TopicGrid basePath="/first-paper" topics={featuredFirst} />
      <div style={{ height: 16 }} />
      <TopicGrid basePath="/second-paper" topics={featuredSecond} />
    </>
  );
}
