
import { useEffect, useState } from "react";
import { incomeAPI } from "../../../api/income";
import { currencies } from "../../../data/currencies";

const today = () => {
  const date = new Date();
  const local = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  );
  return local.toISOString().slice(0, 10);
};

export default function IncomeForm({
  onClose,
  onSaved,
  editData,
  defaultCurrency = "LKR",
}) {
  const isEdit = Boolean(editData);

  const [form, setForm] = useState({
    amount: "",
    source: "Salary",
    date: today(),
    description: "",
    currency: defaultCurrency,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editData) {
      setForm({
        amount: editData.amount ?? "",
        source: editData.source ?? "Salary",
        date: editData.date
          ? String(editData.date).slice(0, 10)
          : today(),
        description: editData.description ?? "",
        currency: editData.currency ?? defaultCurrency,
      });
    }
  }, [editData, defaultCurrency]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && !loading) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () =>
      document.removeEventListener(
        "keydown",
        handleEscape
      );
  }, [onClose, loading]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const amount = Number(form.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    if (!form.date) {
      setError("Please select a date.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        amount,
        source: form.source,
        date: form.date,
        description: form.description,
        currency: form.currency,
        category: form.source,
      };

      if (isEdit) {
        await incomeAPI.update(editData._id, payload);
      } else {
        await incomeAPI.create({
          type: "income",
          ...payload,
        });
      }

      if (onSaved) {
        await onSaved();
      } else {
        onClose();
      }
    } catch (err) {
      console.error("Failed to save income:", err);

      setError(
        err.response?.data?.message ||
        "Failed to save income. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="gt-income-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div
        className="gt-income-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gt-income-modal-title"
      >
        <div className="gt-income-modal-header">
          <div>
            <p className="gt-income-modal-eyebrow">
              INCOME MANAGEMENT
            </p>

            <h2 id="gt-income-modal-title">
              {isEdit ? "Edit Income" : "Add Income"}
            </h2>

            <p>
              {isEdit
                ? "Update your transaction details."
                : "Record a new income transaction."}
            </p>
          </div>

          <button
            type="button"
            className="gt-income-modal-close"
            onClick={onClose}
            disabled={loading}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="gt-income-form-error" role="alert">
            {error}
          </div>
        )}

        <form
          className="gt-income-form"
          onSubmit={handleSubmit}
        >
          <div className="gt-income-form-grid">
            <div className="gt-income-field">
              <label htmlFor="income-amount">
                Amount
              </label>

              <input
                id="income-amount"
                type="number"
                name="amount"
                min="0.01"
                step="any"
                placeholder="0.00"
                value={form.amount}
                onChange={handleChange}
                required
              />
            </div>

            <div className="gt-income-field">
              <label htmlFor="income-currency">
                Currency
              </label>

              <select
                id="income-currency"
                name="currency"
                value={form.currency}
                onChange={handleChange}
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

            <div className="gt-income-field">
              <label htmlFor="income-source">
                Income source
              </label>

              <select
                id="income-source"
                name="source"
                value={form.source}
                onChange={handleChange}
              >
                {![
                  "Salary",
                  "Freelance",
                  "Business",
                  "Investment",
                  "Other",
                ].includes(form.source) && (
                  <option value={form.source}>
                    {form.source}
                  </option>
                )}

                <option value="Salary">Salary</option>
                <option value="Freelance">Freelance</option>
                <option value="Business">Business</option>
                <option value="Investment">Investment</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="gt-income-field">
              <label htmlFor="income-date">
                Date
              </label>

              <input
                id="income-date"
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="gt-income-field">
            <label htmlFor="income-notes">
              Notes <span>(optional)</span>
            </label>

            <textarea
              id="income-notes"
              name="description"
              rows={3}
              placeholder="Add a description..."
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div className="gt-income-modal-footer">
            <button
              type="button"
              className="gt-income-cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="gt-income-primary-btn"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : isEdit
                ? "Save Changes"
                : "Add Income"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
