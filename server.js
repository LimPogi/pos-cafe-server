// ======================
// ENV CONFIG
// ======================
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// ======================
// IMPORTS
// ======================
const express = require("express");
const cors = require("cors");
const pool = require("./config/db");

// Routes
const authRoutes = require("./routes/auth");
const orderRoutes = require("./routes/orders");
const productsRoutes = require("./routes/product");
const dashboardRoutes = require("./routes/dashboard");

// ======================
// INIT APP
// ======================
const app = express();

// ======================
// MIDDLEWARE
// ======================
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://pos-cafe-client.vercel.app",
      "https://pos-cafe-client-djlwkssh3-limpogis-projects.vercel.app",

    ],
    credentials: true,
  })
);

app.use(express.json());

// ======================
// HEALTH CHECK
// ======================
app.get("/", (req, res) => {
  res.send("🚀 POS API Running...");
});

// ======================
// DEBUG (TEMP ONLY)
// ======================
console.log("authRoutes:", typeof authRoutes);
console.log("orderRoutes:", typeof orderRoutes);
console.log("productsRoutes:", typeof productsRoutes);
console.log("dashboardRoutes:", typeof dashboardRoutes);

// ======================
// ROUTES
// ======================
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", productsRoutes); // ✅ FIXED (plural consistent)
app.use("/api/dashboard", dashboardRoutes);

// ======================
// SALES ANALYTICS
// ======================
app.get("/api/sales/analytics", async (req, res) => {
  try {
    const daily = await pool.query(`
      SELECT DATE(created_at) AS date, SUM(total) AS total
      FROM orders
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    const summary = await pool.query(`
      SELECT 
        COUNT(*) AS orders,
        COALESCE(SUM(total), 0) AS revenue
      FROM orders
    `);

    res.json({
      daily: daily.rows,
      summary: summary.rows[0],
    });
  } catch (err) {
    console.error("ANALYTICS ERROR:", err.message);
    res.status(500).json({ error: "Analytics failed" });
  }
});

// ======================
// LOW STOCK PRODUCTS
// ======================
app.get("/api/products/low-stock", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM products
      WHERE stock <= 5
      ORDER BY stock ASC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("LOW STOCK ERROR:", err.message);
    res.status(500).json({ error: "Low stock fetch failed" });
  }
});

// ======================
// SERVER START
// ======================
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("DB connected:", !!process.env.DATABASE_URL);
});
