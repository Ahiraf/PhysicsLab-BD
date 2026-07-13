"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "./LanguageContext";

// The top navigation bar. Reused on every page via app/layout.js.
// On phones the links collapse behind a ☰ hamburger button so the bar never
// wraps into an untidy pile; on wider screens they always show.
export default function Navbar() {
  const { lang, toggle } = useLanguage();
  const pathname = usePathname();
  const [open, setOpen] = useState(false); // mobile menu open?

  const t =
    lang === "bn"
      ? { first: "১ম পত্র", second: "২য় পত্র", about: "পরিচিতি" }
      : { first: "1st Paper", second: "2nd Paper", about: "About" };

  // Highlight the section you're currently in.
  const links = [
    { href: "/first-paper", label: t.first },
    { href: "/second-paper", label: t.second },
    { href: "/about", label: t.about },
  ];
  const isActive = (href) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="navbar">
      <div className="navbar-inner container">
        <Link href="/" className="brand" onClick={() => setOpen(false)}>
          🧪 PhysicsLab <span>BD</span>
        </Link>

        {/* Hamburger — only visible on small screens (see globals.css). */}
        <button
          className="nav-toggle"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? "✕" : "☰"}
        </button>

        <nav className={`nav-links ${open ? "open" : ""}`}>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={isActive(l.href) ? "active" : ""}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
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
