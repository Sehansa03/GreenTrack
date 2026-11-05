import { useEffect, useState } from "react";
import { budgetAPI } from "../../../api/budget";
import { useCurrency } from "../../../context/CurrencyContext";

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

const BudgetForm = ({ editData, onClose, onSuccess }) => {
  const isEditing = Boolean(editData);

  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    budgetType: "monthly",
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });

  const { currency: baseCurrency, convertAmount } = useCurrency();
  const originalCurrency = editData?.originalCurrency || editData?.currency || baseCurrency;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ========================================
  // LOAD EDIT DATA
  // ========================================
  useEffect(() => {
    if (editData) {
      setFormData({
        category: editData.category || "",
        amount: editData.amount ?? "",
        budgetType: editData.budgetType || "monthly",
        year:
          editData.year ||
          new Date().getFullYear(),
        month:
          editData.month ||
          new Date().getMonth() + 1,
      });
    }
  }, [editData]);

  // ========================================
  // HANDLE INPUT
  // ========================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ========================================
  // SUBMIT
  // ========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.amount || Number(formData.amount) <= 0) {
      setError("Please enter a valid budget amount.");
      return;
    }

    setLoading(true);

    try {
      // ========================================
      // EDIT EXISTING BUDGET
      // ONLY UPDATE AMOUNT
      // ========================================
      if (isEditing) {
        await budgetAPI.update(editData._id, {
          amount: Number(formData.amount),
        });

        setSuccess("Budget amount updated successfully.");
      }

      // ========================================
      // CREATE NEW BUDGET
      // ========================================
      else {
        if (!formData.category) {
          setError("Please select a category.");
          setLoading(false);
          return;
        }

        if (!formData.year) {
          setError("Please select a year.");
          setLoading(false);
          return;
        }

        if (
          formData.budgetType === "monthly" &&
          !formData.month
        ) {
          setError("Please select a month.");
          setLoading(false);
          return;
        }

        const data = {
          category: formData.category,
          amount: Number(formData.amount),

          // Budget always uses user's
          // registered/base currency.
          currency: baseCurrency,

          budgetType: formData.budgetType,
          year: Number(formData.year),

          month:
            formData.budgetType === "monthly"
              ? Number(formData.month)
              : undefined,
        };

        await budgetAPI.create(data);

        setSuccess("Budget created successfully.");
      }

      setTimeout(() => {
        onSuccess();
      }, 500);

    } catch (error) {
      console.error("Budget save error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to save budget."
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // MONTHS
  // ========================================
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

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.65)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          background: "#101814",
          border: "1px solid #1f2a24",
          borderRadius: "16px",
          padding: "28px",
          color: "#fff",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "22px",
              }}
            >
              {isEditing
                ? "Edit Budget"
                : "Create Budget"}
            </h2>

            <p
              style={{
                marginTop: "6px",
                color: "#8b9a91",
                fontSize: "13px",
              }}
            >
              {isEditing
                ? `Update the original amount in ${originalCurrency}`
                : `Set your spending limit in ${baseCurrency}`}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#8b9a91",
              fontSize: "22px",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        {/* EDIT MODE */}
        {isEditing ? (
          <div
            style={{
              marginBottom: "20px",
              padding: "14px",
              background: "#18231d",
              border: "1px solid #2a382f",
              borderRadius: "10px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <span
                style={{
                  color: "#8b9a91",
                  fontSize: "13px",
                }}
              >
                Category
              </span>

              <span
                style={{
                  color: "#fff",
                  fontWeight: "600",
                }}
              >
                {editData.category}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <span
                style={{
                  color: "#8b9a91",
                  fontSize: "13px",
                }}
              >
                Period
              </span>

              <span
                style={{
                  color: "#fff",
                  fontWeight: "600",
                }}
              >
                {editData.budgetType === "monthly"
                  ? `${months[(editData.month || 1) - 1]} ${editData.year}`
                  : `${editData.year} Yearly`}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  color: "#8b9a91",
                  fontSize: "13px",
                }}
              >
                Currency
              </span>

              <span
                style={{
                  color: "#4ade80",
                  fontWeight: "600",
                }}
              >
                {isEditing ? originalCurrency : baseCurrency}
              </span>
            </div>
          </div>
        ) : (
          <>
            {/* CATEGORY */}
            <div style={{ marginBottom: "18px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                }}
              >
                Category
              </label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                style={inputStyle}
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
          </>
        )}

        {/* AMOUNT */}
        <div style={{ marginBottom: "18px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
            }}
          >
            Budget Amount
          </label>

          <div
            style={{
              display: "flex",
              gap: "10px",
            }}
          >
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="Enter amount"
              style={{
                ...inputStyle,
                flex: 1,
              }}
            />

            <div
              style={{
                minWidth: "80px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#18231d",
                border: "1px solid #2a382f",
                borderRadius: "8px",
                color: "#4ade80",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              {baseCurrency}
            </div>
          </div>
        </div>

        {/* CREATE-ONLY FIELDS */}
        {!isEditing && (
          <>
            {/* BUDGET TYPE */}
            <div style={{ marginBottom: "18px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                }}
              >
                Budget Type
              </label>

              <select
                name="budgetType"
                value={formData.budgetType}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="monthly">
                  Monthly
                </option>

                <option value="yearly">
                  Yearly
                </option>
              </select>
            </div>

            {/* YEAR */}
            <div style={{ marginBottom: "18px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                }}
              >
                Year
              </label>

              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                min="2020"
                max="2100"
                style={inputStyle}
              />
            </div>

            {/* MONTH */}
            {formData.budgetType === "monthly" && (
              <div style={{ marginBottom: "18px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                  }}
                >
                  Month
                </label>

                <select
                  name="month"
                  value={formData.month}
                  onChange={handleChange}
                  style={inputStyle}
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
          </>
        )}

        {/* ERROR */}
        {error && (
          <div
            style={{
              marginBottom: "15px",
              padding: "10px 12px",
              background: "rgba(248, 113, 113, 0.1)",
              border:
                "1px solid rgba(248, 113, 113, 0.3)",
              borderRadius: "8px",
              color: "#f87171",
              fontSize: "13px",
            }}
          >
            {error}
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div
            style={{
              marginBottom: "15px",
              padding: "10px 12px",
              background: "rgba(74, 222, 128, 0.1)",
              border:
                "1px solid rgba(74, 222, 128, 0.3)",
              borderRadius: "8px",
              color: "#4ade80",
              fontSize: "13px",
            }}
          >
            {success}
          </div>
        )}

        {/* BUTTONS */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "24px",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #2a382f",
              background: "transparent",
              color: "#d1d5db",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            onClick={handleSubmit}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "8px",
              border: "none",
              background:
                "linear-gradient(135deg, #16a34a, #22c55e)",
              color: "#fff",
              fontWeight: "600",
              cursor: loading
                ? "not-allowed"
                : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? "Saving..."
              : isEditing
              ? "Update Budget"
              : "Create Budget"}
          </button>
        </div>
      </div>
    </div>
  );
};

const inputStyle = {
  width: "100%",
  padding: "11px 12px",
  background: "#0b110e",
  border: "1px solid #2a382f",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
};

export default BudgetForm;