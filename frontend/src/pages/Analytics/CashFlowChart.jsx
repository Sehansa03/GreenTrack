
import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";

export default function CashFlowChart({
  incomes = [],
  expenses = [],
  baseCurrency = "LKR",
  convertToBase,
}) {
  const data = useMemo(() => {
    const now = new Date();

    // Create a continuous timeline of the last 6 months
    const months = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1
      );

      const key = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
      ].join("-");

      months.push({
        key,
        month: date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        income: 0,
        expense: 0,
        cashFlow: 0,
      });
    }

    const monthMap = Object.fromEntries(
      months.map((item) => [item.key, item])
    );

    // Add income and expenses to their actual months
    function addTransactions(records, type) {
      records.forEach((record) => {
        const rawDate = record.date;

        if (!rawDate) return;

        const date = String(rawDate).slice(0, 10);

        // Accept dates in YYYY-MM-DD format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          return;
        }

        const key = date.slice(0, 7);

        // Ignore transactions outside the displayed 6 months
        if (!monthMap[key]) return;

        const amount = convertToBase(
          record.amount,
          record.currency || baseCurrency
        );

        if (
          amount === null ||
          amount === undefined ||
          !Number.isFinite(Number(amount))
        ) {
          return;
        }

        monthMap[key][type] += Number(amount);
      });
    }

    addTransactions(incomes, "income");
    addTransactions(expenses, "expense");

    return months.map((item) => ({
      ...item,
      cashFlow: item.income - item.expense,
    }));
  }, [incomes, expenses, baseCurrency, convertToBase]);

  const formatMoney = (amount) =>
    `${baseCurrency} ${Number(amount).toLocaleString(
      "en-US",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;

  const compact = (amount) =>
    Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount);

  const hasTransactions = data.some(
    (item) => item.income !== 0 || item.expense !== 0
  );

  return (
    <div className="gt-analytics-chart-body">
      <ResponsiveContainer width="100%" height={285}>
        <BarChart
          data={data}
          margin={{
            top: 15,
            right: 15,
            left: -10,
            bottom: 5,
          }}
          barCategoryGap="35%"
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
            tick={{
              fill: "#93A29A",
              fontSize: 11,
            }}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            width={55}
            tick={{
              fill: "#829188",
              fontSize: 11,
            }}
            tickFormatter={compact}
            domain={([dataMin, dataMax]) => {
              const min = Math.min(dataMin, 0);
              const max = Math.max(dataMax, 0);

              if (min === 0 && max === 0) {
                return [-1, 1];
              }

              return [
                min < 0 ? min * 1.15 : 0,
                max > 0 ? max * 1.15 : 0,
              ];
            }}
          />

          <ReferenceLine
            y={0}
            stroke="#819087"
            strokeWidth={1}
          />

          <Tooltip
            cursor={{
              fill: "rgba(255,255,255,0.03)",
            }}
            formatter={(value) => [
              formatMoney(value),
              "Net Cash Flow",
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
            dataKey="cashFlow"
            maxBarSize={46}
            radius={[5, 5, 5, 5]}
          >
            {data.map((item) => (
              <Cell
                key={item.key}
                fill={
                  item.cashFlow >= 0
                    ? "#35B978"
                    : "#E77D7D"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="gt-analytics-mini-legend">
        <span>
          <i style={{ background: "#35B978" }} />
          Positive cash flow
        </span>

        <span>
          <i style={{ background: "#E77D7D" }} />
          Negative cash flow
        </span>
      </div>

      {!hasTransactions && (
        <p
          style={{
            textAlign: "center",
            color: "#93A29A",
            fontSize: 12,
            marginTop: 10,
          }}
        >
          No dated transactions in the last 6 months.
        </p>
      )}
    </div>
  );
}
