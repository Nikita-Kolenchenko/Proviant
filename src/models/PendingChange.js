import mongoose from "mongoose";

const pendingChangeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["REGISTRATION", "EMAIL_CHANGE", "PASSWORD_RESET"],
    required: true,
  },
  // payload [newEmail, newUsername, newPassword]
  payload: {
    type: String,
    default: null,
    validate: {
      validator: async function (value) {
        if (
          (this.type === "EMAIL_CHANGE" || this.type === "REGISTRATION") &&
          value
        ) {
          const existingUser = await mongoose
            .model("User")
            .findOne({ email: value });

          if (existingUser) {
            const error = new Error("Користувач з такою поштою вже існує.");
            error.status = 400;
            throw error;
          }
        }
        return true;
      },
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "4m",
  },
});

const PendingChange = mongoose.model("PendingChange", pendingChangeSchema);

export default PendingChange;
