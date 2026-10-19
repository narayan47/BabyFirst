import { Router } from "express";
import mongoose from "mongoose";
import GuestbookEntry from "../models/GuestbookEntry.js";

const router = Router();

const submissions = new Map();

const WINDOW_MS = 60_000;
const MAX_SUBMISSIONS = 5;

function limitSubmissions(req, res, next) {
  const now = Date.now();
  const ip = req.ip || req.socket.remoteAddress || "unknown";

  const record = submissions.get(ip);

  if (!record || now - record.start >= WINDOW_MS) {
    submissions.set(ip, {
      start: now,
      count: 1,
    });

    return next();
  }

  if (record.count >= MAX_SUBMISSIONS) {
    return res.status(429).json({
      message: "Please wait a minute before leaving another dream.",
    });
  }

  record.count += 1;
  next();
}

// GET /api/guestbook
router.get("/", async (_req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message: "Guestbook database is temporarily unavailable.",
      });
    }

    const entries = await GuestbookEntry.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .select("name message createdAt")
      .lean();

    return res.json({ entries });
  } catch (error) {
    console.error("Guestbook fetch error:", error.message);

    return res.status(500).json({
      message: "Could not load dream wishes.",
    });
  }
});

// POST /api/guestbook
router.post("/", limitSubmissions, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message: "Guestbook database is temporarily unavailable.",
      });
    }

    const name =
      typeof req.body?.name === "string"
        ? req.body.name.trim()
        : "";

    const message =
      typeof req.body?.message === "string"
        ? req.body.message.trim()
        : "";

    if (!name || !message) {
      return res.status(400).json({
        message: "Please enter your name and dream wish.",
      });
    }

    if (name.length > 40 || message.length > 300) {
      return res.status(400).json({
        message: "Name or message is too long.",
      });
    }

    const entry = await GuestbookEntry.create({
      name,
      message,
    });

    return res.status(201).json({
      entry: {
        _id: entry._id,
        name: entry.name,
        message: entry.message,
        createdAt: entry.createdAt,
      },
    });
  } catch (error) {
    console.error("Guestbook save error:", error.message);

    return res.status(500).json({
      message: "Could not save your dream wish.",
    });
  }
});

export default router;