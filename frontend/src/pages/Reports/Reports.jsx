
import { useEffect, useMemo, useState } from "react";
import { incomeAPI } from "../../api/income";
import { expenseAPI } from "../../api/expense";
import { authAPI } from "../../api/auth";
import { useCurrency } from "../../context//useCurrency";
import { exportReportPDF } from "./exportReportPDF";
import "./Reports.css";

/* ==============================
   DATE HELPERS
============================== */

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getRecordDate(value) {
  if (!value) return "";

  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}/.test(value)
  ) {
    return value.slice(0, 10);
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? ""
    : formatDate(date);
}

function getDefaultDates() {
  const today = new Date();

  return {
    from: formatDate(
      new Date(today.getFullYear(), today.getMonth(), 1)
    ),
    to: formatDate(today),
  };
}

function getCategoryOrSource(item) {
  return item.reportType === "Income"
    ? item.source || item.category || "Other Income"
    : item.category || "Other Expense";
}

/* ==============================
   SUMMARY CARD
============================== */

function SummaryCard({
  label,
  value,
  detail,
  negative = false,
}) {
  return (
    <div className="gt-report-stat-card">
      <span className="gt-report-stat-label">
        {label}
      </span>

      <h3
        className={`gt-report-stat-value ${
          negative ? "gt-report-negative" : ""
        }`}
      >
        {value}
      </h3>

      <p>{detail}</p>
    </div>
  );
}

/* ==============================
   REPORTS COMPONENT
============================== */

export default function Reports() {
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [userName, setUserName] = useState("");
  const [profileReady, setProfileReady] = useState(false);

  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");
  const [exportError, setExportError] = useState("");
  const [exportingPDF, setExportingPDF] = useState(false);

  const {
    currency: baseCurrency,
    loading: profileLoading,
    ratesLoading,
    convertAmount,
    hasRate,
  } = useCurrency();

  const [reportType, setReportType] = useState("all");
  const [period, setPeriod] = useState("month");
  const [dates, setDates] = useState(getDefaultDates);

  const fromDate = dates.from;
  const toDate = dates.to;

  const loading =
    dataLoading || profileLoading || ratesLoading;

  const invalidRange =
    !fromDate || !toDate || fromDate > toDate;

  /* ==============================
     LOAD TRANSACTIONS
  ============================== */

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

      setError(
        "Unable to load report data. Please try again."
      );
    } finally {
      setDataLoading(false);
    }
  }

  /* ==============================
     LOAD LOGGED-IN USER PROFILE
  ============================== */

  useEffect(() => {
    async function loadUserProfile() {
      try {
        setProfileReady(false);

        const response = await authAPI.getProfile();

        const user =
          response.data?.user || response.data;

        setUserName(user?.fullName || "");
      } catch (err) {
        console.error(
          "Failed to load user profile:",
          err
        );

        setUserName("");
      } finally {
        setProfileReady(true);
      }
    }

    loadUserProfile();
  }, []);

  /* ==============================
     PERIOD FILTER
  ============================== */

  function handlePeriodChange(value) {
    setPeriod(value);

    if (value === "custom") return;

    const now = new Date();
    let start;
    let end = now;

    if (value === "month") {
      start = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );
    } else if (value === "lastMonth") {
      start = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      );

      end = new Date(
        now.getFullYear(),
        now.getMonth(),
        0
      );
    } else if (value === "year") {
      start = new Date(now.getFullYear(), 0, 1);
    } else {
      return;
    }

    setDates({
      from: formatDate(start),
      to: formatDate(end),
    });
  }

  /* ==============================
     FILTER TRANSACTIONS
  ============================== */

  const transactions = useMemo(() => {
    if (invalidRange) return [];

    const incomeRecords = incomes.map((item) => ({
      ...item,
      reportType: "Income",
    }));

    const expenseRecords = expenses.map((item) => ({
      ...item,
      reportType: "Expense",
    }));

    return [...incomeRecords, ...expenseRecords]
      .filter((item) => {
        const date = getRecordDate(item.date);

        if (!date || date < fromDate || date > toDate) {
          return false;
        }

        if (
          reportType === "income" &&
          item.reportType !== "Income"
        ) {
          return false;
        }

        if (
          reportType === "expense" &&
          item.reportType !== "Expense"
        ) {
          return false;
        }

        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.date) - new Date(a.date)
      );
  }, [
    incomes,
    expenses,
    fromDate,
    toDate,
    reportType,
    invalidRange,
  ]);

  /* ==============================
     CURRENCY CONVERSION
  ============================== */

  function convertRecord(item) {
    const originalCurrency =
      item.currency || baseCurrency;

    if (!hasRate(originalCurrency)) {
      return null;
    }

    const converted = convertAmount(
      item.amount,
      originalCurrency
    );

    if (
      converted == null ||
      !Number.isFinite(Number(converted))
    ) {
      return null;
    }

    return Number(converted);
  }

  /* ==============================
     FINANCIAL SUMMARY
  ============================== */

  const report = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    let missingRateCount = 0;

    transactions.forEach((item) => {
      const originalCurrency =
        item.currency || baseCurrency;

      if (!hasRate(originalCurrency)) {
        missingRateCount++;
        return;
      }

      const converted = convertAmount(
        item.amount,
        originalCurrency
      );

      if (
        converted == null ||
        !Number.isFinite(Number(converted))
      ) {
        missingRateCount++;
        return;
      }

      if (item.reportType === "Income") {
        totalIncome += Number(converted);
      } else {
        totalExpense += Number(converted);
      }
    });

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      transactionCount: transactions.length,
      missingRateCount,
    };
  }, [
    transactions,
    baseCurrency,
    convertAmount,
    hasRate,
  ]);

  function formatMoney(value) {
    return `${baseCurrency} ${Number(value).toLocaleString(
      "en-US",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  }

  /* ==============================
     CSV EXPORT
  ============================== */

  function exportCSV() {
    if (
      loading ||
      error ||
      invalidRange ||
      !transactions.length
    ) {
      return;
    }

    const headers = [
      "Date",
      "Type",
      "Category / Source",
      "Description",
      "Original Amount",
      "Original Currency",
      `Amount in ${baseCurrency}`,
    ];

    const rows = transactions.map((item) => {
      const originalCurrency =
        item.currency || baseCurrency;

      const converted = convertRecord(item);

      return [
        getRecordDate(item.date),
        item.reportType,
        getCategoryOrSource(item),
        item.description || item.title || "",
        item.amount ?? 0,
        originalCurrency,
        converted === null
          ? "Conversion unavailable"
          : converted.toFixed(2),
      ];
    });

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    const blob = new Blob(
      ["\uFEFF" + csv],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;

    link.download =
      `GreenTrack_${reportType}_Report_${fromDate}_to_${toDate}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /* ==============================
     PDF EXPORT
  ============================== */

  async function handleExportPDF() {
    if (
      loading ||
      !profileReady ||
      error ||
      invalidRange ||
      !transactions.length ||
      exportingPDF
    ) {
      return;
    }

    try {
      setExportingPDF(true);
      setExportError("");

      await exportReportPDF({
        transactions,
        reportType,
        fromDate,
        toDate,
        baseCurrency,
        userName,
        totalIncome: report.totalIncome,
        totalExpense: report.totalExpense,
        balance: report.balance,
        missingRateCount: report.missingRateCount,
        convertAmount,
        hasRate,
      });
    } catch (err) {
      console.error("PDF export failed:", err);

      setExportError(
        "Unable to generate the PDF report. Please try again."
      );
    } finally {
      setExportingPDF(false);
    }
  }

  const reportLabel =
    reportType === "income"
      ? "Income Statement"
      : reportType === "expense"
      ? "Expense Statement"
      : "Transaction Statement";

  const exportDisabled =
    loading ||
    Boolean(error) ||
    invalidRange ||
    !transactions.length;

  /* ==============================
     PAGE UI
  ============================== */

  return (
    <main className="gt-report-page">

      {/* HEADER */}
      <header className="gt-report-header">
        <div>
          <p className="gt-report-eyebrow">
            YOUR FINANCES
          </p>

          <h1>Reports</h1>

          <p className="gt-report-subtitle">
            Generate, review, and export your financial records.
          </p>
        </div>

        <div className="gt-report-export-actions">
          <button
            type="button"
            className="gt-report-export-btn gt-report-pdf-btn"
            onClick={handleExportPDF}
            disabled={
              exportDisabled ||
              !profileReady ||
              exportingPDF
            }
          >
            <span className="gt-report-download-icon">
              ↓
            </span>

            {exportingPDF
              ? "Generating..."
              : "Export PDF"}
          </button>

          <button
            type="button"
            className="gt-report-export-btn"
            onClick={exportCSV}
            disabled={exportDisabled || exportingPDF}
          >
            <span className="gt-report-download-icon">
              ↓
            </span>

            Export CSV
          </button>
        </div>
      </header>

      {/* REPORT SETTINGS */}
      <section className="gt-report-panel gt-report-filter-panel">
        <div className="gt-report-section-heading">
          <div>
            <h2>Report Settings</h2>
            <p>
              Select the records and period you want to review.
            </p>
          </div>
        </div>

        <div className="gt-report-filter-controls">
          <label className="gt-report-field">
            <span>Report Type</span>

            <select
              value={reportType}
              onChange={(e) =>
                setReportType(e.target.value)
              }
            >
              <option value="all">
                All Transactions
              </option>

              <option value="income">
                Income Only
              </option>

              <option value="expense">
                Expense Only
              </option>
            </select>
          </label>

          <label className="gt-report-field">
            <span>Period</span>

            <select
              value={period}
              onChange={(e) =>
                handlePeriodChange(e.target.value)
              }
            >
              <option value="month">
                This Month
              </option>

              <option value="lastMonth">
                Last Month
              </option>

              <option value="year">
                This Year
              </option>

              <option value="custom">
                Custom Range
              </option>
            </select>
          </label>

          <label className="gt-report-field">
            <span>From</span>

            <input
              type="date"
              value={fromDate}
              max={toDate || undefined}
              onChange={(e) => {
                setPeriod("custom");

                setDates((prev) => ({
                  ...prev,
                  from: e.target.value,
                }));
              }}
            />
          </label>

          <label className="gt-report-field">
            <span>To</span>

            <input
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={(e) => {
                setPeriod("custom");

                setDates((prev) => ({
                  ...prev,
                  to: e.target.value,
                }));
              }}
            />
          </label>
        </div>
      </section>

      {/* ALERTS */}
      {invalidRange && (
        <div
          className="gt-report-alert gt-report-error"
          role="alert"
        >
          Please select a valid date range.
        </div>
      )}

      {error && (
        <div
          className="gt-report-alert gt-report-error"
          role="alert"
        >
          <span>{error}</span>

          <button
            type="button"
            onClick={loadReportData}
          >
            Retry
          </button>
        </div>
      )}

      {exportError && (
        <div
          className="gt-report-alert gt-report-error"
          role="alert"
        >
          {exportError}
        </div>
      )}

      {!loading &&
        !error &&
        report.missingRateCount > 0 && (
          <div
            className="gt-report-alert gt-report-warning"
            role="status"
          >
            <strong>
              Some exchange rates are unavailable.
            </strong>

            <p>
              {report.missingRateCount} transaction(s)
              could not be converted to {baseCurrency}.
              The totals may be incomplete.
              Exports will identify unavailable conversions.
            </p>
          </div>
        )}

      {/* FINANCIAL SUMMARY */}
      <section className="gt-report-summary-section">
        <div className="gt-report-summary-heading">
          <div>
            <h2>Financial Summary</h2>

            <p>
              {fromDate} to {toDate}
            </p>
          </div>
        </div>

        <div
          className={`gt-report-summary-grid ${
            reportType === "all"
              ? "gt-report-summary-three"
              : "gt-report-summary-two"
          }`}
        >
          {(reportType === "all" ||
            reportType === "income") && (
            <SummaryCard
              label="Total Income"
              value={
                loading
                  ? "Loading..."
                  : formatMoney(report.totalIncome)
              }
              detail="Income in selected report"
            />
          )}

          {(reportType === "all" ||
            reportType === "expense") && (
            <SummaryCard
              label="Total Expenses"
              value={
                loading
                  ? "Loading..."
                  : formatMoney(report.totalExpense)
              }
              detail="Expenses in selected report"
            />
          )}

          {reportType === "all" && (
            <SummaryCard
              label="Net Balance"
              value={
                loading
                  ? "Loading..."
                  : formatMoney(report.balance)
              }
              detail="Income minus expenses"
              negative={report.balance < 0}
            />
          )}

          {reportType !== "all" && (
            <SummaryCard
              label={
                reportType === "income"
                  ? "Income Transactions"
                  : "Expense Transactions"
              }
              value={
                loading
                  ? "Loading..."
                  : report.transactionCount
              }
              detail="Records in selected period"
            />
          )}
        </div>
      </section>

      {/* TRANSACTION PREVIEW */}
      <section className="gt-report-panel gt-report-transactions">
        <div className="gt-report-section-heading">
          <div>
            <h2>{reportLabel}</h2>

            <p>
              Live preview of your selected records
            </p>
          </div>

          <span className="gt-report-count">
            {transactions.length} records
          </span>
        </div>

        {loading ? (
          <div
            className="gt-report-empty"
            role="status"
          >
            Loading report...
          </div>
        ) : error ? (
          <div className="gt-report-empty">
            Report data could not be loaded.
          </div>
        ) : invalidRange ? (
          <div className="gt-report-empty">
            Select a valid date range.
          </div>
        ) : transactions.length === 0 ? (
          <div className="gt-report-empty">
            <div className="gt-report-empty-icon">
              ▤
            </div>

            <h3>No transactions found</h3>

            <p>
              There are no records matching your filters.
            </p>
          </div>
        ) : (
          <div className="gt-report-table-wrapper">
            <table className="gt-report-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Category / Source</th>
                  <th>Description</th>

                  <th className="gt-report-align-right">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody>
                {transactions.map((item, index) => {
                  const originalCurrency =
                    item.currency || baseCurrency;

                  const converted = convertRecord(item);

                  const isIncome =
                    item.reportType === "Income";

                  return (
                    <tr
                      key={`${item.reportType}-${item._id || index}`}
                    >
                      <td>
                        {getRecordDate(item.date) || "—"}
                      </td>

                      <td>
                        <span
                          className={`gt-report-type ${
                            isIncome
                              ? "income"
                              : "expense"
                          }`}
                        >
                          {item.reportType}
                        </span>
                      </td>

                      <td>
                        {getCategoryOrSource(item)}
                      </td>

                      <td className="gt-report-description">
                        {item.description ||
                          item.title ||
                          "—"}
                      </td>

                      <td
                        className={`gt-report-amount gt-report-align-right ${
                          isIncome
                            ? "income"
                            : "expense"
                        }`}
                      >
                        {converted === null ? (
                          <span className="gt-report-unavailable">
                            {Number(
                              item.amount || 0
                            ).toLocaleString()}{" "}
                            {originalCurrency}
                            {" · Rate unavailable"}
                          </span>
                        ) : (
                          formatMoney(converted)
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* FOOTER */}
      <p className="gt-report-footer">
        Report values are displayed in your account
        currency ({baseCurrency}). Currency conversion
        depends on available exchange rates.
      </p>
    </main>
  );
}
