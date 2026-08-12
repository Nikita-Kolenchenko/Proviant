import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../../models/User.js";
import RefreshToken from "../../models/Refresh.js";
import PendingChange from "../../models/PendingChange.js";
import { createError } from "../../middleware/errorMiddleware.js";
import { sendMessage, sendCode } from "../../services/email/service.js";

export const changeEmail = async (req, res, next) => {
  // Start session
  const session = await mongoose.startSession();

  try {
    const { newEmail, password } = req.body;
    const user = req.foundUser;

    // Check password
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      const error = new Error("Невірний пароль.");
      error.status = 400;

      return next(createError(400, "Невірний пароль."));
    }

    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await session.withTransaction(async () => {
      // Check pending change
      await PendingChange.deleteMany(
        {
          userId: user._id,
          type: "EMAIL_CHANGE",
        },
        { session },
      );

      // Create a new pending change for email change
      await PendingChange.create(
        [
          {
            userId: user._id,
            type: "EMAIL_CHANGE",
            payload: newEmail,
            code: await bcrypt.hash(code, 10),
          },
        ],
        { session },
      );
    });

    // Send code to new email
    sendCode(newEmail, code).catch((err) =>
      console.error("Email send error:", err),
    );

    res
      .status(204)
      .json({ message: "Код для зміни електронної пошти надіслано." });
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
};

export const verifyChangeEmail = async (req, res, next) => {
  // Start session
  const session = await mongoose.startSession();

  try {
    const { code } = req.body;
    const { refreshToken } = req.cookies;
    const user = req.foundUser;
    const pendingChange = req.foundPendingChange;

    await session.withTransaction(async () => {
      // Delete all refresh tokens for the db and create a new one
      await RefreshToken.deleteMany({
        userId: user._id,
        refreshToken: { $ne: refreshToken },
      });

      // Update email and delete pending change
      await PendingChange.deleteOne({ _id: pendingChange._id });
      await User.findByIdAndUpdate(userId, {
        email: pendingChange.payload,
      });
    });

    // Send message
    sendMessage(
      user.email,
      "Ваша електронна пошта успішно змінена на " + pendingChange.payload + ".",
    ).catch((err) => console.error("Email send error:", err));

    res.status(200).json({ message: "Електронну пошту успішно змінено." });
  } catch (error) {
    next(error);
  } finally {
    session.endSession();
  }
};
