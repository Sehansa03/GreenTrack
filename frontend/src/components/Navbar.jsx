
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import GreenTrackLogo from "./GreenTrackLogo";
import "./Navbar.css";

const links = [
  { label: "Features", href: "/#features" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "About", href: "/#about" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Update navbar appearance when scrolling
  useEffect(() => {
    const update = () => {
      setScrolled(window.scrollY > 20);
    };

    update();

    window.addEventListener("scroll", update, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", update);
    };
  }, []);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className={`gt-navbar ${scrolled ? "is-scrolled" : ""}`}>
      <div className="gt-navbar-inner">
        <GreenTrackLogo />

        <nav className="gt-nav-links" aria-label="Main navigation">
          {links.map((item) => (
            <a key={item.label} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="gt-nav-actions">
          <Link
            to="/login"
            className="gt-nav-signin"
            onClick={closeMenu}
          >
            Sign in
          </Link>

          <Link
            to="/register"
            className="gt-nav-cta"
            onClick={closeMenu}
          >
            Get started
          </Link>
        </div>

        <button
          type="button"
          className="gt-menu-toggle"
          onClick={() => setMenuOpen((value) => !value)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          aria-controls="gt-mobile-navigation"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {menuOpen && (
        <nav
          id="gt-mobile-navigation"
          className="gt-mobile-nav"
          aria-label="Mobile navigation"
        >
          {links.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={closeMenu}
            >
              {item.label}
            </a>
          ))}

          <Link to="/login" onClick={closeMenu}>
            Sign in
          </Link>

          <Link
            to="/register"
            className="gt-mobile-cta"
            onClick={closeMenu}
          >
            Get started
          </Link>
        </nav>
      )}
    </header>
  );
}
