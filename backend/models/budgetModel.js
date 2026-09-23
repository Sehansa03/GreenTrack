const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "LKR",
    },

    budgetType: {
      type: String,
      enum: ["monthly", "yearly"],
      required: true,
    },

    year: {
      type: Number,
      required: true,
    },

    month: {
      type: Number,
      min: 1,
      max: 12,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Budget", budgetSchema);