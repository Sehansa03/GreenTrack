const axios = require("axios");

// ========================================
// GET EXCHANGE RATES
// Base = user's preferred currency
// ========================================
exports.getRates = async (req, res) => {
  try {
    const { base } = req.query;

    if (!base) {
      return res.status(400).json({
        success: false,
        message: "Base currency is required",
      });
    }

    const baseCurrency = base.toUpperCase();

    const response = await axios.get(
      `https://api.frankfurter.dev/v2/rates?base=${baseCurrency}`
    );

    const rates = {};

    response.data.forEach((item) => {
      rates[item.quote] = item.rate;
    });

    // Base currency converts to itself at 1
    rates[baseCurrency] = 1;

    res.status(200).json({
      success: true,
      base: baseCurrency,
      date: response.data[0]?.date || null,
      rates,
    });

  } catch (error) {
    console.error(
      "CURRENCY API ERROR:",
      error.response?.data || error.message
    );

    res.status(500).json({
      success: false,
      message: "Unable to fetch exchange rates",
    });
  }
};