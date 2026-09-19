import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { authAPI } from "../api/auth";

const navItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 13h8V3H3v10Zm10 8h8V11h-8v10ZM3 21h8V15H3v6Zm10-18v6h8V3h-8Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
   {
    label: "Income",
    path: "/income",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3v18m0-18 5 5m-5-5-5 5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
   {
    label: "Expense",
    path: "/expense",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 21V3m0 18-5-5m5 5 5-5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    label: "History",
    path: "/history",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 3v5h5M3.05 13a9 9 0 1 0 .95-4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    label: "Analytics",
    path: "/charts",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 20V10M10 20V4M16 20v-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    label: "Budgets",
    path: "/budgets",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path
          d="M12 7v5l3 3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    label: "Reports",
    path: "/reports",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    ),
  },
];

// Accept collapsed + onToggle props from Dashboard/layout
export default function Sidebar({ collapsed = false, onToggle }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await authAPI.getProfile();
        setUser(res.data);
      } catch (err) {
        console.error("Failed to load user", err);
      }
    };

    loadUser();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        .sb-link { transition: background 0.15s, color 0.15s, border-color 0.15s; text-decoration: none; }
        .sb-link:hover:not(.sb-active) {
          background: rgba(255,255,255,0.05) !important;
          color: rgba(255,255,255,0.8) !important;
        }
        .sb-signout { transition: color 0.15s, border-color 0.15s, background 0.15s; }
        .sb-signout:hover {
          color: #f87171 !important;
          border-color: rgba(248,113,113,0.25) !important;
          background: rgba(248,113,113,0.05) !important;
        }
        .sb-toggle { transition: background 0.15s, color 0.15s; }
        .sb-toggle:hover { background: rgba(255,255,255,0.08) !important; color: rgba(255,255,255,0.8) !important; }
      `}</style>

      <aside style={{
        width: collapsed ? 64 : 220,
        minHeight: "100vh",
        background: "#080d0b",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
        overflow: "hidden",
        fontFamily: "'DM Sans','Segoe UI',sans-serif",
        position: "relative",
        zIndex: 20,
      }}>

        {/* ── Logo row ───────────────────────────────── */}
        <div style={{
          height: 64,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center",
          padding: collapsed ? "0" : "0 16px",
          justifyContent: collapsed ? "center" : "space-between",
          flexShrink: 0,
        }}>
          {/* Logo */}
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none", minWidth: 0 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9, flexShrink: 0,
              background: "linear-gradient(135deg,#16a34a,#22c55e)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16,
            }}>🌿</div>
            {!collapsed && (
              <span style={{
                fontSize: 16, fontWeight: 700, color: "#fff",
                letterSpacing: "-0.2px", whiteSpace: "nowrap",
              }}>
                Green<span style={{ color: "#4ade80" }}>Track</span>
              </span>
            )}
          </Link>

          {/* Collapse / expand toggle */}
          {onToggle && (
            <button
              className="sb-toggle"
              onClick={onToggle}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 7,
                width: collapsed ? 32 : 26,
                height: collapsed ? 32 : 26,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
                color: "rgba(255,255,255,0.3)",
                flexShrink: 0,
                marginLeft: collapsed ? 0 : 8,
              }}
            >
              {collapsed ? (
                // Right arrow = expand
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="9,18 15,12 9,6"/>
                </svg>
              ) : (
                // Left arrow = collapse
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="15,18 9,12 15,6"/>
                </svg>
              )}
            </button>
          )}
        </div>

        {/* ── Nav items ──────────────────────────────── */}
        <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto", overflowX: "hidden" }}>
          {/* Section label */}
          {!collapsed && (
            <p style={{
              fontSize: 10, fontWeight: 600, letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.2)",
              padding: "4px 8px 8px",
              margin: 0,
            }}>
              Main menu
            </p>
          )}

          {navItems.map(({ label, path, icon }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={label}
                to={path}
                className={`sb-link${active ? " sb-active" : ""}`}
                title={collapsed ? label : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: collapsed ? "center" : "flex-start",
                  gap: 10,
                  padding: collapsed ? "11px 0" : "9px 10px",
                  borderRadius: 10,
                  marginBottom: 2,
                  background: active ? "rgba(74,222,128,0.1)" : "transparent",
                  border: `1px solid ${active ? "rgba(74,222,128,0.2)" : "transparent"}`,
                  color: active ? "#4ade80" : "rgba(255,255,255,0.42)",
                  fontSize: 13.5,
                  fontWeight: active ? 600 : 400,
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ flexShrink: 0 }}>{icon}</span>
                {!collapsed && (
                  <>
                    <span style={{ flex: 1 }}>{label}</span>
                    {/* Active dot */}
                    {active && (
                      <span style={{
                        width: 5, height: 5, borderRadius: "50%",
                        background: "#4ade80", flexShrink: 0,
                      }} />
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── User + sign out ────────────────────────── */}
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: collapsed ? "12px 8px" : "12px 10px",
          flexShrink: 0,
        }}>
          {/* User row — only when expanded */}
         {!collapsed && user && (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "9px 10px",
      borderRadius: 10,
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.06)",
      marginBottom: 8,
    }}
  >
    {/* AVATAR */}
    <div
      style={{
        width: 30,
        height: 30,
        borderRadius: "50%",
        background: user.avatar
          ? `url(${user.avatar})`
          : "linear-gradient(135deg,#16a34a,#4ade80)",
        backgroundSize: "cover",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 700,
        fontSize: 12,
      }}
    >
      {!user.avatar && (user.fullName?.[0] || "U")}
    </div>

    {/* NAME + INFO */}
    <div style={{ minWidth: 0, flex: 1 }}>
      <p
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "#fff",
          margin: 0,
        }}
      >
        {user.fullName}
      </p>

      <p
        style={{
          fontSize: 11,
          color: "rgba(255,255,255,0.3)",
          margin: 0,
        }}
      >
        {user.email}
      </p>
    </div>
  </div>
)}

          {/* Sign out */}
          <button
            className="sb-signout"
            onClick={() => navigate("/login")}
            title={collapsed ? "Sign out" : undefined}
            style={{
              width: "100%",
              padding: collapsed ? "10px 0" : "9px 10px",
              borderRadius: 9,
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.3)",
              fontSize: 13,
              cursor: "pointer",
              display: "flex", alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-start",
              gap: 8,
              fontFamily: "'DM Sans',sans-serif",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            {!collapsed && "Sign out"}
          </button>
        </div>
      </aside>
    </>
  );
}
