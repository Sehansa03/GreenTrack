const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { getRates } = require("../controllers/currencyController");

// Get exchange rates
router.get("/rates", authMiddleware, getRates);

module.exports = router;