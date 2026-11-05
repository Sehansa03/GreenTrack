
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { incomeAPI } from "../api/income";
import { expenseAPI } from "../api/expense";
import { authAPI } from "../api/auth";
import { useCurrency } from "../context/CurrencyContext";

import "./Dashboard.css";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// ============================================
// SPROUT - GREENTRACK FINANCIAL COMPANION
// ============================================

function Sprout({ size = 76 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      role="img"
      aria-label="Sprout, your GreenTrack financial companion"
    >
      <circle cx="60" cy="63" r="48" fill="#243A2E" />

      <path
        d="M60 60V36"
        stroke="#86EFAC"
        strokeWidth="5"
        strokeLinecap="round"
      />

      <path
        d="M60 46C39 46 30 34 30 18c20 0 30 10 30 28Z"
        fill="#4ADE80"
      />

      <path
        d="M60 39c0-20 12-28 31-28 0 19-10 28-31 28Z"
        fill="#A7F3D0"
      />

      <rect
        x="31"
        y="57"
        width="58"
        height="45"
        rx="19"
        fill="#34D399"
      />

      <circle cx="49" cy="77" r="3.2" fill="#123B29" />
      <circle cx="71" cy="77" r="3.2" fill="#123B29" />

      <path
        d="M54 86q6 7 12 0"
        stroke="#123B29"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      <circle cx="41" cy="85" r="5" fill="#FB7185" opacity=".2" />
      <circle cx="79" cy="85" r="5" fill="#FB7185" opacity=".2" />
    </svg>
  );
}

// ============================================
// FINANCIAL SUMMARY CARD
// ============================================

function SummaryCard({
  label,
  value,
  rawValue,
  description,
  icon,
  isAvailable = true,
}) {
  const isNegative =
    isAvailable &&
    typeof rawValue === "number" &&
    Number.isFinite(rawValue) &&
    rawValue < 0;

  return (
    <article
      className={`gd-summary-card ${
        isNegative ? "gd-value-negative" : ""
      }`}
    >
      <div className="gd-summary-top">
        <span>{label}</span>
        <span className="gd-summary-icon">{icon}</span>
      </div>

      <strong className="gd-summary-value">{value}</strong>
      <p>{description}</p>
    </article>
  );
}

// ============================================
// EMPTY STATE
// ============================================

function EmptyState({ title, description, to, action }) {
  return (
    <div className="gd-empty-state">
      <div className="gd-empty-symbol">✦</div>

      <strong>{title}</strong>
      <p>{description}</p>

      {to && (
        <Link to={to} className="gd-text-link">
          {action} →
        </Link>
      )}
    </div>
  );
}

// ============================================
// MAIN DASHBOARD
// ============================================

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddMenu, setShowAddMenu] = useState(false);
  const addMenuRef = useRef(null);

  const {
    currency: baseCurrency,
    convertAmount,
    loading: currencyLoading,
    ratesLoading,
  } = useCurrency();

  // Close transaction dropdown on outside click / Escape
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        addMenuRef.current &&
        !addMenuRef.current.contains(event.target)
      ) {
        setShowAddMenu(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowAddMenu(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Load income, expense and profile data
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
          : incomePayload?.data ??
            incomePayload?.incomes ??
            [];

        const expenseRecords = Array.isArray(expensePayload)
          ? expensePayload
          : expensePayload?.data ??
            expensePayload?.expenses ??
            [];

        setIncomes(
          Array.isArray(incomeRecords) ? incomeRecords : []
        );

        setExpenses(
          Array.isArray(expenseRecords) ? expenseRecords : []
        );

        const profile = profileRes.data;

        setUser(
          profile?.data ??
          profile?.user ??
          profile
        );
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

  // Calculate totals in preferred currency
  const financials = useMemo(() => {
    let missingRate = false;

    const isCurrentMonth = (date) => {
      if (!date) return false;

      const value = new Date(date);

      return (
        !Number.isNaN(value.getTime()) &&
        value.getFullYear() === currentYear &&
        value.getMonth() === currentMonth
      );
    };

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

    const monthlyTrend = MONTHS.map((month) => ({
      month,
      amount: 0,
    }));

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
  }, [
    incomes,
    expenses,
    baseCurrency,
    convertAmount,
    currentYear,
    currentMonth,
  ]);

  const busy = loading || currencyLoading || ratesLoading;
  const hasTransactions = incomes.length + expenses.length > 0;
  const valuesAvailable = !busy && !error && !financials.missingRate;

  const formatMoney = (amount) =>
    `${baseCurrency || ""} ${Number(amount).toLocaleString(
      undefined,
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;

  const displayMoney = (amount) => {
    if (busy) return "Loading...";
    if (error) return "Unavailable";
    if (financials.missingRate) return "Rate unavailable";

    return formatMoney(amount);
  };

  const greeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const firstName =
    user?.fullName?.trim().split(/\s+/)[0] || "there";

  const categoryEntries = Object.entries(
    financials.categoryTotals
  ).sort((a, b) => b[1] - a[1]);

  const maxTrend = Math.max(
    1,
    ...financials.monthlyTrend.map((item) => item.amount)
  );

  const hasYearlyExpenses = financials.monthlyTrend.some(
    (item) => item.amount > 0
  );

  // Sprout message changes based on financial data
  const sproutMessage = useMemo(() => {
    if (busy) {
      return {
        title: "Getting your finances ready...",
        description: "I'm preparing your financial overview.",
        action: null,
      };
    }

    if (error) {
      return {
        title: "Let's get things back on track.",
        description:
          "Some financial information couldn't be loaded. Please refresh the page.",
        action: null,
      };
    }

    if (financials.missingRate) {
      return {
        title: "A quick currency update is needed.",
        description:
          "Some exchange rates are unavailable right now. Your totals may need a moment to update.",
        action: null,
      };
    }

    if (!hasTransactions) {
      return {
        title: "Welcome to GreenTrack!",
        description:
          "I'm Sprout! Start by recording your first transaction, and we'll grow your financial habits together.",
        action: { label: "Get started", path: "/income" },
      };
    }

    if (financials.netSavings < 0) {
      return {
        title: "Let's improve your monthly balance.",
        description:
          "Your spending is higher than your recorded income this month. Reviewing your budget can help.",
        action: { label: "View budgets", path: "/budgets" },
      };
    }

    if (financials.netSavings > 0) {
      return {
        title: "You're making great progress!",
        description:
          "You've saved some money this month. Keep tracking your transactions and building good habits.",
        action: { label: "View insights", path: "/charts" },
      };
    }

    return {
      title: "Small steps make a big difference.",
      description:
        "Keep recording your transactions to understand your finances better.",
      action: { label: "View insights", path: "/charts" },
    };
  }, [
    busy,
    error,
    financials.missingRate,
    financials.netSavings,
    hasTransactions,
  ]);

  return (
    <div className="gd-dashboard">
      {/* Header */}
      <header className="gd-header">
        <div>
          <span className="gd-eyebrow">OVERVIEW</span>

          <h1>
            {greeting()}, {firstName} <span>👋</span>
          </h1>

          <p>Your finances at a glance.</p>
        </div>

        <div className="gd-header-actions" ref={addMenuRef}>
          <button
            type="button"
            className="gd-button gd-button-primary"
            onClick={() => setShowAddMenu((prev) => !prev)}
            aria-expanded={showAddMenu}
            aria-haspopup="true"
          >
            + Add Transaction
          </button>

          {showAddMenu && (
            <div className="gd-add-dropdown">
              <Link
                to="/income"
                onClick={() => setShowAddMenu(false)}
              >
                <span>↙</span> Add Income
              </Link>

              <Link
                to="/expense"
                onClick={() => setShowAddMenu(false)}
              >
                <span>↗</span> Add Expense
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Error alerts */}
      {error && (
        <div className="gd-alert gd-alert-error" role="alert">
          {error}
        </div>
      )}

      {!busy && financials.missingRate && (
        <div className="gd-alert gd-alert-warning" role="alert">
          Some exchange rates are unavailable. Financial totals
          cannot be calculated accurately.
        </div>
      )}

      {/* Sprout - Always visible */}
      <section className="gd-sprout-companion">
        <div className="gd-sprout-avatar">
          <Sprout size={76} />
        </div>

        <div className="gd-sprout-content">
          <span className="gd-sprout-label">
            SPROUT · YOUR FINANCIAL COMPANION
          </span>

          <h3>{sproutMessage.title}</h3>
          <p>{sproutMessage.description}</p>
        </div>

        {sproutMessage.action && (
          <Link
            to={sproutMessage.action.path}
            className="gd-sprout-action"
          >
            {sproutMessage.action.label}
            <span aria-hidden="true">→</span>
          </Link>
        )}
      </section>

      {/* Financial summary */}
      <section
        className="gd-summary-grid"
        aria-label="Financial summary"
      >
        <SummaryCard
          label="Total Balance"
          value={displayMoney(financials.balance)}
          rawValue={financials.balance}
          isAvailable={valuesAvailable}
          description="Overall income minus spending"
          icon="◈"
        />

        <SummaryCard
          label="Monthly Income"
          value={displayMoney(financials.monthlyIncome)}
          rawValue={financials.monthlyIncome}
          isAvailable={valuesAvailable}
          description="Money received this month"
          icon="↙"
        />

        <SummaryCard
          label="Monthly Spending"
          value={displayMoney(financials.monthlyExpenses)}
          rawValue={financials.monthlyExpenses}
          isAvailable={valuesAvailable}
          description="Money spent this month"
          icon="↗"
        />

        <SummaryCard
          label="Monthly Savings"
          value={displayMoney(financials.netSavings)}
          rawValue={financials.netSavings}
          isAvailable={valuesAvailable}
          description="Income minus spending this month"
          icon="◎"
        />
      </section>

      {/* Financial charts */}
      <section className="gd-charts-grid">
        {/* Monthly spending */}
        <article className="gd-panel">
          <div className="gd-panel-header">
            <div>
              <h2>Spending Activity</h2>
              <p>Monthly expenses in {currentYear}</p>
            </div>

            <span className="gd-panel-tag">
              {baseCurrency}
            </span>
          </div>

          {busy ? (
            <EmptyState
              title="Loading your activity"
              description="Preparing your financial overview..."
            />
          ) : error || financials.missingRate ? (
            <EmptyState
              title="Chart unavailable"
              description="Financial data could not be calculated."
            />
          ) : !hasYearlyExpenses ? (
            <EmptyState
              title="No spending to show yet"
              description="Your spending chart will appear when you record expenses."
              to="/expense"
              action="Record an expense"
            />
          ) : (
            <div
              className="gd-chart"
              role="img"
              aria-label={`Monthly spending chart for ${currentYear}`}
            >
              {financials.monthlyTrend.map((item) => (
                <div
                  className="gd-chart-column"
                  key={item.month}
                >
                  <div className="gd-chart-track">
                    <div
                      className="gd-chart-bar"
                      style={{
                        height: `${
                          (item.amount / maxTrend) * 100
                        }%`,
                      }}
                      title={`${item.month}: ${formatMoney(
                        item.amount
                      )}`}
                    />
                  </div>

                  <span>{item.month}</span>
                </div>
              ))}
            </div>
          )}
        </article>

        {/* Spending by category */}
        <article className="gd-panel">
          <div className="gd-panel-header">
            <div>
              <h2>Where Your Money Goes</h2>
              <p>Spending by category this month</p>
            </div>

            <Link
              to="/charts"
              className="gd-panel-link"
            >
              Analytics →
            </Link>
          </div>

          {busy ? (
            <EmptyState
              title="Loading categories"
              description="Preparing your spending breakdown..."
            />
          ) : error || financials.missingRate ? (
            <EmptyState
              title="Breakdown unavailable"
              description="Financial data could not be calculated."
            />
          ) : categoryEntries.length === 0 ? (
            <EmptyState
              title="Nothing recorded this month"
              description="Add an expense to understand your spending habits."
            />
          ) : (
            <div className="gd-categories">
              {categoryEntries.map(([category, value]) => {
                const percentage =
                  financials.monthlyExpenses > 0
                    ? (value / financials.monthlyExpenses) * 100
                    : 0;

                return (
                  <div className="gd-category" key={category}>
                    <div className="gd-category-heading">
                      <strong>{category}</strong>
                      <span>{percentage.toFixed(1)}%</span>
                    </div>

                    <div
                      className="gd-progress-track"
                      role="progressbar"
                      aria-label={`${category} spending`}
                      aria-valuenow={percentage}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className="gd-progress-fill"
                        style={{
                          width: `${Math.min(100, percentage)}%`,
                        }}
                      />
                    </div>

                    <small>{formatMoney(value)}</small>
                  </div>
                );
              })}
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
