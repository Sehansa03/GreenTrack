const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: "LKR",
    },

    avatar: {
  type: String, // image URL or filename
  default: "",
},

  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);