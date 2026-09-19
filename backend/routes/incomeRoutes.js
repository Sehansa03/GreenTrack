const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  createIncome,
  getIncome,
  deleteIncome,
  updateIncome
} = require("../controllers/incomeController");

// CREATE INCOME (logged-in user)
router.post("/", authMiddleware, createIncome);

// GET ALL INCOMES (logged-in user)
router.get("/", authMiddleware, getIncome);

// DELETE INCOME (logged-in user)
router.delete("/:id", authMiddleware, deleteIncome);

// UPDATE (EDIT)
router.put("/:id", authMiddleware, updateIncome);

module.exports = router;