import { useEffect, useState } from "react";
export default function Dashboard() {
    const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

    const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div
      style={{
        padding: "32px",
        color: "#fff",
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      {/* ── Header ───────────────────────────────── */}
      <div style={{ marginBottom: 32 }}>
  <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>
    {getGreeting()}, {user?.fullName || "User"} 👋
  </h1>

  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>
    Here’s your financial overview for this month.
  </p>
</div>

      {/* ── Stats Cards ───────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 20,
          marginBottom: 28,
        }}
      >
        <StatCard title="Total Balance" value="$12,480.00" change="+4.2%" />
        <StatCard title="Monthly Income" value="$5,350.00" change="+8.1%" />
        <StatCard title="Monthly Spend" value="$3,245.00" change="-12.3%" negative />
        <StatCard title="Net Savings" value="$2,105.00" change="+22%" />
      </div>

      {/* ── Charts Section ───────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 24,
        }}
      >
        {/* Monthly Spending Chart */}
        <div style={cardStyle}>
          <h3 style={cardTitle}>Monthly Spending</h3>
          <p style={cardSub}>Jan – Oct 2024</p>

          {/* Placeholder chart */}
          <div
            style={{
              height: 220,
              marginTop: 20,
              borderRadius: 12,
              background:
                "linear-gradient(180deg, rgba(34,197,94,0.2), rgba(34,197,94,0.05))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,0.35)",
              fontSize: 14,
            }}
          >
            📈 Line chart goes here
          </div>
        </div>

        {/* Spending Breakdown */}
        <div style={cardStyle}>
          <h3 style={cardTitle}>Spending Breakdown</h3>
          <p style={cardSub}>This month</p>

          <ul style={{ listStyle: "none", padding: 0, marginTop: 20 }}>
            {[
              ["Housing", "34%"],
              ["Food", "22%"],
              ["Transport", "14%"],
              ["Entertainment", "10%"],
              ["Utilities", "12%"],
              ["Other", "8%"],
            ].map(([label, value]) => (
              <li
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 10,
                  fontSize: 14,
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                <span>{label}</span>
                <span>{value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ── Reusable Components ───────────────────────── */

function StatCard({ title, value, change, negative }) {
  return (
    <div
      style={{
        padding: 20,
        borderRadius: 16,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{title}</p>

      <h2 style={{ fontSize: 24, fontWeight: 700, margin: "8px 0" }}>
        {value}
      </h2>

      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: negative ? "#ef4444" : "#22c55e",
        }}
      >
        {change}
      </span>
    </div>
  );
}

/* ── Styles ───────────────────────────────────── */

const cardStyle = {
  padding: 24,
  borderRadius: 18,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.06)",
};

const cardTitle = {
  fontSize: 16,
  fontWeight: 600,
};

const cardSub = {
  fontSize: 12,
  color: "rgba(255,255,255,0.4)",
};