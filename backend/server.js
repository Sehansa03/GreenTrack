require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");



const app = express();

/* =======================
   MIDDLEWARE
======================= */
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =======================
   TEST ROUTE
======================= */
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

/* =======================
   ROUTES
======================= */
const authRoutes = require("./routes/authRoutes");

const incomeRoutes = require("./routes/incomeRoutes");
const expenseRoutes = require("./routes/expenseRoutes");

const currencyRoutes = require("./routes/currencyRoutes");

app.use("/api/auth", authRoutes);

app.use("/api/income", incomeRoutes);

app.use("/api/expense", expenseRoutes);

app.use("/api/currency", currencyRoutes);

/* =======================
   DATABASE
======================= */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("Mongo Error:", err));

/* =======================
   SERVER
======================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
});