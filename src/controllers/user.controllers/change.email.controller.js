import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import User from "../../models/User.js";
import logger from "#services/logger/logger.js";
import RefreshToken from "../../models/Refresh.js";
import PendingChange from "../../models/PendingChange.js";
import { createError } from "../../middleware/error.middleware.js";
import { sendMessage, sendCode } from "../../services/email/service.js";

export const changeEmailController = async (req, res, next) => {
  // Start session
  const session = await mongoose.startSession();

  try {
    const { newEmail, password } = req.body;
    const user = req.foundUser;

    // Check password
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) return next(createError(400, "Невірний пароль."));

    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Transaction
    await session.withTransaction(async () => {
      // Check pending change
      await PendingChange.deleteMany(
        {
          userId: user._id,
          type: "EMAIL_CHANGE",
        },
        { session },
      );

      // Create a new pending change
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
      logger.error(
        `SEND CODE\n  File: ${fileURLToPath(import.meta.url)}\n  Email: ${req.body?.email}\n  Message: ${err.message}`,
      ),
    );

    res
      .status(200)
      .json({ message: "Код для зміни електронної пошти надіслано." });
  } catch (error) {
    if (
      error.message ===
      "PendingChange validation failed: payload: Користувач з такою поштою вже існує."
    ) {
      return next(error);
    }
    // Log the error
    logger.error(
      `CHANGE EMAIL\n  File: ${fileURLToPath(import.meta.url)}\n  Email: current: ${req.foundUser?.email} new: ${req.body?.newEmail}\n  Message: ${error.message}`,
    );
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

    if (!(await bcrypt.compare(code, pendingChange.code)))
      return next(createError(400, "Невірний код."));

    // Transaction
    await session.withTransaction(async () => {
      // Delete all refresh tokens for the db
      await RefreshToken.deleteMany({
        userId: user._id,
        refreshToken: { $ne: refreshToken },
      });

      // Delete pending change
      await PendingChange.deleteOne({ _id: pendingChange._id });
      // Update email
      await User.findByIdAndUpdate(user._id, {
        email: pendingChange.payload,
      });
    });

    // Send message
    sendMessage(
      user.email,
      "Ваша електронна пошта успішно змінена на " + pendingChange.payload + ".",
    ).catch((err) =>
      logger.error(
        `SEND PROTECTION MESSAGE\n  File: ${fileURLToPath(import.meta.url)}\n  Email: ${req.body?.email}\n  Message: ${err.message}`,
      ),
    );

    res.status(200).json({ message: "Електронну пошту успішно змінено." });
  } catch (error) {
    // Log the error
    logger.error(
      `VERIFY CHANGE EMAIL\n  File: ${fileURLToPath(import.meta.url)}\n  Email: current: ${req.foundUser?.email} new: ${req.pendingChange?.payload}\n  Message: ${error.message}`,
    );
    next(error);
  } finally {
    session.endSession();
  }
};
