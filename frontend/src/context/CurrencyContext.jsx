import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { authAPI } from "../api/auth";
import { currencyAPI } from "../api/currency";

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState("LKR");
  const [rates, setRates] = useState({ LKR: 1 });
  const [loading, setLoading] = useState(true);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [currencyError, setCurrencyError] = useState("");

  const requestIdRef = useRef(0);

  // Fetch exchange rates for the selected base currency
  const fetchRates = useCallback(async (baseCurrency) => {
    const selectedCurrency = String(
      baseCurrency || "LKR"
    ).toUpperCase();

    const requestId = ++requestIdRef.current;

    setRatesLoading(true);
    setCurrencyError("");

    try {
      const response = await currencyAPI.getRates(selectedCurrency);

      const fetchedRates = response.data?.rates || {};

      const normalizedRates = {
        [selectedCurrency]: 1,
      };

      Object.entries(fetchedRates).forEach(([code, rate]) => {
        const numericRate = Number(rate);

        if (Number.isFinite(numericRate) && numericRate > 0) {
          normalizedRates[code.toUpperCase()] = numericRate;
        }
      });

      if (requestId === requestIdRef.current) {
        setRates(normalizedRates);
        setRatesLoading(false);
      }

      return normalizedRates;
    } catch (error) {
      console.error("Failed to fetch currency rates:", error);

      if (requestId === requestIdRef.current) {
        setRates({ [selectedCurrency]: 1 });
        setCurrencyError(
          "Exchange rates are unavailable. Some conversions cannot be displayed."
        );
        setRatesLoading(false);
      }

      return null;
    }
  }, []);

  // Load currency from the user's saved profile
  const refreshCurrency = useCallback(async () => {
    setLoading(true);

    try {
      const response = await authAPI.getProfile();

      const savedCurrency = String(
        response.data?.currency ||
          response.data?.data?.currency ||
          "LKR"
      ).toUpperCase();

      setCurrency(savedCurrency);
      setRates({ [savedCurrency]: 1 });

      await fetchRates(savedCurrency);

      return savedCurrency;
    } catch (error) {
      console.error("Failed to load preferred currency:", error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchRates]);

  // Load the profile when the application starts
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      setLoading(false);
      return;
    }

    refreshCurrency();
  }, [refreshCurrency]);

  // Update global currency after profile is saved
  const updatePreferredCurrency = useCallback(
    async (newCurrency) => {
      const selectedCurrency = String(
        newCurrency || "LKR"
      ).toUpperCase();

      setCurrency(selectedCurrency);
      setRates({ [selectedCurrency]: 1 });

      await fetchRates(selectedCurrency);
    },
    [fetchRates]
  );

  // Convert transaction amount into preferred currency
  const convertAmount = useCallback(
    (amount, sourceCurrency) => {
      const numericAmount = Number(amount);

      if (!Number.isFinite(numericAmount)) {
        return null;
      }

      const source = String(
        sourceCurrency || currency
      ).toUpperCase();

      if (source === currency) {
        return numericAmount;
      }

      const rate = Number(rates[source]);

      if (!Number.isFinite(rate) || rate <= 0) {
        return null;
      }

      return numericAmount / rate;
    },
    [currency, rates]
  );

  // Format amount in the selected preferred currency
  const formatAmount = useCallback(
    (amount, sourceCurrency) => {
      const convertedAmount = convertAmount(
        amount,
        sourceCurrency
      );

      if (convertedAmount === null) {
        return "Rate unavailable";
      }

      return `${currency} ${convertedAmount.toLocaleString(
        "en-US",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      )}`;
    },
    [convertAmount, currency]
  );

  // Check whether a conversion rate exists
  const hasRate = useCallback(
    (sourceCurrency) => {
      const source = String(
        sourceCurrency || currency
      ).toUpperCase();

      if (source === currency) {
        return true;
      }

      const rate = Number(rates[source]);

      return Number.isFinite(rate) && rate > 0;
    },
    [currency, rates]
  );

  const value = useMemo(
    () => ({
      currency,
      baseCurrency: currency,
      rates,
      loading,
      ratesLoading,
      currencyError,
      refreshCurrency,
      updatePreferredCurrency,
      convertAmount,
      convertToBase: convertAmount,
      formatAmount,
      hasRate,
    }),
    [
      currency,
      rates,
      loading,
      ratesLoading,
      currencyError,
      refreshCurrency,
      updatePreferredCurrency,
      convertAmount,
      formatAmount,
      hasRate,
    ]
  );

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);

  if (!context) {
    throw new Error(
      "useCurrency must be used inside CurrencyProvider"
    );
  }

  return context;
}