
import { useEffect, useState } from "react";
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

export default function ExpenseForm({
  onClose,
  onSaved,
  editData,
  defaultCurrency = "LKR",
}) {
  const isEdit = Boolean(editData);

  const [form, setForm] = useState({
    amount: "",
    category: "",
    date: "",
    description: "",
    currency: defaultCurrency,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editData) {
      setForm({
        amount: editData.amount ?? "",
        category: editData.category ?? "",
        date: editData.date
          ? String(editData.date).slice(0, 10)
          : "",
        description: editData.description ?? "",
        currency: editData.currency || defaultCurrency,
      });
    }
  }, [editData, defaultCurrency]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.amount || Number(form.amount) <= 0) {
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
        amount: Number(form.amount),
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
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !loading) {
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

        {error && (
          <div className="gt-expense-form-error" role="alert">
            {error}
          </div>
        )}

        <form
          className="gt-expense-form"
          onSubmit={handleSubmit}
        >
          <div className="gt-expense-form-grid">
            <div className="gt-expense-field">
              <label htmlFor="expense-amount">Amount</label>

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
                  <option key={item.code} value={item.code}>
                    {item.code} - {item.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
              <option value="">Select category</option>

              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="gt-expense-field">
            <label htmlFor="expense-date">Date</label>

            <input
              id="expense-date"
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
            />
          </div>

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
