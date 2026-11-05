import { useEffect, useMemo, useState } from "react";

import IncomeForm from "./income_components/IncomeForm";
import IncomeTable from "./income_components/IncomeTable";
import IncomeChart from "./income_components/IncomeChart";
import IncomeFilter from "./income_components/IncomeFilter";
import IncomeSummary from "./income_components/IncomeSummary";

import { useCurrency } from "../../context/CurrencyContext";
import { incomeAPI } from "../../api/income";

export default function Income() {
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [incomes, setIncomes] = useState([]);

  // Global currency system
  const {
    currency: baseCurrency,
    rates,
    loading: profileLoading,
    ratesLoading,
    convertAmount: convertToBase,
    hasRate,
  } = useCurrency();

  const currencyLoading = profileLoading || ratesLoading;

  const [filters, setFilters] = useState({
    source: "",
    currency: "",
    from: "",
    to: "",
  });

  // Fetch income records
  const fetchIncomes = async () => {
    try {
      const res = await incomeAPI.getAll();
      setIncomes(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch incomes:", err);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  // Filter income records
  const filteredIncomes = useMemo(() => {
    return incomes.filter((income) => {
      const sourceMatch = (income.source || "")
        .toLowerCase()
        .includes(filters.source.toLowerCase());

      const currencyMatch =
        !filters.currency ||
        income.currency === filters.currency;

      // Compare calendar dates to include the entire end date
      const incomeDate = income.date
        ? String(income.date).slice(0, 10)
        : "";

      const fromMatch =
        !filters.from || incomeDate >= filters.from;

      const toMatch =
        !filters.to || incomeDate <= filters.to;

      return (
        sourceMatch &&
        currencyMatch &&
        fromMatch &&
        toMatch
      );
    });
  }, [incomes, filters]);

  // Calculate income in the preferred currency
  const totalIncome = useMemo(() => {
    return filteredIncomes.reduce((sum, income) => {
      const convertedAmount = convertToBase(
        income.amount,
        income.currency
      );

      return sum + (convertedAmount ?? 0);
    }, 0);
  }, [filteredIncomes, convertToBase]);

  const roundedTotal =
    Math.round(totalIncome * 100) / 100;

  // Detect records that cannot currently be converted
  const unavailableRateCount = useMemo(() => {
    return filteredIncomes.filter(
      (income) => !hasRate(income.currency)
    ).length;
  }, [filteredIncomes, hasRate]);

  // Edit income
  const handleEdit = (income) => {
    setEditData(income);
    setShowModal(true);
  };

  // Close modal and refresh records
  const handleClose = () => {
    setShowModal(false);
    setEditData(null);
    fetchIncomes();
  };

  // Clear filters
  const handleClearFilters = () => {
    setFilters({
      source: "",
      currency: "",
      from: "",
      to: "",
    });
  };

  return (
    <div style={page}>
      {/* HEADER */}
      <div style={header}>
        <div>
          <p style={eyebrow}>FINANCIAL OVERVIEW</p>

          <h1 style={title}>Income</h1>

          <p style={subtitle}>
            Track your earnings and understand where
            your money comes from.
          </p>
        </div>

        <button
          type="button"
          style={addBtn}
          onClick={() => {
            setEditData(null);
            setShowModal(true);
          }}
        >
          <span style={{ fontSize: 20 }}>+</span>
          Add Income
        </button>
      </div>

      {/* SUMMARY */}
      <IncomeSummary
        total={roundedTotal}
        incomeCount={filteredIncomes.length}
        currency={baseCurrency}
        loading={currencyLoading}
      />

      {/* EXCHANGE RATE WARNING */}
      {!currencyLoading && unavailableRateCount > 0 && (
        <div style={warningCard}>
          <span style={{ fontSize: 18 }}>⚠</span>

          <div>
            <strong>Some exchange rates are unavailable</strong>

            <p style={warningText}>
              {unavailableRateCount} income
              {unavailableRateCount === 1
                ? " record cannot"
                : " records cannot"}{" "}
              currently be converted to {baseCurrency}.
              The total shown is incomplete.
            </p>
          </div>
        </div>
      )}

      {/* FILTERS */}
      <div style={filterCard}>
        <div style={filterHeader}>
          <div>
            <h3 style={filterTitle}>Income Records</h3>

            <p style={filterSubtitle}>
              Filter and manage your income transactions
            </p>
          </div>

          <span style={recordBadge}>
            {filteredIncomes.length} records
          </span>
        </div>

        <IncomeFilter
          filters={filters}
          setFilters={setFilters}
          onClear={handleClearFilters}
        />
      </div>

      {/* DASHBOARD GRID */}
      <div style={dashboardGrid}>
        {/* TABLE */}
        <div style={tableCard}>
          <IncomeTable
            incomes={filteredIncomes}
            setIncomes={setIncomes}
            onEdit={handleEdit}
          />
        </div>

        {/* CHART */}
        <div style={chartCard}>
          <IncomeChart
            incomes={filteredIncomes}
            baseCurrency={baseCurrency}
            rates={rates}
          />
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <IncomeForm
          onClose={handleClose}
          editData={editData}
        />
      )}
    </div>
  );
}

/* ---------- STYLES ---------- */

const page = {
  padding: "32px 36px",
  color: "#e5e7eb",
  minHeight: "100vh",
  background: "#080d0b",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  flexWrap: "wrap",
  marginBottom: 30,
};

const eyebrow = {
  fontSize: 11,
  letterSpacing: "2px",
  color: "#4ade80",
  fontWeight: 700,
  marginBottom: 8,
};

const title = {
  fontSize: 32,
  fontWeight: 700,
  margin: 0,
  color: "#f9fafb",
};

const subtitle = {
  color: "rgba(255,255,255,0.4)",
  marginTop: 8,
  fontSize: 14,
  lineHeight: 1.6,
};

const addBtn = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  background: "linear-gradient(135deg,#22c55e,#16a34a)",
  border: "none",
  padding: "12px 20px",
  borderRadius: 10,
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: "0 8px 20px rgba(34,197,94,0.15)",
};

const warningCard = {
  display: "flex",
  alignItems: "flex-start",
  gap: 12,
  background: "rgba(245,158,11,0.08)",
  border: "1px solid rgba(245,158,11,0.25)",
  color: "#fbbf24",
  borderRadius: 12,
  padding: "14px 18px",
  marginBottom: 22,
  fontSize: 13,
};

const warningText = {
  margin: "5px 0 0",
  lineHeight: 1.6,
  color: "#d6c5a2",
};

const filterCard = {
  background: "#101814",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 16,
  padding: 22,
  marginBottom: 22,
};

const filterHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
  marginBottom: 20,
};

const filterTitle = {
  margin: 0,
  fontSize: 17,
  color: "#fff",
};

const filterSubtitle = {
  margin: "5px 0 0",
  fontSize: 12,
  color: "rgba(255,255,255,0.35)",
};

const recordBadge = {
  background: "rgba(74,222,128,0.1)",
  color: "#4ade80",
  padding: "6px 10px",
  borderRadius: 20,
  fontSize: 12,
  whiteSpace: "nowrap",
};

const dashboardGrid = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) minmax(280px, 330px)",
  gap: 22,
  alignItems: "start",
};

const tableCard = {
  background: "#101814",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 16,
  padding: 20,
  overflow: "hidden",
  minWidth: 0,
};

const chartCard = {
  background: "#101814",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 16,
  padding: 20,
  minWidth: 0,
};