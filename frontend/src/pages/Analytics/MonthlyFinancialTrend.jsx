import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function MonthlyFinancialTrend({
  incomes,
  expenses,
  baseCurrency,
  convertToBase,
}) {
  const monthlyData = {};

  // Process income
  incomes.forEach((income) => {
    const date = new Date(income.date);

    if (isNaN(date)) return;

    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        monthKey,
        income: 0,
        expense: 0,
      };
    }

    monthlyData[monthKey].income += convertToBase(
      income.amount,
      income.currency
    );
  });

  // Process expenses
  expenses.forEach((expense) => {
    const date = new Date(expense.date);

    if (isNaN(date)) return;

    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        monthKey,
        income: 0,
        expense: 0,
      };
    }

    monthlyData[monthKey].expense += convertToBase(
      expense.amount,
      expense.currency
    );
  });

  const data = Object.values(monthlyData)
    .sort((a, b) =>
      a.monthKey.localeCompare(b.monthKey)
    )
    .map((item) => ({
      ...item,
      month: formatMonth(item.monthKey),
    }));

  if (data.length === 0) {
    return (
      <div style={emptyState}>
        <div style={emptyIcon}>◌</div>
        <p style={emptyTitle}>
          No monthly data yet
        </p>
        <span style={emptyDescription}>
          Add income or expenses to see your financial trend.
        </span>
      </div>
    );
  }

  return (
    <div style={chartWrapper}>
      <ResponsiveContainer width="100%" height={340}>
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 20,
            left: 10,
            bottom: 10,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.06)"
            vertical={false}
          />

          <XAxis
            dataKey="month"
            tick={{
              fill: "rgba(255,255,255,0.5)",
              fontSize: 11,
            }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            tick={{
              fill: "rgba(255,255,255,0.4)",
              fontSize: 10,
            }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) =>
              Number(value).toLocaleString()
            }
          />

          <Tooltip
            contentStyle={{
              background: "#ffffff",
              border: "none",
              borderRadius: 10,
              boxShadow:
                "0 8px 30px rgba(0,0,0,0.25)",
              padding: "10px 12px",
            }}
            labelStyle={{
              color: "#111827",
              fontWeight: 600,
              marginBottom: 6,
            }}
            itemStyle={{
              color: "#111827",
              fontSize: 12,
            }}
            formatter={(value, name) => [
              `${baseCurrency} ${Number(
                value
              ).toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}`,
              name === "income"
                ? "Income"
                : "Expense",
            ]}
          />

          <Line
            type="monotone"
            dataKey="income"
            stroke="#4ade80"
            strokeWidth={3}
            dot={{
              r: 4,
              strokeWidth: 2,
              fill: "#101814",
            }}
            activeDot={{
              r: 6,
            }}
          />

          <Line
            type="monotone"
            dataKey="expense"
            stroke="#f87171"
            strokeWidth={3}
            dot={{
              r: 4,
              strokeWidth: 2,
              fill: "#101814",
            }}
            activeDot={{
              r: 6,
            }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div style={legend}>
        <div style={legendItem}>
          <span
            style={{
              ...legendDot,
              background: "#4ade80",
            }}
          />
          <span>Income</span>
        </div>

        <div style={legendItem}>
          <span
            style={{
              ...legendDot,
              background: "#f87171",
            }}
          />
          <span>Expense</span>
        </div>
      </div>
    </div>
  );
}

function formatMonth(monthKey) {
  const [year, month] = monthKey.split("-");

  const date = new Date(
    Number(year),
    Number(month) - 1,
    1
  );

  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

const chartWrapper = {
  width: "100%",
  marginTop: 20,
};

const legend = {
  display: "flex",
  justifyContent: "center",
  gap: 24,
  marginTop: 4,
};

const legendItem = {
  display: "flex",
  alignItems: "center",
  gap: 7,
  fontSize: 12,
  color: "rgba(255,255,255,0.6)",
};

const legendDot = {
  width: 8,
  height: 8,
  borderRadius: "50%",
};

const emptyState = {
  height: 340,
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