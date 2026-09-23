const express = require("express");

const {
  createBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
} = require("../controllers/budgetController");

const auth = require("../middleware/authMiddleware");

const router = express.Router();

// Create budget
router.post("/", auth, createBudget);

// Get all budgets
router.get("/", auth, getBudgets);

// Update budget
router.put("/:id", auth, updateBudget);

// Delete budget
router.delete("/:id", auth, deleteBudget);

module.exports = router;