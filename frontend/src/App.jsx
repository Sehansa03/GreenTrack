
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { CurrencyProvider } from "./context/CurrencyContext";
import "./AppLayout.css";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Income from "./pages/Income/Income";
import Expense from "./pages/Expense/Expense";
import Analytics from "./pages/Analytics/Analytics";
import Budgets from "./pages/Budgets/Budgets";
import Reports from "./pages/Reports/Reports";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";

function PublicLayout({ children }) {
  return (
    <div className="gt-public-layout">
      <Navbar />
      <main className="gt-public-main">{children}</main>
      <Footer />
    </div>
  );
}

function AppLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const onEscape = (event) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };

    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [mobileMenuOpen]);

  return (
    <div className="gt-app-layout">
      {mobileMenuOpen && (
        <button
          type="button"
          className="gt-sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="gt-app-content">
        <header className="gt-mobile-header">
          <button
            type="button"
            className="gt-mobile-menu-button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <span />
            <span />
            <span />
          </button>

          <Link to="/dashboard" className="gt-mobile-brand">
            <span className="gt-mobile-brand-icon">🌿</span>
            Green<span>Track</span>
          </Link>

          <Link
            to="/income"
            className="gt-mobile-add-button"
            aria-label="Go to income"
          >
            +
          </Link>
        </header>

        <main className="gt-page-content">{children}</main>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <PublicLayout>
      <div className="gt-not-found">
        <div className="gt-not-found-icon">🌿</div>
        <h1>Oops! Wrong turn.</h1>
        <p>
          We couldn't find that page. Let's get you back on track.
        </p>
        <Link to="/" className="gt-primary-button">
          Back to home
        </Link>
      </div>
    </PublicLayout>
  );
}

export default function App() {
  return (
    <CurrencyProvider>
      <Routes>
        <Route
          path="/"
          element={
            <PublicLayout>
              <Landing />
            </PublicLayout>
          }
        />

        <Route
          path="/login"
          element={
            <PublicLayout>
              <Login />
            </PublicLayout>
          }
        />

        <Route
          path="/register"
          element={
            <PublicLayout>
              <Register />
            </PublicLayout>
          }
        />

        <Route
          path="/dashboard"
          element={
            <AppLayout>
              <Dashboard />
            </AppLayout>
          }
        />

        <Route
          path="/income"
          element={
            <AppLayout>
              <Income />
            </AppLayout>
          }
        />

        <Route
          path="/expense"
          element={
            <AppLayout>
              <Expense />
            </AppLayout>
          }
        />

        <Route
          path="/charts"
          element={
            <AppLayout>
              <Analytics />
            </AppLayout>
          }
        />

        <Route
          path="/budgets"
          element={
            <AppLayout>
              <Budgets />
            </AppLayout>
          }
        />

        <Route
          path="/reports"
          element={
            <AppLayout>
              <Reports />
            </AppLayout>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </CurrencyProvider>
  );
}
