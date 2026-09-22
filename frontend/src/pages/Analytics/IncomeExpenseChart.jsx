import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  LabelList,
} from "recharts";

export default function IncomeExpenseChart({
  totalIncome,
  totalExpense,
  currency,
}) {
  const data = [
    {
      name: "Income",
      amount: Number(totalIncome || 0),
      color: "#4ade80",
    },
    {
      name: "Expense",
      amount: Number(totalExpense || 0),
      color: "#f87171",
    },
  ];

  return (
    <div style={chartWrapper}>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={data}
          margin={{
            top: 35,
            right: 20,
            left: 20,
            bottom: 10,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.06)"
            vertical={false}
          />

          <XAxis
            dataKey="name"
            tick={{
              fill: "rgba(255,255,255,0.6)",
              fontSize: 13,
              fontWeight: 600,
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
  cursor={{
    fill: "rgba(255,255,255,0.03)",
  }}
  formatter={(value) => [
    `${currency} ${Number(value).toLocaleString(
      undefined,
      {
        maximumFractionDigits: 2,
      }
    )}`,
    "Amount",
  ]}
  contentStyle={{
    background: "#101814",
    border: "1px solid rgba(74,222,128,0.2)",
    borderRadius: 10,
    boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
    color: "#f9fafb",
    padding: "10px 12px",
  }}
  labelStyle={{
    color: "#4ade80",
    fontWeight: 600,
    marginBottom: 5,
  }}
  itemStyle={{
    color: "#f9fafb",
    fontSize: 12,
  }}
/>

          <Bar
            dataKey="amount"
            radius={[8, 8, 0, 0]}
            barSize={70}
          >
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={entry.color}
              />
            ))}

            <LabelList
              dataKey="amount"
              position="top"
              formatter={(value) =>
                `${currency} ${Number(value).toLocaleString(
                  undefined,
                  {
                    maximumFractionDigits: 0,
                  }
                )}`
              }
              style={{
                fill: "#f9fafb",
                fontSize: 11,
                fontWeight: 600,
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const chartWrapper = {
  width: "100%",
  marginTop: 20,
};