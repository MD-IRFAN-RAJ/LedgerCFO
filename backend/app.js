import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

import clientRoutes from "./routes/clientRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import { apiRateLimiter, corsGuard, securityHeaders } from "./middleware/security.js";

dotenv.config();

const app = express();

// Middleware
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(securityHeaders);
app.use(corsGuard);
app.use(express.json({ limit: "10kb" }));
app.use("/api", apiRateLimiter);

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api/clients", clientRoutes);
app.use("/api/tasks", taskRoutes);

if (!mongoose.connection.readyState) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log(err));
}

export default app;