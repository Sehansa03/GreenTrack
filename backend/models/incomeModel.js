const mongoose = require("mongoose");

const incomeSchema = new mongoose.Schema(
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
    source: {
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
      default: "income",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Income", incomeSchema);