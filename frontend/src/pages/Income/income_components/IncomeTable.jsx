
import { incomeAPI } from "../../../api/income";
import { useCurrency } from "../../../context/CurrencyContext";

export default function IncomeTable({
  incomes = [],
  setIncomes,
  onEdit,
}) {
  const {
    currency: baseCurrency,
    convertAmount,
    ratesLoading,
  } = useCurrency();

  const handleDelete = async (id) => {
    try {
      await incomeAPI.delete(id);

      setIncomes((prev) =>
        prev.filter((income) => income._id !== id)
      );
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete income.");
    }
  };

  const displayAmount = (income) => {
    if (ratesLoading) return "Converting...";

    const converted = convertAmount(
      income.amount,
      income.currency || baseCurrency
    );

    if (converted === null || !Number.isFinite(Number(converted))) {
      return "Rate unavailable";
    }

    return `+ ${baseCurrency} ${Number(converted).toLocaleString(
      undefined,
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={table}>
        <thead>
          <tr>
            <th style={th}>AMOUNT</th>
            <th style={th}>SOURCE</th>
            <th style={th}>ORIGINAL CURRENCY</th>
            <th style={th}>DATE</th>
            <th style={th}>ACTIONS</th>
          </tr>
        </thead>

        <tbody>
          {incomes.length === 0 ? (
            <tr>
              <td colSpan={5} style={empty}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>
                  📭
                </div>
                No income records found
                <p style={{ fontSize: 12, opacity: 0.5 }}>
                  Try changing your filters or add a new income.
                </p>
              </td>
            </tr>
          ) : (
            incomes.map((income) => (
              <tr key={income._id} style={row}>
                <td style={td}>
                  <span style={amount}>
                    {displayAmount(income)}
                  </span>
                </td>

                <td style={td}>
                  <div style={sourceWrapper}>
                    <div style={sourceIcon}>↗</div>
                    <span>{income.source}</span>
                  </div>
                </td>

                <td style={td}>
                  <span style={currencyBadge}>
                    {income.currency || baseCurrency}
                  </span>
                </td>

                <td style={td}>
                  {income.date
                    ? new Date(income.date).toLocaleDateString()
                    : "—"}
                </td>

                <td style={td}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      style={editBtn}
                      onClick={() => onEdit(income)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      style={deleteBtn}
                      onClick={() => handleDelete(income._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

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

const row = {
  transition: "background 0.2s",
};

const amount = {
  color: "#4ade80",
  fontWeight: 700,
  whiteSpace: "nowrap",
};

const sourceWrapper = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  color: "#e5e7eb",
};

const sourceIcon = {
  width: 28,
  height: 28,
  borderRadius: 8,
  background: "rgba(74,222,128,0.1)",
  color: "#4ade80",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const currencyBadge = {
  padding: "5px 8px",
  borderRadius: 6,
  background: "rgba(255,255,255,0.05)",
  fontSize: 11,
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
