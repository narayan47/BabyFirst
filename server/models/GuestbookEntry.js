import mongoose from "mongoose";

const guestbookEntrySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
  },
  {
    timestamps: true,
  }
);

const GuestbookEntry =
  mongoose.models.GuestbookEntry ||
  mongoose.model("GuestbookEntry", guestbookEntrySchema);

export default GuestbookEntry;