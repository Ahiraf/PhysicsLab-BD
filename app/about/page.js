export const metadata = {
  title: "About — PhysicsLab BD",
  description: "About PhysicsLab BD, interactive physics simulations for HSC students.",
};

export default function AboutPage() {
  return (
    <>
      <nav className="breadcrumb">Home › About</nav>
      <h1 className="section-title" style={{ marginTop: 4 }}>ℹ️ About PhysicsLab BD</h1>
      <div className="sim-explain" style={{ marginTop: 16 }}>
        <p>
          <b>PhysicsLab BD</b> is a free collection of interactive physics
          simulations for Bangladesh HSC students. Instead of only reading
          formulas, you can move sliders and watch the physics happen.
        </p>
        <p>
          It covers topics from Physics 1st and 2nd paper. Each simulation shows
          a live animation, the values you control, and the formula behind it.
        </p>
        <p style={{ color: "var(--muted)", marginBottom: 0 }}>
          Built with Next.js as a learning and portfolio project.
        </p>
      </div>
    </>
  );
}
