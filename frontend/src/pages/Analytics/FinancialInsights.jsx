export default function FinancialInsights({
  incomes,
  expenses,
  totalIncome,
  totalExpense,
  balance,
  savingsRate,
  baseCurrency,
  convertToBase,
}) {
  /* --------------------------------
     1. Highest Spending Category
  --------------------------------- */

  const categoryTotals = expenses.reduce((acc, expense) => {
    const category = expense.category || "Other";

    const amount = convertToBase(
      expense.amount,
      expense.currency
    );

    acc[category] = (acc[category] || 0) + amount;

    return acc;
  }, {});

  const categoryEntries = Object.entries(categoryTotals);

  const highestCategory =
    categoryEntries.length > 0
      ? categoryEntries.reduce((highest, current) =>
          current[1] > highest[1] ? current : highest
        )
      : null;

  const highestCategoryName =
    highestCategory?.[0] || "No data";

  const highestCategoryAmount =
    highestCategory?.[1] || 0;

  const highestCategoryPercentage =
    totalExpense > 0
      ? (highestCategoryAmount / totalExpense) * 100
      : 0;

  /* --------------------------------
     2. Monthly Expense Data
  --------------------------------- */

  const monthlyExpenses = {};

  expenses.forEach((expense) => {
    const date = new Date(expense.date);

    if (isNaN(date)) return;

    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    const amount = convertToBase(
      expense.amount,
      expense.currency
    );

    monthlyExpenses[monthKey] =
      (monthlyExpenses[monthKey] || 0) + amount;
  });

  const monthlyEntries = Object.entries(monthlyExpenses);

  /* --------------------------------
     3. Highest Spending Month
  --------------------------------- */

  const highestMonth =
    monthlyEntries.length > 0
      ? monthlyEntries.reduce((highest, current) =>
          current[1] > highest[1] ? current : highest
        )
      : null;

  const highestMonthName = highestMonth
    ? formatMonth(highestMonth[0])
    : "No data";

  const highestMonthAmount =
    highestMonth?.[1] || 0;

  /* --------------------------------
     4. Average Monthly Expense
  --------------------------------- */

  const averageMonthlyExpense =
    monthlyEntries.length > 0
      ? totalExpense / monthlyEntries.length
      : 0;

  /* --------------------------------
     5. Expense-to-Income Ratio
  --------------------------------- */

  const expenseRatio =
    totalIncome > 0
      ? (totalExpense / totalIncome) * 100
      : 0;

  return (
    <div style={grid}>
      {/* Highest Category */}
      <InsightCard
        icon="◉"
        title="Top Spending Category"
        value={highestCategoryName}
        description={
          highestCategory
            ? `${baseCurrency} ${formatNumber(
                highestCategoryAmount
              )} · ${highestCategoryPercentage.toFixed(
                1
              )}% of expenses`
            : "No expense data available"
        }
      />

      {/* Highest Month */}
      <InsightCard
        icon="◷"
        title="Highest Spending Month"
        value={highestMonthName}
        description={
          highestMonth
            ? `${baseCurrency} ${formatNumber(
                highestMonthAmount
              )} spent`
            : "No monthly data available"
        }
      />

      {/* Average Monthly Expense */}
      <InsightCard
        icon="≈"
        title="Average Monthly Expense"
        value={`${baseCurrency} ${formatNumber(
          averageMonthlyExpense
        )}`}
        description="Based on recorded expense months"
      />

      {/* Expense Ratio */}
      <InsightCard
        icon="↗"
        title="Income Used for Expenses"
        value={`${expenseRatio.toFixed(1)}%`}
        description="Percentage of total income spent"
      />

      {/* Savings Rate */}
      <InsightCard
        icon="◈"
        title="Savings Rate"
        value={`${savingsRate.toFixed(1)}%`}
        description={
          balance >= 0
            ? `${baseCurrency} ${formatNumber(
                balance
              )} remaining`
            : `${baseCurrency} ${formatNumber(
                Math.abs(balance)
              )} over income`
        }
      />
    </div>
  );
}

/* --------------------------------
   Insight Card
--------------------------------- */

function InsightCard({
  icon,
  title,
  value,
  description,
}) {
  return (
    <div style={card}>
      <div style={topRow}>
        <div style={iconBox}>{icon}</div>

        <span style={titleStyle}>
          {title}
        </span>
      </div>

      <h3 style={valueStyle}>
        {value}
      </h3>

      <p style={descriptionStyle}>
        {description}
      </p>
    </div>
  );
}

/* --------------------------------
   Helpers
--------------------------------- */

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

function formatNumber(value) {
  return Number(value).toLocaleString(
    undefined,
    {
      maximumFractionDigits: 2,
    }
  );
}

/* --------------------------------
   Styles
--------------------------------- */

const grid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 16,
  marginTop: 20,
};

const card = {
  background: "#101814",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 16,
  padding: 20,
  minHeight: 145,
};

const topRow = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const iconBox = {
  width: 30,
  height: 30,
  borderRadius: 8,
  background: "rgba(74,222,128,0.1)",
  color: "#4ade80",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 14,
};

const titleStyle = {
  fontSize: 12,
  color: "rgba(255,255,255,0.45)",
};

const valueStyle = {
  margin: "18px 0 8px",
  fontSize: 21,
  fontWeight: 700,
  color: "#f9fafb",
};

const descriptionStyle = {
  margin: 0,
  fontSize: 11,
  lineHeight: 1.5,
  color: "rgba(255,255,255,0.35)",
};