import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import User from "../../models/User.js";
import Refresh from "../../models/Refresh.js";
import logger from "#services/logger/logger.js";
import PendingChange from "../../models/PendingChange.js";
import { createError } from "../../middleware/error.middleware.js";

export const verifycation = async (req, res, next) => {
  // Start session
  const session = await mongoose.startSession();

  try {
    const { code } = req.body;
    const user = req.foundUser;
    const pendingChange = req.foundPendingChange;

    // Does the code match?
    if (!(await bcrypt.compare(code, pendingChange.code))) {
      return next(createError(400, "Невірний код підтвердження."));
    }

    // Generate jti
    const tokenJti = crypto.randomUUID();

    // Create refresh token
    const refreshToken = jwt.sign(
      { id: user._id, jti: tokenJti },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "30d" },
    );

    await session.withTransaction(async () => {
      // Delete pending change
      await PendingChange.deleteOne({ _id: pendingChange._id }, { session });
      // Changing user
      await User.findByIdAndUpdate(
        user._id,
        {
          $set: { isActivated: true },
          $unset: { expiredAt: 1 },
        },
        { session },
      );

      // Create a new refresh token
      const [newToken] = await Refresh.create(
        [
          {
            userId: user._id,
            jti: tokenJti,
          },
        ],
        { session },
      );
    });

    // Delete registration token
    res.clearCookie("registrationToken", {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    // Create access token
    const accessToken = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "10m" },
    );

    // Set cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      maxAge: 10 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res
      .status(200)
      .json({ message: "Вітаємо, ви успішно підтвердили електронну адресу." });
  } catch (error) {
    // Log the error
    logger.error(
      `VERIFICATION\n  File: ${fileURLToPath(import.meta.url)}\n  Email: ${req.foundUser?.email}\n  Message: ${error.message}`,
    );
    console.error("Verification error: ", error);
    next(error);
  } finally {
    await session.endSession();
  }
};
