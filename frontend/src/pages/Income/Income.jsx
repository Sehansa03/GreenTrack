import { useEffect, useMemo, useState } from "react";

import IncomeForm from "./income_components/IncomeForm";
import IncomeTable from "./income_components/IncomeTable";
import IncomeChart from "./income_components/IncomeChart";
import IncomeFilter from "./income_components/IncomeFilter";
import IncomeSummary from "./income_components/IncomeSummary";

import { incomeAPI } from "../../api/income";
import { currencyAPI } from "../../api/currency";
import { authAPI } from "../../api/auth";

export default function Income() {
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [incomes, setIncomes] = useState([]);

  // Currency states
  const [baseCurrency, setBaseCurrency] = useState("LKR");
  const [rates, setRates] = useState({});
  const [currencyLoading, setCurrencyLoading] = useState(false);

  const [filters, setFilters] = useState({
    source: "",
    currency: "",
    from: "",
    to: "",
  });

  // --------------------------------
  // Fetch incomes
  // --------------------------------
  const fetchIncomes = async () => {
    try {
      const res = await incomeAPI.getAll();
      setIncomes(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch incomes", err);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  // --------------------------------
  // Get user's preferred currency
  // --------------------------------
  useEffect(() => {
    const loadUserCurrency = async () => {
      try {
        const res = await authAPI.getProfile();

        const userCurrency = res.data.currency || "LKR";

        setBaseCurrency(userCurrency);
      } catch (error) {
        console.error("Failed to load user currency:", error);
      }
    };

    loadUserCurrency();
  }, []);

  // --------------------------------
  // Fetch exchange rates
  // --------------------------------
  useEffect(() => {
    const loadRates = async () => {
      if (!baseCurrency) return;

      try {
        setCurrencyLoading(true);

        const res = await currencyAPI.getRates(baseCurrency);

        setRates(res.data.rates || {});
      } catch (error) {
        console.error("Failed to load exchange rates:", error);
      } finally {
        setCurrencyLoading(false);
      }
    };

    loadRates();
  }, [baseCurrency]);

  // --------------------------------
  // Convert any currency to base currency
  // --------------------------------
  const convertToBase = (amount, currency) => {
    const numericAmount = Number(amount || 0);

    // Same currency → no conversion needed
    if (currency === baseCurrency) {
      return numericAmount;
    }

    const rate = rates[currency];

    // Rate not available yet
    if (!rate) {
      return 0;
    }

    // Frankfurter gives:
    // 1 BASE = RATE SOURCE CURRENCY
    // Therefore SOURCE → BASE requires division
    return numericAmount / Number(rate);
  };

  // --------------------------------
  // Filter incomes
  // --------------------------------
  const filteredIncomes = useMemo(() => {
    return incomes.filter((income) => {
      const sourceMatch = income.source
        ?.toLowerCase()
        .includes(filters.source.toLowerCase());

      const currencyMatch =
        !filters.currency || income.currency === filters.currency;

      const incomeDate = income.date
        ? new Date(income.date)
        : null;

      const fromMatch =
        !filters.from ||
        (incomeDate && incomeDate >= new Date(filters.from));

      const toMatch =
        !filters.to ||
        (incomeDate && incomeDate <= new Date(filters.to));

      return (
        sourceMatch &&
        currencyMatch &&
        fromMatch &&
        toMatch
      );
    });
  }, [incomes, filters]);

  // --------------------------------
  // Calculate total in base currency
  // --------------------------------
  const totalIncome = filteredIncomes.reduce(
    (sum, income) =>
      sum + convertToBase(income.amount, income.currency),
    0
  );

  const roundedTotal =
    Math.round(totalIncome * 100) / 100;

  // --------------------------------
  // Edit income
  // --------------------------------
  const handleEdit = (income) => {
    setEditData(income);
    setShowModal(true);
  };

  // --------------------------------
  // Close modal
  // --------------------------------
  const handleClose = () => {
    setShowModal(false);
    setEditData(null);
    fetchIncomes();
  };

  // --------------------------------
  // UI
  // --------------------------------
  return (
    <div style={page}>

      {/* HEADER */}
      <div style={header}>
        <div>
          <p style={eyebrow}>FINANCIAL OVERVIEW</p>

          <h1 style={title}>
            Income
          </h1>

          <p style={subtitle}>
            Track your earnings and understand where your money comes from.
          </p>
        </div>

        <button
          style={addBtn}
          onClick={() => {
            setEditData(null);
            setShowModal(true);
          }}
        >
          <span style={{ fontSize: 20 }}>
            +
          </span>

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

      {/* FILTERS */}
      <div style={filterCard}>

        <div style={filterHeader}>
          <div>
            <h3 style={filterTitle}>
              Income Records
            </h3>

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
};

const dashboardGrid = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 330px",
  gap: 22,
  alignItems: "start",
};

const tableCard = {
  background: "#101814",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 16,
  padding: 20,
  overflow: "hidden",
};

const chartCard = {
  background: "#101814",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 16,
  padding: 20,
};