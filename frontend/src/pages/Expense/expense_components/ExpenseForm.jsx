
import { useState } from "react";
import { expenseAPI } from "../../../api/expense";
import { currencies } from "../../../data/currencies";

const categories = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Health",
  "Education",
  "Other",
];

// Initialize form values for Add or Edit mode
const getInitialForm = (editData, defaultCurrency) => ({
  amount: editData?.amount ?? "",
  category: editData?.category ?? "",
  date: editData?.date
    ? String(editData.date).slice(0, 10)
    : "",
  description: editData?.description ?? "",
  currency: editData?.currency || defaultCurrency,
});

export default function ExpenseForm({
  onClose,
  onSaved,
  editData,
  defaultCurrency = "LKR",
}) {
  const isEdit = Boolean(editData);

  // Initialize form once when the modal opens
  const [form, setForm] = useState(() =>
    getInitialForm(editData, defaultCurrency)
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle form field changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Handle Add or Edit submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    const amount = Number(form.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    if (!form.category) {
      setError("Please select an expense category.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        amount,
        category: form.category,
        date: form.date,
        description: form.description,
        currency: form.currency,
      };

      if (isEdit) {
        await expenseAPI.update(editData._id, payload);
      } else {
        await expenseAPI.create({
          type: "expense",
          ...payload,
        });
      }

      if (onSaved) {
        await onSaved();
      } else {
        onClose();
      }
    } catch (err) {
      console.error("Failed to save expense:", err);

      setError(
        err.response?.data?.message ||
          "Failed to save expense. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="gt-expense-modal-overlay"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !loading
        ) {
          onClose();
        }
      }}
    >
      <div
        className="gt-expense-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gt-expense-modal-title"
      >
        {/* MODAL HEADER */}
        <div className="gt-expense-modal-header">
          <div>
            <p className="gt-expense-modal-eyebrow">
              EXPENSE MANAGEMENT
            </p>

            <h2 id="gt-expense-modal-title">
              {isEdit ? "Edit Expense" : "Add Expense"}
            </h2>

            <p>Keep your spending records up to date.</p>
          </div>

          <button
            type="button"
            className="gt-expense-modal-close"
            onClick={onClose}
            disabled={loading}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div
            className="gt-expense-form-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* EXPENSE FORM */}
        <form
          className="gt-expense-form"
          onSubmit={handleSubmit}
        >
          <div className="gt-expense-form-grid">
            {/* AMOUNT */}
            <div className="gt-expense-field">
              <label htmlFor="expense-amount">
                Amount
              </label>

              <input
                id="expense-amount"
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                placeholder="0.00"
                min="0.01"
                step="0.01"
                required
              />
            </div>

            {/* CURRENCY */}
            <div className="gt-expense-field">
              <label htmlFor="expense-currency">
                Currency
              </label>

              <select
                id="expense-currency"
                name="currency"
                value={form.currency}
                onChange={handleChange}
                required
              >
                {currencies.map((item) => (
                  <option
                    key={item.code}
                    value={item.code}
                  >
                    {item.code} - {item.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* CATEGORY */}
          <div className="gt-expense-field">
            <label htmlFor="expense-category">
              Category
            </label>

            <select
              id="expense-category"
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            >
              <option value="">
                Select category
              </option>

              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* DATE */}
          <div className="gt-expense-field">
            <label htmlFor="expense-date">
              Date
            </label>

            <input
              id="expense-date"
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
            />
          </div>

          {/* DESCRIPTION */}
          <div className="gt-expense-field">
            <label htmlFor="expense-description">
              Notes
            </label>

            <textarea
              id="expense-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Optional notes..."
              rows={3}
            />
          </div>

          {/* FORM ACTIONS */}
          <div className="gt-expense-modal-footer">
            <button
              type="button"
              className="gt-expense-cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="gt-expense-primary-btn"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : isEdit
                  ? "Save Changes"
                  : "Add Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
