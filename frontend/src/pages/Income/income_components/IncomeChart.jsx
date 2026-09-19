import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const SOURCE_COLORS = {
  Salary: "#22c55e",
  Freelance: "#38bdf8",
  Business: "#facc15",
  Investment: "#f87171",
  Other: "#a78bfa",
};

const DEFAULT_COLORS = [
  "#22c55e",
  "#38bdf8",
  "#facc15",
  "#f87171",
  "#a78bfa",
];

export default function IncomeChart({
  incomes,
  baseCurrency = "LKR",
  rates = {},
}) {
  // --------------------------------
  // Convert amount to user's currency
  // --------------------------------
  const convertToBase = (amount, currency) => {
    const numericAmount = Number(amount || 0);

    // Same currency
    if (currency === baseCurrency) {
      return numericAmount;
    }

    const rate = rates[currency];

    // Exchange rate not available
    if (!rate) {
      return 0;
    }

    // Frankfurter gives:
    // 1 BASE = RATE SOURCE
    //
    // Therefore:
    // SOURCE → BASE
    // amount / rate

    return numericAmount / Number(rate);
  };

  // --------------------------------
  // Group income by source
  // --------------------------------
  const grouped = {};

  incomes.forEach((income) => {
    const key = income.source || "Other";

    const convertedAmount = convertToBase(
      income.amount,
      income.currency
    );

    grouped[key] =
      (grouped[key] || 0) + convertedAmount;
  });

  // --------------------------------
  // Calculate total
  // --------------------------------
  const total = Object.values(grouped).reduce(
    (sum, value) => sum + value,
    0
  );

  // --------------------------------
  // Create chart data
  // --------------------------------
  const data = Object.entries(grouped)
    .map(([name, value]) => {
      const percentage =
        total > 0
          ? (value / total) * 100
          : 0;

      return {
        name,
        value: Number(value.toFixed(2)),
        percentage: Number(percentage.toFixed(1)),
      };
    })
    .sort((a, b) => b.value - a.value);

  // --------------------------------
  // Get color for source
  // --------------------------------
  const getColor = (name, index) => {
    return (
      SOURCE_COLORS[name] ||
      DEFAULT_COLORS[index % DEFAULT_COLORS.length]
    );
  };

  return (
    <div>
      {/* HEADER */}
      <div style={chartHeader}>
        <div>
          <h3 style={chartTitle}>
            Income Distribution
          </h3>

          <p style={chartSubtitle}>
            Breakdown by income source · {baseCurrency}
          </p>
        </div>
      </div>

      {/* NO DATA */}
      {data.length === 0 ? (
        <div style={noData}>
          No chart data available
        </div>
      ) : (
        <>
          {/* PIE CHART */}
          <div
            style={{
              width: "100%",
              height: 250,
            }}
          >
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={82}
                  innerRadius={54}
                  paddingAngle={3}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getColor(
                        entry.name,
                        index
                      )}
                    />
                  ))}
                </Pie>

                {/* TOOLTIP */}
                <Tooltip
                  formatter={(value, name, props) => {
                    const percentage =
                      props.payload?.percentage || 0;

                    return [
                      `${baseCurrency} ${Number(
                        value
                      ).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })} (${percentage}%)`,
                      name,
                    ];
                  }}
                  contentStyle={{
                    background: "#101814",
                    border:
                      "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 10,
                    color: "#fff",
                    boxShadow:
                      "0 8px 25px rgba(0,0,0,0.3)",
                  }}
                  labelStyle={{
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* SOURCE BREAKDOWN */}
          <div style={breakdown}>
            {data.map((item, index) => (
              <div
                key={item.name}
                style={breakdownRow}
              >
                {/* LEFT */}
                <div style={sourceInfo}>
                  <span
                    style={{
                      ...colorDot,
                      backgroundColor:
                        getColor(
                          item.name,
                          index
                        ),
                    }}
                  />

                  <span style={sourceName}>
                    {item.name}
                  </span>
                </div>

                {/* RIGHT */}
                <div style={amountInfo}>
                  <span style={amount}>
                    {baseCurrency}{" "}
                    {item.value.toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}
                  </span>

                  <span style={percentage}>
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* --------------------------------
   STYLES
-------------------------------- */

const chartHeader = {
  marginBottom: 6,
};

const chartTitle = {
  margin: 0,
  fontSize: 17,
  color: "#fff",
};

const chartSubtitle = {
  margin: "5px 0 0",
  fontSize: 12,
  color: "rgba(255,255,255,0.35)",
};

const noData = {
  height: 250,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "rgba(255,255,255,0.3)",
  fontSize: 13,
};

const breakdown = {
  marginTop: 4,
  borderTop:
    "1px solid rgba(255,255,255,0.06)",
  paddingTop: 12,
};

const breakdownRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "9px 0",
  borderBottom:
    "1px solid rgba(255,255,255,0.04)",
};

const sourceInfo = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const colorDot = {
  width: 9,
  height: 9,
  borderRadius: "50%",
  display: "inline-block",
};

const sourceName = {
  fontSize: 12,
  color: "#d1d5db",
};

const amountInfo = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const amount = {
  fontSize: 11,
  color: "#d1d5db",
};

const percentage = {
  minWidth: 42,
  textAlign: "right",
  fontSize: 11,
  fontWeight: 600,
  color: "#4ade80",
};