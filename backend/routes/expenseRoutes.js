const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createExpense,
  getExpenses,
  deleteExpense,
  updateExpense,
} = require("../controllers/expenseController");

// CREATE EXPENSE
router.post("/", authMiddleware, createExpense);

// GET ALL EXPENSES
router.get("/", authMiddleware, getExpenses);

// DELETE EXPENSE
router.delete("/:id", authMiddleware, deleteExpense);

// UPDATE EXPENSE
router.put("/:id", authMiddleware, updateExpense);

module.exports = router;