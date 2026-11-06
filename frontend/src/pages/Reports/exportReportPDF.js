
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/* ==============================
   HELPERS
============================== */

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
    : date.toISOString().slice(0, 10);
}

function getCategoryOrSource(item) {
  return item.reportType === "Income"
    ? item.source || item.category || "Other Income"
    : item.category || "Other Expense";
}

/* ==============================
   EXPORT PDF
============================== */

export function exportReportPDF({
  transactions,
  reportType,
  fromDate,
  toDate,
  baseCurrency,
  userName,
  totalIncome,
  totalExpense,
  balance,
  missingRateCount = 0,
  convertAmount,
  hasRate,
}) {
  if (!transactions?.length) return;

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const green = [37, 132, 87];
  const dark = [30, 45, 36];
  const muted = [105, 115, 109];

  const reportTitle =
    reportType === "income"
      ? "Income Statement"
      : reportType === "expense"
      ? "Expense Statement"
      : "Transaction Statement";

  const money = (amount) =>
    `${baseCurrency} ${Number(amount).toLocaleString(
      "en-US",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;

  /* ==============================
     HEADER
  ============================== */

  doc.setFillColor(...green);
  doc.rect(0, 0, pageWidth, 5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...green);

  doc.text("GreenTrack", 14, 20);

  doc.setFontSize(15);
  doc.setTextColor(...dark);

  doc.text(reportTitle, 14, 31);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...muted);

  // User name
  const displayName = userName?.trim() || "Account Holder";

  doc.text(
    `Prepared for: ${displayName}`,
    14,
    39
  );

  // Report period
  doc.text(
    `Period: ${fromDate} to ${toDate}`,
    14,
    45
  );

  // Currency
  doc.text(
    `Account Currency: ${baseCurrency}`,
    14,
    51
  );

  // Generated date
  doc.text(
    `Generated: ${new Date().toLocaleString("en-GB")}`,
    pageWidth - 14,
    20,
    { align: "right" }
  );

  // Divider
  doc.setDrawColor(225, 232, 227);
  doc.line(14, 57, pageWidth - 14, 57);

  /* ==============================
     FINANCIAL SUMMARY
  ============================== */

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...dark);

  doc.text("Financial Summary", 14, 65);

  doc.setFontSize(10);

  if (reportType === "all") {
    doc.text(
      `Total Income: ${money(totalIncome)}`,
      14,
      74
    );

    doc.text(
      `Total Expenses: ${money(totalExpense)}`,
      108,
      74
    );

    doc.text(
      `Net Balance: ${money(balance)}`,
      202,
      74
    );
  } else if (reportType === "income") {
    doc.text(
      `Total Income: ${money(totalIncome)}`,
      14,
      74
    );

    doc.text(
      `Income Transactions: ${transactions.length}`,
      108,
      74
    );
  } else {
    doc.text(
      `Total Expenses: ${money(totalExpense)}`,
      14,
      74
    );

    doc.text(
      `Expense Transactions: ${transactions.length}`,
      108,
      74
    );
  }

  /* ==============================
     EXCHANGE RATE WARNING
  ============================== */

  if (missingRateCount > 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(165, 105, 35);

    doc.text(
      `Warning: ${missingRateCount} transaction(s) could not be converted. Summary totals may be incomplete.`,
      14,
      84
    );
  }

  /* ==============================
     TRANSACTION TABLE
  ============================== */

  const rows = transactions.map((item) => {
    const originalCurrency =
      item.currency || baseCurrency;

    const converted = hasRate(originalCurrency)
      ? convertAmount(item.amount, originalCurrency)
      : null;

    const convertedAmount =
      converted == null ||
      !Number.isFinite(Number(converted))
        ? "Rate unavailable"
        : money(converted);

    return [
      getRecordDate(item.date),
      item.reportType,
      getCategoryOrSource(item),
      item.description || item.title || "-",
      `${Number(item.amount || 0).toFixed(2)} ${originalCurrency}`,
      convertedAmount,
    ];
  });

  autoTable(doc, {
    startY: missingRateCount > 0 ? 94 : 83,

    head: [[
      "Date",
      "Type",
      "Category / Source",
      "Description",
      "Original Amount",
      `Amount (${baseCurrency})`,
    ]],

    body: rows,
    theme: "grid",

    margin: {
      left: 14,
      right: 14,
      bottom: 20,
    },

    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 3,
      textColor: dark,
      lineColor: [226, 232, 227],
      lineWidth: 0.15,
      overflow: "linebreak",
    },

    headStyles: {
      fillColor: green,
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },

    alternateRowStyles: {
      fillColor: [247, 250, 248],
    },

    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 22 },
      2: { cellWidth: 45 },
      4: { cellWidth: 43 },
      5: { cellWidth: 43 },
    },
  });

  /* ==============================
     PAGE FOOTERS
  ============================== */

  const pageCount = doc.getNumberOfPages();

  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...muted);

    doc.text(
      "Generated by GreenTrack | Conversions depend on available exchange rates.",
      14,
      pageHeight - 10
    );

    doc.text(
      `Page ${page} of ${pageCount}`,
      pageWidth - 14,
      pageHeight - 10,
      { align: "right" }
    );
  }

  /* ==============================
     SAVE PDF
  ============================== */

  doc.save(
    `GreenTrack_${reportType}_Report_${fromDate}_to_${toDate}.pdf`
  );
}
