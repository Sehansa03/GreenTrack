import { useEffect, useState } from "react";

import { budgetAPI } from "../../api/budget";
import { authAPI } from "../../api/auth";
import BudgetForm from "./budget_components/BudgetForm";

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [baseCurrency, setBaseCurrency] = useState("LKR");

  const [budgetType, setBudgetType] = useState("monthly");

  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear()
  );

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().getMonth() + 1
  );

  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);

  const [deleteData, setDeleteData] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ========================================
  // LOAD BUDGETS
  // ========================================

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    try {
      setLoading(true);

      const [budgetRes, profileRes] =
        await Promise.all([
          budgetAPI.getAll(),
          authAPI.getProfile(),
        ]);

      setBudgets(
        budgetRes.data.data || []
      );

      setBaseCurrency(
        (
          profileRes.data.currency ||
          "LKR"
        ).toUpperCase()
      );

    } catch (error) {
      console.error(
        "Failed to load budgets:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // EDIT BUDGET
  // ========================================

  const handleEdit = (budget) => {
    setEditData(budget);
    setShowForm(true);
  };

  // ========================================
  // DELETE BUDGET
  // ========================================

  const handleDelete = (id) => {
    setDeleteData(id);
  };

  const confirmDelete = async () => {
    if (!deleteData) {
      return;
    }

    try {
      setDeleteLoading(true);

      await budgetAPI.delete(deleteData);

      setDeleteData(null);

      await loadBudgets();

    } catch (error) {
      console.error(
        "Failed to delete budget:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete budget."
      );

    } finally {
      setDeleteLoading(false);
    }
  };

  // ========================================
  // FILTER BUDGETS
  // ========================================

  const filteredBudgets = budgets.filter(
    (budget) => {

      if (
        budget.budgetType !==
        budgetType
      ) {
        return false;
      }

      if (
        Number(budget.year) !==
        Number(selectedYear)
      ) {
        return false;
      }

      if (
        budgetType === "monthly" &&
        Number(budget.month) !==
          Number(selectedMonth)
      ) {
        return false;
      }

      return true;
    }
  );

  // ========================================
  // SUMMARY
  // ========================================

  const totalBudget =
    filteredBudgets.reduce(
      (sum, budget) =>
        sum +
        Number(
          budget.amount || 0
        ),
      0
    );

  const totalSpent =
    filteredBudgets.reduce(
      (sum, budget) =>
        sum +
        Number(
          budget.spent || 0
        ),
      0
    );

  const totalRemaining = Math.max(
    totalBudget - totalSpent,
    0
  );

  const totalPercentage =
    totalBudget > 0
      ? (totalSpent / totalBudget) * 100
      : 0;

  return (
    <div style={page}>

      {/* ========================================
          HEADER
      ======================================== */}

      <div style={header}>

        <div>
          <p style={eyebrow}>
            FINANCIAL PLANNING
          </p>

          <h1 style={title}>
            Budgets
          </h1>

          <p style={subtitle}>
            Plan your spending and stay within your limits.
          </p>
        </div>

        {/* ADD BUDGET BUTTON */}

        <button
          style={addButton}
          onClick={() => {
            setEditData(null);
            setShowForm(true);
          }}
        >
          <span style={plusIcon}>
            +
          </span>

          Add Budget
        </button>

      </div>


      {/* ========================================
          BUDGET TYPE + FILTERS
      ======================================== */}

      <div style={controls}>

        <div style={tabs}>

          <button
            style={{
              ...tab,
              ...(budgetType === "monthly"
                ? activeTab
                : {}),
            }}
            onClick={() =>
              setBudgetType("monthly")
            }
          >
            Monthly
          </button>

          <button
            style={{
              ...tab,
              ...(budgetType === "yearly"
                ? activeTab
                : {}),
            }}
            onClick={() =>
              setBudgetType("yearly")
            }
          >
            Yearly
          </button>

        </div>


        <div style={selectors}>

          {budgetType === "monthly" && (
            <select
              value={selectedMonth}
              onChange={(e) =>
                setSelectedMonth(
                  Number(e.target.value)
                )
              }
              style={select}
            >
              {months.map((month) => (
                <option
                  key={month.value}
                  value={month.value}
                >
                  {month.label}
                </option>
              ))}
            </select>
          )}


          <select
            value={selectedYear}
            onChange={(e) =>
              setSelectedYear(
                Number(e.target.value)
              )
            }
            style={select}
          >
            {years.map((year) => (
              <option
                key={year}
                value={year}
              >
                {year}
              </option>
            ))}
          </select>

        </div>

      </div>


      {/* ========================================
          SUMMARY
      ======================================== */}

      <div style={summaryGrid}>

        <SummaryCard
          label="Total Budget"
          value={totalBudget}
          currency={baseCurrency}
        />

        <SummaryCard
          label="Total Spent"
          value={totalSpent}
          currency={baseCurrency}
        />

        <SummaryCard
          label="Remaining"
          value={totalRemaining}
          currency={baseCurrency}
        />

        <SummaryCard
          label="Budget Used"
          value={`${totalPercentage.toFixed(
            1
          )}%`}
          currency=""
        />

      </div>


      {/* ========================================
          BUDGET AREA
      ======================================== */}

      <div style={section}>

        <div style={sectionHeader}>

          <div>

            <h2 style={sectionTitle}>
              {budgetType === "monthly"
                ? "Monthly Budgets"
                : "Yearly Budgets"}
            </h2>

            <p style={sectionSubtitle}>
              {budgetType === "monthly"
                ? `${months[selectedMonth - 1].label} ${selectedYear}`
                : `Year ${selectedYear}`}
            </p>

          </div>

        </div>


        {/* LOADING */}

        {loading ? (

          <div style={emptyState}>
            Loading budgets...
          </div>


        ) : filteredBudgets.length === 0 ? (

          /* ========================================
             EMPTY STATE
          ======================================== */

          <div style={emptyState}>

            <div style={emptyIcon}>
              ◌
            </div>

            <h3 style={emptyTitle}>
              No budgets yet
            </h3>

            <p style={emptyDescription}>
              Create a budget to start planning your spending.
            </p>

            <button
              style={emptyButton}
              onClick={() => {
                setEditData(null);
                setShowForm(true);
              }}
            >
              + Create Budget
            </button>

          </div>


        ) : (

          /* ========================================
             BUDGET CARDS
          ======================================== */

          <div style={budgetGrid}>

            {filteredBudgets.map(
              (budget) => (

                <div
                  key={budget._id}
                  style={budgetCard}
                >

                  {/* CARD HEADER */}

                  <div style={cardHeader}>

                    <h3
                      style={{
                        margin: 0,
                        color: "#fff",
                        fontSize: 15,
                        fontWeight: 600,
                      }}
                    >
                      {budget.category}
                    </h3>


                    {/* ACTION ICONS */}

                    <div style={actionIcons}>

                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(budget)
                        }
                        style={editIconButton}
                        title="Edit budget"
                        aria-label="Edit budget"
                      >
                        ✎
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            budget._id
                          )
                        }
                        style={deleteIconButton}
                        title="Delete budget"
                        aria-label="Delete budget"
                      >
                        🗑
                      </button>

                    </div>

                  </div>


                  {/* BUDGET AMOUNT */}

                  <div
                    style={{
                      marginTop: 18,
                    }}
                  >

                    <span style={cardLabel}>
                      Budget
                    </span>

                    <p style={budgetAmount}>
                      {baseCurrency}{" "}
                      {Number(
                        budget.amount || 0
                      ).toLocaleString(
                        undefined,
                        {
                          maximumFractionDigits: 2,
                        }
                      )}
                    </p>

                  </div>


                  {/* SPENT + REMAINING */}

                  <div style={financialStats}>

                    <div>

                      <span style={cardLabel}>
                        Spent
                      </span>

                      <p style={spentValue}>
                        {baseCurrency}{" "}
                        {Number(
                          budget.spent || 0
                        ).toLocaleString(
                          undefined,
                          {
                            maximumFractionDigits: 2,
                          }
                        )}
                      </p>

                    </div>


                    <div
                      style={{
                        textAlign: "right",
                      }}
                    >

                      <span style={cardLabel}>
                        Remaining
                      </span>

                      <p style={remainingValue}>
                        {baseCurrency}{" "}
                        {Number(
                          budget.remaining || 0
                        ).toLocaleString(
                          undefined,
                          {
                            maximumFractionDigits: 2,
                          }
                        )}
                      </p>

                    </div>

                  </div>


                  {/* USAGE */}

                  <div style={usageHeader}>

                    <span
                      style={{
                        color:
                          budget.status ===
                          "over"
                            ? "#f87171"
                            : budget.status ===
                              "warning"
                            ? "#fbbf24"
                            : "#4ade80",
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      {Number(
                        budget.percentage || 0
                      ).toFixed(1)}
                      % used
                    </span>

                    <span
                      style={usageStatus}
                    >
                      {budget.status ===
                      "over"
                        ? "Over budget"
                        : budget.status ===
                          "warning"
                        ? "Near limit"
                        : "On track"}
                    </span>

                  </div>


                  {/* PROGRESS BAR */}

                  <div
                    style={
                      progressBackground
                    }
                  >

                    <div
                      style={{
                        ...progressBar,
                        width: `${Math.min(
                          Number(
                            budget.percentage ||
                              0
                          ),
                          100
                        )}%`,
                        background:
                          budget.status ===
                          "over"
                            ? "#f87171"
                            : budget.status ===
                              "warning"
                            ? "#fbbf24"
                            : "#4ade80",
                      }}
                    />

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>


      {/* ========================================
          BUDGET FORM
      ======================================== */}

      {showForm && (
        <BudgetForm
          editData={editData}
          onClose={() => {
            setShowForm(false);
            setEditData(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setEditData(null);
            loadBudgets();
          }}
        />
      )}


      {/* ========================================
          DELETE CONFIRMATION MODAL
      ======================================== */}

      {deleteData && (

        <div style={deleteOverlay}>

          <div style={deleteModal}>

            <div
              style={
                deleteIconContainer
              }
            >
              🗑
            </div>


            <h2 style={deleteTitle}>
              Delete budget?
            </h2>


            <p
              style={
                deleteDescription
              }
            >
              Are you sure you want to delete
              this budget? This action cannot
              be undone.
            </p>


            <div style={deleteActions}>

              <button
                type="button"
                onClick={() =>
                  setDeleteData(null)
                }
                disabled={deleteLoading}
                style={{
                  ...cancelDeleteButton,
                  opacity:
                    deleteLoading
                      ? 0.5
                      : 1,
                }}
              >
                Cancel
              </button>


              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleteLoading}
                style={{
                  ...confirmDeleteButton,
                  opacity:
                    deleteLoading
                      ? 0.6
                      : 1,
                }}
              >
                {deleteLoading
                  ? "Deleting..."
                  : "Delete Budget"}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}


// ========================================
// SUMMARY CARD
// ========================================

function SummaryCard({
  label,
  value,
  currency,
}) {
  return (
    <div style={summaryCard}>

      <span style={summaryLabel}>
        {label}
      </span>

      <h2 style={summaryValue}>

        {currency}{" "}

        {typeof value === "number"
          ? value.toLocaleString(
              undefined,
              {
                maximumFractionDigits: 2,
              }
            )
          : value}

      </h2>

    </div>
  );
}


// ========================================
// MONTHS
// ========================================

const months = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];


// ========================================
// YEARS
// ========================================

const currentYear =
  new Date().getFullYear();

const years = [
  currentYear - 1,
  currentYear,
  currentYear + 1,
  currentYear + 2,
];


// ========================================
// PAGE
// ========================================

const page = {
  padding: "32px 36px",
  color: "#e5e7eb",
  minHeight: "100vh",
  background: "#080d0b",
};


// ========================================
// HEADER
// ========================================

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
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


// ========================================
// ADD BUDGET BUTTON
// ========================================

const addButton = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  background:
    "linear-gradient(135deg,#22c55e,#16a34a)",
  border: "none",
  padding: "12px 20px",
  borderRadius: 10,
  color: "#fff",
  fontWeight: 600,
  fontSize: 13,
  cursor: "pointer",
  boxShadow:
    "0 8px 20px rgba(34,197,94,0.15)",
};

const plusIcon = {
  fontSize: 20,
  lineHeight: 1,
};


// ========================================
// CONTROLS
// ========================================

const controls = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  marginBottom: 22,
};

const tabs = {
  display: "flex",
  gap: 6,
  background: "#101814",
  padding: 5,
  borderRadius: 10,
  border:
    "1px solid rgba(255,255,255,0.06)",
};

const tab = {
  border: "none",
  background: "transparent",
  color: "rgba(255,255,255,0.45)",
  padding: "9px 16px",
  borderRadius: 7,
  fontSize: 12,
  cursor: "pointer",
};

const activeTab = {
  background:
    "rgba(74,222,128,0.12)",
  color: "#4ade80",
};

const selectors = {
  display: "flex",
  gap: 10,
};

const select = {
  background: "#101814",
  border:
    "1px solid rgba(255,255,255,0.08)",
  color: "#f9fafb",
  borderRadius: 9,
  padding: "9px 12px",
  fontSize: 12,
  outline: "none",
};


// ========================================
// SUMMARY
// ========================================

const summaryGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(4, minmax(0, 1fr))",
  gap: 18,
  marginBottom: 24,
};

const summaryCard = {
  background: "#101814",
  border:
    "1px solid rgba(255,255,255,0.06)",
  borderRadius: 16,
  padding: 20,
};

const summaryLabel = {
  color: "rgba(255,255,255,0.4)",
  fontSize: 12,
};

const summaryValue = {
  color: "#f9fafb",
  fontSize: 24,
  margin: "14px 0 0",
};


// ========================================
// SECTION
// ========================================

const section = {
  background: "#101814",
  border:
    "1px solid rgba(255,255,255,0.06)",
  borderRadius: 16,
  padding: 22,
};

const sectionHeader = {
  marginBottom: 20,
};

const sectionTitle = {
  margin: 0,
  color: "#fff",
  fontSize: 18,
};

const sectionSubtitle = {
  margin: "5px 0 0",
  color: "rgba(255,255,255,0.3)",
  fontSize: 11,
};


// ========================================
// BUDGET GRID
// ========================================

const budgetGrid = {
  display: "grid",

  // Exactly 3 cards per row on desktop
  gridTemplateColumns:
    "repeat(3, minmax(0, 1fr))",

  gap: 16,
};


// ========================================
// BUDGET CARD
// ========================================

const budgetCard = {
  position: "relative",
  background: "#0d1410",
  border:
    "1px solid rgba(255,255,255,0.06)",
  borderRadius: 14,
  padding: 18,
  minWidth: 0,
};


// ========================================
// CARD HEADER
// ========================================

const cardHeader = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
};


// ========================================
// ACTION ICONS
// ========================================

const actionIcons = {
  display: "flex",
  alignItems: "center",
  gap: 6,
};

const editIconButton = {
  width: 30,
  height: 30,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border:
    "1px solid rgba(74,222,128,0.15)",
  borderRadius: 7,
  background:
    "rgba(74,222,128,0.06)",
  color: "#4ade80",
  fontSize: 15,
  cursor: "pointer",
};

const deleteIconButton = {
  width: 30,
  height: 30,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border:
    "1px solid rgba(248,113,113,0.15)",
  borderRadius: 7,
  background:
    "rgba(248,113,113,0.06)",
  color: "#f87171",
  fontSize: 14,
  cursor: "pointer",
};


// ========================================
// CARD CONTENT
// ========================================

const cardLabel = {
  display: "block",
  color:
    "rgba(255,255,255,0.38)",
  fontSize: 11,
  marginBottom: 5,
};

const budgetAmount = {
  margin: 0,
  color: "#f9fafb",
  fontSize: 21,
  fontWeight: 700,
};

const financialStats = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
  marginTop: 18,
  paddingTop: 15,
  borderTop:
    "1px solid rgba(255,255,255,0.06)",
};

const spentValue = {
  margin: 0,
  color: "#f9fafb",
  fontSize: 13,
  fontWeight: 600,
};

const remainingValue = {
  margin: 0,
  color: "#4ade80",
  fontSize: 13,
  fontWeight: 600,
};

const usageHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: 18,
};

const usageStatus = {
  color:
    "rgba(255,255,255,0.32)",
  fontSize: 10,
};


// ========================================
// PROGRESS BAR
// ========================================

const progressBackground = {
  width: "100%",
  height: 6,
  background:
    "rgba(255,255,255,0.06)",
  borderRadius: 10,
  overflow: "hidden",
  marginTop: 14,
};

const progressBar = {
  height: "100%",
  borderRadius: 10,
  transition:
    "width 0.3s ease",
};


// ========================================
// EMPTY STATE
// ========================================

const emptyState = {
  minHeight: 280,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
};

const emptyIcon = {
  fontSize: 34,
  color: "#4ade80",
  marginBottom: 10,
};

const emptyTitle = {
  color: "#fff",
  margin: "0 0 6px",
  fontSize: 16,
};

const emptyDescription = {
  color:
    "rgba(255,255,255,0.3)",
  fontSize: 12,
  margin: "0 0 18px",
};

const emptyButton = {
  border: "none",
  borderRadius: 9,
  padding: "9px 16px",
  background:
    "rgba(74,222,128,0.1)",
  color: "#4ade80",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};


// ========================================
// DELETE MODAL
// ========================================

const deleteOverlay = {
  position: "fixed",
  inset: 0,
  background:
    "rgba(0, 0, 0, 0.72)",
  backdropFilter: "blur(6px)",
  WebkitBackdropFilter:
    "blur(6px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2000,
  padding: 20,
};

const deleteModal = {
  width: "100%",
  maxWidth: 390,
  background: "#101814",
  border:
    "1px solid rgba(255,255,255,0.08)",
  borderRadius: 18,
  padding: 28,
  textAlign: "center",
  boxShadow:
    "0 24px 70px rgba(0,0,0,0.5)",
};

const deleteIconContainer = {
  width: 52,
  height: 52,
  margin: "0 auto 16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  background:
    "rgba(248,113,113,0.1)",
  border:
    "1px solid rgba(248,113,113,0.2)",
  fontSize: 21,
};

const deleteTitle = {
  margin: 0,
  color: "#fff",
  fontSize: 19,
  fontWeight: 700,
};

const deleteDescription = {
  margin: "10px 0 24px",
  color:
    "rgba(255,255,255,0.45)",
  fontSize: 13,
  lineHeight: 1.6,
};

const deleteActions = {
  display: "flex",
  gap: 10,
};

const cancelDeleteButton = {
  flex: 1,
  padding: "11px 14px",
  borderRadius: 9,
  border:
    "1px solid rgba(255,255,255,0.08)",
  background: "#18231d",
  color: "#d1d5db",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

const confirmDeleteButton = {
  flex: 1,
  padding: "11px 14px",
  borderRadius: 9,
  border:
    "1px solid rgba(248,113,113,0.25)",
  background:
    "rgba(248,113,113,0.12)",
  color: "#f87171",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};