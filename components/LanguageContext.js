"use client";

// A tiny global "which language" store, shared by every page.
// Default is English (matches the original site); the user can flip to Bangla
// with the toggle in the navbar. The choice is saved in localStorage so it
// sticks between visits.
import { createContext, useContext, useEffect, useState } from "react";

const LanguageContext = createContext({ lang: "en", toggle: () => {} });

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("en");

  // Restore the saved choice on first load (client only).
  useEffect(() => {
    const saved = typeof window !== "undefined" && localStorage.getItem("lang");
    if (saved === "bn" || saved === "en") setLang(saved);
  }, []);

  const toggle = () =>
    setLang((current) => {
      const next = current === "en" ? "bn" : "en";
      if (typeof window !== "undefined") localStorage.setItem("lang", next);
      return next;
    });

  return (
    <LanguageContext.Provider value={{ lang, toggle }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Handy hook so any component can read the language or flip it.
export const useLanguage = () => useContext(LanguageContext);
