
const formatMoney = (value, currency) =>
  `${currency} ${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function ExpenseSummary({
  total = 0,
  expenseCount = 0,
  currency = "LKR",
  loading = false,
}) {
  const average = expenseCount > 0 ? total / expenseCount : 0;

  const cards = [
    {
      label: "Total Expense",
      value: formatMoney(total, currency),
      description: "Based on your current filters",
      icon: "↘",
    },
    {
      label: "Transactions",
      value: expenseCount.toLocaleString(),
      description: "Recorded expense transactions",
      icon: "▤",
    },
    {
      label: "Average Expense",
      value: formatMoney(average, currency),
      description: "Average amount per transaction",
      icon: "◈",
    },
  ];

  return (
    <div className="gt-expense-summary-grid">
      {cards.map((card) => (
        <div className="gt-expense-stat-card" key={card.label}>
          <div className="gt-expense-stat-top">
            <span>{card.label}</span>
            <div className="gt-expense-stat-icon">
              {card.icon}
            </div>
          </div>

          <h2 className="gt-expense-stat-value">
            {loading && card.label !== "Transactions"
              ? "Loading..."
              : card.value}
          </h2>

          <p>{card.description}</p>
        </div>
      ))}
    </div>
  );
}
