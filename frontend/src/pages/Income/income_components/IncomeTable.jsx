
import { useState } from "react";
import { incomeAPI } from "../../../api/income";
import { useCurrency } from "../../../context/CurrencyContext";

export default function IncomeTable({
  incomes = [],
  setIncomes,
  onDeleted,
  onEdit,
}) {
  const {
    currency: baseCurrency,
    convertAmount,
    ratesLoading,
  } = useCurrency();

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  const formatMoney = (amount, currency) =>
    `${currency} ${Number(amount).toLocaleString(
      undefined,
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;

  const displayAmount = (income) => {
    if (ratesLoading) return "Converting...";

    const converted = convertAmount(
      income.amount,
      income.currency || baseCurrency
    );

    if (
      converted == null ||
      !Number.isFinite(Number(converted))
    ) {
      return "Rate unavailable";
    }

    return `+ ${formatMoney(converted, baseCurrency)}`;
  };

  const closeDeleteModal = () => {
    if (deletingId) return;
    setDeleteTarget(null);
    setDeleteError("");
  };

  const confirmDelete = async () => {
    if (!deleteTarget || deletingId) return;

    const id = deleteTarget._id;
    setDeletingId(id);
    setDeleteError("");

    try {
      await incomeAPI.delete(id);

      if (onDeleted) {
        onDeleted(id);
      } else {
        setIncomes?.((previous) =>
          previous.filter((income) => income._id !== id)
        );
      }

      setDeleteTarget(null);
    } catch (err) {
      console.error("Delete failed:", err);
      setDeleteError(
        err.response?.data?.message ||
        "Unable to delete income. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="gt-income-transaction-list">
        {incomes.length === 0 ? (
          <div className="gt-income-empty">
            <span aria-hidden="true">▤</span>
            <strong>No income records found</strong>
            <p>
              Add a transaction or adjust your filters.
            </p>
          </div>
        ) : (
          incomes.map((income) => (
            <article
              key={income._id}
              className="gt-income-transaction-row"
            >
              <div className="gt-income-transaction-main">
                <span className="gt-income-source-icon">
                  ↗
                </span>

                <div className="gt-income-transaction-info">
                  <strong>
                    {income.source || "Other"}
                  </strong>

                  <span>
                    {income.date
                      ? String(income.date).slice(0, 10)
                      : "No date"}
                    {" · "}
                    {income.currency || baseCurrency}
                  </span>
                </div>
              </div>

              <div className="gt-income-transaction-right">
                <div className="gt-income-transaction-amount">
                  <strong>{displayAmount(income)}</strong>

                  <span>
                    Original:{" "}
                    {formatMoney(
                      income.amount,
                      income.currency || baseCurrency
                    )}
                  </span>
                </div>

                <div className="gt-income-actions">
                  <button
                    type="button"
                    className="gt-income-edit-btn"
                    onClick={() => onEdit(income)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="gt-income-delete-btn"
                    onClick={() => {
                      setDeleteTarget(income);
                      setDeleteError("");
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {deleteTarget && (
        <div
          className="gt-income-delete-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDeleteModal();
            }
          }}
        >
          <div
            className="gt-income-delete-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="gt-delete-title"
            aria-describedby="gt-delete-description"
          >
            <div className="gt-income-delete-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 10v6M14 10v6" />
              </svg>
            </div>

            <h2 id="gt-delete-title">
              Delete income?
            </h2>

            <p id="gt-delete-description">
              Are you sure you want to delete this
              income transaction? This action cannot
              be undone.
            </p>

            <div className="gt-income-delete-details">
              <span>
                {deleteTarget.source || "Other"}
              </span>

              <strong>
                {formatMoney(
                  deleteTarget.amount,
                  deleteTarget.currency || baseCurrency
                )}
              </strong>
            </div>

            {deleteError && (
              <p
                className="gt-income-delete-error"
                role="alert"
              >
                {deleteError}
              </p>
            )}

            <div className="gt-income-delete-footer">
              <button
                type="button"
                className="gt-income-cancel-btn"
                onClick={closeDeleteModal}
                disabled={Boolean(deletingId)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="gt-income-confirm-delete-btn"
                onClick={confirmDelete}
                disabled={Boolean(deletingId)}
              >
                {deletingId
                  ? "Deleting..."
                  : "Delete Income"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
