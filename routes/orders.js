const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const auth = require("../middleware/authMiddleware");

// 🔐 CREATE ORDER
router.post("/", auth, async (req, res) => {
  try {
    const { items, total, payment, change } = req.body;

    const result = await pool.query(
      `INSERT INTO orders (items, total, payment, change)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [JSON.stringify(items), total, payment, change]
    );

    res.json({
      msg: "Order created",
      order: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// 🔐 GET ORDERS
router.get("/", auth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM orders ORDER BY id DESC"
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching orders" });
  }
});

router.post("/checkout", async (req, res) => {
  const { items, subtotal, discount, tax, total } = req.body;

  await pool.query(
    "INSERT INTO orders (items, subtotal, discount, tax, total) VALUES ($1,$2,$3,$4,$5)",
    [JSON.stringify(items), subtotal, discount, tax, total]
  );

  res.json({ message: "Order saved" });
});

module.exports = router;
