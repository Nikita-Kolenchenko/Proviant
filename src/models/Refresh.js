import mongoose from "mongoose";

const refreshSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    refreshToken: { type: String },

    expiredAt: { type: Date, default: Date.now, expires: "30d" },
  },
  { timestamps: true },
);

const RefreshToken = mongoose.model("Refresh", refreshSchema);

export default RefreshToken;
