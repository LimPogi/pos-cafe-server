
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect()
  .then(() => console.log("✅ Connected to Supabase DB"))
  .catch(err => console.error("❌ DB Connection Error:", err));
console.log("DATABASE_URL =", process.env.DATABASE_URL);
module.exports = pool;