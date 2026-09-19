export default function IncomeFilter({
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

      <div style={inputGroup}>
        <label style={label}>SEARCH SOURCE</label>
        <input
          placeholder="Salary, Freelance..."
          value={filters.source}
          onChange={(e) =>
            updateFilter("source", e.target.value)
          }
          style={input}
        />
      </div>

      <div style={inputGroup}>
        <label style={label}>CURRENCY</label>
        <select
          value={filters.currency}
          onChange={(e) =>
            updateFilter("currency", e.target.value)
          }
          style={input}
        >
          <option value="">All currencies</option>
          <option value="LKR">LKR</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
        </select>
      </div>

      <div style={inputGroup}>
        <label style={label}>FROM DATE</label>
        <input
          type="date"
          value={filters.from}
          onChange={(e) =>
            updateFilter("from", e.target.value)
          }
          style={input}
        />
      </div>

      <div style={inputGroup}>
        <label style={label}>TO DATE</label>
        <input
          type="date"
          value={filters.to}
          onChange={(e) =>
            updateFilter("to", e.target.value)
          }
          style={input}
        />
      </div>

      <button style={clearBtn} onClick={onClear}>
        Clear
      </button>

    </div>
  );
}

const filterContainer = {
  display: "flex",
  gap: 13,
  alignItems: "flex-end",
  flexWrap: "wrap",
};

const inputGroup = {
  display: "flex",
  flexDirection: "column",
  gap: 7,
  flex: 1,
  minWidth: 145,
};

const label = {
  fontSize: 10,
  letterSpacing: "0.7px",
  fontWeight: 600,
  color: "rgba(255,255,255,0.38)",
};

const input = {
  width: "100%",
  boxSizing: "border-box",
  height: 40,
  background: "#080d0b",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#d1d5db",
  padding: "0 11px",
  borderRadius: 8,
  outline: "none",
  fontSize: 12,
};

const clearBtn = {
  height: 40,
  padding: "0 15px",
  background: "transparent",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "rgba(255,255,255,0.45)",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 12,
};