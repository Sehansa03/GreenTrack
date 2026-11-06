
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { authAPI } from "../api/auth";
import { currencyAPI } from "../api/currency";
import { CurrencyContext } from "./CurrencyContextBase";

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState("LKR");
  const [rates, setRates] = useState({ LKR: 1 });

  // No profile request is needed if there is no token.
  const [loading, setLoading] = useState(
    () => Boolean(localStorage.getItem("token"))
  );

  const [ratesLoading, setRatesLoading] = useState(false);
  const [currencyError, setCurrencyError] = useState("");

  const requestIdRef = useRef(0);
  const profileRequestIdRef = useRef(0);

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

  const refreshCurrency = useCallback(async () => {
    const profileRequestId = ++profileRequestIdRef.current;

    setLoading(true);

    try {
      const response = await authAPI.getProfile();

      if (profileRequestId !== profileRequestIdRef.current) {
        return null;
      }

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
      if (profileRequestId === profileRequestIdRef.current) {
        console.error("Failed to load preferred currency:", error);
      }

      return null;
    } finally {
      if (profileRequestId === profileRequestIdRef.current) {
        setLoading(false);
      }
    }
  }, [fetchRates]);

  // Load saved profile currency when the provider mounts.

useEffect(() => {
  if (!localStorage.getItem("token")) {
    return;
  }

  // Schedule the async profile refresh outside
  // the synchronous effect execution.
  const controller = new AbortController();

  const loadInitialCurrency = async () => {
    if (controller.signal.aborted) return;

    await refreshCurrency();
  };

  Promise.resolve().then(() => {
    if (!controller.signal.aborted) {
      void loadInitialCurrency();
    }
  });

  return () => {
    controller.abort();
    profileRequestIdRef.current += 1;
    requestIdRef.current += 1;
  };
}, [refreshCurrency]);


  const updatePreferredCurrency = useCallback(
    async (newCurrency) => {
      const selectedCurrency = String(
        newCurrency || "LKR"
      ).toUpperCase();

      // Invalidate any older profile request.
      profileRequestIdRef.current += 1;

      setLoading(false);
      setCurrency(selectedCurrency);
      setRates({ [selectedCurrency]: 1 });

      await fetchRates(selectedCurrency);
    },
    [fetchRates]
  );

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
