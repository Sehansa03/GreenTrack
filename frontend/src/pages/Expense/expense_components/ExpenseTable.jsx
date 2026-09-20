import { expenseAPI } from "../../../api/expense";

export default function ExpenseTable({
  expenses = [],
  setExpenses,
  onEdit,
}) {
  // ============================
  // DELETE EXPENSE
  // ============================
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this expense?"
    );

    if (!confirmed) return;

    try {
      await expenseAPI.delete(id);

      setExpenses((prev) =>
        prev.filter((expense) => expense._id !== id)
      );
    } catch (error) {
      console.error("DELETE EXPENSE ERROR:", error);

      alert(
        error?.response?.data?.message ||
        "Failed to delete expense."
      );
    }
  };

  // ============================
  // EMPTY STATE
  // ============================
  if (expenses.length === 0) {
    return (
      <div style={empty}>
        <div style={emptyIcon}>📭</div>

        <p style={emptyTitle}>
          No expense records found
        </p>

        <p style={emptyText}>
          Add your first expense to start tracking your spending.
        </p>
      </div>
    );
  }

  return (
    <div style={wrapper}>
      <table style={table}>
        <thead>
          <tr>
            <th style={th}>AMOUNT</th>
            <th style={th}>CATEGORY</th>
            <th style={th}>CURRENCY</th>
            <th style={th}>DATE</th>
            <th style={th}>ACTIONS</th>
          </tr>
        </thead>

        <tbody>
          {expenses.map((expense) => (
            <tr key={expense._id}>

              {/* AMOUNT */}
              <td style={td}>
                <span style={amount}>
                  - {Number(expense.amount).toLocaleString()}
                </span>
              </td>

              {/* CATEGORY */}
              <td style={td}>
                <div style={categoryWrapper}>
                  <div style={categoryIcon}>
                    {getCategoryIcon(expense.category)}
                  </div>

                  <span style={categoryText}>
                    {expense.category}
                  </span>
                </div>
              </td>

              {/* CURRENCY */}
              <td style={td}>
                <span style={currencyBadge}>
                  {expense.currency || "LKR"}
                </span>
              </td>

              {/* DATE */}
              <td style={td}>
                {expense.date
                  ? new Date(expense.date).toLocaleDateString()
                  : "-"}
              </td>

              {/* ACTIONS */}
              <td style={td}>
                <div style={actions}>

                  <button
                    type="button"
                    style={editBtn}
                    onClick={() => onEdit(expense)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    style={deleteBtn}
                    onClick={() => handleDelete(expense._id)}
                  >
                    Delete
                  </button>

                </div>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================
// CATEGORY ICON
// ============================

function getCategoryIcon(category) {
  const icons = {
    Food: "🍴",
    Transport: "🚗",
    Shopping: "🛍",
    Bills: "🧾",
    Entertainment: "🎬",
    Health: "❤",
    Education: "📚",
    Other: "●",
  };

  return icons[category] || "●";
}

// ============================
// STYLES
// ============================

const wrapper = {
  width: "100%",
  overflowX: "auto",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 13,
};

const th = {
  textAlign: "left",
  padding: "14px 12px",
  fontSize: 10,
  letterSpacing: "1px",
  color: "rgba(255,255,255,0.3)",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
  whiteSpace: "nowrap",
};

const td = {
  padding: "16px 12px",
  borderBottom: "1px solid rgba(255,255,255,0.04)",
  color: "rgba(255,255,255,0.65)",
  whiteSpace: "nowrap",
};

const amount = {
  color: "#f87171",
  fontWeight: 700,
};

const categoryWrapper = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const categoryIcon = {
  width: 30,
  height: 30,
  borderRadius: 8,
  background: "rgba(74,222,128,0.1)",
  color: "#4ade80",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 14,
};

const categoryText = {
  color: "#e5e7eb",
};

const currencyBadge = {
  padding: "5px 8px",
  borderRadius: 6,
  background: "rgba(255,255,255,0.05)",
  fontSize: 11,
  color: "#d1d5db",
};

const actions = {
  display: "flex",
  gap: 7,
};

const editBtn = {
  background: "rgba(255,255,255,0.06)",
  border: "none",
  color: "#d1d5db",
  padding: "6px 10px",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 11,
};

const deleteBtn = {
  background: "rgba(248,113,113,0.08)",
  border: "none",
  color: "#f87171",
  padding: "6px 10px",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 11,
};

const empty = {
  textAlign: "center",
  padding: 50,
  color: "rgba(255,255,255,0.35)",
};

const emptyIcon = {
  fontSize: 32,
  marginBottom: 10,
};

const emptyTitle = {
  margin: 0,
  color: "rgba(255,255,255,0.55)",
  fontSize: 14,
};

const emptyText = {
  margin: "7px 0 0",
  fontSize: 12,
  color: "rgba(255,255,255,0.25)",
};