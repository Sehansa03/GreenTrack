
import { useEffect, useState } from "react";
import { budgetAPI } from "../../api/budget";
import { useCurrency } from "../../context/CurrencyContext";
import BudgetForm from "./budget_components/BudgetForm";
import "./Budgets.css";

const months = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

const formatMoney = (value, currency) => {
  if (value == null || !Number.isFinite(Number(value))) {
    return "Rate unavailable";
  }

  return `${currency} ${Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [budgetType, setBudgetType] = useState("monthly");
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear()
  );
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().getMonth() + 1
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteData, setDeleteData] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const {
    currency: baseCurrency,
    loading: currencyLoading,
    ratesLoading,
  } = useCurrency();

  const loadBudgets = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await budgetAPI.getAll();
      const payload = res.data?.data ?? res.data;

      setBudgets(Array.isArray(payload) ? payload : []);
    } catch (err) {
      console.error("Failed to load budgets:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load budgets."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudgets();
  }, [baseCurrency]);

  const filteredBudgets = budgets.filter((budget) => {
    if (budget.budgetType !== budgetType) return false;
    if (Number(budget.year) !== selectedYear) return false;

    if (
      budgetType === "monthly" &&
      Number(budget.month) !== selectedMonth
    ) {
      return false;
    }

    return true;
  });

  const incomplete = filteredBudgets.some(
    (budget) =>
      budget.conversionUnavailable === true ||
      budget.convertedAmount == null ||
      budget.spent == null
  );

  const totalBudget = filteredBudgets.reduce(
    (sum, budget) =>
      sum + Number(budget.convertedAmount ?? 0),
    0
  );

  const totalSpent = filteredBudgets.reduce(
    (sum, budget) => sum + Number(budget.spent ?? 0),
    0
  );

  const totalRemaining = totalBudget - totalSpent;

  const totalPercentage =
    totalBudget > 0
      ? (totalSpent / totalBudget) * 100
      : 0;

  const busy = loading || currencyLoading || ratesLoading;

  const years = [
    ...new Set([
      selectedYear,
      new Date().getFullYear() - 1,
      new Date().getFullYear(),
      new Date().getFullYear() + 1,
      new Date().getFullYear() + 2,
      ...budgets.map((budget) => Number(budget.year)),
    ]),
  ]
    .filter(Number.isFinite)
    .sort((a, b) => b - a);

  const openCreate = () => {
    setEditData(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditData(null);
  };

  const confirmDelete = async () => {
    if (!deleteData) return;

    try {
      setDeleteLoading(true);
      await budgetAPI.delete(deleteData._id);
      setDeleteData(null);
      await loadBudgets();
    } catch (err) {
      console.error("Failed to delete budget:", err);
      setError(
        err.response?.data?.message ||
          "Failed to delete budget."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <main className="gt-budget-page">
      {/* HEADER */}
      <header className="gt-budget-header">
        <div>
          <p className="gt-budget-eyebrow">
            YOUR FINANCES / BUDGETS
          </p>

          <h1>Budgets</h1>

          <p className="gt-budget-subtitle">
            Plan your spending and stay within your limits.
          </p>
        </div>

        <button
          type="button"
          className="gt-budget-primary-btn"
          onClick={openCreate}
        >
          <span aria-hidden="true">+</span>
          Add Budget
        </button>
      </header>

      {/* FILTERS */}
      <div className="gt-budget-toolbar">
        <div className="gt-budget-tabs">
          {["monthly", "yearly"].map((type) => (
            <button
              key={type}
              type="button"
              className={budgetType === type ? "active" : ""}
              onClick={() => setBudgetType(type)}
            >
              {type === "monthly" ? "Monthly" : "Yearly"}
            </button>
          ))}
        </div>

        <div className="gt-budget-filters">
          {budgetType === "monthly" && (
            <select
              aria-label="Select month"
              value={selectedMonth}
              onChange={(e) =>
                setSelectedMonth(Number(e.target.value))
              }
            >
              {months.map((month, index) => (
                <option key={month} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
          )}

          <select
            aria-label="Select year"
            value={selectedYear}
            onChange={(e) =>
              setSelectedYear(Number(e.target.value))
            }
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ALERTS */}
      {error && (
        <div className="gt-budget-error" role="alert">
          {error}
          <button
            type="button"
            onClick={loadBudgets}
          >
            Retry
          </button>
        </div>
      )}

      {incomplete && !busy && (
        <div className="gt-budget-warning">
          <span>!</span>
          <div>
            <strong>Exchange rate unavailable</strong>
            <p>
              Some budget values cannot be converted.
              Totals are hidden until conversion is available.
            </p>
          </div>
        </div>
      )}

      {/* SUMMARY */}
      <div className="gt-budget-summary-grid">
        <SummaryCard
          label="Total Budget"
          icon="◎"
          value={
            busy
              ? "Loading..."
              : incomplete
              ? "Rate unavailable"
              : formatMoney(totalBudget, baseCurrency)
          }
          description="Your planned spending limit"
        />

        <SummaryCard
          label="Total Spent"
          icon="↗"
          value={
            busy
              ? "Loading..."
              : incomplete
              ? "Rate unavailable"
              : formatMoney(totalSpent, baseCurrency)
          }
          description="Amount spent in this period"
        />

        <SummaryCard
          label="Remaining"
          icon="↘"
          value={
            busy
              ? "Loading..."
              : incomplete
              ? "Rate unavailable"
              : formatMoney(totalRemaining, baseCurrency)
          }
          description="Available budget balance"
          tone={
            !busy && !incomplete && totalRemaining < 0
              ? "danger"
              : "success"
          }
        />

        <SummaryCard
          label="Budget Used"
          icon="%"
          value={
            busy
              ? "Loading..."
              : incomplete
              ? "Rate unavailable"
              : `${totalPercentage.toFixed(1)}%`
          }
          description="Overall budget utilization"
          tone={
            !busy && !incomplete && totalPercentage > 100
              ? "danger"
              : "default"
          }
        />
      </div>

      {/* BUDGET PANEL */}
      <section className="gt-budget-panel">
        <div className="gt-budget-section-heading">
          <div>
            <h2>
              {budgetType === "monthly"
                ? "Monthly Budgets"
                : "Yearly Budgets"}
            </h2>

            <p>
              {budgetType === "monthly"
                ? `${months[selectedMonth - 1]} ${selectedYear}`
                : `Year ${selectedYear}`}
              {" · "}
              {filteredBudgets.length} categories
            </p>
          </div>
        </div>

        {busy ? (
          <div className="gt-budget-loading">
            Loading budgets...
          </div>
        ) : filteredBudgets.length === 0 ? (
          <div className="gt-budget-empty">
            <span className="gt-budget-empty-icon">◎</span>
            <strong>No budgets for this period</strong>
            <p>
              Create a budget to start planning your spending.
            </p>

            <button
              type="button"
              className="gt-budget-primary-btn"
              onClick={openCreate}
            >
              <span aria-hidden="true">+</span>
              Create Budget
            </button>
          </div>
        ) : (
          <div className="gt-budget-grid">
            {filteredBudgets.map((budget) => {
              const unavailable =
                budget.conversionUnavailable === true ||
                budget.convertedAmount == null ||
                budget.spent == null ||
                budget.percentage == null;

              const used = unavailable
                ? 0
                : Number(budget.percentage);

              const status = unavailable
                ? "unavailable"
                : budget.status === "over" || used > 100
                ? "over"
                : budget.status === "warning" || used >= 80
                ? "warning"
                : "ontrack";

              const remainingAmount = unavailable
                ? null
                : budget.remaining == null
                ? Number(budget.convertedAmount) -
                  Number(budget.spent)
                : Number(budget.remaining);

              return (
                <article
                  className="gt-budget-card"
                  key={budget._id}
                >
                  <div className="gt-budget-card-top">
                    <h3>{budget.category}</h3>

                    <div className="gt-budget-actions">
                      <button
                        type="button"
                        title="Edit budget"
                        aria-label={`Edit ${budget.category}`}
                        onClick={() => {
                          setEditData(budget);
                          setShowForm(true);
                        }}
                      >
                        ✎
                      </button>

                      <button
                        type="button"
                        className="delete"
                        title="Delete budget"
                        aria-label={`Delete ${budget.category}`}
                        onClick={() => setDeleteData(budget)}
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  <span className="gt-budget-label">
                    Budget Limit
                  </span>

                  <div className="gt-budget-main-amount">
                    {unavailable
                      ? "Rate unavailable"
                      : formatMoney(
                          budget.convertedAmount,
                          baseCurrency
                        )}
                  </div>

                  <div className="gt-budget-card-stats">
                    <div>
                      <span className="gt-budget-label">
                        Spent
                      </span>

                      <strong>
                        {unavailable
                          ? "—"
                          : formatMoney(
                              budget.spent,
                              baseCurrency
                            )}
                      </strong>
                    </div>

                    <div>
                      <span className="gt-budget-label">
                        Remaining
                      </span>

                      <strong
                        className={
                          remainingAmount < 0
                            ? "negative"
                            : "positive"
                        }
                      >
                        {unavailable
                          ? "—"
                          : formatMoney(
                              remainingAmount,
                              baseCurrency
                            )}
                      </strong>
                    </div>
                  </div>

                  <div className="gt-budget-progress-heading">
                    <span>
                      {unavailable
                        ? "Rate unavailable"
                        : `${used.toFixed(1)}% used`}
                    </span>

                    <span
                      className={`gt-budget-status ${status}`}
                    >
                      {status === "over"
                        ? "Over budget"
                        : status === "warning"
                        ? "Near limit"
                        : status === "unavailable"
                        ? "Unavailable"
                        : "On track"}
                    </span>
                  </div>

                  <div className="gt-budget-progress-track">
                    <div
                      className={`gt-budget-progress-fill ${status}`}
                      style={{
                        width: `${
                          Math.min(100, Math.max(0, used))
                        }%`,
                      }}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ADD / EDIT FORM */}
      {showForm && (
        <BudgetForm
          editData={editData}
          onClose={closeForm}
          onSuccess={() => {
            closeForm();
            loadBudgets();
          }}
        />
      )}

      {/* DELETE MODAL */}
      {deleteData && (
        <div className="gt-budget-delete-overlay">
          <div
            className="gt-budget-delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-budget-title"
          >
            <div className="gt-budget-delete-icon">
              ×
            </div>

            <h2 id="delete-budget-title">
              Delete budget?
            </h2>

            <p>
              Are you sure you want to delete this budget?
              This action cannot be undone.
            </p>

            <div className="gt-budget-delete-details">
              <span>Category</span>
              <strong>{deleteData.category}</strong>
            </div>

            <div className="gt-budget-delete-footer">
              <button
                type="button"
                className="gt-budget-secondary-btn"
                disabled={deleteLoading}
                onClick={() => setDeleteData(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="gt-budget-confirm-delete-btn"
                disabled={deleteLoading}
                onClick={confirmDelete}
              >
                {deleteLoading
                  ? "Deleting..."
                  : "Delete Budget"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function SummaryCard({
  label,
  icon,
  value,
  description,
  tone = "default",
}) {
  return (
    <div className={`gt-budget-stat-card ${tone}`}>
      <div className="gt-budget-stat-top">
        <span>{label}</span>
        <span className="gt-budget-stat-icon">
          {icon}
        </span>
      </div>

      <h3 className="gt-budget-stat-value">
        {value}
      </h3>

      <p>{description}</p>
    </div>
  );
}
