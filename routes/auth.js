const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs"); // ✅ FIXED
const pool = require("../config/db");


// ==========================
// 🧾 REGISTER (MISSING BEFORE)
// ==========================
router.post("/register", async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING *",
      [email, hashedPassword, role]
    );

    const user = result.rows[0];

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "User registered successfully",
      token,
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});


// ==========================
// 🔐 LOGIN
// ==========================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  console.log("👉 LOGIN REQUEST RECEIVED:", email);

  try {
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    console.log("👉 DB RESULT:", userResult.rows);

    if (userResult.rows.length === 0) {
      console.log("❌ USER NOT FOUND");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = userResult.rows[0];

    console.log("👉 USER FOUND:", user.email);

    const validPassword = await bcrypt.compare(password, user.password);

    console.log("👉 PASSWORD MATCH:", validPassword);

    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      role: user.role,
    });

  } catch (err) {
    console.error("❌ LOGIN ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;