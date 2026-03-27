const pool = require("../config/db");

// Create order
exports.createOrder = async (req, res) => {
  const { items, total, payment, change } = req.body;

  if (!items || !total || !payment || change === undefined)
    return res.status(400).json({ msg: "Missing order data" });

  try {
    const result = await pool.query(
  "INSERT INTO orders (items, total, payment, change) VALUES ($1, $2, $3, $4)",
  [JSON.stringify(items), total, payment, change]
    );

    res.json({ message: "Order saved", order: result.rows[0] });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Get all orders
exports.getOrders = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM orders ORDER BY created_at DESC");
    res.json({ msg: "Orders fetched successfully", orders: result.rows, user: req.user });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};