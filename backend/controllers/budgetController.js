
const axios = require("axios");

const Budget = require("../models/budgetModel");
const Expense = require("../models/expenseModel");
const User = require("../models/user");

// ========================================
// CURRENCY HELPERS
// ========================================

const normalizeCurrency = (value, fallback = "LKR") =>
  String(value || fallback).trim().toUpperCase();

const convertAmount = (amount, fromCurrency, baseCurrency, rates) => {
  const value = Number(amount);
  if (!Number.isFinite(value)) return null;

  const from = normalizeCurrency(fromCurrency, baseCurrency);

  if (from === baseCurrency) return value;

  const rate = Number(rates[from]);

  if (!Number.isFinite(rate) || rate <= 0) {
    return null;
  }

  return value / rate;
};

// ========================================
// CREATE BUDGET
// ========================================

const createBudget = async (req, res) => {
  try {
    const {
      category,
      amount,
      currency,
      budgetType,
      year,
      month,
    } = req.body;

    const numericAmount = Number(amount);
    const numericYear = Number(year);
    const numericMonth = Number(month);

    if (
      !category ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0 ||
      !["monthly", "yearly"].includes(budgetType) ||
      !Number.isInteger(numericYear) ||
      numericYear < 1
    ) {
      return res.status(400).json({
        message:
          "Valid category, amount, budget type and year are required",
      });
    }

    if (
      budgetType === "monthly" &&
      (!Number.isInteger(numericMonth) ||
        numericMonth < 1 ||
        numericMonth > 12)
    ) {
      return res.status(400).json({
        message: "Valid month is required for monthly budgets",
      });
    }

    const periodMonth =
      budgetType === "monthly" ? numericMonth : undefined;

    const existingBudget = await Budget.findOne({
      user: req.user.id,
      category,
      budgetType,
      year: numericYear,
      month: periodMonth,
    });

    if (existingBudget) {
      return res.status(400).json({
        message:
          "A budget already exists for this category and period",
      });
    }

    const user = await User.findById(req.user.id).select("currency");

    const budget = await Budget.create({
      user: req.user.id,
      category,
      amount: numericAmount,
      currency: normalizeCurrency(
        currency,
        user?.currency || "LKR"
      ),
      budgetType,
      year: numericYear,
      month: periodMonth,
    });

    return res.status(201).json({
      message: "Budget created successfully",
      data: budget,
    });
  } catch (error) {
    console.error("Create budget error:", error);

    return res.status(500).json({
      message: "Failed to create budget",
    });
  }
};

// ========================================
// GET ALL BUDGETS
// ========================================

const getBudgets = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("currency");
    const baseCurrency = normalizeCurrency(user?.currency);

    const [budgets, expenses] = await Promise.all([
      Budget.find({ user: req.user.id }).sort({
        year: -1,
        month: -1,
      }),
      Expense.find({ user: req.user.id }),
    ]);

    const rates = { [baseCurrency]: 1 };

    // Fetch rates only when foreign currencies are present.
    const needsConversion = [...budgets, ...expenses].some(
      (item) =>
        normalizeCurrency(item.currency, baseCurrency) !==
        baseCurrency
    );

    if (needsConversion) {
      try {
        const response = await axios.get(
          `https://api.frankfurter.dev/v2/rates?base=${encodeURIComponent(
            baseCurrency
          )}`,
          { timeout: 10000 }
        );

        const rows = Array.isArray(response.data)
          ? response.data
          : [];

        rows.forEach((item) => {
          const rate = Number(item.rate);

          if (
            item.quote &&
            Number.isFinite(rate) &&
            rate > 0
          ) {
            rates[normalizeCurrency(item.quote)] = rate;
          }
        });
      } catch (error) {
        console.error(
          "Failed to fetch exchange rates:",
          error.response?.data || error.message
        );
      }
    }

    // Convert every budget and its related expenses.
    const budgetsWithSpending = budgets.map((budget) => {
      const originalCurrency = normalizeCurrency(
        budget.currency,
        baseCurrency
      );

      const convertedAmount = convertAmount(
        budget.amount,
        originalCurrency,
        baseCurrency,
        rates
      );

      const startDate =
        budget.budgetType === "monthly"
          ? `${budget.year}-${String(budget.month).padStart(
              2,
              "0"
            )}-01`
          : `${budget.year}-01-01`;

      const endDate =
        budget.budgetType === "monthly"
          ? Number(budget.month) === 12
            ? `${Number(budget.year) + 1}-01-01`
            : `${budget.year}-${String(
                Number(budget.month) + 1
              ).padStart(2, "0")}-01`
          : `${Number(budget.year) + 1}-01-01`;

      const relatedExpenses = expenses.filter((expense) => {
        const expenseDate = new Date(expense.date);

        if (Number.isNaN(expenseDate.getTime())) {
          return false;
        }

        const date = expenseDate.toISOString().slice(0, 10);

        return (
          expense.category === budget.category &&
          date >= startDate &&
          date < endDate
        );
      });

      let spent = 0;
      let conversionUnavailable = convertedAmount === null;

      relatedExpenses.forEach((expense) => {
        const convertedExpense = convertAmount(
          expense.amount,
          expense.currency,
          baseCurrency,
          rates
        );

        if (convertedExpense === null) {
          conversionUnavailable = true;
        } else {
          spent += convertedExpense;
        }
      });

      const remaining = conversionUnavailable
        ? null
        : Math.max(convertedAmount - spent, 0);

      const percentage = conversionUnavailable
        ? null
        : convertedAmount > 0
          ? (spent / convertedAmount) * 100
          : 0;

      let status = "normal";

      if (conversionUnavailable) {
        status = "unavailable";
      } else if (percentage >= 100) {
        status = "over";
      } else if (percentage >= 80) {
        status = "warning";
      }

      return {
        ...budget.toObject(),

        // Keep original values for editing.
        amount: Number(budget.amount),
        currency: originalCurrency,
        originalCurrency,

        // Converted values for display.
        displayCurrency: baseCurrency,
        convertedAmount,
        spent: conversionUnavailable ? null : spent,
        remaining,
        percentage,
        status,
        conversionUnavailable,
      };
    });

    return res.status(200).json({
      data: budgetsWithSpending,
      baseCurrency,
    });
  } catch (error) {
    console.error("Get budgets error:", error);

    return res.status(500).json({
      message: "Failed to fetch budgets",
    });
  }
};

// ========================================
// UPDATE BUDGET
// ========================================

const updateBudget = async (req, res) => {
  try {
    const amount = Number(req.body.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        message: "A positive budget amount is required",
      });
    }

    const budget = await Budget.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id,
      },
      {
        $set: { amount },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!budget) {
      return res.status(404).json({
        message: "Budget not found",
      });
    }

    return res.status(200).json({
      message: "Budget updated successfully",
      data: budget,
    });
  } catch (error) {
    console.error("Update budget error:", error);

    return res.status(500).json({
      message: "Failed to update budget",
    });
  }
};

// ========================================
// DELETE BUDGET
// ========================================

const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!budget) {
      return res.status(404).json({
        message: "Budget not found",
      });
    }

    return res.status(200).json({
      message: "Budget deleted successfully",
    });
  } catch (error) {
    console.error("Delete budget error:", error);

    return res.status(500).json({
      message: "Failed to delete budget",
    });
  }
};

module.exports = {
  createBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
};
