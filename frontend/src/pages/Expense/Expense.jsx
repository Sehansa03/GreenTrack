import { useEffect, useMemo, useState } from "react";

import ExpenseForm from "./expense_components/ExpenseForm";
import ExpenseTable from "./expense_components/ExpenseTable";
import ExpenseChart from "./expense_components/ExpenseChart";
import ExpenseFilter from "./expense_components/ExpenseFilter";
import ExpenseSummary from "./expense_components/ExpenseSummary";

import { useCurrency } from "../../context/CurrencyContext";
import { expenseAPI } from "../../api/expense";

export default function Expense() {
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [expenses, setExpenses] = useState([]);

  // Global currency system
  const {
    currency: baseCurrency,
    rates,
    loading: profileLoading,
    ratesLoading,
    convertAmount: convertToBase,
    hasRate,
  } = useCurrency();

  const currencyLoading = profileLoading || ratesLoading;

  const [filters, setFilters] = useState({
    category: "",
    currency: "",
    from: "",
    to: "",
  });

  // Fetch expenses
  const fetchExpenses = async () => {
    try {
      const res = await expenseAPI.getAll();
      setExpenses(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch expenses:", err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const categoryMatch = (expense.category || "")
        .toLowerCase()
        .includes(filters.category.toLowerCase());

      const currencyMatch =
        !filters.currency ||
        expense.currency === filters.currency;

      const expenseDate = expense.date
        ? String(expense.date).slice(0, 10)
        : "";

      const fromMatch =
        !filters.from || expenseDate >= filters.from;

      const toMatch =
        !filters.to || expenseDate <= filters.to;

      return (
        categoryMatch &&
        currencyMatch &&
        fromMatch &&
        toMatch
      );
    });
  }, [expenses, filters]);

  // Calculate total in preferred currency
  const totalExpense = useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => {
      const convertedAmount = convertToBase(
        expense.amount,
        expense.currency
      );

      return sum + (convertedAmount ?? 0);
    }, 0);
  }, [filteredExpenses, convertToBase]);

  const roundedTotal = Math.round(totalExpense * 100) / 100;

  // Count transactions with unavailable conversion rates
  const unavailableRateCount = useMemo(() => {
    return filteredExpenses.filter(
      (expense) => !hasRate(expense.currency)
    ).length;
  }, [filteredExpenses, hasRate]);

  const handleEdit = (expense) => {
    setEditData(expense);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditData(null);
    fetchExpenses();
  };

  const handleClearFilters = () => {
    setFilters({
      category: "",
      currency: "",
      from: "",
      to: "",
    });
  };

  return (
    <div style={page}>
      {/* HEADER */}
      <div style={header}>
        <div>
          <p style={eyebrow}>FINANCIAL OVERVIEW</p>

          <h1 style={title}>Expense</h1>

          <p style={subtitle}>
            Track your spending and understand where your money goes.
          </p>
        </div>

        <button
          type="button"
          style={addBtn}
          onClick={() => {
            setEditData(null);
            setShowModal(true);
          }}
        >
          <span style={{ fontSize: 20 }}>+</span>
          Add Expense
        </button>
      </div>

      {/* SUMMARY */}
      <ExpenseSummary
        total={roundedTotal}
        expenseCount={filteredExpenses.length}
        currency={baseCurrency}
        loading={currencyLoading}
      />

      {/* EXCHANGE RATE WARNING */}
      {!currencyLoading && unavailableRateCount > 0 && (
        <div style={warningCard}>
          <span style={{ fontSize: 18 }}>⚠</span>

          <div>
            <strong>Some exchange rates are unavailable</strong>

            <p style={warningText}>
              {unavailableRateCount} expense
              {unavailableRateCount === 1
                ? " record cannot"
                : " records cannot"}{" "}
              currently be converted to {baseCurrency}.
              The total shown is incomplete.
            </p>
          </div>
        </div>
      )}

      {/* FILTERS */}
      <div style={filterCard}>
        <div style={filterHeader}>
          <div>
            <h3 style={filterTitle}>Expense Records</h3>

            <p style={filterSubtitle}>
              Filter and manage your expense transactions
            </p>
          </div>

          <span style={recordBadge}>
            {filteredExpenses.length} records
          </span>
        </div>

        <ExpenseFilter
          filters={filters}
          setFilters={setFilters}
          onClear={handleClearFilters}
        />
      </div>

      {/* DASHBOARD GRID */}
      <div style={dashboardGrid}>
        {/* TABLE */}
        <div style={tableCard}>
          <ExpenseTable
            expenses={filteredExpenses}
            setExpenses={setExpenses}
            onEdit={handleEdit}
          />
        </div>

        {/* CHART */}
        <div style={chartCard}>
          <ExpenseChart
            expenses={filteredExpenses}
            baseCurrency={baseCurrency}
            rates={rates}
          />
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <ExpenseForm
          onClose={handleClose}
          editData={editData}
        />
      )}
    </div>
  );
}

/* ---------- STYLES ---------- */

const page = {
  padding: "32px 36px",
  color: "#e5e7eb",
  minHeight: "100vh",
  background: "#080d0b",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  flexWrap: "wrap",
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
  lineHeight: 1.6,
};

const addBtn = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  background: "linear-gradient(135deg,#22c55e,#16a34a)",
  border: "none",
  padding: "12px 20px",
  borderRadius: 10,
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: "0 8px 20px rgba(34,197,94,0.15)",
};

const warningCard = {
  display: "flex",
  alignItems: "flex-start",
  gap: 12,
  background: "rgba(245,158,11,0.08)",
  border: "1px solid rgba(245,158,11,0.25)",
  color: "#fbbf24",
  borderRadius: 12,
  padding: "14px 18px",
  marginBottom: 22,
  fontSize: 13,
};

const warningText = {
  margin: "5px 0 0",
  lineHeight: 1.6,
  color: "#d6c5a2",
};

const filterCard = {
  background: "#101814",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 16,
  padding: 22,
  marginBottom: 22,
};

const filterHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
  marginBottom: 20,
};

const filterTitle = {
  margin: 0,
  fontSize: 17,
  color: "#fff",
};

const filterSubtitle = {
  margin: "5px 0 0",
  fontSize: 12,
  color: "rgba(255,255,255,0.35)",
};

const recordBadge = {
  background: "rgba(74,222,128,0.1)",
  color: "#4ade80",
  padding: "6px 10px",
  borderRadius: 20,
  fontSize: 12,
  whiteSpace: "nowrap",
};

const dashboardGrid = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) minmax(280px, 330px)",
  gap: 22,
  alignItems: "start",
};

const tableCard = {
  background: "#101814",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 16,
  padding: 20,
  overflow: "hidden",
  minWidth: 0,
};

const chartCard = {
  background: "#101814",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 16,
  padding: 20,
  minWidth: 0,
};