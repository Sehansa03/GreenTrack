
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { authAPI } from "../api/auth";
import ProfileModal from "./ProfileModal";
import "./Sidebar.css";

function Icon({ name, size = 20 }) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const paths = {
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    income: <path d="M12 19V5m0 0-5 5m5-5 5 5M4 20h16" />,
    expense: <path d="M12 5v14m0 0-5-5m5 5 5-5M4 4h16" />,
    analytics: <path d="M4 20v-8m6 8V5m6 15v-9m4 9V8" />,
    budgets: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </>
    ),
    reports: (
      <>
        <path d="M7 3h8l5 5v13H7a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Z" />
        <path d="M14 3v6h6M9 14h6M9 18h6" />
      </>
    ),
    logout: (
      <>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="m16 17 5-5-5-5M21 12H9" />
      </>
    ),
    chevron: <path d="m15 18-6-6 6-6" />,
    close: <path d="M18 6 6 18M6 6l12 12" />,
  };

  return <svg {...props}>{paths[name]}</svg>;
}

function BrandLogo() {
  return (
    <span className="gt-brand-mark">
      <svg
        width="29"
        height="29"
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M16 26V13"
          stroke="#E9FFF0"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M16 19C9 19 6 15 6 9c7 0 10 4 10 10Z"
          fill="#A7F3D0"
        />
        <path
          d="M16 15c0-7 4-10 10-10 0 7-3 10-10 10Z"
          fill="#DCFCE7"
        />
        <path
          d="M10 26h12"
          stroke="#E9FFF0"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: "dashboard" },
  { label: "Income", path: "/income", icon: "income" },
  { label: "Expense", path: "/expense", icon: "expense" },
  { label: "Analytics", path: "/charts", icon: "analytics" },
  { label: "Budgets", path: "/budgets", icon: "budgets" },
  { label: "Reports", path: "/reports", icon: "reports" },
];

export default function Sidebar({
  collapsed = false,
  onToggle,
  mobileOpen = false,
  onMobileClose,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);


const loadUser = async () => {
  try {
    const res = await authAPI.getProfile();

    const profile =
      res.data?.data?.user ||
      res.data?.data ||
      res.data?.user ||
      res.data;

    setUser(profile);
  } catch (error) {
    console.error("Failed to load profile:", error);
  }
};

useEffect(() => {
  let active = true;

  const fetchProfile = async () => {
    try {
      const res = await authAPI.getProfile();

      if (!active) return;

      const profile =
        res.data?.data?.user ||
        res.data?.data ||
        res.data?.user ||
        res.data;

      setUser(profile);
    } catch (error) {
      if (active) {
        console.error("Failed to load profile:", error);
      }
    }
  };

  fetchProfile();

  return () => {
    active = false;
  };
}, []);


  const closeMobile = () => {
    onMobileClose?.();
  };


const handleLogout = () => {
  localStorage.removeItem("token");
  closeMobile();
  setUser(null);
  navigate("/login", { replace: true });
};


  const initials = (user?.fullName || "User")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <>
      <aside
        className={[
          "gt-sidebar",
          "gt-sidebar-compact",
          "gt-sidebar-dark",
          collapsed ? "gt-sidebar-collapsed" : "",
          mobileOpen ? "gt-sidebar-mobile-open" : "",
        ].join(" ")}
        aria-label="Main navigation"
      >
        {/* Brand */}
        <div className="gt-sidebar-top">
          <Link
            to="/dashboard"
            className="gt-sidebar-brand"
            onClick={closeMobile}
          >
            <BrandLogo />

            <span className="gt-sidebar-brand-text">
              Green<span>Track</span>
            </span>
          </Link>

          <button
            type="button"
            className="gt-sidebar-toggle"
            onClick={onToggle}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Icon name="chevron" size={17} />
          </button>

          <button
            type="button"
            className="gt-sidebar-close"
            onClick={closeMobile}
            aria-label="Close navigation"
          >
            <Icon name="close" />
          </button>
        </div>

        {/* Navigation */}
        <div className="gt-sidebar-scroll">
          <div className="gt-sidebar-section-label">
            MENU
          </div>

          <nav className="gt-sidebar-nav">
            {navItems.map((item) => {
              const active =
                location.pathname === item.path ||
                location.pathname.startsWith(`${item.path}/`);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeMobile}
                  className={`gt-nav-link ${
                    active ? "gt-nav-active" : ""
                  }`}
                  title={collapsed ? item.label : undefined}
                  aria-current={active ? "page" : undefined}
                >
                  <span className="gt-nav-icon">
                    <Icon name={item.icon} />
                  </span>

                  <span className="gt-nav-text">
                    <strong>{item.label}</strong>
                  </span>

                  {active && (
                    <span className="gt-nav-active-dot" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Account */}
        <div className="gt-sidebar-bottom">
          <button
            type="button"
            className="gt-profile-button"
            onClick={() => {
              closeMobile();
              setShowProfile(true);
            }}
            title="My profile"
          >
            <span className="gt-profile-avatar">
              {initials}
            </span>

            <span className="gt-profile-info">
              <strong>
                {user?.fullName || "My Profile"}
              </strong>

              <small>
                {user?.email || "Account settings"}
              </small>
            </span>

            <span className="gt-profile-arrow">›</span>
          </button>

          <button
            type="button"
            className="gt-logout-button"
            onClick={handleLogout}
            title="Sign out"
          >
            <Icon name="logout" size={18} />
            <span className="gt-logout-text">
              Sign out
            </span>
          </button>
        </div>
      </aside>

      {showProfile && (
        <ProfileModal
          onClose={() => {
            setShowProfile(false);
            loadUser();
          }}
        />
      )}
    </>
  );
}
