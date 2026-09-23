const axios = require("axios");

const Budget = require("../models/budgetModel");
const Expense = require("../models/expenseModel");
const User = require("../models/user");


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

    if (!category || !amount || !budgetType || !year) {
      return res.status(400).json({
        message:
          "Category, amount, budget type and year are required",
      });
    }

    if (
      budgetType === "monthly" &&
      (!month || month < 1 || month > 12)
    ) {
      return res.status(400).json({
        message:
          "Month is required for monthly budgets",
      });
    }

    // Prevent duplicate budgets
    const existingBudget = await Budget.findOne({
      user: req.user.id,
      category,
      budgetType,
      year,
      month:
        budgetType === "monthly"
          ? month
          : undefined,
    });

    if (existingBudget) {
      return res.status(400).json({
        message:
          "A budget already exists for this category and period",
      });
    }

    const budget = await Budget.create({
      user: req.user.id,
      category,
      amount,
      currency: currency || "LKR",
      budgetType,
      year,
      month:
        budgetType === "monthly"
          ? month
          : undefined,
    });

    res.status(201).json({
      message: "Budget created successfully",
      data: budget,
    });

  } catch (error) {
    console.error(
      "Create budget error:",
      error
    );

    res.status(500).json({
      message: "Failed to create budget",
    });
  }
};


// ========================================
// GET ALL BUDGETS
// ========================================
const getBudgets = async (req, res) => {
  try {

    // Get user's preferred/base currency
    const user = await User.findById(
      req.user.id
    ).select("currency");

    const baseCurrency =
      user?.currency || "LKR";


    // ========================================
    // Get exchange rates
    // ========================================

    let rates = {
      [baseCurrency]: 1,
    };

    try {
      const response = await axios.get(
        `https://api.frankfurter.dev/v2/rates?base=${baseCurrency}`
      );

      response.data.forEach((item) => {
        rates[item.quote] = item.rate;
      });

      rates[baseCurrency] = 1;

    } catch (currencyError) {

      console.error(
        "Failed to fetch currency rates:",
        currencyError.response?.data ||
          currencyError.message
      );

      // Continue with base currency only
    }


    // ========================================
    // Get user's budgets
    // ========================================

    const budgets = await Budget.find({
      user: req.user.id,
    }).sort({
      year: -1,
      month: -1,
    });


    // ========================================
    // Calculate spending
    // ========================================

    const budgetsWithSpending =
      await Promise.all(
        budgets.map(async (budget) => {

          const expenseQuery = {
            user: req.user.id,
            category: budget.category,
          };

          let startDate;
          let endDate;


          // Monthly budget
          if (
            budget.budgetType === "monthly"
          ) {

            startDate = new Date(
              budget.year,
              budget.month - 1,
              1
            );

            endDate = new Date(
              budget.year,
              budget.month,
              1
            );

          }

          // Yearly budget
          else {

            startDate = new Date(
              budget.year,
              0,
              1
            );

            endDate = new Date(
              budget.year + 1,
              0,
              1
            );
          }


          const expenses =
            await Expense.find({
              ...expenseQuery,
              date: {
                $gte: formatDate(startDate),
                $lt: formatDate(endDate),
              },
            });


          // ========================================
          // Convert all expenses to base currency
          // ========================================

          const spent =
            expenses.reduce(
              (total, expense) => {

                const amount =
                  Number(
                    expense.amount || 0
                  );

                const expenseCurrency =
                  (
                    expense.currency ||
                    baseCurrency
                  ).toUpperCase();


                // Already base currency
                if (
                  expenseCurrency ===
                  baseCurrency
                ) {
                  return total + amount;
                }


                // Convert foreign currency
                const rate =
                  rates[expenseCurrency];


                if (!rate) {
                  console.warn(
                    `Exchange rate not found for ${expenseCurrency}`
                  );

                  return total;
                }


                // Same conversion logic
                // used by GreenTrack Analytics
                const convertedAmount =
                  amount / Number(rate);


                return (
                  total +
                  convertedAmount
                );
              },
              0
            );


          // ========================================
          // Budget calculations
          // ========================================

          const budgetAmount =
            Number(
              budget.amount || 0
            );


          const remaining =
            Math.max(budgetAmount - spent, 0);


          const percentage =
            budgetAmount > 0
              ? (spent / budgetAmount) * 100
              : 0;


          let status = "normal";

          if (percentage >= 100) {
            status = "over";
          } else if (percentage >= 80) {
            status = "warning";
          }


          return {
            ...budget.toObject(),

            // Always expose budget
            // calculations in base currency
            currency: baseCurrency,

            spent,
            remaining,
            percentage,
            status,
          };
        })
      );


    res.status(200).json({
      data: budgetsWithSpending,
    });

  } catch (error) {

    console.error(
      "Get budgets error:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch budgets",
    });
  }
};


// ========================================
// UPDATE BUDGET
// ========================================
const updateBudget = async (req, res) => {
  try {

    const budget =
      await Budget.findOneAndUpdate(
        {
          _id: req.params.id,
          user: req.user.id,
        },
        req.body,
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


    res.status(200).json({
      message:
        "Budget updated successfully",
      data: budget,
    });

  } catch (error) {

    console.error(
      "Update budget error:",
      error
    );

    res.status(500).json({
      message: "Failed to update budget",
    });
  }
};


// ========================================
// DELETE BUDGET
// ========================================
const deleteBudget = async (req, res) => {
  try {

    const budget =
      await Budget.findOneAndDelete({
        _id: req.params.id,
        user: req.user.id,
      });


    if (!budget) {
      return res.status(404).json({
        message: "Budget not found",
      });
    }


    res.status(200).json({
      message:
        "Budget deleted successfully",
    });

  } catch (error) {

    console.error(
      "Delete budget error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to delete budget",
    });
  }
};


// ========================================
// FORMAT DATE
// ========================================
const formatDate = (date) => {

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");


  return `${year}-${month}-${day}`;
};


module.exports = {
  createBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
};