const Income = require("../models/incomeModel");

// ============================
// CREATE INCOME
// ============================
exports.createIncome = async (req, res) => {
  try {
    const { amount, source, date, description, currency } = req.body;

    // basic validation
    if (!amount || !source) {
      return res.status(400).json({ message: "Amount and source are required" });
    }

    const income = await Income.create({
      user: req.user.id,          // 🔐 LINK TO LOGGED IN USER
      amount,
      source,
      date,
      description,
      currency,
      type: "income",
    });

    res.status(201).json({
      success: true,
      message: "Income added successfully",
      data: income,
    });

  } catch (error) {
    console.error("CREATE INCOME ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// GET ALL INCOME (USER ONLY)
// ============================
exports.getIncome = async (req, res) => {
  try {
    const income = await Income.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: income,
    });

  } catch (error) {
    console.error("GET INCOME ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// DELETE INCOME (USER ONLY)
// ============================
exports.deleteIncome = async (req, res) => {
  try {
    const income = await Income.findOne({
      _id: req.params.id,
      user: req.user.id, // 🔐 OWNER CHECK
    });

    if (!income) {
      return res.status(404).json({ message: "Income not found" });
    }

    await income.deleteOne();

    res.status(200).json({
      success: true,
      message: "Income deleted successfully",
    });

  } catch (error) {
    console.error("DELETE INCOME ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// UPDATE INCOME (EDIT)
// ============================
exports.updateIncome = async (req, res) => {
  try {
    const { amount, source, date, description, currency } = req.body;

    const income = await Income.findOne({
      _id: req.params.id,
      user: req.user.id, // 🔐 security check
    });

    if (!income) {
      return res.status(404).json({ message: "Income not found" });
    }

    income.amount = amount ?? income.amount;
    income.source = source ?? income.source;
    income.date = date ?? income.date;
    income.description = description ?? income.description;
    income.currency = currency ?? income.currency;

    const updatedIncome = await income.save();

    res.status(200).json({
      success: true,
      message: "Income updated successfully",
      data: updatedIncome,
    });

  } catch (error) {
    console.error("UPDATE INCOME ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};