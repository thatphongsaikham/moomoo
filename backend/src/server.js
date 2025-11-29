import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import orderRoutes from "./routes/orderRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import tableRoutes from "./routes/tableRoutes.js";
import billRoutes from "./routes/billRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import TimerService from "./services/TimerService.js";

dotenv.config();

const app = express();

// CORS configuration - Allow multiple origins for development
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "MOOMOO Restaurant API Server",
    version: "1.0.0",
    status: "running",
  });
});

app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/reservations", reservationRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Connect to MongoDB
const mongoUri =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  "mongodb://localhost:27017/moomoo";
mongoose
  .connect(mongoUri)
  .then(() => {
    console.log("✅ MongoDB Connected");
    // Initialize timer service after DB connection
    TimerService.initializeCronJobs();
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
