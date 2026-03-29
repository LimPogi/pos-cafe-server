const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const auth = require("../middleware/authMiddleware");

router.post("/", async (req, res) => {
  const { items, total } = req.body;

  // ✅ VALIDATION
  if (!items || items.length === 0) {
    return res.status(400).json({ error: "Cart is empty" });
  }

  if (!total || total <= 0) {
    return res.status(400).json({ error: "Invalid total" });
  }

  try {
    const order = await pool.query(
      "INSERT INTO orders (total) VALUES ($1) RETURNING *",
      [total]
    );

    const orderId = order.rows[0].id;

    for (let item of items) {
      if (!item.name || !item.price || !item.qty) continue;

      await pool.query(
        `INSERT INTO order_items 
        (order_id, name, price, qty) 
        VALUES ($1, $2, $3, $4)`,
        [orderId, item.name, item.price, item.qty]
      );
    }

    res.json({ message: "Order saved", orderId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// 📊 GET ALL ORDERS
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM orders ORDER BY created_at DESC"
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// 📈 TOTAL SALES
router.get("/summary", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT SUM(total) as total_sales FROM orders"
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Summary error" });
  }
});

module.exports = router;
