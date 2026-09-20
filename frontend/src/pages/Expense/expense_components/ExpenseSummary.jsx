export default function ExpenseSummary({
  total,
  expenseCount = 0,
  currency = "LKR",
  loading = false,
}) {
  return (
    <div style={summaryGrid}>

      {/* Total Expense */}
      <div style={summaryCard}>
        <div style={summaryTop}>
          <span>Total Expense</span>
          <div style={icon}>↘</div>
        </div>

        <h2 style={value}>
          {loading
            ? "Loading..."
            : `${currency} ${Number(total).toLocaleString()}`}
        </h2>

        <p style={description}>
          Based on current filtered records
        </p>
      </div>

      {/* Expense Entries */}
      <div style={summaryCard}>
        <div style={summaryTop}>
          <span>Expense Entries</span>
          <div style={icon}>▤</div>
        </div>

        <h2 style={value}>
          {expenseCount}
        </h2>

        <p style={description}>
          Recorded expense transactions
        </p>
      </div>

      {/* Spending Overview */}
      <div style={summaryCard}>
        <div style={summaryTop}>
          <span>Spending Overview</span>
          <div style={icon}>✦</div>
        </div>

        <h2 style={value}>
          Tracking
        </h2>

        <p style={description}>
          Keep monitoring your spending
        </p>
      </div>

    </div>
  );
}

const summaryGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 18,
  marginBottom: 24,
};

const summaryCard = {
  background: "#101814",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 16,
  padding: 22,
};

const summaryTop = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  color: "rgba(255,255,255,0.4)",
  fontSize: 12,
};

const icon = {
  width: 30,
  height: 30,
  borderRadius: 8,
  background: "rgba(74,222,128,0.1)",
  color: "#4ade80",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const value = {
  fontSize: 25,
  margin: "18px 0 8px",
  color: "#f9fafb",
};

const description = {
  fontSize: 11,
  color: "rgba(255,255,255,0.3)",
  margin: 0,
};