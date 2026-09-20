import { Routes, Route } from "react-router-dom";
import { useState } from "react";


import Landing   from "./pages/Landing";
import Login     from "./pages/Login";
import Register  from "./pages/Register";
import Dashboard from "./pages/Dashboard";

//for income page
import Income from "./pages/Income/Income";
//for expense page
import Expense from "./pages/Expense/Expense";


import Navbar  from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Footer  from "./components/Footer";

// ─────────────────────────────────────────────────────────
// PUBLIC LAYOUT — Navbar + Footer
// Used by: Landing, Login, Register
// ─────────────────────────────────────────────────────────
function PublicLayout({ children }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#0a0f0d" }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// APP LAYOUT — Collapsible Sidebar
// Used by: Dashboard (and future pages like /add, /history)
// ─────────────────────────────────────────────────────────
function AppLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0a0f0d" }}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// APP ROUTES
// ─────────────────────────────────────────────────────────
export default function App() {
  return (
    
      <Routes>

        {/* Public pages — show Navbar + Footer */}
        <Route path="/"         element={<PublicLayout><Landing  /></PublicLayout>} />
        <Route path="/login"    element={<PublicLayout><Login    /></PublicLayout>} />
        <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />

        {/* App pages  */}
        <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/income"    element={<AppLayout><Income    /></AppLayout>} />
        <Route path="/expense" element={<AppLayout><Expense /></AppLayout>} />

        {/* 404 fallback */}
        <Route path="*" element={
          <PublicLayout>
            <div style={{
              minHeight: "70vh", display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", textAlign: "center",
              fontFamily: "'DM Sans',sans-serif", color: "#fff", padding: "0 24px",
            }}>
              <p style={{ fontSize: 64, lineHeight: 1, marginBottom: 0 }}>🌿</p>
              <h1 style={{ fontSize: 40, fontWeight: 700, margin: "16px 0 8px", letterSpacing: "-1px" }}>
                404
              </h1>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", marginBottom: 32 }}>
                Page not found.
              </p>
              <a href="/" style={{
                padding: "11px 28px", borderRadius: 10, textDecoration: "none",
                background: "linear-gradient(135deg,#16a34a,#22c55e)",
                color: "#fff", fontSize: 14, fontWeight: 600,
              }}>
                Back to home
              </a>
            </div>
          </PublicLayout>
        } />

      </Routes>
   
  );
}
