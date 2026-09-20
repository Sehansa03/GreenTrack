import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function ExpenseChart({
  expenses = [],
  baseCurrency = "LKR",
  rates = {},
}) {
  // ============================
  // CONVERT TO BASE CURRENCY
  // ============================
  const convertToBase = (amount, currency) => {
    const numericAmount = Number(amount || 0);

    if (currency === baseCurrency) {
      return numericAmount;
    }

    const rate = rates[currency];

    if (!rate) {
      return 0;
    }

    return numericAmount / Number(rate);
  };

  // ============================
  // GROUP EXPENSES BY CATEGORY
  // ============================
  const categoryTotals = {};

  expenses.forEach((expense) => {
    const category = expense.category || "Other";

    const amount = convertToBase(
      expense.amount,
      expense.currency
    );

    categoryTotals[category] =
      (categoryTotals[category] || 0) + amount;
  });

  const chartData = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      name: category,
      value: Math.round(amount * 100) / 100,
    }))
    .filter((item) => item.value > 0);

  // ============================
  // CATEGORY COLORS
  // ============================
  const COLORS = [
    "#22c55e",
    "#38bdf8",
    "#facc15",
    "#f87171",
    "#a78bfa",
    "#fb923c",
    "#2dd4bf",
    "#94a3b8",
  ];

  // ============================
  // EMPTY STATE
  // ============================
  if (chartData.length === 0) {
    return (
      <div>
        <div style={header}>
          <h3 style={title}>
            Expense Distribution
          </h3>

          <p style={subtitle}>
            Breakdown by category · {baseCurrency}
          </p>
        </div>

        <div style={empty}>
          <div style={emptyIcon}>◔</div>

          <p style={emptyTitle}>
            No expense data
          </p>

          <p style={emptyText}>
            Add expenses to see your spending distribution.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* HEADER */}
      <div style={header}>
        <h3 style={title}>
          Expense Distribution
        </h3>

        <p style={subtitle}>
          Breakdown by category · {baseCurrency}
        </p>
      </div>

      {/* CHART */}
      <div style={chartWrapper}>
        <ResponsiveContainer
          width="100%"
          height={280}
        >
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="45%"
              outerRadius={85}
              innerRadius={52}
              paddingAngle={3}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${entry.name}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(value) =>
                `${baseCurrency} ${Number(value).toLocaleString()}`
              }
              contentStyle={{
                background: "#111a15",
                border: "1px solid rgba(74,222,128,0.15)",
                borderRadius: 10,
                color: "#fff",
                fontSize: 12,
              }}
              itemStyle={{
                color: "#f9fafb",
              }}
              labelStyle={{
                color: "#4ade80",
              }}
            />

            <Legend
              verticalAlign="bottom"
              height={45}
              iconType="circle"
              wrapperStyle={{
                fontSize: 11,
                color: "rgba(255,255,255,0.55)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* CATEGORY TOTALS */}
      <div style={categoryList}>
        {chartData.map((item, index) => (
          <div
            key={item.name}
            style={categoryRow}
          >
            <div style={categoryName}>
              <span
                style={{
                  ...dot,
                  background:
                    COLORS[index % COLORS.length],
                }}
              />

              {item.name}
            </div>

            <span style={categoryAmount}>
              {baseCurrency}{" "}
              {Number(item.value).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================
// STYLES
// ============================

const header = {
  marginBottom: 10,
};

const title = {
  margin: 0,
  fontSize: 17,
  color: "#fff",
};

const subtitle = {
  margin: "5px 0 0",
  fontSize: 11,
  color: "rgba(255,255,255,0.3)",
};

const chartWrapper = {
  width: "100%",
  height: 300,
};

const categoryList = {
  marginTop: 4,
  borderTop: "1px solid rgba(255,255,255,0.05)",
};

const categoryRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "10px 2px",
  borderBottom: "1px solid rgba(255,255,255,0.04)",
};

const categoryName = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 12,
  color: "rgba(255,255,255,0.6)",
};

const dot = {
  width: 7,
  height: 7,
  borderRadius: "50%",
  display: "inline-block",
};

const categoryAmount = {
  fontSize: 12,
  color: "#e5e7eb",
  fontWeight: 600,
};

const empty = {
  height: 280,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
};

const emptyIcon = {
  fontSize: 38,
  color: "rgba(74,222,128,0.5)",
  marginBottom: 8,
};

const emptyTitle = {
  margin: 0,
  fontSize: 14,
  color: "rgba(255,255,255,0.5)",
};

const emptyText = {
  margin: "7px 0 0",
  maxWidth: 220,
  fontSize: 11,
  lineHeight: 1.5,
  color: "rgba(255,255,255,0.25)",
};