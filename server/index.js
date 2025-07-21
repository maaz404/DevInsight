const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Import middleware
const { generalRateLimit } = require("./middleware/rateLimiter");

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(generalRateLimit);

// Enhanced MongoDB connection with explicit database name
const connectDB = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...");
    console.log(
      "Connection string:",
      process.env.MONGO_URI?.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@")
    );

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: "devinsight", // Force the database name
    });

    console.log(`✅ MongoDB connected successfully!`);
    console.log(`📊 Database: ${conn.connection.db.databaseName}`);
    console.log(`🌐 Host: ${conn.connection.host}`);

    return true;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    console.log("⚠️  Server will continue without database functionality");
    return false;
  }
};

// Connect to database
connectDB();

// Routes
app.use("/api/analyze", require("./routes/analyze"));
app.use("/api/projects", require("./routes/projects"));
app.use("/api/analyze/readme", require("./features/readme-analyzer/routes"));
app.use(
  "/api/analyze/dependencies",
  require("./features/dependency-analyzer/routes")
);
app.use(
  "/api/analyze/code-smells",
  require("./features/code-smell-scanner/routes")
);
app.use(
  "/api/analyze/github",
  require("./features/github-api-analyzer/routes")
);

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "DevInsight API is running!" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
