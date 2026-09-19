export default function IncomeSummary({ total, incomeCount = 0 }) {
  return (
    <div style={summaryGrid}>

      <div style={summaryCard}>
        <div style={summaryTop}>
          <span>Total Income</span>
          <div style={icon}>↗</div>
        </div>

        <h2 style={value}>
          Rs. {Number(total).toLocaleString()}
        </h2>

        <p style={description}>
          Based on current filtered records
        </p>
      </div>

      <div style={summaryCard}>
        <div style={summaryTop}>
          <span>Income Entries</span>
          <div style={icon}>▤</div>
        </div>

        <h2 style={value}>{incomeCount}</h2>

        <p style={description}>
          Recorded income transactions
        </p>
      </div>

      <div style={summaryCard}>
        <div style={summaryTop}>
          <span>Financial Progress</span>
          <div style={icon}>✦</div>
        </div>

        <h2 style={value}>Growing</h2>

        <p style={description}>
          Keep tracking your earnings
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