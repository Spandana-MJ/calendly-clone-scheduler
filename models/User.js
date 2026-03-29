import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  timezone: { type: String },
  googleRefreshToken: { type: String },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
