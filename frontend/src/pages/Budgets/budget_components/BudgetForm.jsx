
import { useState } from "react";
import { budgetAPI } from "../../../api/budget";
import { useCurrency } from "../../../context/useCurrency";

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

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Initialize form values for Add or Edit mode
const getInitialForm = (editData) => ({
  category: editData?.category || "",
  amount: editData?.amount ?? "",
  budgetType: editData?.budgetType || "monthly",
  year: editData?.year || new Date().getFullYear(),
  month: editData?.month || new Date().getMonth() + 1,
});

export default function BudgetForm({
  editData,
  onClose,
  onSuccess,
}) {
  const isEditing = Boolean(editData);

  const { currency: baseCurrency } = useCurrency();

  const originalCurrency =
    editData?.originalCurrency ||
    editData?.currency ||
    baseCurrency;

  // Initialize form when modal opens
  const [formData, setFormData] = useState(() =>
    getInitialForm(editData)
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle form input changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Handle budget submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const amount = Number(formData.amount);

    if (
      formData.amount === "" ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setError("Please enter a valid budget amount.");
      return;
    }

    if (!isEditing && !formData.category) {
      setError("Please select a category.");
      return;
    }

    const year = Number(formData.year);

    if (
      !isEditing &&
      (!Number.isInteger(year) || year < 2020 || year > 2100)
    ) {
      setError("Please enter a valid year.");
      return;
    }

    try {
      setLoading(true);

      if (isEditing) {
        // Update amount in its original currency
        await budgetAPI.update(editData._id, {
          amount,
        });
      } else {
        await budgetAPI.create({
          category: formData.category,
          amount,
          currency: baseCurrency,
          budgetType: formData.budgetType,
          year,
          month:
            formData.budgetType === "monthly"
              ? Number(formData.month)
              : undefined,
        });
      }

      if (onSuccess) {
        await onSuccess();
      } else {
        onClose();
      }
    } catch (err) {
      console.error("Budget save error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to save budget."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gt-budget-modal-overlay">
      <div
        className="gt-budget-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="budget-modal-title"
      >
        {/* MODAL HEADER */}
        <div className="gt-budget-modal-header">
          <div>
            <p className="gt-budget-modal-eyebrow">
              FINANCIAL PLANNING
            </p>

            <h2 id="budget-modal-title">
              {isEditing ? "Edit Budget" : "Add Budget"}
            </h2>

            <p>
              {isEditing
                ? `Update your budget in ${originalCurrency}.`
                : `Set a spending limit in ${baseCurrency}.`}
            </p>
          </div>

          <button
            type="button"
            className="gt-budget-modal-close"
            onClick={onClose}
            disabled={loading}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* BUDGET FORM */}
        <form
          className="gt-budget-form"
          onSubmit={handleSubmit}
        >
          {/* EDIT MODE INFORMATION */}
          {isEditing ? (
            <div className="gt-budget-edit-info">
              <div>
                <span>Category</span>
                <strong>{editData.category}</strong>
              </div>

              <div>
                <span>Period</span>
                <strong>
                  {editData.budgetType === "monthly"
                    ? `${months[Number(editData.month) - 1]} ${editData.year}`
                    : `Year ${editData.year}`}
                </strong>
              </div>

              <div>
                <span>Original currency</span>
                <strong>{originalCurrency}</strong>
              </div>
            </div>
          ) : (
            /* CATEGORY - ADD MODE */
            <div className="gt-budget-field">
              <label htmlFor="budget-category">
                Category
              </label>

              <select
                id="budget-category"
                name="category"
                value={formData.category}
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
          )}

          {/* AMOUNT */}
          <div className="gt-budget-field">
            <label htmlFor="budget-amount">
              Budget Amount
            </label>

            <div className="gt-budget-amount-input">
              <input
                id="budget-amount"
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                min="0.01"
                step="0.01"
                placeholder="Enter amount"
                required
              />

              <span>
                {isEditing
                  ? originalCurrency
                  : baseCurrency}
              </span>
            </div>
          </div>

          {/* ADD MODE FIELDS */}
          {!isEditing && (
            <>
              <div className="gt-budget-field">
                <label htmlFor="budget-type">
                  Budget Type
                </label>

                <select
                  id="budget-type"
                  name="budgetType"
                  value={formData.budgetType}
                  onChange={handleChange}
                >
                  <option value="monthly">
                    Monthly
                  </option>

                  <option value="yearly">
                    Yearly
                  </option>
                </select>
              </div>

              <div className="gt-budget-form-grid">
                {/* YEAR */}
                <div className="gt-budget-field">
                  <label htmlFor="budget-year">
                    Year
                  </label>

                  <input
                    id="budget-year"
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    min="2020"
                    max="2100"
                    required
                  />
                </div>

                {/* MONTH */}
                {formData.budgetType === "monthly" && (
                  <div className="gt-budget-field">
                    <label htmlFor="budget-month">
                      Month
                    </label>

                    <select
                      id="budget-month"
                      name="month"
                      value={formData.month}
                      onChange={handleChange}
                    >
                      {months.map((month, index) => (
                        <option
                          key={month}
                          value={index + 1}
                        >
                          {month}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ERROR MESSAGE */}
          {error && (
            <div
              className="gt-budget-form-error"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* FORM ACTIONS */}
          <div className="gt-budget-modal-footer">
            <button
              type="button"
              className="gt-budget-secondary-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="gt-budget-primary-btn"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : isEditing
                  ? "Update Budget"
                  : "Add Budget"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
