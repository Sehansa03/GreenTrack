export default function ExpenseFilter({
  filters,
  setFilters,
  onClear,
}) {
  const updateFilter = (key, value) => {
    setFilters({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div style={filterContainer}>

      {/* CATEGORY SEARCH */}
      <div style={inputGroup}>
        <label style={label}>
          SEARCH CATEGORY
        </label>

        <input
          type="text"
          placeholder="Food, Transport..."
          value={filters.category}
          onChange={(e) =>
            updateFilter("category", e.target.value)
          }
          style={input}
        />
      </div>

      {/* CURRENCY */}
      <div style={inputGroup}>
        <label style={label}>
          CURRENCY
        </label>

        <select
          value={filters.currency}
          onChange={(e) =>
            updateFilter("currency", e.target.value)
          }
          style={select}
        >
          <option
            value=""
            style={{
              background: "#151d18",
              color: "#f9fafb",
            }}
          >
            All currencies
          </option>

          <option
            value="LKR"
            style={{
              background: "#151d18",
              color: "#f9fafb",
            }}
          >
            LKR
          </option>

          <option
            value="USD"
            style={{
              background: "#151d18",
              color: "#f9fafb",
            }}
          >
            USD
          </option>

          <option
            value="EUR"
            style={{
              background: "#151d18",
              color: "#f9fafb",
            }}
          >
            EUR
          </option>

          <option
            value="GBP"
            style={{
              background: "#151d18",
              color: "#f9fafb",
            }}
          >
            GBP
          </option>

          <option
            value="INR"
            style={{
              background: "#151d18",
              color: "#f9fafb",
            }}
          >
            INR
          </option>

          <option
            value="AUD"
            style={{
              background: "#151d18",
              color: "#f9fafb",
            }}
          >
            AUD
          </option>
        </select>
      </div>

      {/* FROM DATE */}
      <div style={inputGroup}>
        <label style={label}>
          FROM DATE
        </label>

        <input
          type="date"
          value={filters.from}
          onChange={(e) =>
            updateFilter("from", e.target.value)
          }
          style={input}
        />
      </div>

      {/* TO DATE */}
      <div style={inputGroup}>
        <label style={label}>
          TO DATE
        </label>

        <input
          type="date"
          value={filters.to}
          onChange={(e) =>
            updateFilter("to", e.target.value)
          }
          style={input}
        />
      </div>

      {/* CLEAR */}
      <button
        type="button"
        style={clearBtn}
        onClick={onClear}
      >
        Clear
      </button>

    </div>
  );
}

// ============================
// STYLES
// ============================

const filterContainer = {
  display: "grid",
  gridTemplateColumns: "1.5fr 1fr 1fr 1fr auto",
  gap: 12,
  alignItems: "end",
};

const inputGroup = {
  display: "flex",
  flexDirection: "column",
};

const label = {
  marginBottom: 7,
  fontSize: 10,
  letterSpacing: "1px",
  color: "rgba(255,255,255,0.35)",
  fontWeight: 700,
};

const input = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 11px",
  borderRadius: 9,
  background: "#151d18",
  border: "1px solid rgba(74,222,128,0.18)",
  color: "#f9fafb",
  outline: "none",
  fontSize: 12,
};

const select = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 11px",
  borderRadius: 9,
  background: "#151d18",
  border: "1px solid rgba(74,222,128,0.18)",
  color: "#f9fafb",
  outline: "none",
  cursor: "pointer",
  fontSize: 12,
};

const clearBtn = {
  padding: "10px 16px",
  borderRadius: 9,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.05)",
  color: "#d1d5db",
  cursor: "pointer",
  fontSize: 12,
  whiteSpace: "nowrap",
};