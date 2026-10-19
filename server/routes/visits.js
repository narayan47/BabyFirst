import { Router } from "express";
import mongoose from "mongoose";

export const visitRouter = Router();

const counterSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  count: {
    type: Number,
    default: 0,
  },
});

const Counter =
  mongoose.models.Counter ||
  mongoose.model("Counter", counterSchema);

// GET /api/visits
visitRouter.get("/", async (_req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message: "Visit counter database is unavailable.",
      });
    }

    const doc = await Counter.findOne({ key: "site" }).lean();

    return res.json({
      count: doc?.count || 0,
    });
  } catch (error) {
    console.error("Visit counter fetch error:", error.message);

    return res.status(500).json({
      message: "Could not load visit count.",
    });
  }
});

// POST /api/visits/hit
visitRouter.post("/hit", async (_req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message: "Visit counter database is unavailable.",
      });
    }

    const doc = await Counter.findOneAndUpdate(
      { key: "site" },
      { $inc: { count: 1 } },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.json({
      count: doc.count,
    });
  } catch (error) {
    console.error("Visit counter update error:", error.message);

    return res.status(500).json({
      message: "Could not update visit count.",
    });
  }
});