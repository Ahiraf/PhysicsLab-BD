import "./globals.css";
import Navbar from "../components/Navbar";
import { LanguageProvider } from "../components/LanguageContext";

// This metadata is what shows up in the browser tab and in Google search
// results — the start of "SEO". Each page can override it.
export const metadata = {
  title: "PhysicsLab BD — Interactive HSC Physics Simulations",
  description:
    "Free interactive physics simulations for Bangladesh HSC students, " +
    "covering Physics 1st and 2nd paper topics like projectile motion, " +
    "the simple pendulum and Ohm's law.",
};

// The root layout wraps EVERY page, so the navbar and footer appear everywhere
// without repeating them on each page.
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <Navbar />
          <main className="container">{children}</main>
          <footer className="footer">
            PhysicsLab BD · Interactive physics for HSC students · Built with Next.js
          </footer>
        </LanguageProvider>
      </body>
    </html>
  );
}
