import { useEffect, useMemo, useState } from "react";

import { incomeAPI } from "../../api/income";
import { expenseAPI } from "../../api/expense";
import { useCurrency } from "../../context/CurrencyContext";

import IncomeExpenseChart from "./IncomeExpenseChart";
import ExpenseDistributionChart from "./ExpenseDistributionChart";
import MonthlyFinancialTrend from "./MonthlyFinancialTrend";
import FinancialInsights from "./FinancialInsights";

export default function Analytics() {
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");

  // GLOBAL CURRENCY
  const {
    currency: baseCurrency,
    loading: profileLoading,
    ratesLoading,
    convertAmount,
    hasRate,
  } = useCurrency();

  const loading =
    dataLoading || profileLoading || ratesLoading;

  // LOAD INCOME AND EXPENSE DATA
  useEffect(() => {
    let active = true;

    const loadAnalyticsData = async () => {
      try {
        setDataLoading(true);
        setError("");

        const [incomeRes, expenseRes] = await Promise.all([
          incomeAPI.getAll(),
          expenseAPI.getAll(),
        ]);

        if (!active) return;

        setIncomes(incomeRes.data?.data || []);
        setExpenses(expenseRes.data?.data || []);
      } catch (err) {
        console.error("Failed to load analytics:", err);

        if (active) {
          setError("Unable to load analytics data.");
        }
      } finally {
        if (active) {
          setDataLoading(false);
        }
      }
    };

    loadAnalyticsData();

    return () => {
      active = false;
    };
  }, []);

  // CONVERT AMOUNTS
  // Existing chart components expect numeric values.
  const convertToBase = (amount, currency) => {
    return convertAmount(amount, currency) ?? 0;
  };

  // CALCULATE TOTAL INCOME
  const totalIncome = useMemo(() => {
    return incomes.reduce((sum, income) => {
      const converted = convertAmount(
        income.amount,
        income.currency
      );

      return sum + (converted ?? 0);
    }, 0);
  }, [incomes, convertAmount]);

  // CALCULATE TOTAL EXPENSE
  const totalExpense = useMemo(() => {
    return expenses.reduce((sum, expense) => {
      const converted = convertAmount(
        expense.amount,
        expense.currency
      );

      return sum + (converted ?? 0);
    }, 0);
  }, [expenses, convertAmount]);

  // BALANCE AND SAVINGS RATE
  const balance = totalIncome - totalExpense;

  const savingsRate =
    totalIncome > 0
      ? (balance / totalIncome) * 100
      : 0;

  // DETECT UNAVAILABLE EXCHANGE RATES
  const unavailableRateCount = useMemo(() => {
    return [...incomes, ...expenses].filter(
      (transaction) => !hasRate(transaction.currency)
    ).length;
  }, [incomes, expenses, hasRate]);

  // FORMAT AMOUNT
  const formatMoney = (amount) => {
    return `${baseCurrency} ${Number(amount).toLocaleString(
      "en-US",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  return (
    <div style={page}>
      {/* HEADER */}
      <div style={header}>
        <div>
          <p style={eyebrow}>FINANCIAL ANALYTICS</p>

          <h1 style={title}>Analytics</h1>

          <p style={subtitle}>
            Understand your income, expenses and
            financial performance.
          </p>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div style={errorCard}>
          {error}
        </div>
      )}

      {/* EXCHANGE RATE WARNING */}
      {!loading && unavailableRateCount > 0 && (
        <div style={warningCard}>
          <strong>
            Some exchange rates are unavailable.
          </strong>

          <p style={{ margin: "6px 0 0" }}>
            {unavailableRateCount} transaction(s)
            could not be converted to {baseCurrency}.
            The totals and charts below are incomplete.
          </p>
        </div>
      )}

      {/* SUMMARY */}
      <div style={summaryGrid}>
        <SummaryCard
          label="Total Income"
          value={formatMoney(totalIncome)}
          loading={loading}
          icon="↗"
        />

        <SummaryCard
          label="Total Expense"
          value={formatMoney(totalExpense)}
          loading={loading}
          icon="↘"
        />

        <SummaryCard
          label="Balance"
          value={formatMoney(balance)}
          loading={loading}
          icon="◈"
        />

        <SummaryCard
          label="Savings Rate"
          value={`${savingsRate.toFixed(1)}%`}
          loading={loading}
          icon="%"
          description="Based on total income"
        />
      </div>

      {/* CHART AREA */}
      <div style={chartGrid}>
        <div style={chartCard}>
          <h3 style={chartTitle}>
            Income vs Expense
          </h3>

          <p style={chartSubtitle}>
            Compare your total income and spending
          </p>

          <IncomeExpenseChart
            totalIncome={totalIncome}
            totalExpense={totalExpense}
            currency={baseCurrency}
          />
        </div>

        <div style={chartCard}>
          <h3 style={chartTitle}>
            Expense Distribution
          </h3>

          <p style={chartSubtitle}>
            See where your money is going
          </p>

          <ExpenseDistributionChart
            expenses={expenses}
            baseCurrency={baseCurrency}
            convertToBase={convertToBase}
          />
        </div>
      </div>

      {/* MONTHLY FINANCIAL TREND */}
      <div style={largeChartCard}>
        <h3 style={chartTitle}>
          Monthly Financial Trend
        </h3>

        <p style={chartSubtitle}>
          Track your financial activity over time
        </p>

        <MonthlyFinancialTrend
          incomes={incomes}
          expenses={expenses}
          baseCurrency={baseCurrency}
          convertToBase={convertToBase}
        />
      </div>

      {/* FINANCIAL INSIGHTS */}
      <div style={insightsSection}>
        <div style={insightsHeader}>
          <div>
            <h3 style={chartTitle}>
              Financial Insights
            </h3>

            <p style={chartSubtitle}>
              Understand your spending patterns and
              financial performance
            </p>
          </div>

          <div style={insightsBadge}>
            ● Current records
          </div>
        </div>

        <FinancialInsights
          incomes={incomes}
          expenses={expenses}
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          balance={balance}
          savingsRate={savingsRate}
          baseCurrency={baseCurrency}
          convertToBase={convertToBase}
        />
      </div>
    </div>
  );
}

/* ================= SUMMARY CARD ================= */

function SummaryCard({
  label,
  value,
  loading,
  icon,
  description = "Based on current records",
}) {
  return (
    <div style={summaryCard}>
      <div style={summaryTop}>
        <span>{label}</span>

        <div style={iconStyle}>
          {icon}
        </div>
      </div>

      <h2 style={valueStyle}>
        {loading ? "Loading..." : value}
      </h2>

      <p style={summaryDescription}>
        {description}
      </p>
    </div>
  );
}

/* ================= PAGE STYLES ================= */

const page = {
  padding: "32px 36px",
  color: "#e5e7eb",
  minHeight: "100vh",
  background: "#080d0b",
};

const header = {
  marginBottom: 30,
};

const eyebrow = {
  fontSize: 11,
  letterSpacing: "2px",
  color: "#4ade80",
  fontWeight: 700,
  marginBottom: 8,
};

const title = {
  fontSize: 32,
  fontWeight: 700,
  margin: 0,
  color: "#f9fafb",
};

const subtitle = {
  color: "rgba(255,255,255,0.4)",
  marginTop: 8,
  fontSize: 14,
};

const summaryGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 18,
  marginBottom: 24,
};

const summaryCard = {
  background: "#101814",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 16,
  padding: 22,
  minWidth: 0,
};

const summaryTop = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  color: "rgba(255,255,255,0.4)",
  fontSize: 12,
};

const iconStyle = {
  width: 30,
  height: 30,
  borderRadius: 8,
  background: "rgba(74,222,128,0.1)",
  color: "#4ade80",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const valueStyle = {
  fontSize: 25,
  margin: "18px 0 8px",
  color: "#f9fafb",
  overflowWrap: "anywhere",
};

const summaryDescription = {
  fontSize: 11,
  color: "rgba(255,255,255,0.3)",
  margin: 0,
};

const chartGrid = {
  display: "grid",
  gridTemplateColumns:
    "minmax(0, 1.5fr) minmax(300px, 1fr)",
  gap: 22,
  marginBottom: 22,
};

const chartCard = {
  background: "#101814",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 16,
  padding: 22,
  minWidth: 0,
};

const chartTitle = {
  margin: 0,
  fontSize: 17,
  color: "#fff",
};

const chartSubtitle = {
  margin: "5px 0 16px",
  fontSize: 11,
  color: "rgba(255,255,255,0.3)",
};

const largeChartCard = {
  background: "#101814",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 16,
  padding: 22,
  marginBottom: 22,
};

const insightsSection = {
  background: "#0d1410",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 16,
  padding: 22,
};

const insightsHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 20,
  marginBottom: 20,
};

const insightsBadge = {
  padding: "6px 10px",
  borderRadius: 20,
  background: "rgba(74,222,128,0.08)",
  border: "1px solid rgba(74,222,128,0.15)",
  color: "#4ade80",
  fontSize: 10,
  fontWeight: 600,
  whiteSpace: "nowrap",
};

const warningCard = {
  padding: "14px 18px",
  marginBottom: 22,
  borderRadius: 12,
  background: "rgba(245,158,11,0.08)",
  border: "1px solid rgba(245,158,11,0.25)",
  color: "#fbbf24",
  fontSize: 13,
};

const errorCard = {
  padding: "14px 18px",
  marginBottom: 22,
  borderRadius: 12,
  background: "rgba(239,68,68,0.08)",
  border: "1px solid rgba(239,68,68,0.25)",
  color: "#fca5a5",
  fontSize: 13,
};