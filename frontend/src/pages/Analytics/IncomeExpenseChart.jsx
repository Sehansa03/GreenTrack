
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  LabelList,
} from "recharts";

export default function IncomeExpenseChart({
  totalIncome,
  totalExpense,
  currency,
}) {
  const income = Number(totalIncome) || 0;
  const expense = Number(totalExpense) || 0;

  const data = [
    {
      name: "Income",
      amount: income,
      color: "#35B978",
    },
    {
      name: "Expense",
      amount: expense,
      color: "#E77D7D",
    },
  ];

  const formatMoney = (amount) =>
    `${currency} ${Number(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const compact = (amount) =>
    Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount);

  if (income === 0 && expense === 0) {
    return (
      <div className="gt-analytics-empty">
        <strong>No financial data yet</strong>
        <p>Add income or expenses to see the comparison.</p>
      </div>
    );
  }

  return (
    <div className="gt-analytics-chart-body">
      <ResponsiveContainer width="100%" height={285}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{
            top: 15,
            right: 50,
            left: 5,
            bottom: 10,
          }}
          barCategoryGap="38%"
        >
          <CartesianGrid
            stroke="#28342D"
            strokeDasharray="3 5"
            horizontal={false}
          />

          <XAxis
            type="number"
            domain={[0, "dataMax"]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#829188", fontSize: 11 }}
            tickFormatter={compact}
          />

          <YAxis
            type="category"
            dataKey="name"
            width={65}
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "#B6C3BA",
              fontSize: 12,
              fontWeight: 500,
            }}
          />

          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.03)" }}
            formatter={(value) => [
              formatMoney(value),
              "Amount",
            ]}
            contentStyle={{
              background: "#202925",
              border: "1px solid #34453A",
              borderRadius: 10,
              color: "#F2F5F3",
            }}
            labelStyle={{ color: "#F2F5F3" }}
            itemStyle={{ color: "#F2F5F3" }}
          />

          <Bar
            dataKey="amount"
            maxBarSize={45}
            radius={[0, 7, 7, 0]}
          >
            {data.map((item) => (
              <Cell key={item.name} fill={item.color} />
            ))}

            <LabelList
              dataKey="amount"
              position="right"
              formatter={compact}
              style={{
                fill: "#E5EDE7",
                fontSize: 11,
                fontWeight: 600,
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="gt-analytics-mini-legend">
        <span>
          <i style={{ background: "#35B978" }} />
          Income
        </span>
        <span>
          <i style={{ background: "#E77D7D" }} />
          Expense
        </span>
      </div>
    </div>
  );
}
