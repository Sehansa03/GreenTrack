
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const compact = (value) =>
  Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

export default function MonthlyFinancialTrend({
  incomes,
  expenses,
  baseCurrency,
  convertToBase,
}) {
  const monthly = {};

  function addRecords(records, field) {
    records.forEach((record) => {
      const date = String(record.date || "").slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return;

      const monthKey = date.slice(0, 7);
      const amount = convertToBase(
        record.amount,
        record.currency
      );

      if (amount === null || !Number.isFinite(Number(amount))) {
        return;
      }

      if (!monthly[monthKey]) {
        monthly[monthKey] = {
          monthKey,
          income: 0,
          expense: 0,
        };
      }

      monthly[monthKey][field] += Number(amount);
    });
  }

  addRecords(incomes, "income");
  addRecords(expenses, "expense");

  const data = Object.values(monthly)
    .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
    .map((item) => {
      const [year, month] = item.monthKey.split("-");
      return {
        ...item,
        month: new Date(
          Number(year),
          Number(month) - 1,
          1
        ).toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        }),
      };
    });

  if (!data.length) {
    return (
      <div className="gt-analytics-empty">
        <span className="gt-analytics-empty-icon">⌁</span>
        <strong>No monthly data yet</strong>
        <p>Add transactions to view your financial trend.</p>
      </div>
    );
  }

  return (
    <div className="gt-analytics-chart-body">
      <ResponsiveContainer width="100%" height={315}>
        <LineChart
          data={data}
          margin={{ top: 12, right: 16, left: -15, bottom: 6 }}
        >
          <CartesianGrid
            stroke="#28342D"
            strokeDasharray="3 5"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#93A29A", fontSize: 11 }}
            minTickGap={20}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#829188", fontSize: 11 }}
            tickFormatter={compact}
            width={58}
          />
          <Tooltip
            formatter={(value, name) => [
              `${baseCurrency} ${Number(value).toLocaleString(
                "en-US",
                { maximumFractionDigits: 2 }
              )}`,
              name === "income" ? "Income" : "Expense",
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
          <Legend
            verticalAlign="bottom"
            wrapperStyle={{ paddingTop: 12, fontSize: 12 }}
            formatter={(value) =>
              value === "income" ? "Income" : "Expense"
            }
          />
          <Line
            type="monotone"
            dataKey="income"
            stroke="#35B978"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#171E1B" }}
            activeDot={{ r: 6 }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="expense"
            stroke="#E77D7D"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#171E1B" }}
            activeDot={{ r: 6 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
