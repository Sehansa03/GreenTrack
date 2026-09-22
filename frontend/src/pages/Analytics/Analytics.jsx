import { useEffect, useState } from "react";

import { incomeAPI } from "../../api/income";
import { expenseAPI } from "../../api/expense";
import { currencyAPI } from "../../api/currency";
import { authAPI } from "../../api/auth";

import IncomeExpenseChart from "./IncomeExpenseChart";
import ExpenseDistributionChart from "./ExpenseDistributionChart";

export default function Analytics() {
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [baseCurrency, setBaseCurrency] = useState("LKR");
  const [rates, setRates] = useState({});

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);

      const [incomeRes, expenseRes, profileRes] =
        await Promise.all([
          incomeAPI.getAll(),
          expenseAPI.getAll(),
          authAPI.getProfile(),
        ]);

      setIncomes(incomeRes.data.data || []);
      setExpenses(expenseRes.data.data || []);

      const currency =
        profileRes.data.currency || "LKR";

      setBaseCurrency(currency);

      const rateRes =
        await currencyAPI.getRates(currency);

      setRates(rateRes.data.rates || {});
    } catch (error) {
      console.error(
        "Failed to load analytics data:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const convertToBase = (amount, currency) => {
    const numericAmount = Number(amount || 0);

    if (currency === baseCurrency) {
      return numericAmount;
    }

    const rate = rates[currency];

    if (!rate) {
      return 0;
    }

    return numericAmount / Number(rate);
  };

  const totalIncome = incomes.reduce(
    (sum, income) =>
      sum +
      convertToBase(
        income.amount,
        income.currency
      ),
    0
  );

  const totalExpense = expenses.reduce(
    (sum, expense) =>
      sum +
      convertToBase(
        expense.amount,
        expense.currency
      ),
    0
  );

  const balance = totalIncome - totalExpense;

  const savingsRate =
    totalIncome > 0
      ? (balance / totalIncome) * 100
      : 0;

  return (
    <div style={page}>

      {/* HEADER */}
      <div style={header}>
        <div>
          <p style={eyebrow}>
            FINANCIAL ANALYTICS
          </p>

          <h1 style={title}>
            Analytics
          </h1>

          <p style={subtitle}>
            Understand your income, expenses and
            financial performance.
          </p>
        </div>
      </div>

      {/* SUMMARY */}
      <div style={summaryGrid}>

        <SummaryCard
          label="Total Income"
          value={totalIncome}
          currency={baseCurrency}
          loading={loading}
          icon="↗"
        />

        <SummaryCard
          label="Total Expense"
          value={totalExpense}
          currency={baseCurrency}
          loading={loading}
          icon="↘"
        />

        <SummaryCard
          label="Balance"
          value={balance}
          currency={baseCurrency}
          loading={loading}
          icon="◈"
        />

        <div style={summaryCard}>
          <div style={summaryTop}>
            <span>Savings Rate</span>

            <div style={iconStyle}>
              %
            </div>
          </div>

          <h2 style={valueStyle}>
            {loading
              ? "Loading..."
              : `${savingsRate.toFixed(1)}%`}
          </h2>

          <p style={description}>
            Based on total income
          </p>
        </div>

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

      {/* MONTHLY TREND */}
      <div style={largeChartCard}>

        <h3 style={chartTitle}>
          Monthly Financial Trend
        </h3>

        <p style={chartSubtitle}>
          Track your financial activity over time
        </p>

        <div style={largeChartPlaceholder}>
          Monthly chart coming next
        </div>

      </div>

    </div>
  );
}


/* ================= SUMMARY CARD ================= */

function SummaryCard({
  label,
  value,
  currency,
  loading,
  icon,
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
        {loading
          ? "Loading..."
          : `${currency} ${Number(value).toLocaleString(
              undefined,
              {
                maximumFractionDigits: 2,
              }
            )}`}
      </h2>

      <p style={description}>
        Based on current records
      </p>

    </div>
  );
}


/* ================= PAGE STYLE ================= */

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


/* ================= SUMMARY ================= */

const summaryGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(4, minmax(0, 1fr))",
  gap: 18,
  marginBottom: 24,
};

const summaryCard = {
  background: "#101814",
  border:
    "1px solid rgba(255,255,255,0.06)",
  borderRadius: 16,
  padding: 22,
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
  background:
    "rgba(74,222,128,0.1)",
  color: "#4ade80",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const valueStyle = {
  fontSize: 25,
  margin: "18px 0 8px",
  color: "#f9fafb",
};

const description = {
  fontSize: 11,
  color: "rgba(255,255,255,0.3)",
  margin: 0,
};


/* ================= CHARTS ================= */

const chartGrid = {
  display: "grid",
  gridTemplateColumns:
    "minmax(0, 1.5fr) minmax(300px, 1fr)",
  gap: 22,
  marginBottom: 22,
};

const chartCard = {
  background: "#101814",
  border:
    "1px solid rgba(255,255,255,0.06)",
  borderRadius: 16,
  padding: 22,
};

const chartTitle = {
  margin: 0,
  fontSize: 17,
  color: "#fff",
};

const chartSubtitle = {
  margin: "5px 0 0",
  fontSize: 11,
  color: "rgba(255,255,255,0.3)",
};

const chartPlaceholder = {
  height: 300,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "rgba(255,255,255,0.2)",
  fontSize: 13,
};

const largeChartCard = {
  background: "#101814",
  border:
    "1px solid rgba(255,255,255,0.06)",
  borderRadius: 16,
  padding: 22,
};

const largeChartPlaceholder = {
  height: 320,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "rgba(255,255,255,0.2)",
  fontSize: 13,
};