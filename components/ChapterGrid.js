import Link from "next/link";

// Renders a grid of CHAPTER cards for a paper. Each card links to that
// chapter's simulation list at `${basePath}/ch/${chapter.slug}`.
export default function ChapterGrid({ basePath, chapters }) {
  return (
    <div className="grid-3">
      {chapters.map((c) => (
        <Link key={c.slug} href={`${basePath}/ch/${c.slug}`} className="card">
          <div className="emoji">{c.emoji}</div>
          <div className="chapter">Chapter {c.num}</div>
          <h3>{c.name}</h3>
          <p>{c.blurb}</p>
          <span className="badge">
            {c.sims.length} simulation{c.sims.length > 1 ? "s" : ""}
          </span>
        </Link>
      ))}
    </div>
  );
}
