import "dotenv/config";

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "node:path";
import { fileURLToPath } from "node:url";

import guestbookRouter from "./routes/guestbook.js";
import { visitRouter } from "./routes/visits.js";

const app = express();

const PORT = Number(process.env.PORT || 5000);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allowedOrigins = (
  process.env.CLIENT_ORIGIN || "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests without an Origin header, such as local health checks.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json({ limit: "20kb" }));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "pip-midnight-nursery-api",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// API routes
app.use("/api/guestbook", guestbookRouter);
app.use("/api/visits", visitRouter);

// Optional: serve the built frontend from ../dist.
const distPath = path.resolve(__dirname, "../dist");

app.use(express.static(distPath));

// API not found
app.use("/api", (_req, res) => {
  res.status(404).json({ message: "API route not found." });
});

// Frontend fallback
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return next();
  }

  res.sendFile(path.join(distPath, "index.html"), (error) => {
    if (error && !res.headersSent) {
      res.status(404).send(
        "Frontend build not found. Run npm run build."
      );
    }
  });
});

// Central error handler
app.use((error, _req, res, _next) => {
  console.error("Server error:", error.message);

  if (res.headersSent) {
    return;
  }

  res.status(500).json({
    message: "Something went wrong. Please try again.",
  });
});

// Connect to MongoDB before accepting requests
async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error(
        "MONGODB_URI is missing. Check your .env file."
      );
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected successfully");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Pip API listening on http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("Backend startup failed:", error.message);
    process.exit(1);
  }
}

startServer();

export default app;