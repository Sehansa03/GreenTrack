
import { lazy, Suspense, useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { CurrencyProvider } from "./context/CurrencyContext";
import "./AppLayout.css";

// Lazy-load page components
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Income = lazy(() => import("./pages/Income/Income"));
const Expense = lazy(() => import("./pages/Expense/Expense"));
const Analytics = lazy(() => import("./pages/Analytics/Analytics"));
const Budgets = lazy(() => import("./pages/Budgets/Budgets"));
const Reports = lazy(() => import("./pages/Reports/Reports"));

// Shared components
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";

// Loading screen for lazy-loaded pages
function PageLoader() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "16px",
        background: "#0C1110",
        color: "#F2F5F3",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: "42px",
          height: "42px",
          border: "4px solid #28342D",
          borderTop: "4px solid #35B978",
          borderRadius: "50%",
          animation: "gt-loading-spin 0.8s linear infinite",
        }}
      />

      <p style={{ color: "#93A29A", fontSize: "14px" }}>
        Loading GreenTrack...
      </p>
    </div>
  );
}

// Public pages layout
function PublicLayout({ children }) {
  return (
    <div className="gt-public-layout">
      <Navbar />
      <main className="gt-public-main">{children}</main>
      <Footer />
    </div>
  );
}

// Authenticated application layout
function AppLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu using the Escape key
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const onEscape = (event) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", onEscape);

    return () => {
      document.removeEventListener("keydown", onEscape);
    };
  }, [mobileMenuOpen]);

  // Close mobile navigation
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Toggle desktop sidebar
  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  return (
    <div className="gt-app-layout">
      {/* Mobile sidebar backdrop */}
      {mobileMenuOpen && (
        <button
          type="button"
          className="gt-sidebar-backdrop"
          aria-label="Close navigation"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        mobileOpen={mobileMenuOpen}
        onMobileClose={closeMobileMenu}
      />

      {/* Main application content */}
      <div className="gt-app-content">
        {/* Mobile header */}
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

          {/* Mobile brand */}
          <Link
            to="/dashboard"
            className="gt-mobile-brand"
            onClick={closeMobileMenu}
          >
            <span className="gt-mobile-brand-icon">
              🌿
            </span>
            Green<span>Track</span>
          </Link>

          {/* Mobile income shortcut */}
          <Link
            to="/income"
            className="gt-mobile-add-button"
            aria-label="Go to income"
            onClick={closeMobileMenu}
          >
            +
          </Link>
        </header>

        {/* Page content */}
        <main className="gt-page-content">
          {children}
        </main>
      </div>
    </div>
  );
}

// 404 page
function NotFound() {
  return (
    <PublicLayout>
      <div className="gt-not-found">
        <div className="gt-not-found-icon">
          🌿
        </div>

        <h1>Oops! Wrong turn.</h1>

        <p>
          We couldn't find that page. Let's get you
          back on track.
        </p>

        <Link to="/" className="gt-primary-button">
          Back to home
        </Link>
      </div>
    </PublicLayout>
  );
}

// Main application
export default function App() {
  return (
    <CurrencyProvider>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
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

          {/* Application routes */}
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

          {/* 404 fallback */}
          <Route
            path="*"
            element={<NotFound />}
          />
        </Routes>
      </Suspense>
    </CurrencyProvider>
  );
}
