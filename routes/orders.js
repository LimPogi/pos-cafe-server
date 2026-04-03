const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// 🧾 CREATE ORDER (CHECKOUT)
router.post("/", async (req, res) => {
  const { user_id, items, total, payment, change } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: "Cart is empty" });
  }

  try {
    // 1. Insert order
    const orderResult = await pool.query(
      `INSERT INTO orders (user_id, total, payment, change)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [user_id || null, total, payment || 0, change || 0]
    );

    const orderId = orderResult.rows[0].id;

    // 2. Insert items + update stock
    for (let item of items) {
      if (!item.name || !item.price || !item.qty) continue;

      // insert order item
      await pool.query(
        `INSERT INTO order_items (order_id, product_name, price, qty)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.name, item.price, item.qty]
      );

      // 🔥 UPDATE STOCK (IMPORTANT FIX)
      await pool.query(
        `UPDATE products
         SET stock = stock - $1
         WHERE name = $2`,
        [item.qty, item.name]
      );
    }

    res.json({
      message: "Order created successfully",
      orderId,
    });

  } catch (err) {
    console.error("ORDER ERROR:", err);
    res.status(500).json({ error: "Order failed" });
  }
});


// 📦 GET ALL ORDERS
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


// 📊 SALES SUMMARY (DASHBOARD)
router.get("/summary", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total), 0) as total_sales
      FROM orders
    `);

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Summary error" });
  }
});

module.exports = router;
