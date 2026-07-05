import Link from "next/link";

// The top navigation bar. Reused on every page via app/layout.js.
export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-inner container">
        <Link href="/" className="brand">
          🧪 PhysicsLab <span>BD</span>
        </Link>
        <nav className="nav-links">
          <Link href="/first-paper">1st Paper</Link>
          <Link href="/second-paper">2nd Paper</Link>
          <Link href="/about">About</Link>
        </nav>
      </div>
    </header>
  );
}
