
import { useEffect, useMemo, useState } from "react";

import IncomeForm from "./income_components/IncomeForm";
import IncomeTable from "./income_components/IncomeTable";
import IncomeChart from "./income_components/IncomeChart";
import IncomeFilter from "./income_components/IncomeFilter";
import IncomeSummary from "./income_components/IncomeSummary";

import { useCurrency } from "../../context/CurrencyContext";
import { incomeAPI } from "../../api/income";
import "./Income.css";

const emptyFilters = {
  source: "",
  currency: "",
  from: "",
  to: "",
};

export default function Income() {
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [incomes, setIncomes] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [filters, setFilters] = useState(emptyFilters);
  const [showFilters, setShowFilters] = useState(false);

  const {
    currency: baseCurrency,
    loading: profileLoading,
    ratesLoading,
    convertAmount,
    hasRate,
  } = useCurrency();

  const currencyLoading = profileLoading || ratesLoading;

  const fetchIncomes = async () => {
    try {
      setFetchError("");

      const res = await incomeAPI.getAll();
      const payload = res.data?.data ?? res.data;

      const records = Array.isArray(payload)
        ? payload
        : payload?.incomes ?? [];

      setIncomes(records);
    } catch (err) {
      console.error("Failed to fetch incomes:", err);
      setFetchError("Unable to load income records.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  const filteredIncomes = useMemo(() => {
    return incomes.filter((income) => {
      const sourceMatch = (income.source || "")
        .toLowerCase()
        .includes(filters.source.toLowerCase());

      const currencyMatch =
        !filters.currency ||
        (income.currency || baseCurrency) === filters.currency;

      const date = income.date
        ? String(income.date).slice(0, 10)
        : "";

      const fromMatch =
        !filters.from || date >= filters.from;

      const toMatch =
        !filters.to || date <= filters.to;

      return (
        sourceMatch &&
        currencyMatch &&
        fromMatch &&
        toMatch
      );
    });
  }, [incomes, filters, baseCurrency]);

  const totalIncome = useMemo(() => {
    return filteredIncomes.reduce((sum, income) => {
      const converted = convertAmount(
        income.amount,
        income.currency || baseCurrency
      );

      const numeric = Number(converted);

      return sum + (
        converted != null && Number.isFinite(numeric)
          ? numeric
          : 0
      );
    }, 0);
  }, [filteredIncomes, convertAmount, baseCurrency]);

  const unavailableRateCount = useMemo(() => {
    return filteredIncomes.filter(
      (income) => !hasRate(income.currency || baseCurrency)
    ).length;
  }, [filteredIncomes, hasRate, baseCurrency]);

  const activeFilterCount = [
    filters.source,
    filters.currency,
    filters.from,
    filters.to,
  ].filter(Boolean).length;

  const handleEdit = (income) => {
    setEditData(income);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditData(null);
  };

  const handleSaved = async () => {
    handleClose();
    await fetchIncomes();
  };

  const handleDeleted = (id) => {
    setIncomes((previous) =>
      previous.filter((income) => income._id !== id)
    );
  };

  return (
    <main className="gt-income-page gt-income-refined">
      {/* HEADER */}
      <header className="gt-income-header">
        <div>
          <p className="gt-income-eyebrow">
            YOUR FINANCES / INCOME
          </p>

          <h1>Income</h1>

          <p className="gt-income-subtitle">
            Manage and monitor your earnings.
          </p>
        </div>

        <button
          type="button"
          className="gt-income-primary-btn"
          onClick={() => {
            setEditData(null);
            setShowModal(true);
          }}
        >
          <span aria-hidden="true">+</span>
          Add Income
        </button>
      </header>

      {/* FETCH ERROR */}
      {fetchError && (
        <div className="gt-income-error" role="alert">
          {fetchError}
          <button type="button" onClick={fetchIncomes}>
            Retry
          </button>
        </div>
      )}

      {/* SUMMARY */}
      <IncomeSummary
        total={totalIncome}
        incomeCount={filteredIncomes.length}
        currency={baseCurrency}
        loading={currencyLoading || fetching}
      />

      {/* EXCHANGE RATE WARNING */}
      {!currencyLoading && unavailableRateCount > 0 && (
        <div className="gt-income-warning" role="status">
          <span aria-hidden="true">!</span>

          <div>
            <strong>Exchange rates unavailable</strong>
            <p>
              {unavailableRateCount} income{" "}
              {unavailableRateCount === 1
                ? "record cannot"
                : "records cannot"}{" "}
              currently be converted to {baseCurrency}.
              Your total may be incomplete.
            </p>
          </div>
        </div>
      )}

      {/* MAIN DESKTOP GRID */}
      <div className="gt-income-main-grid">
        {/* LEFT: TRANSACTIONS */}
        <section className="gt-income-panel gt-income-transactions-panel">
          <div className="gt-income-section-heading">
            <div>
              <h2>Transactions</h2>
              <p>
                {filteredIncomes.length} income{" "}
                {filteredIncomes.length === 1
                  ? "transaction"
                  : "transactions"}
              </p>
            </div>

            <button
              type="button"
              className={`gt-income-filter-toggle ${
                showFilters ? "is-active" : ""
              }`}
              onClick={() =>
                setShowFilters((previous) => !previous)
              }
              aria-expanded={showFilters}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <path d="M4 7h16M7 12h10M10 17h4" />
              </svg>

              Filters

              {activeFilterCount > 0 && (
                <span className="gt-income-filter-count">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {showFilters && (
            <div className="gt-income-filter-drawer">
              <IncomeFilter
                filters={filters}
                setFilters={setFilters}
                onClear={() =>
                  setFilters({ ...emptyFilters })
                }
              />
            </div>
          )}

          {fetching ? (
            <div className="gt-income-loading">
              Loading transactions...
            </div>
          ) : (
            <IncomeTable
              incomes={filteredIncomes}
              setIncomes={setIncomes}
              onDeleted={handleDeleted}
              onEdit={handleEdit}
            />
          )}
        </section>

        {/* RIGHT: CHART */}
        <section className="gt-income-panel gt-income-chart-section">
          <IncomeChart
            incomes={filteredIncomes}
            baseCurrency={baseCurrency}
          />
        </section>
      </div>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <IncomeForm
          editData={editData}
          onClose={handleClose}
          onSaved={handleSaved}
          defaultCurrency={baseCurrency}
        />
      )}
    </main>
  );
}
