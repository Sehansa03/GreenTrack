import { useEffect, useMemo, useState } from "react";

import { incomeAPI } from "../../api/income";
import { expenseAPI } from "../../api/expense";
import { useCurrency } from "../../context/CurrencyContext";

export default function Reports() {
  const today = new Date();
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const {
    currency: baseCurrency,
    loading: profileLoading,
    ratesLoading,
    convertAmount,
    hasRate,
  } = useCurrency();
  const [dataLoading, setDataLoading] = useState(true);
  const loading = dataLoading || profileLoading || ratesLoading;
  const [error, setError] = useState("");

  const [period, setPeriod] = useState("month");
  const [fromDate, setFromDate] = useState(
    formatDate(new Date(today.getFullYear(), today.getMonth(), 1))
  );
  const [toDate, setToDate] = useState(
    formatDate(today)
  );

  useEffect(() => {
    loadReportData();
  }, []);

  async function loadReportData() {
    try {
      setDataLoading(true);
      setError("");

      const [incomeRes, expenseRes] = await Promise.all([
        incomeAPI.getAll(),
        expenseAPI.getAll(),
      ]);

      setIncomes(incomeRes.data?.data || []);
      setExpenses(expenseRes.data?.data || []);
    } catch (err) {
      console.error("Failed to load report data:", err);
      setError("Unable to load report data. Please try again.");
    } finally {
      setDataLoading(false);
    }
  }

  // All conversions come from the shared account currency context.
  function convertToBase(amount, currency) {
    return convertAmount(amount, currency);
  }

  function changePeriod(value) {
    setPeriod(value);

    const now = new Date();
    let start;

    if (value === "month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (value === "lastMonth") {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    } else if (value === "year") {
      start = new Date(now.getFullYear(), 0, 1);
    } else {
      return;
    }

    const end =
      value === "lastMonth"
        ? new Date(now.getFullYear(), now.getMonth(), 0)
        : now;

    setFromDate(formatDate(start));
    setToDate(formatDate(end));
  }

  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  const report = useMemo(() => {
    const inRange = (record) => {
      if (!record.date || !fromDate || !toDate) return false;

      const parsed = new Date(record.date);
      if (Number.isNaN(parsed.getTime())) return false;
      const date = formatDate(parsed);
      return date >= fromDate && date <= toDate;
    };

    const selectedIncomes = incomes.filter(inRange);
    const selectedExpenses = expenses.filter(inRange);

    const sumRecords = (records) =>
      records.reduce((sum, record) => {
        const converted = convertToBase(
          record.amount,
          record.currency || baseCurrency
        );

        return converted === null ? sum : sum + converted;
      }, 0);

    const missingRateCount = [...selectedIncomes, ...selectedExpenses]
      .filter((record) => !hasRate(record.currency || baseCurrency)).length;

    const totalIncome = sumRecords(selectedIncomes);
    const totalExpense = sumRecords(selectedExpenses);
    const balance = totalIncome - totalExpense;

    return {
      incomes: selectedIncomes,
      expenses: selectedExpenses,
      totalIncome,
      totalExpense,
      balance,
      missingRateCount,
      savingsRate:
        totalIncome > 0 ? (balance / totalIncome) * 100 : 0,
    };
  }, [incomes, expenses, fromDate, toDate, baseCurrency, convertAmount, hasRate]);

  const transactions = useMemo(() => {
    const all = [
      ...report.incomes.map((item) => ({
        ...item,
        reportType: "Income",
      })),
      ...report.expenses.map((item) => ({
        ...item,
        reportType: "Expense",
      })),
    ];

    return all.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  }, [report]);

  function formatMoney(value) {
    return `${baseCurrency} ${Number(value).toLocaleString(
      undefined,
      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
    )}`;
  }

  function exportCSV() {
    const headers = [
      "Date",
      "Type",
      "Category",
      "Description",
      "Original Amount",
      "Original Currency",
      `Amount in ${baseCurrency}`,
    ];

    const rows = transactions.map((item) => {
      const originalCurrency = item.currency || baseCurrency;
      const converted = convertToBase(
        item.amount,
        originalCurrency
      );

      return [
        item.date ? formatDate(new Date(item.date)) : "",
        item.reportType,
        item.category || "",
        item.description || item.title || "",
        item.amount ?? 0,
        originalCurrency,
        converted === null ? "Conversion unavailable" : converted.toFixed(2),
      ];
    });

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `GreenTrack_Report_${fromDate}_to_${toDate}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <p style={styles.eyebrow}>FINANCIAL OVERVIEW</p>
          <h1 style={styles.title}>Reports</h1>
          <p style={styles.subtitle}>
            Review your financial activity and export your records.
          </p>
        </div>

        <button
          type="button"
          style={styles.exportButton}
          onClick={exportCSV}
          disabled={loading || Boolean(error) || !transactions.length}
        >
          ↓ Export CSV
        </button>
      </header>

      <section style={styles.filterCard}>
        <div>
          <h3 style={styles.sectionTitle}>Report period</h3>
          <p style={styles.muted}>
            Choose the dates you want to analyse.
          </p>
        </div>

        <div style={styles.filterControls}>
          <select
            value={period}
            onChange={(e) => changePeriod(e.target.value)}
            style={styles.select}
            aria-label="Report period"
          >
            <option value="month">This month</option>
            <option value="lastMonth">Last month</option>
            <option value="year">This year</option>
            <option value="custom">Custom range</option>
          </select>

          <label style={styles.dateField}>
            <span>From</span>
            <input
              type="date"
              value={fromDate}
              max={toDate || undefined}
              onChange={(e) => {
                setPeriod("custom");
                setFromDate(e.target.value);
              }}
              style={styles.dateInput}
            />
          </label>

          <label style={styles.dateField}>
            <span>To</span>
            <input
              type="date"
              value={toDate}
              min={fromDate || undefined}
              max={formatDate(today)}
              onChange={(e) => {
                setPeriod("custom");
                setToDate(e.target.value);
              }}
              style={styles.dateInput}
            />
          </label>
        </div>
      </section>

      {error && (
        <div style={styles.error}>
          {error}
          <button type="button" onClick={loadReportData} style={styles.retry}>
            Retry
          </button>
        </div>
      )}

      {!loading && report.missingRateCount > 0 && (
        <div style={styles.rateWarning}>
          <strong>Some exchange rates are unavailable.</strong>
          <div>
            {report.missingRateCount} transaction(s) could not be converted
            to {baseCurrency}. Report totals and savings rate are incomplete.
            CSV export will mark these conversions as unavailable.
          </div>
        </div>
      )}

      <section style={styles.summaryGrid}>
        <SummaryCard
          label="Total Income"
          value={formatMoney(report.totalIncome)}
          detail={`${report.incomes.length} transactions`}
          icon="↗"
          color="#4ade80"
        />
        <SummaryCard
          label="Total Expenses"
          value={formatMoney(report.totalExpense)}
          detail={`${report.expenses.length} transactions`}
          icon="↘"
          color="#fb7185"
        />
        <SummaryCard
          label="Net Savings"
          value={formatMoney(report.balance)}
          detail="Income minus expenses"
          icon="◈"
          color={report.balance >= 0 ? "#4ade80" : "#fb7185"}
        />
        <SummaryCard
          label="Savings Rate"
          value={`${report.savingsRate.toFixed(1)}%`}
          detail="Based on total income"
          icon="%"
          color="#60a5fa"
        />
      </section>

      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>Transaction report</h2>
            <p style={styles.muted}>
              {fromDate} to {toDate}
            </p>
          </div>
          <span style={styles.badge}>
            {transactions.length} records
          </span>
        </div>

        {loading ? (
          <div style={styles.empty}>Loading report...</div>
        ) : transactions.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>▤</div>
            <h3 style={styles.emptyTitle}>No transactions found</h3>
            <p style={styles.muted}>
              There are no income or expense records in this date range.
            </p>
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Description</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((item, index) => {
                  const currency = item.currency || baseCurrency;
                  const converted = convertToBase(item.amount, currency);

                  return (
                    <tr key={`${item.reportType}-${item._id || index}`}>
                      <td style={styles.td}>
                        {item.date
                          ? formatDate(new Date(item.date))
                          : "—"}
                      </td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.typeBadge,
                            color:
                              item.reportType === "Income"
                                ? "#4ade80"
                                : "#fb7185",
                            background:
                              item.reportType === "Income"
                                ? "rgba(74,222,128,0.09)"
                                : "rgba(251,113,133,0.09)",
                          }}
                        >
                          {item.reportType}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {item.category || "Uncategorised"}
                      </td>
                      <td style={styles.td}>
                        {item.description || item.title || "—"}
                      </td>
                      <td
                        style={{
                          ...styles.td,
                          textAlign: "right",
                          fontWeight: 600,
                          color:
                            item.reportType === "Income"
                              ? "#4ade80"
                              : "#fb7185",
                        }}
                      >
                        {converted === null
                          ? `${Number(item.amount || 0).toLocaleString()} ${currency} · Rate unavailable`
                          : formatMoney(converted)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p style={styles.footer}>
        All report totals are displayed in your account currency ({baseCurrency}).
        Currency conversion depends on the available exchange rates.
      </p>
    </div>
  );
}

function SummaryCard({ label, value, detail, icon, color }) {
  return (
    <div style={styles.summaryCard}>
      <div style={styles.summaryTop}>
        <span style={styles.summaryLabel}>{label}</span>
        <span
          style={{
            ...styles.summaryIcon,
            color,
            background: `${color}16`,
          }}
        >
          {icon}
        </span>
      </div>
      <h2 style={styles.summaryValue}>{value}</h2>
      <p style={styles.summaryDetail}>{detail}</p>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "32px 36px",
    color: "#e5e7eb",
    background: "#080d0b",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
    flexWrap: "wrap",
    marginBottom: 28,
  },
  eyebrow: {
    color: "#4ade80",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 2,
    margin: "0 0 8px",
  },
  title: {
    color: "#f9fafb",
    fontSize: 32,
    fontWeight: 700,
    margin: 0,
  },
  subtitle: {
    color: "rgba(255,255,255,0.42)",
    fontSize: 14,
    margin: "8px 0 0",
  },
  exportButton: {
    background: "linear-gradient(135deg,#22c55e,#16a34a)",
    border: 0,
    borderRadius: 10,
    padding: "12px 19px",
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  filterCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 20,
    padding: 22,
    marginBottom: 22,
    background: "#101814",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 16,
  },
  sectionTitle: {
    margin: 0,
    color: "#f9fafb",
    fontSize: 17,
  },
  muted: {
    margin: "6px 0 0",
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
  },
  filterControls: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 12,
  },
  select: {
    background: "#0d1410",
    color: "#f9fafb",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 9,
    padding: "10px 12px",
    fontSize: 12,
  },
  dateField: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
    color: "rgba(255,255,255,0.45)",
    fontSize: 11,
  },
  dateInput: {
    colorScheme: "dark",
    background: "#0d1410",
    color: "#f9fafb",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 9,
    padding: "9px 10px",
    fontSize: 12,
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))",
    gap: 16,
    marginBottom: 24,
  },
  summaryCard: {
    minWidth: 0,
    padding: 21,
    background: "#101814",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 16,
  },
  summaryTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  summaryLabel: {
    color: "rgba(255,255,255,0.48)",
    fontSize: 12,
  },
  summaryIcon: {
    display: "grid",
    placeItems: "center",
    width: 32,
    height: 32,
    borderRadius: 9,
    fontSize: 17,
    fontWeight: 700,
  },
  summaryValue: {
    color: "#f9fafb",
    fontSize: "clamp(19px,2vw,25px)",
    overflowWrap: "anywhere",
    margin: "19px 0 8px",
  },
  summaryDetail: {
    color: "rgba(255,255,255,0.34)",
    fontSize: 11,
    margin: 0,
  },
  section: {
    padding: 22,
    background: "#101814",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 16,
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  badge: {
    color: "#4ade80",
    background: "rgba(74,222,128,0.1)",
    borderRadius: 20,
    padding: "6px 10px",
    fontSize: 11,
  },
  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    minWidth: 720,
    borderCollapse: "collapse",
    textAlign: "left",
  },
  th: {
    padding: "13px 12px",
    color: "rgba(255,255,255,0.42)",
    fontSize: 11,
    fontWeight: 600,
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "15px 12px",
    color: "#d1d5db",
    fontSize: 12,
    borderBottom: "1px solid rgba(255,255,255,0.045)",
  },
  typeBadge: {
    display: "inline-block",
    padding: "5px 8px",
    borderRadius: 6,
    fontSize: 10,
    fontWeight: 600,
  },
  empty: {
    minHeight: 210,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    color: "rgba(255,255,255,0.4)",
    fontSize: 13,
  },
  emptyIcon: {
    color: "#4ade80",
    fontSize: 30,
    marginBottom: 8,
  },
  emptyTitle: {
    color: "#f9fafb",
    fontSize: 16,
    margin: "4px 0",
  },
  rateWarning: {
    padding: 16,
    marginBottom: 20,
    color: "#fbbf24",
    background: "rgba(245,158,11,0.08)",
    border: "1px solid rgba(245,158,11,0.22)",
    borderRadius: 10,
    fontSize: 12,
    lineHeight: 1.7,
  },
  error: {
    padding: 16,
    marginBottom: 20,
    color: "#fca5a5",
    background: "rgba(248,113,113,0.08)",
    borderRadius: 10,
  },
  retry: {
    marginLeft: 12,
    padding: "7px 12px",
    borderRadius: 7,
    border: "1px solid rgba(248,113,113,0.3)",
    background: "transparent",
    color: "#fca5a5",
    cursor: "pointer",
  },
  footer: {
    marginTop: 16,
    color: "rgba(255,255,255,0.3)",
    fontSize: 11,
    lineHeight: 1.6,
  },
};