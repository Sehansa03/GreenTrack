
import { useEffect, useMemo, useState } from "react";
import { incomeAPI } from "../../api/income";
import { expenseAPI } from "../../api/expense";
import { useCurrency } from "../../context//useCurrency";

import IncomeExpenseChart from "./IncomeExpenseChart";
import CashFlowChart from "./CashFlowChart";
import MonthlyFinancialTrend from "./MonthlyFinancialTrend";
import FinancialInsights from "./FinancialInsights";

import "./Analytics.css";

// Default date filter
const initialFilters = {
  period: "all",
  from: "",
  to: "",
};

// Get transaction date
const getDate = (record) =>
  record.date ? String(record.date).slice(0, 10) : "";

// Get starting date for selected period
function getPeriodStart(period) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  if (period === "month") {
    return `${year}-${String(month + 1).padStart(2, "0")}-01`;
  }

  if (period === "year") {
    return `${year}-01-01`;
  }

  if (period === "last6") {
    const date = new Date(year, month - 5, 1);

    return `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-01`;
  }

  return "";
}

// Check whether transaction matches selected period
function matchesFilters(record, filters) {
  // Keep the working All Time fix.
  // Include transactions even when date is missing.
  if (filters.period === "all") {
    return true;
  }

  const date = getDate(record);

  if (!date) return false;

  if (filters.period === "custom") {
    if (filters.from && date < filters.from) return false;
    if (filters.to && date > filters.to) return false;

    return true;
  }

  const start = getPeriodStart(filters.period);

  if (start && date < start) return false;

  const today = new Date().toISOString().slice(0, 10);

  if (date > today) return false;

  return true;
}

// Format financial values
function money(value, currency) {
  return `${currency} ${Number(value || 0).toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
}

export default function Analytics() {
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [filters, setFilters] = useState(initialFilters);

  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");

  // Currency context
  const {
    currency: baseCurrency,
    loading: profileLoading,
    ratesLoading,
    convertAmount,
    hasRate,
  } = useCurrency();

  const loading =
    dataLoading || profileLoading || ratesLoading;

  // Load income and expense data
  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        setDataLoading(true);
        setError("");

        const [incomeRes, expenseRes] = await Promise.all([
          incomeAPI.getAll(),
          expenseAPI.getAll(),
        ]);

        if (!active) return;

        // TEMPORARY: Check saved transaction dates
console.log(
  "INCOME RECORDS:",
  incomeRes.data?.data?.map((item) => ({
    amount: item.amount,
    date: item.date,
    createdAt: item.createdAt,
    currency: item.currency,
  }))
);

console.log(
  "EXPENSE RECORDS:",
  expenseRes.data?.data?.map((item) => ({
    amount: item.amount,
    date: item.date,
    createdAt: item.createdAt,
    currency: item.currency,
  }))
);

        setIncomes(incomeRes.data?.data || []);
        setExpenses(expenseRes.data?.data || []);
      } catch (err) {
        console.error("Analytics loading failed:", err);

        if (active) {
          setError("Unable to load analytics data.");
        }
      } finally {
        if (active) {
          setDataLoading(false);
        }
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  // Filter income
  const filteredIncomes = useMemo(
    () =>
      incomes.filter((item) =>
        matchesFilters(item, filters)
      ),
    [incomes, filters]
  );

  // Filter expenses
  const filteredExpenses = useMemo(
    () =>
      expenses.filter((item) =>
        matchesFilters(item, filters)
      ),
    [expenses, filters]
  );

  // Convert transactions into user's base currency
  const convertToBase = (amount, currency) => {
    const result = convertAmount(
      amount,
      currency || baseCurrency
    );

    if (result === null || result === undefined) {
      return null;
    }

    const numeric = Number(result);

    return Number.isFinite(numeric) ? numeric : null;
  };

  // Total income
  const totalIncome = filteredIncomes.reduce(
    (sum, item) => {
      return (
        sum +
        (convertToBase(item.amount, item.currency) ?? 0)
      );
    },
    0
  );

  // Total expense
  const totalExpense = filteredExpenses.reduce(
    (sum, item) => {
      return (
        sum +
        (convertToBase(item.amount, item.currency) ?? 0)
      );
    },
    0
  );

  // Net balance
  const balance = totalIncome - totalExpense;

  // Savings rate
  const savingsRate =
    totalIncome > 0
      ? (balance / totalIncome) * 100
      : 0;

  // Missing exchange rates
  const unavailableRateCount = [
    ...filteredIncomes,
    ...filteredExpenses,
  ].filter(
    (item) => !hasRate(item.currency || baseCurrency)
  ).length;

  const periodLabels = {
    all: "All-time overview",
    month: "This month",
    last6: "Last 6 months",
    year: "This year",
    custom: "Custom date range",
  };

  return (
    <main className="gt-analytics">
      {/* PAGE HEADER */}
      <header className="gt-analytics-header">
        <div>
          <p className="gt-analytics-eyebrow">
            YOUR FINANCES / ANALYTICS
          </p>

          <h1>Analytics</h1>

          <p className="gt-analytics-subtitle">
            Understand your financial performance and spending
            patterns.
          </p>
        </div>

        {/* TIME PERIOD FILTER */}
        <div className="gt-analytics-period">
          <label htmlFor="analytics-period">
            Time period
          </label>

          <select
            id="analytics-period"
            value={filters.period}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                period: e.target.value,
              }))
            }
          >
            <option value="all">All time</option>
            <option value="month">This month</option>
            <option value="last6">Last 6 months</option>
            <option value="year">This year</option>
            <option value="custom">Custom range</option>
          </select>
        </div>
      </header>

      {/* CUSTOM DATE FILTER */}
      {filters.period === "custom" && (
        <div className="gt-analytics-datebar">
          <label>
            From
            <input
              type="date"
              value={filters.from}
              max={filters.to || undefined}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  from: e.target.value,
                }))
              }
            />
          </label>

          <label>
            To
            <input
              type="date"
              value={filters.to}
              min={filters.from || undefined}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  to: e.target.value,
                }))
              }
            />
          </label>

          <button
            type="button"
            onClick={() => setFilters(initialFilters)}
          >
            Reset filters
          </button>
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div
          className="gt-analytics-alert error"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* CURRENCY WARNING */}
      {!loading && unavailableRateCount > 0 && (
        <div
          className="gt-analytics-alert warning"
          role="status"
        >
          <strong>Exchange rates unavailable</strong>

          <span>
            {unavailableRateCount} transaction(s) could
            not be converted to {baseCurrency}.
            Financial totals and insights may be incomplete.
          </span>
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="gt-analytics-summary">
        <SummaryCard
          label="Total Income"
          value={money(totalIncome, baseCurrency)}
          icon="↗"
          tone="income"
          loading={loading}
          description={periodLabels[filters.period]}
        />

        <SummaryCard
          label="Total Expense"
          value={money(totalExpense, baseCurrency)}
          icon="↘"
          tone="expense"
          loading={loading}
          description={periodLabels[filters.period]}
        />

        <SummaryCard
          label="Net Balance"
          value={money(balance, baseCurrency)}
          icon="◈"
          tone="balance"
          loading={loading}
          description="Income minus expenses"
        />

        <SummaryCard
          label="Savings Rate"
          value={`${savingsRate.toFixed(1)}%`}
          icon="%"
          tone="savings"
          loading={loading}
          description="Percentage of income remaining"
        />
      </div>

      {/* CHART ROW */}
      <div className="gt-analytics-chart-grid">
        {/* INCOME VS EXPENSE */}
        <section className="gt-analytics-panel">
          <div className="gt-analytics-panel-heading">
            <h2>Income vs Expense</h2>

            <p>Compare your earnings and spending</p>
          </div>

          {loading ? (
            <ChartLoading />
          ) : (
            <IncomeExpenseChart
              totalIncome={totalIncome}
              totalExpense={totalExpense}
              currency={baseCurrency}
            />
          )}
        </section>

        {/* CASH FLOW ANALYSIS */}
        <section className="gt-analytics-panel">
          <div className="gt-analytics-panel-heading">
            <h2>Cash Flow Analysis</h2>

            <p>
              Monthly income remaining after expenses
            </p>
          </div>

          {loading ? (
            <ChartLoading />
          ) : (
            <CashFlowChart
              incomes={filteredIncomes}
              expenses={filteredExpenses}
              baseCurrency={baseCurrency}
              convertToBase={convertToBase}
            />
          )}
        </section>
      </div>

      {/* MONTHLY FINANCIAL TREND */}
      <section className="gt-analytics-panel gt-analytics-wide">
        <div className="gt-analytics-panel-heading">
          <h2>Monthly Financial Trend</h2>

          <p>
            Track income and expenses over time
          </p>
        </div>

        {loading ? (
          <ChartLoading />
        ) : (
          <MonthlyFinancialTrend
            incomes={filteredIncomes}
            expenses={filteredExpenses}
            baseCurrency={baseCurrency}
            convertToBase={convertToBase}
          />
        )}
      </section>

      {/* FINANCIAL INSIGHTS */}
      <section className="gt-analytics-insights-section">
        <div className="gt-analytics-insights-heading">
          <div>
            <h2>Financial Insights</h2>

            <p>
              Key observations based on your selected period
            </p>
          </div>

          <span className="gt-analytics-period-tag">
            {periodLabels[filters.period]}
          </span>
        </div>

        {loading ? (
          <ChartLoading />
        ) : (
          <FinancialInsights
            incomes={filteredIncomes}
            expenses={filteredExpenses}
            totalIncome={totalIncome}
            totalExpense={totalExpense}
            balance={balance}
            savingsRate={savingsRate}
            baseCurrency={baseCurrency}
            convertToBase={convertToBase}
          />
        )}
      </section>
    </main>
  );
}

// SUMMARY CARD COMPONENT
function SummaryCard({
  label,
  value,
  icon,
  tone,
  loading,
  description,
}) {
  return (
    <article className={`gt-analytics-stat ${tone}`}>
      <div className="gt-analytics-stat-top">
        <span>{label}</span>

        <span className="gt-analytics-stat-icon">
          {icon}
        </span>
      </div>

      <h2>{loading ? "Loading..." : value}</h2>

      <p>{description}</p>
    </article>
  );
}

// CHART LOADING COMPONENT
function ChartLoading() {
  return (
    <div className="gt-analytics-chart-loading">
      Loading financial data...
    </div>
  );
}
