if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const cors = require("cors");
const pool = require("./config/db");

const authRoutes = require("./routes/auth");
const orderRoutes = require("./routes/orders");
const productsRoutes = require("./routes/product");
const dashboardRoutes = require("./routes/dashboard");

const app = express();

app.use(cors());
app.use(express.json());

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("POS API Runninga...");
});

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api", productsRoutes);
app.use("/api/dashboard", dashboardRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.env.PORT
process.env.DATABASE_URL
process.env.SECRET_KEY

console.log("DB URL loaded");
