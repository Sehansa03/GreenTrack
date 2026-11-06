
import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useCurrency } from "../../../context//useCurrency";

const SOURCE_COLORS = {
  Salary: "#35b978",
  Freelance: "#60a5fa",
  Business: "#e5b85c",
  Investment: "#c084fc",
  Other: "#fb923c",
};

const DEFAULT_COLORS = [
  "#35b978",
  "#60a5fa",
  "#e5b85c",
  "#c084fc",
  "#fb923c",
  "#2dd4bf",
];

const formatAmount = (value) =>
  Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function IncomeChartTooltip({ active, payload, currency }) {
  if (!active || !payload?.length) return null;

  const item = payload[0].payload;

  return (
    <div className="gt-income-chart-tooltip">
      <strong>{item.name}</strong>
      <span>
        {currency} {formatAmount(item.value)}
      </span>
      <small>{item.percentage.toFixed(1)}% of total</small>
    </div>
  );
}

export default function IncomeChart({
  incomes = [],
  baseCurrency,
}) {
  const {
    currency: preferredCurrency,
    convertAmount,
    ratesLoading,
    loading,
  } = useCurrency();

  const currency = preferredCurrency || baseCurrency || "LKR";
  const isLoading = loading || ratesLoading;

  const { data, total, missingRates } = useMemo(() => {
    const grouped = {};
    let missing = 0;

    incomes.forEach((income) => {
      const source = income.source || "Other";
      const originalCurrency = income.currency || currency;

      const converted = convertAmount(
        income.amount,
        originalCurrency
      );

      if (
        converted == null ||
        !Number.isFinite(Number(converted))
      ) {
        missing += 1;
        return;
      }

      grouped[source] =
        (grouped[source] || 0) + Number(converted);
    });

    const calculatedTotal = Object.values(grouped).reduce(
      (sum, amount) => sum + amount,
      0
    );

    const chartData = Object.entries(grouped)
      .filter(([, value]) => value > 0)
      .map(([name, value], index) => ({
        name,
        value,
        percentage:
          calculatedTotal > 0
            ? (value / calculatedTotal) * 100
            : 0,
        color:
          SOURCE_COLORS[name] ||
          DEFAULT_COLORS[index % DEFAULT_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);

    return {
      data: chartData,
      total: calculatedTotal,
      missingRates: missing,
    };
  }, [incomes, convertAmount, currency]);

  return (
    <div className="gt-income-chart">
      <div className="gt-income-chart-header">
        <div>
          <h3>Income Distribution</h3>
          <p>Breakdown by income source · {currency}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="gt-income-chart-empty">
          Calculating distribution...
        </div>
      ) : data.length === 0 ? (
        <div className="gt-income-chart-empty">
          <span className="gt-income-chart-empty-icon">
            ◌
          </span>
          <strong>No income data yet</strong>
          <p>
            Add income transactions to see how your
            earnings are distributed.
          </p>
        </div>
      ) : (
        <>
          <div className="gt-income-donut-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={76}
                  outerRadius={96}
                  paddingAngle={3}
                  cornerRadius={5}
                  stroke="none"
                >
                  {data.map((item) => (
                    <Cell
                      key={item.name}
                      fill={item.color}
                    />
                  ))}
                </Pie>

                <Tooltip
                  content={
                    <IncomeChartTooltip currency={currency} />
                  }
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="gt-income-donut-center">
              <span>Total income</span>
              <strong>
                {total.toLocaleString(undefined, {
                  notation:
                    total >= 1000000 ? "compact" : "standard",
                  maximumFractionDigits:
                    total >= 1000000 ? 1 : 0,
                })}
              </strong>
              <small>{currency}</small>
            </div>
          </div>

          <div className="gt-income-chart-breakdown">
            <div className="gt-income-chart-breakdown-title">
              <span>Income sources</span>
              <span>{data.length} categories</span>
            </div>

            {data.map((item) => (
              <div
                key={item.name}
                className="gt-income-chart-source-row"
              >
                <div className="gt-income-chart-source-top">
                  <div className="gt-income-chart-source-name">
                    <span
                      className="gt-income-chart-dot"
                      style={{
                        backgroundColor: item.color,
                      }}
                    />

                    <span>{item.name}</span>
                  </div>

                  <strong>
                    {item.percentage.toFixed(1)}%
                  </strong>
                </div>

                <div className="gt-income-chart-progress-track">
                  <div
                    className="gt-income-chart-progress-fill"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>

                <div className="gt-income-chart-source-amount">
                  {currency} {formatAmount(item.value)}
                </div>
              </div>
            ))}
          </div>

          {missingRates > 0 && (
            <p className="gt-income-chart-rate-warning">
              {missingRates} transaction
              {missingRates === 1 ? " is" : "s are"} excluded
              because exchange rates are unavailable.
            </p>
          )}
        </>
      )}
    </div>
  );
}
