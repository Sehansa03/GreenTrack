const express = require("express");
const router = express.Router();

const {
  getMonthlySummary,
  getCategorySummary
} = require("../controllers/analyticsController");

// 📊 Monthly summary API
router.get("/monthly", getMonthlySummary);

// 📊 Category summary API
router.get("/category", getCategorySummary);

module.exports = router;