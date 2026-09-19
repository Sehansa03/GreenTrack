const Expense = require("../models/Expense");

// 📊 MONTHLY SUMMARY
exports.getMonthlySummary = async (req, res) => {
  try {
    const { userId, month, year } = req.query;

    const expenses = await Expense.find({ userId });

    let income = 0;
    let expense = 0;

    expenses.forEach(item => {
      const date = new Date(item.date);

      if (
        date.getMonth() + 1 == month &&
        date.getFullYear() == year
      ) {
        if (item.type === "income") {
          income += item.amount;
        } else {
          expense += item.amount;
        }
      }
    });

    res.json({
      income,
      expense,
      balance: income - expense
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCategorySummary = async (req, res) => {
  const { userId } = req.query;

  const expenses = await Expense.find({ userId });

  const summary = {};

  expenses.forEach(item => {
    if (item.type === "expense") {
      summary[item.category] =
        (summary[item.category] || 0) + item.amount;
    }
  });

  res.json(summary);
};