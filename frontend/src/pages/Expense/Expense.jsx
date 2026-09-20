import { useEffect, useMemo, useState } from "react";

import ExpenseForm from "./expense_components/ExpenseForm";
import ExpenseTable from "./expense_components/ExpenseTable";
import ExpenseChart from "./expense_components/ExpenseChart";
import ExpenseFilter from "./expense_components/ExpenseFilter";
import ExpenseSummary from "./expense_components/ExpenseSummary";

import { expenseAPI } from "../../api/expense";
import { currencyAPI } from "../../api/currency";
import { authAPI } from "../../api/auth";

export default function Expense() {
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [expenses, setExpenses] = useState([]);

  const [baseCurrency, setBaseCurrency] = useState("LKR");
  const [rates, setRates] = useState({});
  const [currencyLoading, setCurrencyLoading] = useState(false);

  const [filters, setFilters] = useState({
    category: "",
    currency: "",
    from: "",
    to: "",
  });

  // ============================
  // FETCH EXPENSES
  // ============================
  const fetchExpenses = async () => {
    try {
      const res = await expenseAPI.getAll();
      setExpenses(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch expenses", err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // ============================
  // LOAD USER BASE CURRENCY
  // ============================
  useEffect(() => {
    const loadUserCurrency = async () => {
      try {
        const res = await authAPI.getProfile();
        const userCurrency = res.data.currency || "LKR";

        setBaseCurrency(userCurrency);
      } catch (error) {
        console.error("Failed to load user currency:", error);
      }
    };

    loadUserCurrency();
  }, []);

  // ============================
  // LOAD EXCHANGE RATES
  // ============================
  useEffect(() => {
    const loadRates = async () => {
      if (!baseCurrency) return;

      try {
        setCurrencyLoading(true);

        const res = await currencyAPI.getRates(baseCurrency);

        setRates(res.data.rates || {});
      } catch (error) {
        console.error("Failed to load exchange rates:", error);
      } finally {
        setCurrencyLoading(false);
      }
    };

    loadRates();
  }, [baseCurrency]);

  // ============================
  // CONVERT TO BASE CURRENCY
  // ============================
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

  // ============================
  // FILTER EXPENSES
  // ============================
  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const categoryMatch = expense.category
        ?.toLowerCase()
        .includes(filters.category.toLowerCase());

      const currencyMatch =
        !filters.currency ||
        expense.currency === filters.currency;

      const expenseDate = expense.date
        ? new Date(expense.date)
        : null;

      const fromMatch =
        !filters.from ||
        (expenseDate && expenseDate >= new Date(filters.from));

      const toMatch =
        !filters.to ||
        (expenseDate && expenseDate <= new Date(filters.to));

      return (
        categoryMatch &&
        currencyMatch &&
        fromMatch &&
        toMatch
      );
    });
  }, [expenses, filters]);

  // ============================
  // TOTAL EXPENSE
  // ============================
  const totalExpense = filteredExpenses.reduce(
    (sum, expense) =>
      sum + convertToBase(expense.amount, expense.currency),
    0
  );

  const roundedTotal =
    Math.round(totalExpense * 100) / 100;

  // ============================
  // EDIT EXPENSE
  // ============================
  const handleEdit = (expense) => {
    setEditData(expense);
    setShowModal(true);
  };

  // ============================
  // CLOSE MODAL
  // ============================
  const handleClose = () => {
    setShowModal(false);
    setEditData(null);
    fetchExpenses();
  };

  // ============================
  // CLEAR FILTERS
  // ============================
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

      {/* FILTERS */}
      <div style={filterCard}>
        <div style={filterHeader}>
          <div>
            <h3 style={filterTitle}>
              Expense Records
            </h3>

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

      {/* TABLE + CHART */}
      <div style={dashboardGrid}>

        <div style={tableCard}>
          <ExpenseTable
            expenses={filteredExpenses}
            setExpenses={setExpenses}
            onEdit={handleEdit}
          />
        </div>

        <div style={chartCard}>
          <ExpenseChart
            expenses={filteredExpenses}
            baseCurrency={baseCurrency}
            rates={rates}
          />
        </div>

      </div>

      {/* EXPENSE FORM MODAL */}
      {showModal && (
        <ExpenseForm
          onClose={handleClose}
          editData={editData}
        />
      )}

    </div>
  );
}

// ============================
// STYLES
// ============================

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
};

const dashboardGrid = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 330px",
  gap: 22,
  alignItems: "start",
};

const tableCard = {
  background: "#101814",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 16,
  padding: 20,
  overflow: "hidden",
};

const chartCard = {
  background: "#101814",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 16,
  padding: 20,
};