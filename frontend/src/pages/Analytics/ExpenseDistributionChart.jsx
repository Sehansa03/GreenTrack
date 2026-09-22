import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

export default function ExpenseDistributionChart({
  expenses,
  baseCurrency,
  convertToBase,
}) {
  // Group expenses by category
  const categoryTotals = expenses.reduce((acc, expense) => {
    const category = expense.category || "Other";

    const amount = convertToBase(
      expense.amount,
      expense.currency
    );

    acc[category] = (acc[category] || 0) + amount;

    return acc;
  }, {});

  const totalExpense = Object.values(categoryTotals).reduce(
    (sum, amount) => sum + amount,
    0
  );

  const data = Object.entries(categoryTotals)
    .map(([name, amount]) => ({
      name,
      amount,
      percentage:
        totalExpense > 0
          ? (amount / totalExpense) * 100
          : 0,
    }))
    .filter((item) => item.amount > 0);

  if (data.length === 0) {
    return (
      <div style={emptyState}>
        <div style={emptyIcon}>◌</div>
        <p style={emptyTitle}>No expense data yet</p>
        <span style={emptyDescription}>
          Add expenses to see your spending distribution.
        </span>
      </div>
    );
  }

  return (
    <div style={chartWrapper}>
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={data}
            dataKey="amount"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={105}
            paddingAngle={3}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell
                key={entry.name}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip
            cursor={false}
            formatter={(value, name, props) => [
              `${baseCurrency} ${Number(value).toLocaleString(
                undefined,
                {
                  maximumFractionDigits: 2,
                }
              )} (${props.payload.percentage.toFixed(1)}%)`,
              name,
            ]}
            contentStyle={{
              background: "#ffffff",
              border: "none",
              borderRadius: 10,
              boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
              padding: "10px 12px",
            }}
            labelStyle={{
              color: "#111827",
              fontWeight: 600,
            }}
            itemStyle={{
              color: "#111827",
              fontSize: 12,
              fontWeight: 500,
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Category legend */}
      <div style={legend}>
        {data.map((item, index) => (
          <div key={item.name} style={legendItem}>
            <div style={legendLeft}>
              <span
                style={{
                  ...legendDot,
                  background: COLORS[index % COLORS.length],
                }}
              />

              <span style={categoryName}>
                {item.name}
              </span>
            </div>

            <div style={legendRight}>
              <span style={percentage}>
                {item.percentage.toFixed(1)}%
              </span>

              <span style={categoryAmount}>
                {baseCurrency}{" "}
                {Number(item.amount).toLocaleString(
                  undefined,
                  {
                    maximumFractionDigits: 2,
                  }
                )}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Different colors for different categories */
const COLORS = [
  "#4ade80", // green
  "#60a5fa", // blue
  "#f59e0b", // amber
  "#f87171", // red
  "#a78bfa", // purple
  "#f472b6", // pink
  "#2dd4bf", // teal
  "#fb923c", // orange
];

const chartWrapper = {
  width: "100%",
  marginTop: 12,
};

const legend = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
  marginTop: 4,
};

const legendItem = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "7px 0",
  borderBottom: "1px solid rgba(255,255,255,0.04)",
};

const legendLeft = {
  display: "flex",
  alignItems: "center",
  gap: 9,
};

const legendRight = {
  display: "flex",
  alignItems: "center",
  gap: 14,
};

const legendDot = {
  width: 8,
  height: 8,
  borderRadius: "50%",
};

const categoryName = {
  fontSize: 12,
  color: "rgba(255,255,255,0.65)",
};

const percentage = {
  fontSize: 12,
  color: "#4ade80",
  fontWeight: 600,
};

const categoryAmount = {
  fontSize: 12,
  color: "#f9fafb",
  fontWeight: 600,
};

const emptyState = {
  height: 320,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
};

const emptyIcon = {
  fontSize: 32,
  color: "#4ade80",
  marginBottom: 10,
};

const emptyTitle = {
  color: "#fff",
  margin: "0 0 6px",
  fontSize: 14,
};

const emptyDescription = {
  color: "rgba(255,255,255,0.3)",
  fontSize: 12,
};