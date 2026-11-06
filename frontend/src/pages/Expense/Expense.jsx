
import { useEffect, useMemo, useState } from "react";

import ExpenseForm from "./expense_components/ExpenseForm";
import ExpenseTable from "./expense_components/ExpenseTable";
import ExpenseChart from "./expense_components/ExpenseChart";
import ExpenseFilter from "./expense_components/ExpenseFilter";
import ExpenseSummary from "./expense_components/ExpenseSummary";

import { useCurrency } from "../../context/useCurrency";
import { expenseAPI } from "../../api/expense";

import "./Expense.css";

const emptyFilters = {
  category: "",
  currency: "",
  from: "",
  to: "",
};

export default function Expense() {
  const [expenses, setExpenses] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);

  const [filters, setFilters] = useState(emptyFilters);
  const [showFilters, setShowFilters] = useState(false);

  const {
    currency: baseCurrency,
    loading: profileLoading,
    ratesLoading,
    convertAmount,
    hasRate,
  } = useCurrency();

  const currencyLoading = profileLoading || ratesLoading;

  // Fetch expense records for refresh and retry
  const fetchExpenses = async () => {
    setFetching(true);
    setFetchError("");

    try {
      const res = await expenseAPI.getAll();
      const payload = res.data?.data ?? res.data;

      const records = Array.isArray(payload)
        ? payload
        : payload?.expenses ?? [];

      setExpenses(records);
    } catch (err) {
      console.error("Failed to fetch expenses:", err);
      setFetchError("Unable to load expense records.");
    } finally {
      setFetching(false);
    }
  };

  // Load expenses when the page first opens
  useEffect(() => {
    let active = true;

    const loadInitialExpenses = async () => {
      try {
        const res = await expenseAPI.getAll();

        if (!active) return;

        const payload = res.data?.data ?? res.data;

        const records = Array.isArray(payload)
          ? payload
          : payload?.expenses ?? [];

        setExpenses(records);
        setFetchError("");
      } catch (err) {
        if (!active) return;

        console.error("Failed to fetch expenses:", err);
        setFetchError("Unable to load expense records.");
      } finally {
        if (active) {
          setFetching(false);
        }
      }
    };

    void loadInitialExpenses();

    return () => {
      active = false;
    };
  }, []);

  // Filter expense records
  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const categoryMatch = (expense.category || "")
        .toLowerCase()
        .includes(filters.category.toLowerCase());

      const currencyMatch =
        !filters.currency ||
        (expense.currency || baseCurrency) === filters.currency;

      const date = expense.date
        ? String(expense.date).slice(0, 10)
        : "";

      const fromMatch = !filters.from || date >= filters.from;
      const toMatch = !filters.to || date <= filters.to;

      return (
        categoryMatch &&
        currencyMatch &&
        fromMatch &&
        toMatch
      );
    });
  }, [expenses, filters, baseCurrency]);

  // Calculate total expense in preferred currency
  const totalExpense = useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => {
      const converted = convertAmount(
        expense.amount,
        expense.currency || baseCurrency
      );

      const numeric = Number(converted);

      if (converted == null || !Number.isFinite(numeric)) {
        return sum;
      }

      return sum + numeric;
    }, 0);
  }, [filteredExpenses, convertAmount, baseCurrency]);

  // Count expenses without available exchange rates
  const unavailableRateCount = useMemo(() => {
    return filteredExpenses.filter(
      (expense) => !hasRate(expense.currency || baseCurrency)
    ).length;
  }, [filteredExpenses, hasRate, baseCurrency]);

  const activeFilterCount =
    Object.values(filters).filter(Boolean).length;

  // Open edit modal
  const handleEdit = (expense) => {
    setEditData(expense);
    setShowModal(true);
  };

  // Close modal
  const handleClose = () => {
    setShowModal(false);
    setEditData(null);
  };

  // Refresh records after saving
  const handleSaved = async () => {
    handleClose();
    await fetchExpenses();
  };

  // Remove deleted expense from state
  const handleDeleted = (id) => {
    setExpenses((previous) =>
      previous.filter((expense) => expense._id !== id)
    );
  };

  return (
    <main className="gt-expense-page">
      {/* HEADER */}
      <header className="gt-expense-header">
        <div>
          <p className="gt-expense-eyebrow">
            YOUR FINANCES / EXPENSE
          </p>

          <h1>Expense</h1>

          <p className="gt-expense-subtitle">
            Track your spending and understand where your money goes.
          </p>
        </div>

        <button
          type="button"
          className="gt-expense-primary-btn"
          onClick={() => {
            setEditData(null);
            setShowModal(true);
          }}
        >
          <span aria-hidden="true">+</span>
          Add Expense
        </button>
      </header>

      {/* ERROR */}
      {fetchError && (
        <div className="gt-expense-error" role="alert">
          {fetchError}

          <button
            type="button"
            onClick={fetchExpenses}
          >
            Retry
          </button>
        </div>
      )}

      {/* SUMMARY */}
      <ExpenseSummary
        total={totalExpense}
        expenseCount={filteredExpenses.length}
        currency={baseCurrency}
        loading={currencyLoading || fetching}
      />

      {/* EXCHANGE RATE WARNING */}
      {!currencyLoading && unavailableRateCount > 0 && (
        <div
          className="gt-expense-warning"
          role="status"
        >
          <span aria-hidden="true">!</span>

          <div>
            <strong>Exchange rates unavailable</strong>

            <p>
              {unavailableRateCount} expense{" "}
              {unavailableRateCount === 1
                ? "record cannot"
                : "records cannot"}{" "}
              currently be converted to {baseCurrency}.
              Your total may be incomplete.
            </p>
          </div>
        </div>
      )}

      {/* TWO-COLUMN LAYOUT */}
      <div className="gt-expense-main-grid">
        {/* TRANSACTIONS */}
        <section className="gt-expense-panel">
          <div className="gt-expense-section-heading">
            <div>
              <h2>Transactions</h2>

              <p>
                {filteredExpenses.length} expense{" "}
                {filteredExpenses.length === 1
                  ? "transaction"
                  : "transactions"}
              </p>
            </div>

            <button
              type="button"
              className={`gt-expense-filter-toggle ${
                showFilters ? "is-active" : ""
              }`}
              onClick={() =>
                setShowFilters((previous) => !previous)
              }
              aria-expanded={showFilters}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <path d="M4 7h16M7 12h10M10 17h4" />
              </svg>

              Filters

              {activeFilterCount > 0 && (
                <span className="gt-expense-filter-count">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* FILTER DRAWER */}
          {showFilters && (
            <div className="gt-expense-filter-drawer">
              <ExpenseFilter
                filters={filters}
                setFilters={setFilters}
                onClear={() =>
                  setFilters({ ...emptyFilters })
                }
              />
            </div>
          )}

          {/* EXPENSE TABLE */}
          {fetching ? (
            <div className="gt-expense-loading">
              Loading transactions...
            </div>
          ) : (
            <ExpenseTable
              expenses={filteredExpenses}
              onEdit={handleEdit}
              onDeleted={handleDeleted}
            />
          )}
        </section>

        {/* EXPENSE DISTRIBUTION CHART */}
        <section className="gt-expense-panel">
          <ExpenseChart
            expenses={filteredExpenses}
            baseCurrency={baseCurrency}
          />
        </section>
      </div>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <ExpenseForm
          editData={editData}
          onClose={handleClose}
          onSaved={handleSaved}
          defaultCurrency={baseCurrency}
        />
      )}
    </main>
  );
}
