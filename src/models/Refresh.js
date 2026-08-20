import mongoose from "mongoose";

const refreshSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    jti: { type: String },

    expiredAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      expires: 0,
    },
  },
  { timestamps: true },
);

const RefreshToken = mongoose.model("Refresh", refreshSchema);

export default RefreshToken;
