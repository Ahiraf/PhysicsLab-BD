import Link from "next/link";

// Renders a grid of topic cards. Reused by BOTH paper menu pages — write once,
// use twice. `basePath` is e.g. "/first-paper".
export default function TopicGrid({ basePath, topics }) {
  return (
    <div className="grid-3">
      {topics.map((t) => {
        const inner = (
          <>
            <div className="emoji">{t.emoji}</div>
            <div className="chapter">{t.chapter}</div>
            <h3>{t.title}</h3>
            <p>{t.blurb}</p>
            {!t.ready && <span className="badge">Coming soon</span>}
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
