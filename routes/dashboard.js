const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const verifyToken = require("../middleware/authMiddleware");

// 📊 TOTAL SALES
router.get("/total-sales", verifyToken, async (req, res) => {
  const result = await pool.query("SELECT SUM(total) FROM orders");

  res.json({
    totalSales: result.rows[0].sum || 0,
  });
});

// 📅 TODAY SALES
router.get("/today-sales", verifyToken, async (req, res) => {
  const result = await pool.query(`
    SELECT SUM(total)
    FROM orders
    WHERE DATE(created_at) = CURRENT_DATE
  `);

  res.json({
    todaySales: result.rows[0].sum || 0,
  });
});

// 📦 ALL ORDERS
router.get("/orders", verifyToken, async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM orders ORDER BY id DESC"
  );

  res.json(result.rows);
});

// 📅 WEEK SALES
router.get("/week-sales", verifyToken, async (req, res) => {
  const result = await pool.query(`
    SELECT SUM(total)
    FROM orders
    WHERE created_at >= NOW() - INTERVAL '7 days'
  `);

  res.json({
    weekSales: result.rows[0].sum || 0,
  });
});

// 📅 MONTH SALES
router.get("/month-sales", verifyToken, async (req, res) => {
  const result = await pool.query(`
    SELECT SUM(total)
    FROM orders
    WHERE created_at >= NOW() - INTERVAL '30 days'
  `);

  res.json({
    monthSales: result.rows[0].sum || 0,
  });
});

// 📈 DAILY SALES (NEW - ADD THIS)
router.get("/daily-sales", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        DATE(created_at) AS date,
        SUM(total) AS sales
      FROM orders
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("DAILY SALES ERROR:", err.message);
    res.status(500).json({ msg: "Error fetching daily sales" });
  }
});

module.exports = router;
