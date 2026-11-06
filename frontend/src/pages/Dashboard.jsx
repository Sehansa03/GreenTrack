
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { incomeAPI } from "../api/income";
import { expenseAPI } from "../api/expense";
import { authAPI } from "../api/auth";
import { useCurrency } from "../context/CurrencyContext";

import "./Dashboard.css";

/* ============================================
   DATE AND DATA HELPERS
============================================ */

function getDateKey(value) {
  if (!value) return "";

  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}/.test(value)
  ) {
    return value.slice(0, 10);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDateParts(value) {
  const key = getDateKey(value);

  if (!key) return null;

  const [year, month, day] = key.split("-").map(Number);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  return {
    year,
    month: month - 1,
    day,
  };
}

function isInMonth(value, year, month) {
  const parts = getDateParts(value);

  return (
    parts?.year === year &&
    parts?.month === month
  );
}

function formatTransactionDate(value) {
  const parts = getDateParts(value);

  if (!parts) return "Date unavailable";

  const date = new Date(
    parts.year,
    parts.month,
    parts.day
  );

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getTransactionTitle(item) {
  if (item.transactionType === "income") {
    return item.source || item.title || "Income";
  }

  return item.category || item.title || "Expense";
}

function getTransactionDescription(item) {
  return item.description || "";
}

/* ============================================
   SPROUT - FINANCIAL COMPANION
============================================ */

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

      <circle
        cx="41"
        cy="85"
        r="5"
        fill="#FB7185"
        opacity=".2"
      />

      <circle
        cx="79"
        cy="85"
        r="5"
        fill="#FB7185"
        opacity=".2"
      />
    </svg>
  );
}

/* ============================================
   SUMMARY CARD
============================================ */

function SummaryCard({
  label,
  value,
  rawValue,
  description,
  icon,
  comparison,
  isAvailable = true,
  tone = "default",
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
      } gd-tone-${tone}`}
    >
      <div className="gd-summary-top">
        <span>{label}</span>

        <span className="gd-summary-icon">
          {icon}
        </span>
      </div>

      <strong className="gd-summary-value">
        {value}
      </strong>

      <p>{description}</p>

      {comparison && isAvailable && (
        <div className="gd-summary-comparison">
          <span
            className={`gd-comparison-badge ${
              comparison.direction === "up"
                ? "up"
                : comparison.direction === "down"
                ? "down"
                : "neutral"
            }`}
          >
            {comparison.direction === "up"
              ? "↑"
              : comparison.direction === "down"
              ? "↓"
              : "—"}{" "}
            {comparison.text}
          </span>

          <span className="gd-comparison-label">
            vs. last month
          </span>
        </div>
      )}
    </article>
  );
}

/* ============================================
   EMPTY STATE
============================================ */

function EmptyState({
  title,
  description,
  to,
  action,
}) {
  return (
    <div className="gd-empty-state">
      <div className="gd-empty-symbol">
        ✦
      </div>

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

/* ============================================
   DASHBOARD
============================================ */

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
    hasRate,
    loading: currencyLoading,
    ratesLoading,
  } = useCurrency();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentMonthShort = now.toLocaleString("en-US", { month: "short" });

  const previousMonthDate = new Date(
    currentYear,
    currentMonth - 1,
    1
  );

  const previousYear = previousMonthDate.getFullYear();
  const previousMonth = previousMonthDate.getMonth();

  const busy =
    loading || currencyLoading || ratesLoading;

  /* ============================================
     CLOSE ADD TRANSACTION DROPDOWN
  ============================================ */

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        addMenuRef.current &&
        !addMenuRef.current.contains(event.target)
      ) {
        setShowAddMenu(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setShowAddMenu(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  /* ============================================
     LOAD DASHBOARD DATA
  ============================================ */

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const [
          incomeResponse,
          expenseResponse,
          profileResponse,
        ] = await Promise.all([
          incomeAPI.getAll(),
          expenseAPI.getAll(),
          authAPI.getProfile(),
        ]);

        if (!active) return;

        const incomePayload = incomeResponse.data;
        const expensePayload = expenseResponse.data;

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
          Array.isArray(incomeRecords)
            ? incomeRecords
            : []
        );

        setExpenses(
          Array.isArray(expenseRecords)
            ? expenseRecords
            : []
        );

        const profile = profileResponse.data;

        setUser(
          profile?.data ??
          profile?.user ??
          profile
        );
      } catch (err) {
        console.error(
          "Dashboard load error:",
          err
        );

        if (active) {
          setError(
            err.response?.data?.message ||
              "Failed to load your financial overview."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  /* ============================================
     CURRENCY HELPERS
  ============================================ */

  function convertRecord(record) {
    const originalCurrency =
      record.currency || baseCurrency;

    if (!hasRate(originalCurrency)) {
      return null;
    }

    const converted = convertAmount(
      record.amount,
      originalCurrency
    );

    if (
      converted == null ||
      !Number.isFinite(Number(converted))
    ) {
      return null;
    }

    return Number(converted);
  }

  function formatMoney(amount) {
    return `${baseCurrency || ""} ${Number(
      amount
    ).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  function displayMoney(amount) {
    if (busy) return "Loading...";
    if (error) return "Unavailable";

    if (financials.missingRate) {
      return "Rate unavailable";
    }

    return formatMoney(amount);
  }

  /* ============================================
     FINANCIAL CALCULATIONS
  ============================================ */

  const financials = useMemo(() => {
    let missingRate = false;

    let allIncome = 0;
    let allExpenses = 0;

    let monthlyIncome = 0;
    let monthlyExpenses = 0;

    let previousIncome = 0;
    let previousExpenses = 0;

    incomes.forEach((income) => {
      const originalCurrency =
        income.currency || baseCurrency;

      if (!hasRate(originalCurrency)) {
        missingRate = true;
        return;
      }

      const converted = convertAmount(
        income.amount,
        originalCurrency
      );

      if (
        converted == null ||
        !Number.isFinite(Number(converted))
      ) {
        missingRate = true;
        return;
      }

      const amount = Number(converted);

      allIncome += amount;

      if (
        isInMonth(
          income.date,
          currentYear,
          currentMonth
        )
      ) {
        monthlyIncome += amount;
      }

      if (
        isInMonth(
          income.date,
          previousYear,
          previousMonth
        )
      ) {
        previousIncome += amount;
      }
    });

    expenses.forEach((expense) => {
      const originalCurrency =
        expense.currency || baseCurrency;

      if (!hasRate(originalCurrency)) {
        missingRate = true;
        return;
      }

      const converted = convertAmount(
        expense.amount,
        originalCurrency
      );

      if (
        converted == null ||
        !Number.isFinite(Number(converted))
      ) {
        missingRate = true;
        return;
      }

      const amount = Number(converted);

      allExpenses += amount;

      if (
        isInMonth(
          expense.date,
          currentYear,
          currentMonth
        )
      ) {
        monthlyExpenses += amount;
      }

      if (
        isInMonth(
          expense.date,
          previousYear,
          previousMonth
        )
      ) {
        previousExpenses += amount;
      }
    });

    return {
      balance: allIncome - allExpenses,
      monthlyIncome,
      monthlyExpenses,
      netSavings:
        monthlyIncome - monthlyExpenses,
      previousIncome,
      previousExpenses,
      missingRate,
    };
  }, [
    incomes,
    expenses,
    baseCurrency,
    convertAmount,
    hasRate,
    currentYear,
    currentMonth,
    previousYear,
    previousMonth,
  ]);

  /* ============================================
     MONTHLY COMPARISONS
  ============================================ */

  function getComparison(current, previous) {
    if (previous === 0) {
      if (current === 0) {
        return {
          text: "No change",
          direction: "neutral",
        };
      }

      return {
        text: "New activity",
        direction: "neutral",
      };
    }

    const percentage =
      ((current - previous) / Math.abs(previous)) * 100;

    return {
      text: `${Math.abs(percentage).toFixed(1)}%`,
      direction:
        percentage > 0
          ? "up"
          : percentage < 0
          ? "down"
          : "neutral",
    };
  }

  const incomeComparison = getComparison(
    financials.monthlyIncome,
    financials.previousIncome
  );

  const expenseComparison = getComparison(
    financials.monthlyExpenses,
    financials.previousExpenses
  );

  /* ============================================
     RECENT TRANSACTIONS
  ============================================ */

  const recentTransactions = useMemo(() => {
    const incomeRecords = incomes.map((item) => ({
      ...item,
      transactionType: "income",
    }));

    const expenseRecords = expenses.map((item) => ({
      ...item,
      transactionType: "expense",
    }));

    return [...incomeRecords, ...expenseRecords]
      .sort((a, b) => {
        const dateA = getDateKey(
          a.date || a.createdAt
        );

        const dateB = getDateKey(
          b.date || b.createdAt
        );

        if (dateA !== dateB) {
          return dateB.localeCompare(dateA);
        }

        return String(b.createdAt || "").localeCompare(
          String(a.createdAt || "")
        );
      })
      .slice(0, 5);
  }, [incomes, expenses]);

  function getTransactionAmount(item) {
    if (busy) return "Loading...";
    if (error) return "Unavailable";

    const converted = convertRecord(item);

    if (converted === null) {
      return "Rate unavailable";
    }

    const prefix =
      item.transactionType === "income"
        ? "+"
        : "−";

    return `${prefix} ${formatMoney(converted)}`;
  }

  /* ============================================
     DISPLAY DATA
  ============================================ */

  const hasTransactions =
    incomes.length + expenses.length > 0;

  const valuesAvailable =
    !busy &&
    !error &&
    !financials.missingRate;

  // Build six consecutive calendar months, including the current month.
  // Use the same base-currency conversion as the summary cards.
  const incomeExpenseTrend = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(currentYear, currentMonth - (5 - index), 1);
      return {
        key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
        label: date.toLocaleDateString("en-US", { month: "short" }),
        year: date.getFullYear(),
        income: 0,
        expense: 0,
      };
    });

    const byMonth = new Map(months.map((item) => [item.key, item]));

    const accumulate = (records, field) => {
      records.forEach((record) => {
        const parts = getDateParts(record.date);
        if (!parts) return;
        const key = `${parts.year}-${String(parts.month + 1).padStart(2, "0")}`;
        const month = byMonth.get(key);
        if (!month) return;
        const originalCurrency = record.currency || baseCurrency;
        if (!hasRate(originalCurrency)) return;
        const converted = convertAmount(record.amount, originalCurrency);
        if (converted == null || !Number.isFinite(Number(converted))) return;
        month[field] += Number(converted);
      });
    };

    accumulate(incomes, "income");
    accumulate(expenses, "expense");
    return months;
  }, [incomes, expenses, baseCurrency, convertAmount, hasRate, currentYear, currentMonth]);

  const maxChartValue = Math.max(
    1,
    ...incomeExpenseTrend.flatMap((item) => [item.income, item.expense])
  );
  const hasChartActivity = incomeExpenseTrend.some(
    (item) => item.income !== 0 || item.expense !== 0
  );

  function greeting() {
    const hour = new Date().getHours();

    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";

    return "Good evening";
  }

  const firstName =
    user?.fullName?.trim().split(/\s+/)[0] ||
    "there";

  /* ============================================
     DYNAMIC SPROUT MESSAGE
  ============================================ */

  const sproutMessage = useMemo(() => {
    if (busy) {
      return {
        title: "Getting your finances ready...",
        description:
          "I'm preparing your financial overview.",
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
        title: "A currency update is needed.",
        description:
          "Some exchange rates are unavailable. Your financial totals cannot be calculated completely right now.",
        action: null,
      };
    }

    if (!hasTransactions) {
      return {
        title: "Welcome to GreenTrack!",
        description:
          "I'm Sprout! Start by recording your first transaction, and we'll grow your financial habits together.",
        action: {
          label: "Get started",
          path: "/income",
        },
      };
    }

    if (financials.netSavings < 0) {
      return {
        title: "Let's improve your monthly balance.",
        description:
          "Your recorded spending is higher than your income this month. Reviewing your budget may help.",
        action: {
          label: "View budgets",
          path: "/budgets",
        },
      };
    }

    if (financials.netSavings > 0) {
      return {
        title: "You're making great progress!",
        description:
          "Your recorded income is higher than your spending this month. Keep building consistent financial habits.",
        action: {
          label: "View insights",
          path: "/charts",
        },
      };
    }

    return {
      title: "Small steps make a big difference.",
      description:
        "Keep recording your transactions to understand your finances better.",
      action: {
        label: "View insights",
        path: "/charts",
      },
    };
  }, [
    busy,
    error,
    financials.missingRate,
    financials.netSavings,
    hasTransactions,
  ]);

  /* ============================================
     RENDER
  ============================================ */

  return (
    <div className="gd-dashboard">

      {/* HEADER */}
      <header className="gd-header">
        <div>
          <span className="gd-eyebrow">
            OVERVIEW
          </span>

          <h1>
            {greeting()}, {firstName}{" "}
            <span aria-hidden="true">👋</span>
          </h1>

          <p>Your finances at a glance.</p>
        </div>

        <div
          className="gd-header-actions"
          ref={addMenuRef}
        >
          <button
            type="button"
            className="gd-button gd-button-primary"
            onClick={() =>
              setShowAddMenu((prev) => !prev)
            }
            aria-expanded={showAddMenu}
            aria-haspopup="true"
          >
            + Add Transaction
          </button>

          {showAddMenu && (
            <div className="gd-add-dropdown">
              <Link
                to="/income"
                onClick={() =>
                  setShowAddMenu(false)
                }
              >
                <span>↙</span>
                Add Income
              </Link>

              <Link
                to="/expense"
                onClick={() =>
                  setShowAddMenu(false)
                }
              >
                <span>↗</span>
                Add Expense
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* ALERTS */}
      {error && (
        <div
          className="gd-alert gd-alert-error"
          role="alert"
        >
          {error}
        </div>
      )}

      {!busy &&
        !error &&
        financials.missingRate && (
          <div
            className="gd-alert gd-alert-warning"
            role="alert"
          >
            Some exchange rates are unavailable.
            Financial totals cannot be calculated accurately.
          </div>
        )}

      {/* SPROUT COMPANION */}
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

      {/* SUMMARY CARDS */}
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
          icon="◇"
        />

        <SummaryCard
          label={`Monthly Income (${currentMonthShort})`}
          tone="income"
          value={displayMoney(
            financials.monthlyIncome
          )}
          rawValue={financials.monthlyIncome}
          isAvailable={valuesAvailable}
          description="Money received this month"
          icon="↙"
          comparison={incomeComparison}
        />

        <SummaryCard
          label={`Monthly Spending (${currentMonthShort})`}
          tone="expense"
          value={displayMoney(
            financials.monthlyExpenses
          )}
          rawValue={financials.monthlyExpenses}
          isAvailable={valuesAvailable}
          description="Money spent this month"
          icon="↗"
          comparison={expenseComparison}
        />

        <SummaryCard
          label={`Monthly Savings (${currentMonthShort})`}
          tone="savings"
          value={displayMoney(
            financials.netSavings
          )}
          rawValue={financials.netSavings}
          isAvailable={valuesAvailable}
          description="Income minus spending this month"
          icon="◎"
        />
      </section>

      {/* INCOME AND SPENDING — REAL DATA, LAST SIX MONTHS */}
      <section className="gd-income-expense-section" aria-label="Income and spending trend">
        <article className="gd-panel gd-income-expense-panel">
          <div className="gd-panel-header">
            <div>
              <h2>Income &amp; Spending</h2>
              <p>Monthly financial activity in {baseCurrency}</p>
            </div>
            <span className="gd-panel-tag">Last 6 months</span>
          </div>

          {busy ? (
            <EmptyState
              title="Loading financial activity"
              description="Preparing your income and spending chart..."
            />
          ) : error || financials.missingRate ? (
            <EmptyState
              title="Chart unavailable"
              description="Financial data could not be calculated accurately."
            />
          ) : !hasChartActivity ? (
            <EmptyState
              title="No activity in the last six months"
              description="Record income or expenses to see your monthly comparison."
              to="/income"
              action="Add income"
            />
          ) : (
            <>
              <div
                className="gd-dual-chart"
                role="group"
                aria-label={`Income and expenses for the last six months in ${baseCurrency}`}
              >
                {incomeExpenseTrend.map((item) => (
                  <div className="gd-dual-month" key={item.key}>
                    <div className="gd-dual-bars">
                      <div
                        className="gd-dual-bar gd-dual-income"
                        style={{ height: `${Math.max(0, item.income / maxChartValue * 100)}%` }}
                        title={`${item.label} ${item.year} income: ${formatMoney(item.income)}`}
                        aria-label={`${item.label} income ${formatMoney(item.income)}`}
                      />
                      <div
                        className="gd-dual-bar gd-dual-expense"
                        style={{ height: `${Math.max(0, item.expense / maxChartValue * 100)}%` }}
                        title={`${item.label} ${item.year} expenses: ${formatMoney(item.expense)}`}
                        aria-label={`${item.label} expenses ${formatMoney(item.expense)}`}
                      />
                    </div>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
              <div className="gd-dual-legend" aria-label="Chart legend">
                <span><i className="gd-dual-legend-income" />Income</span>
                <span><i className="gd-dual-legend-expense" />Expenses</span>
              </div>
            </>
          )}
        </article>
      </section>

      {/* RECENT TRANSACTIONS */}
      <section className="gd-panel gd-recent-section">
        <div className="gd-panel-header">
          <div>
            <h2>Recent Transactions</h2>
            <p>
              Your latest financial activity
            </p>
          </div>

          <span className="gd-panel-tag">
            Latest 5
          </span>
        </div>

        {busy ? (
          <EmptyState
            title="Loading transactions"
            description="Preparing your recent activity..."
          />
        ) : error ? (
          <EmptyState
            title="Transactions unavailable"
            description="Unable to load your recent activity."
          />
        ) : recentTransactions.length === 0 ? (
          <EmptyState
            title="No transactions yet"
            description="Start tracking your finances by adding income or expenses."
            to="/income"
            action="Add income"
          />
        ) : (
          <div className="gd-recent-list">
            {recentTransactions.map(
              (item, index) => {
                const isIncome =
                  item.transactionType === "income";

                return (
                  <div
                    className="gd-recent-item"
                    key={`${item.transactionType}-${
                      item._id || index
                    }`}
                  >
                    <div className="gd-recent-left">
                      <div
                        className={`gd-recent-icon ${
                          isIncome
                            ? "income"
                            : "expense"
                        }`}
                      >
                        {isIncome ? "↙" : "↗"}
                      </div>

                      <div className="gd-recent-info">
                        <strong>
                          {getTransactionTitle(item)}
                        </strong>

                        <span>
                          {formatTransactionDate(
                            item.date || item.createdAt
                          )}
                          {" · "}
                          {isIncome
                            ? "Income"
                            : "Expense"}
                        </span>

                        {getTransactionDescription(
                          item
                        ) && (
                          <small>
                            {getTransactionDescription(
                              item
                            )}
                          </small>
                        )}
                      </div>
                    </div>

                    <strong
                      className={`gd-recent-amount ${
                        isIncome
                          ? "income"
                          : "expense"
                      }`}
                    >
                      {getTransactionAmount(item)}
                    </strong>
                  </div>
                );
              }
            )}
          </div>
        )}

        <div className="gd-recent-footer">
          <span>
            Showing up to five recent transactions
          </span>

          <div className="gd-recent-links">
            <Link
              to="/income"
              className="gd-panel-link"
            >
              Income
            </Link>

            <Link
              to="/expense"
              className="gd-panel-link"
            >
              Expenses
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
