
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

const COLORS = [
  "#35B978",
  "#5D9DE0",
  "#E7AF61",
  "#E77D7D",
  "#A78BDA",
  "#D88DB9",
  "#4EBBAF",
  "#C88C60",
];

export default function ExpenseDistributionChart({
  expenses,
  baseCurrency,
  convertToBase,
}) {
  const totals = {};

  expenses.forEach((expense) => {
    const amount = convertToBase(
      expense.amount,
      expense.currency
    );

    if (amount === null || !Number.isFinite(Number(amount))) {
      return;
    }

    const category = expense.category || "Other";
    totals[category] = (totals[category] || 0) + Number(amount);
  });

  const total = Object.values(totals).reduce(
    (sum, value) => sum + value,
    0
  );

  const data = Object.entries(totals)
    .map(([name, amount]) => ({
      name,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
    }))
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const formatMoney = (amount) =>
    `${baseCurrency} ${Number(amount).toLocaleString("en-US", {
      maximumFractionDigits: 2,
    })}`;

  if (!data.length) {
    return (
      <div className="gt-analytics-empty">
        <span className="gt-analytics-empty-icon">◌</span>
        <strong>No expense data yet</strong>
        <p>Add expenses to see your spending distribution.</p>
      </div>
    );
  }

  return (
    <div className="gt-analytics-distribution">
      <div className="gt-analytics-donut">
        <ResponsiveContainer width="100%" height={245}>
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={3}
              stroke="none"
            >
              {data.map((item, index) => (
                <Cell
                  key={item.name}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [
                formatMoney(value),
                name,
              ]}
              contentStyle={{
                background: "#202925",
                border: "1px solid #34453A",
                borderRadius: 10,
                color: "#F2F5F3",
              }}
              itemStyle={{ color: "#F2F5F3" }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="gt-analytics-donut-center">
          <span>Total spent</span>
          <strong>
            {Intl.NumberFormat("en-US", {
              notation: "compact",
              maximumFractionDigits: 1,
            }).format(total)}
          </strong>
          <small>{baseCurrency}</small>
        </div>
      </div>

      <div className="gt-analytics-category-list">
        {data.map((item, index) => (
          <div
            key={item.name}
            className="gt-analytics-category"
          >
            <div className="gt-analytics-category-info">
              <span
                className="gt-analytics-category-dot"
                style={{
                  background: COLORS[index % COLORS.length],
                }}
              />
              <span>{item.name}</span>
            </div>

            <div className="gt-analytics-category-values">
              <strong>{item.percentage.toFixed(1)}%</strong>
              <small>{formatMoney(item.amount)}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
