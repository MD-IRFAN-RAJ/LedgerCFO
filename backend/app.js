import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

import clientRoutes from "./routes/clientRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import { apiRateLimiter, corsGuard, securityHeaders } from "./middleware/security.js";

dotenv.config();

const app = express();
let mongoConnectPromise = null;

const connectToDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not configured");
  }

  if (!mongoConnectPromise) {
    mongoConnectPromise = mongoose
      .connect(process.env.MONGO_URI)
      .then(() => console.log("MongoDB Connected"))
      .finally(() => {
        mongoConnectPromise = null;
      });
  }

  await mongoConnectPromise;
};

// Middleware
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(securityHeaders);
app.use(corsGuard);
app.use(express.json({ limit: "10kb" }));
app.use("/api", apiRateLimiter);
app.use("/api", async (req, res, next) => {
  try {
    await connectToDatabase();
    return next();
  } catch (error) {
    console.error("Database connection error:", error.message);
    return res.status(500).json({ message: "Database unavailable" });
  }
});

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api/clients", clientRoutes);
app.use("/api/tasks", taskRoutes);

export default app;