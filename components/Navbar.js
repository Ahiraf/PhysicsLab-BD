"use client";

import Link from "next/link";
import { useLanguage } from "./LanguageContext";

// The top navigation bar. Reused on every page via app/layout.js.
export default function Navbar() {
  const { lang, toggle } = useLanguage();
  const t =
    lang === "bn"
      ? { first: "১ম পত্র", second: "২য় পত্র", about: "পরিচিতি" }
      : { first: "1st Paper", second: "2nd Paper", about: "About" };

  return (
    <header className="navbar">
      <div className="navbar-inner container">
        <Link href="/" className="brand">
          🧪 PhysicsLab <span>BD</span>
        </Link>
        <nav className="nav-links">
          <Link href="/first-paper">{t.first}</Link>
          <Link href="/second-paper">{t.second}</Link>
          <Link href="/about">{t.about}</Link>
          {/* Flip the whole site between English and Bangla. */}
          <button
            className="lang-toggle"
            onClick={toggle}
            aria-label="Toggle language"
            title={lang === "en" ? "বাংলায় দেখুন" : "View in English"}
          >
            {lang === "en" ? "বাংলা" : "EN"}
          </button>
        </nav>
      </div>
    </header>
  );
}
