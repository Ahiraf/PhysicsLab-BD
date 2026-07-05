import Link from "next/link";

// The shared template for EVERY simulation page:
//   animation (left) + controls (right) + explanation (below).
// Each simulation passes in its own canvas, controls and explanation.
export default function SimulationLayout({
  title,
  breadcrumb = [],
  canvas,
  controls,
  explanation,
}) {
  return (
    <article className="sim">
      <nav className="breadcrumb">
        <Link href="/">Home</Link>
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
        <h2>📖 The Physics</h2>
        {explanation}
      </section>
    </article>
  );
}
