import mongoose from "mongoose";

const AvailabilitySchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  day: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  timezone: { type: String, required: true },
});

AvailabilitySchema.index({ userId: 1, day: 1 }, { unique: true });

export default mongoose.models.Availability ||
  mongoose.model("Availability", AvailabilitySchema);
