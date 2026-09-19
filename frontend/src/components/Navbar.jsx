import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setMenuOpen(false), [location]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        .nav-link-pub { transition: color 0.2s; }
        .nav-link-pub:hover { color: #fff !important; }
        .nav-btn-primary {
          background: linear-gradient(135deg, #16a34a, #22c55e);
          transition: filter 0.2s, transform 0.15s;
        }
        .nav-btn-primary:hover { filter: brightness(1.1); transform: translateY(-1px); }
        .nav-btn-outline { transition: background 0.2s, border-color 0.2s; }
        .nav-btn-outline:hover {
          background: rgba(74,222,128,0.08) !important;
          border-color: rgba(74,222,128,0.5) !important;
        }
        .mobile-menu-item { transition: background 0.15s, color 0.15s; }
        .mobile-menu-item:hover { background: rgba(255,255,255,0.05) !important; color: #fff !important; }
      `}</style>

      <header
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
          background: scrolled ? "rgba(10,15,13,0.85)" : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(34,197,94,0.12)" : "none",
          transition: "all 0.3s ease",
        }}
        className="px-6 md:px-16 py-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-2.5">
          <div
            style={{
              width: 34, height: 34, borderRadius: 10,
              background: "linear-gradient(135deg, #16a34a, #4ade80)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 17,
            }}
          >
            🌿
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.3px" }}>
            Green<span style={{ color: "#4ade80" }}>Track</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {["Features", "Pricing", "About"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.target.style.color = "#fff")}
              onMouseLeave={(e) => (e.target.style.color = "rgba(255,255,255,0.6)")}
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", transition: "color 0.2s" }}
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="btn-primary"
            style={{ padding: "9px 20px", borderRadius: 10, fontSize: 14, fontWeight: 600, color: "#fff" }}
          >
            Get Started Free
          </Link>
        </div>
      </header>
    </>
  );
}
