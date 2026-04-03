if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const cors = require("cors");

const app = express(); // ✅ MUST BE FIRST

const pool = require("./config/db");
const authRoutes = require("./routes/auth");
const orderRoutes = require("./routes/orders");
const productsRoutes = require("./routes/product");
const dashboardRoutes = require("./routes/dashboard");


// ======================
// MIDDLEWARE
// ======================
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://pos-cafe-client.vercel.app"
    ],
    credentials: true,
  })
);

app.use(express.json());


// ======================
// TEST ROUTE
// ======================
app.get("/", (req, res) => {
  res.send("POS API Running...");
});


// ======================
// ROUTES
// ======================
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/dashboard", dashboardRoutes);


// ======================
// EXTRA ANALYTICS ROUTES
// ======================
app.get("/api/sales/analytics", async (req, res) => {
  const daily = await pool.query(`
    SELECT DATE(created_at) as date, SUM(total) as total
    FROM orders
    GROUP BY DATE(created_at)
    ORDER BY date DESC
  `);

  const total = await pool.query(`
    SELECT COUNT(*) as orders, SUM(total) as revenue
    FROM orders
  `);

  res.json({
    daily: daily.rows,
    summary: total.rows[0],
  });
});

app.get("/api/products/low-stock", async (req, res) => {
  const result = await pool.query(`
    SELECT * FROM products
    WHERE stock <= 5
  `);

  res.json(result.rows);
});


// ======================
// SERVER START
// ======================
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

console.log("DB URL loaded:", !!process.env.DATABASE_URL);
