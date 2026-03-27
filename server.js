require("dotenv").config();

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
  res.send("POS API Running...");
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

// DB CONNECT
pool.connect()
  .then(() => console.log("✅ Connected to Supabase DB"))
  .catch(err => console.error("❌ DB Connection Error:", err));

console.log("DB URL loaded");
