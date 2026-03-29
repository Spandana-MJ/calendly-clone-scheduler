import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  hostId: { type: String, required: true, index: true },
  guestName: { type: String, required: true },
  guestEmail: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

BookingSchema.index({ hostId: 1, date: 1, time: 1 }, { unique: true });

export default mongoose.models.Booking || mongoose.model("Booking", BookingSchema);
