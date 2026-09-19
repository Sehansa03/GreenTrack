export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <>
      {/* ── Footer ───────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "40px 24px",
          background: "#080d0b",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            gap: 24,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>🌿</span>
            <span style={{ fontWeight: 700, fontSize: 16 }}>
              Green<span style={{ color: "#4ade80" }}>Track</span>
            </span>
          </div>

          {/* Copyright */}
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", margin: 0 }}>
            Built with 💚 by Sehansa · Advanced Expense Tracker · © {year}
          </p>

          {/* Links */}
          <div style={{ display: "flex", gap: 24 }}>
            {["Privacy", "Terms", "Contact"].map((l) => (
              <a
                key={l}
                href="#"
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.35)",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.color = "#fff")}
                onMouseLeave={(e) =>
                  (e.target.style.color = "rgba(255,255,255,0.35)")
                }
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}