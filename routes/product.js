const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const verifyToken = require("../middleware/authMiddleware");

// GET ALL
router.get("/", verifyToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ msg: "Error" });
  }
});

// ADD
router.post("/", verifyToken, async (req, res) => {
  const { name, price, stock } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO products (name, price, stock) VALUES ($1,$2,$3) RETURNING *",
      [name, price, stock]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ msg: "Error" });
  }
});

// UPDATE
router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { name, price, stock } = req.body;

  try {
    const result = await pool.query(
      "UPDATE products SET name=$1, price=$2, stock=$3 WHERE id=$4 RETURNING *",
      [name, price, stock, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ msg: "Error" });
  }
});

// DELETE
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM products WHERE id=$1 RETURNING *",
      [req.params.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ msg: "Error" });
  }
});

module.exports = router;
