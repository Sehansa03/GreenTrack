
export default function IncomeSummary({
  total = 0,
  incomeCount = 0,
  currency = "LKR",
  loading = false,
}) {
  const average =
    incomeCount > 0 ? Number(total) / incomeCount : 0;

  const formatMoney = (amount) =>
    `${currency} ${Number(amount).toLocaleString(
      undefined,
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;

  const cards = [
    {
      label: "Total Income",
      value: loading ? "Calculating..." : formatMoney(total),
      description: "Based on filtered transactions",
      icon: "↗",
    },
    {
      label: "Transactions",
      value: incomeCount.toString(),
      description: "Recorded income entries",
      icon: "▤",
    },
    {
      label: "Average Income",
      value: loading ? "Calculating..." : formatMoney(average),
      description: "Per income transaction",
      icon: "◈",
    },
  ];

  return (
    <div className="gt-income-summary-grid">
      {cards.map((card) => (
        <article
          key={card.label}
          className="gt-income-stat-card"
        >
          <div className="gt-income-stat-top">
            <span>{card.label}</span>
            <span className="gt-income-stat-icon">
              {card.icon}
            </span>
          </div>

          <h2 className="gt-income-stat-value">
            {card.value}
          </h2>

          <p>{card.description}</p>
        </article>
      ))}
    </div>
  );
}
