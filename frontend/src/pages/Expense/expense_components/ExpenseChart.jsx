
import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useCurrency } from "../../../context//useCurrency";

const COLORS = [
  "#35b978",
  "#60a5fa",
  "#eabf69",
  "#f28b82",
  "#a78bfa",
  "#fb923c",
  "#2dd4bf",
  "#94a3b8",
];

const formatMoney = (value, currency) =>
  `${currency} ${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function ExpenseChart({
  expenses = [],
  baseCurrency,
}) {
  const {
    currency: preferredCurrency,
    convertAmount,
    ratesLoading,
  } = useCurrency();

  const currency = baseCurrency || preferredCurrency;

  const chartData = useMemo(() => {
    const totals = {};

    expenses.forEach((expense) => {
      const converted = convertAmount(
        expense.amount,
        expense.currency || currency
      );

      const numeric = Number(converted);

      if (
        converted == null ||
        !Number.isFinite(numeric) ||
        numeric <= 0
      ) {
        return;
      }

      const category = expense.category || "Other";
      totals[category] = (totals[category] || 0) + numeric;
    });

    return Object.entries(totals)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses, convertAmount, currency]);

  const total = chartData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  return (
    <div className="gt-expense-chart">
      <div className="gt-expense-chart-header">
        <h3>Expense Distribution</h3>
        <p>Spending breakdown by category · {currency}</p>
      </div>

      {ratesLoading ? (
        <div className="gt-expense-chart-empty">
          Converting currencies...
        </div>
      ) : chartData.length === 0 ? (
        <div className="gt-expense-chart-empty">
          <span className="gt-expense-chart-empty-icon">
            ◔
          </span>
          <strong>No expense data</strong>
          <p>
            Add expenses to see your spending distribution.
          </p>
        </div>
      ) : (
        <>
          <div className="gt-expense-donut-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius="64%"
                  outerRadius="87%"
                  paddingAngle={2}
                  stroke="none"
                >
                  {chartData.map((item, index) => (
                    <Cell
                      key={item.name}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>

                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) {
                      return null;
                    }

                    const item = payload[0].payload;

                    return (
                      <div className="gt-expense-chart-tooltip">
                        <strong>{item.name}</strong>
                        <span>
                          {formatMoney(item.value, currency)}
                        </span>
                        <small>
                          {total > 0
                            ? ((item.value / total) * 100).toFixed(1)
                            : 0}
                          %
                        </small>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="gt-expense-donut-center">
              <span>Total Spending</span>
              <strong>
                {Number(total).toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </strong>
              <small>{currency}</small>
            </div>
          </div>

          <div className="gt-expense-chart-breakdown">
            <div className="gt-expense-chart-breakdown-title">
              <span>Categories</span>
              <span>{chartData.length} total</span>
            </div>

            {chartData.map((item, index) => {
              const percentage =
                total > 0 ? (item.value / total) * 100 : 0;

              return (
                <div
                  className="gt-expense-chart-source-row"
                  key={item.name}
                >
                  <div className="gt-expense-chart-source-top">
                    <span className="gt-expense-chart-source-name">
                      <span
                        className="gt-expense-chart-dot"
                        style={{
                          backgroundColor:
                            COLORS[index % COLORS.length],
                        }}
                      />

                      {item.name}
                    </span>

                    <strong>{percentage.toFixed(1)}%</strong>
                  </div>

                  <div className="gt-expense-chart-progress-track">
                    <div
                      className="gt-expense-chart-progress-fill"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor:
                          COLORS[index % COLORS.length],
                      }}
                    />
                  </div>

                  <div className="gt-expense-chart-source-amount">
                    {formatMoney(item.value, currency)}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
