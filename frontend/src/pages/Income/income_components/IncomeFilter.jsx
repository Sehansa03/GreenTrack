
import { currencies } from "../../../data/currencies";

export default function IncomeFilter({
  filters,
  setFilters,
  onClear,
}) {
  const updateFilter = (key, value) => {
    setFilters((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  return (
    <div className="gt-income-filters">
      <div className="gt-income-field">
        <label htmlFor="income-source-search">
          Search source
        </label>
        <input
          id="income-source-search"
          type="search"
          placeholder="Salary, Freelance..."
          value={filters.source}
          onChange={(e) =>
            updateFilter("source", e.target.value)
          }
        />
      </div>

      <div className="gt-income-field">
        <label htmlFor="income-currency-filter">
          Currency
        </label>
        <select
          id="income-currency-filter"
          value={filters.currency}
          onChange={(e) =>
            updateFilter("currency", e.target.value)
          }
        >
          <option value="">All currencies</option>
          {currencies.map((item) => (
            <option key={item.code} value={item.code}>
              {item.code}
            </option>
          ))}
        </select>
      </div>

      <div className="gt-income-field">
        <label htmlFor="income-from-date">
          From date
        </label>
        <input
          id="income-from-date"
          type="date"
          value={filters.from}
          onChange={(e) =>
            updateFilter("from", e.target.value)
          }
        />
      </div>

      <div className="gt-income-field">
        <label htmlFor="income-to-date">
          To date
        </label>
        <input
          id="income-to-date"
          type="date"
          min={filters.from || undefined}
          value={filters.to}
          onChange={(e) =>
            updateFilter("to", e.target.value)
          }
        />
      </div>

      <button
        type="button"
        className="gt-income-clear-btn"
        onClick={onClear}
      >
        Clear filters
      </button>
    </div>
  );
}
