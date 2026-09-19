const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    date: {
      type: String,
    },

    description: {
      type: String,
    },

    currency: {
      type: String,
      default: "LKR",
    },

    type: {
      type: String,
      default: "expense",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);