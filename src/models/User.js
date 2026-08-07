import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, default: null },
    email: { type: String, unique: true, default: null },
    password: { type: String, default: null },
    role: { type: String, default: "user" },

    isActivated: { type: Boolean, default: false },

    // activationCode: { type: String, default: null },
    // verificationAttempts: { type: Number, default: 0 },

    expiredAt: { type: Date, default: null, expires: "4m" },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
