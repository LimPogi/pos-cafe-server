const express = require("express");
const router = express.Router();

const pool = require("../config/db");
const verifyToken = require("../middleware/authMiddleware");

// TOTAL SALES
router.get("/total-sales", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT COALESCE(SUM(total), 0) AS sum FROM orders
    `);

    res.json({ totalSales: result.rows[0].sum });
  } catch (err) {
    res.status(500).json({ msg: "Error" });
  }
});

// TODAY SALES
router.get("/today-sales", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT COALESCE(SUM(total), 0) AS sum
      FROM orders
      WHERE DATE(created_at) = CURRENT_DATE
    `);

    res.json({ todaySales: result.rows[0].sum });
  } catch (err) {
    res.status(500).json({ msg: "Error" });
  }
});

// ORDERS
router.get("/orders", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM orders ORDER BY id DESC"
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ msg: "Error" });
  }
});

// WEEK SALES
router.get("/week-sales", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT COALESCE(SUM(total), 0) AS sum
      FROM orders
      WHERE created_at >= NOW() - INTERVAL '7 days'
    `);

    res.json({ weekSales: result.rows[0].sum });
  } catch (err) {
    res.status(500).json({ msg: "Error" });
  }
});

// MONTH SALES
router.get("/month-sales", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT COALESCE(SUM(total), 0) AS sum
      FROM orders
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `);

    res.json({ monthSales: result.rows[0].sum });
  } catch (err) {
    res.status(500).json({ msg: "Error" });
  }
});

// DAILY SALES
router.get("/daily-sales", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DATE(created_at) AS date, SUM(total) AS sales
      FROM orders
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ msg: "Error" });
  }
});

// SUMMARY
router.get("/sales/summary", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT COUNT(*) AS total_orders,
             COALESCE(SUM(total),0) AS total_sales
      FROM orders
    `);

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ msg: "Error" });
  }
});

module.exports = router;
