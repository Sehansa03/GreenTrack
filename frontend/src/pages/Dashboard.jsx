
import { useEffect, useMemo, useState } from "react";
import { incomeAPI } from "../api/income";
import { expenseAPI } from "../api/expense";
import { authAPI } from "../api/auth";
import { useCurrency } from "../context/CurrencyContext";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const {
    currency: baseCurrency,
    convertAmount,
    loading: currencyLoading,
    ratesLoading,
  } = useCurrency();

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [incomeRes, expenseRes, profileRes] =
          await Promise.all([
            incomeAPI.getAll(),
            expenseAPI.getAll(),
            authAPI.getProfile(),
          ]);

        if (!active) return;

        const incomePayload = incomeRes.data;
        const expensePayload = expenseRes.data;

        const incomeRecords = Array.isArray(incomePayload)
          ? incomePayload
          : incomePayload?.data ?? incomePayload?.incomes ?? [];

        const expenseRecords = Array.isArray(expensePayload)
          ? expensePayload
          : expensePayload?.data ?? expensePayload?.expenses ?? [];

        setIncomes(
          Array.isArray(incomeRecords) ? incomeRecords : []
        );

        setExpenses(
          Array.isArray(expenseRecords) ? expenseRecords : []
        );

        const profile = profileRes.data;
        setUser(profile?.data ?? profile);
      } catch (err) {
        console.error("Dashboard load error:", err);

        if (active) {
          setError(
            err.response?.data?.message ||
              "Failed to load your financial overview."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const isCurrentMonth = (date) => {
    if (!date) return false;

    const value = new Date(date);

    return (
      !Number.isNaN(value.getTime()) &&
      value.getFullYear() === currentYear &&
      value.getMonth() === currentMonth
    );
  };

  const financials = useMemo(() => {
    let missingRate = false;

    const convertRecord = (record) => {
      const converted = convertAmount(
        record.amount,
        record.currency || baseCurrency
      );

      if (
        converted === null ||
        !Number.isFinite(Number(converted))
      ) {
        missingRate = true;
        return null;
      }

      return Number(converted);
    };

    let allIncome = 0;
    let allExpenses = 0;
    let monthlyIncome = 0;
    let monthlyExpenses = 0;

    const categoryTotals = {};
    const monthlyTrend = Array.from(
      { length: 12 },
      (_, index) => ({
        month: new Date(
          currentYear,
          index,
          1
        ).toLocaleString("en-US", { month: "short" }),
        amount: 0,
      })
    );

    incomes.forEach((income) => {
      const converted = convertRecord(income);
      if (converted === null) return;

      allIncome += converted;

      if (isCurrentMonth(income.date)) {
        monthlyIncome += converted;
      }
    });

    expenses.forEach((expense) => {
      const converted = convertRecord(expense);
      if (converted === null) return;

      allExpenses += converted;

      const date = new Date(expense.date);

      if (isCurrentMonth(expense.date)) {
        monthlyExpenses += converted;

        const category = expense.category || "Other";

        categoryTotals[category] =
          (categoryTotals[category] || 0) + converted;
      }

      if (
        !Number.isNaN(date.getTime()) &&
        date.getFullYear() === currentYear
      ) {
        monthlyTrend[date.getMonth()].amount += converted;
      }
    });

    return {
      balance: allIncome - allExpenses,
      monthlyIncome,
      monthlyExpenses,
      netSavings: monthlyIncome - monthlyExpenses,
      categoryTotals,
      monthlyTrend,
      missingRate,
    };
  }, [incomes, expenses, baseCurrency, convertAmount]);

  const formatMoney = (value) =>
    `${baseCurrency} ${Number(value).toLocaleString(
      undefined,
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;

  const displayMoney = (value) =>
    financials.missingRate
      ? "Rate unavailable"
      : formatMoney(value);

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const categoryEntries = Object.entries(
    financials.categoryTotals
  ).sort((a, b) => b[1] - a[1]);

  const maxTrend = Math.max(
    1,
    ...financials.monthlyTrend.map((item) => item.amount)
  );

  const busy = loading || currencyLoading || ratesLoading;

  return (
    <div style={page}>
      <div style={{ marginBottom: 32 }}>
        <p style={eyebrow}>FINANCIAL OVERVIEW</p>

        <h1 style={heading}>
          {getGreeting()}, {user?.fullName || "User"} 👋
        </h1>

        <p style={subtitle}>
          Here’s your financial overview for this month.
        </p>
      </div>

      {error && (
        <div style={errorBox}>{error}</div>
      )}

      {financials.missingRate && !busy && (
        <div style={warningBox}>
          Some exchange rates are unavailable. Financial
          totals cannot be calculated accurately.
        </div>
      )}

      <div style={statsGrid}>
        <StatCard
          title="Total Balance"
          value={
            busy
              ? "Loading..."
              : displayMoney(financials.balance)
          }
          subtitle="All-time income minus expenses"
        />

        <StatCard
          title="Monthly Income"
          value={
            busy
              ? "Loading..."
              : displayMoney(financials.monthlyIncome)
          }
          subtitle="Income received this month"
          color="#4ade80"
        />

        <StatCard
          title="Monthly Spend"
          value={
            busy
              ? "Loading..."
              : displayMoney(financials.monthlyExpenses)
          }
          subtitle="Expenses recorded this month"
          color="#f87171"
        />

        <StatCard
          title="Net Savings"
          value={
            busy
              ? "Loading..."
              : displayMoney(financials.netSavings)
          }
          subtitle="Monthly income minus spending"
          color={
            financials.netSavings < 0
              ? "#f87171"
              : "#4ade80"
          }
        />
      </div>

      <div style={chartsGrid}>
        <div style={cardStyle}>
          <h3 style={cardTitle}>Monthly Spending</h3>

          <p style={cardSub}>
            January – December {currentYear}
          </p>

          {busy ? (
            <div style={emptyChart}>Loading chart...</div>
          ) : financials.missingRate ? (
            <div style={emptyChart}>
              Exchange rates unavailable
            </div>
          ) : (
            <div style={barChart}>
              {financials.monthlyTrend.map((item) => (
                <div key={item.month} style={barColumn}>
                  <div style={barTrack}>
                    <div
                      title={`${item.month}: ${formatMoney(
                        item.amount
                      )}`}
                      style={{
                        ...bar,
                        height: `${
                          (item.amount / maxTrend) * 100
                        }%`,
                      }}
                    />
                  </div>

                  <span style={monthLabel}>
                    {item.month}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={cardStyle}>
          <h3 style={cardTitle}>Spending Breakdown</h3>

          <p style={cardSub}>This month</p>

          {busy ? (
            <div style={emptyChart}>Loading...</div>
          ) : financials.missingRate ? (
            <div style={emptyChart}>
              Exchange rates unavailable
            </div>
          ) : categoryEntries.length === 0 ? (
            <div style={emptyChart}>
              No expenses recorded this month
            </div>
          ) : (
            <div style={{ marginTop: 24 }}>
              {categoryEntries.map(([category, value]) => {
                const percentage =
                  financials.monthlyExpenses > 0
                    ? (value /
                        financials.monthlyExpenses) *
                      100
                    : 0;

                return (
                  <div
                    key={category}
                    style={{ marginBottom: 18 }}
                  >
                    <div style={categoryRow}>
                      <span>{category}</span>
                      <span>
                        {percentage.toFixed(1)}%
                      </span>
                    </div>

                    <div style={progressTrack}>
                      <div
                        style={{
                          ...progressFill,
                          width: `${Math.min(
                            percentage,
                            100
                          )}%`,
                        }}
                      />
                    </div>

                    <p style={categoryAmount}>
                      {formatMoney(value)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  color = "#f9fafb",
}) {
  return (
    <div style={statCard}>
      <p style={statTitle}>{title}</p>

      <h2
        style={{
          color,
          fontSize: 23,
          fontWeight: 700,
          margin: "12px 0 8px",
          overflowWrap: "anywhere",
        }}
      >
        {value}
      </h2>

      <p style={statSubtitle}>{subtitle}</p>
    </div>
  );
}

const page = {
  padding: "32px",
  minHeight: "100vh",
  background: "#080d0b",
  color: "#fff",
  fontFamily: "'DM Sans', system-ui, sans-serif",
};

const eyebrow = {
  color: "#4ade80",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 2,
  marginBottom: 10,
};

const heading = {
  fontSize: 28,
  fontWeight: 700,
  margin: "0 0 6px",
};

const subtitle = {
  color: "rgba(255,255,255,0.4)",
  fontSize: 14,
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 20,
  marginBottom: 28,
};

const statCard = {
  padding: 20,
  borderRadius: 16,
  background: "#101814",
  border: "1px solid rgba(255,255,255,0.06)",
};

const statTitle = {
  fontSize: 13,
  color: "rgba(255,255,255,0.45)",
  margin: 0,
};

const statSubtitle = {
  fontSize: 11,
  color: "rgba(255,255,255,0.35)",
  margin: 0,
};

const chartsGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(300px, 1fr))",
  gap: 24,
};

const cardStyle = {
  padding: 24,
  borderRadius: 18,
  background: "#101814",
  border: "1px solid rgba(255,255,255,0.06)",
  minWidth: 0,
};

const cardTitle = {
  fontSize: 16,
  fontWeight: 600,
  margin: 0,
};

const cardSub = {
  fontSize: 12,
  color: "rgba(255,255,255,0.4)",
  marginTop: 8,
};

const barChart = {
  display: "flex",
  alignItems: "stretch",
  gap: 8,
  height: 230,
  marginTop: 26,
};

const barColumn = {
  flex: 1,
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 8,
};

const barTrack = {
  height: 190,
  width: "100%",
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
  background: "rgba(255,255,255,0.025)",
  borderRadius: 6,
  overflow: "hidden",
};

const bar = {
  width: "75%",
  minHeight: 0,
  borderRadius: "6px 6px 0 0",
  background:
    "linear-gradient(180deg,#4ade80,#15803d)",
  transition: "height 0.3s ease",
};

const monthLabel = {
  fontSize: 10,
  color: "rgba(255,255,255,0.4)",
};

const categoryRow = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  fontSize: 12,
  color: "rgba(255,255,255,0.75)",
};

const progressTrack = {
  width: "100%",
  height: 6,
  borderRadius: 10,
  background: "rgba(255,255,255,0.07)",
  marginTop: 9,
  overflow: "hidden",
};

const progressFill = {
  height: "100%",
  background: "#4ade80",
  borderRadius: 10,
};

const categoryAmount = {
  fontSize: 11,
  color: "rgba(255,255,255,0.4)",
  marginTop: 6,
};

const emptyChart = {
  minHeight: 190,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  color: "rgba(255,255,255,0.4)",
  fontSize: 13,
};

const errorBox = {
  color: "#fca5a5",
  background: "rgba(248,113,113,0.08)",
  padding: 14,
  borderRadius: 10,
  marginBottom: 20,
};

const warningBox = {
  color: "#fbbf24",
  background: "rgba(251,191,36,0.08)",
  padding: 14,
  borderRadius: 10,
  marginBottom: 20,
};
