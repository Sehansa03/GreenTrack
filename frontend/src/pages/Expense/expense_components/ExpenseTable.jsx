
import { useState } from "react";
import { expenseAPI } from "../../../api/expense";
import { useCurrency } from "../../../context/CurrencyContext";

const categoryIcons = {
  Food: "🍽️",
  Transport: "🚗",
  Shopping: "🛍️",
  Bills: "🧾",
  Entertainment: "🎬",
  Health: "💊",
  Education: "📚",
  Other: "📦",
};

const formatMoney = (amount, currency) =>
  `${currency} ${Number(amount || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function ExpenseTable({
  expenses = [],
  onEdit,
  onDeleted,
}) {
  const {
    currency: baseCurrency,
    convertAmount,
    ratesLoading,
  } = useCurrency();

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const displayAmount = (expense) => {
    if (ratesLoading) return "Converting...";

    const converted = convertAmount(
      expense.amount,
      expense.currency || baseCurrency
    );

    if (
      converted == null ||
      !Number.isFinite(Number(converted))
    ) {
      return "Rate unavailable";
    }

    return `− ${formatMoney(converted, baseCurrency)}`;
  };

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return;

    setDeleting(true);
    setDeleteError("");

    try {
      await expenseAPI.delete(deleteTarget._id);

      onDeleted?.(deleteTarget._id);
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete expense:", err);

      setDeleteError(
        err.response?.data?.message ||
          "Failed to delete expense. Please try again."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      {expenses.length === 0 ? (
        <div className="gt-expense-empty">
          <span aria-hidden="true">▤</span>
          <strong>No expense records found</strong>
          <p>
            Add an expense or adjust your filters to see records.
          </p>
        </div>
      ) : (
        <div className="gt-expense-transaction-list">
          {expenses.map((expense) => (
            <article
              className="gt-expense-transaction-row"
              key={expense._id}
            >
              <div className="gt-expense-transaction-main">
                <div
                  className="gt-expense-category-icon"
                  aria-hidden="true"
                >
                  {categoryIcons[expense.category] || "📦"}
                </div>

                <div className="gt-expense-transaction-info">
                  <strong>{expense.category || "Other"}</strong>

                  <span>
                    {expense.date
                      ? String(expense.date).slice(0, 10)
                      : "No date"}
                    {" · "}
                    {expense.currency || baseCurrency}
                  </span>

                  {expense.description && (
                    <span className="gt-expense-transaction-note">
                      {expense.description}
                    </span>
                  )}
                </div>
              </div>

              <div className="gt-expense-transaction-right">
                <div className="gt-expense-transaction-amount">
                  <strong>{displayAmount(expense)}</strong>

                  <span>
                    Original:{" "}
                    {formatMoney(
                      expense.amount,
                      expense.currency || baseCurrency
                    )}
                  </span>
                </div>

                <div className="gt-expense-actions">
                  <button
                    type="button"
                    className="gt-expense-edit-btn"
                    onClick={() => onEdit(expense)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="gt-expense-delete-btn"
                    onClick={() => {
                      setDeleteError("");
                      setDeleteTarget(expense);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {deleteTarget && (
        <div
          className="gt-expense-delete-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !deleting) {
              setDeleteTarget(null);
            }
          }}
        >
          <div
            className="gt-expense-delete-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="gt-expense-delete-title"
          >
            <div className="gt-expense-delete-icon">
              <svg
                width="23"
                height="23"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6" />
                <path d="M10 10v6M14 10v6" />
              </svg>
            </div>

            <h2 id="gt-expense-delete-title">
              Delete this expense?
            </h2>

            <p>
              This transaction will be permanently deleted.
              This action cannot be undone.
            </p>

            <div className="gt-expense-delete-details">
              <span>{deleteTarget.category || "Expense"}</span>

              <strong>
                {formatMoney(
                  deleteTarget.amount,
                  deleteTarget.currency || baseCurrency
                )}
              </strong>
            </div>

            {deleteError && (
              <p className="gt-expense-delete-error" role="alert">
                {deleteError}
              </p>
            )}

            <div className="gt-expense-delete-footer">
              <button
                type="button"
                className="gt-expense-cancel-btn"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="gt-expense-confirm-delete-btn"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete Expense"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
