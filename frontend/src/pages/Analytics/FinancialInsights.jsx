
function formatMoney(value, currency) {
  return `${currency} ${Number(value || 0).toLocaleString(
    "en-US",
    { maximumFractionDigits: 2 }
  )}`;
}

function formatMonth(key) {
  if (!key) return "No data";

  const [year, month] = key.split("-");
  return new Date(
    Number(year),
    Number(month) - 1,
    1
  ).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

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
  const categories = {};
  const months = {};

  expenses.forEach((expense) => {
    const amount = convertToBase(
      expense.amount,
      expense.currency
    );

    if (amount === null || !Number.isFinite(Number(amount))) {
      return;
    }

    const category = expense.category || "Other";
    categories[category] =
      (categories[category] || 0) + Number(amount);

    const date = String(expense.date || "").slice(0, 10);

    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const month = date.slice(0, 7);
      months[month] = (months[month] || 0) + Number(amount);
    }
  });

  const topCategory = Object.entries(categories).sort(
    (a, b) => b[1] - a[1]
  )[0];

  const topMonth = Object.entries(months).sort(
    (a, b) => b[1] - a[1]
  )[0];

  const monthCount = Object.keys(months).length;

  const averageMonthlyExpense =
    monthCount > 0 ? totalExpense / monthCount : 0;

  const expenseRatio =
    totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;

  const insights = [
    {
      icon: "◎",
      title: "Top Spending Category",
      value: topCategory?.[0] || "No data",
      description: topCategory
        ? `${formatMoney(
            topCategory[1],
            baseCurrency
          )} · ${
            totalExpense > 0
              ? ((topCategory[1] / totalExpense) * 100).toFixed(1)
              : "0.0"
          }% of spending`
        : "No expense records available",
    },
    {
      icon: "▦",
      title: "Highest Spending Month",
      value: formatMonth(topMonth?.[0]),
      description: topMonth
        ? `${formatMoney(topMonth[1], baseCurrency)} spent`
        : "No monthly records available",
    },
    {
      icon: "≈",
      title: "Average Monthly Expense",
      value: formatMoney(averageMonthlyExpense, baseCurrency),
      description: "Average across months with expenses",
    },
    {
      icon: "↗",
      title: "Income Used for Expenses",
      value: `${expenseRatio.toFixed(1)}%`,
      description: "Expenses as a percentage of income",
    },
    {
      icon: "◈",
      title: "Savings Rate",
      value: `${savingsRate.toFixed(1)}%`,
      description:
        totalIncome > 0
          ? `${formatMoney(balance, baseCurrency)} remaining`
          : "No income recorded for this period",
    },
    {
      icon: "≡",
      title: "Transactions Analyzed",
      value: String(incomes.length + expenses.length),
      description: `${incomes.length} income · ${expenses.length} expense`,
    },
  ];

  return (
    <div className="gt-analytics-insights-grid">
      {insights.map((item) => (
        <article
          className="gt-analytics-insight-card"
          key={item.title}
        >
          <div className="gt-analytics-insight-top">
            <span className="gt-analytics-insight-icon">
              {item.icon}
            </span>
            <span>{item.title}</span>
          </div>

          <h3>{item.value}</h3>
          <p>{item.description}</p>
        </article>
      ))}
    </div>
  );
}
