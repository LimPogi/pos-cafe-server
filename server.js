if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const cors = require("cors");

const pool = require("./config/db");

const authRoutes = require("./routes/auth");
const orderRoutes = require("./routes/orders");
const productsRoutes = require("./routes/product");
const dashboardRoutes = require("./routes/dashboard");

const app = express();

// ✅ CORS CONFIG (FIXED)
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

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("POS API Running...");
});

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api", productsRoutes);
app.use("/api/dashboard", dashboardRoutes);

// PORT
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// DEBUG LOGS (optional)
console.log("DB URL loaded:", !!process.env.DATABASE_URL);