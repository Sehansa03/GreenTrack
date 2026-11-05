
import { currencies } from "../../../data/currencies";

export default function ExpenseFilter({
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
    <div className="gt-expense-filters">
      <div className="gt-expense-field">
        <label htmlFor="expense-filter-category">
          Category
        </label>

        <input
          id="expense-filter-category"
          type="text"
          placeholder="Food, Transport..."
          value={filters.category}
          onChange={(e) =>
            updateFilter("category", e.target.value)
          }
        />
      </div>

      <div className="gt-expense-field">
        <label htmlFor="expense-filter-currency">
          Currency
        </label>

        <select
          id="expense-filter-currency"
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

      <div className="gt-expense-field">
        <label htmlFor="expense-filter-from">
          From date
        </label>

        <input
          id="expense-filter-from"
          type="date"
          value={filters.from}
          onChange={(e) =>
            updateFilter("from", e.target.value)
          }
        />
      </div>

      <div className="gt-expense-field">
        <label htmlFor="expense-filter-to">
          To date
        </label>

        <input
          id="expense-filter-to"
          type="date"
          value={filters.to}
          onChange={(e) =>
            updateFilter("to", e.target.value)
          }
        />
      </div>

      <button
        type="button"
        className="gt-expense-clear-btn"
        onClick={onClear}
      >
        Clear filters
      </button>
    </div>
  );
}
