const Expense = require("../models/expenseModel");

// ============================
// CREATE EXPENSE
// ============================
exports.createExpense = async (req, res) => {
  try {
    const {
      amount,
      category,
      date,
      description,
      currency,
    } = req.body;

    if (!amount || !category) {
      return res.status(400).json({
        message: "Amount and category are required",
      });
    }

    const expense = await Expense.create({
      user: req.user.id,
      amount,
      category,
      date,
      description,
      currency,
      type: "expense",
    });

    res.status(201).json({
      success: true,
      message: "Expense added successfully",
      data: expense,
    });
  } catch (error) {
    console.error("CREATE EXPENSE ERROR:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ============================
// GET ALL EXPENSES
// ============================
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: expenses,
    });
  } catch (error) {
    console.error("GET EXPENSES ERROR:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ============================
// DELETE EXPENSE
// ============================
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    await expense.deleteOne();

    res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    console.error("DELETE EXPENSE ERROR:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ============================
// UPDATE EXPENSE
// ============================
exports.updateExpense = async (req, res) => {
  try {
    const {
      amount,
      category,
      date,
      description,
      currency,
    } = req.body;

    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    expense.amount = amount ?? expense.amount;
    expense.category = category ?? expense.category;
    expense.date = date ?? expense.date;
    expense.description = description ?? expense.description;
    expense.currency = currency ?? expense.currency;

    const updatedExpense = await expense.save();

    res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      data: updatedExpense,
    });
  } catch (error) {
    console.error("UPDATE EXPENSE ERROR:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};