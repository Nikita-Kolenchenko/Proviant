import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { fileURLToPath } from "url";
import User from "../../models/User.js";
import mongoose from "mongoose";
import logger from "#services/logger/logger.js";
import PendingChange from "../../models/PendingChange.js";
import { sendCode } from "#services/email/service.js";
import { createError } from "../../middleware/error.middleware.js";

export const register = async (req, res, next) => {
  // Start session
  const session = await mongoose.startSession();

  try {
    const { username, email, password } = req.body;

    // User and code
    let user;
    let code = Math.floor(100000 + Math.random() * 900000).toString();

    await session.withTransaction(async () => {
      // Delete user and pending change already exists
      const userFindPandingChange = await User.findOneAndDelete(
        { email, isActivated: false },
        { session },
      );
      // Delete panding changes
      if (userFindPandingChange) {
        await PendingChange.deleteMany(
          { userId: userFindPandingChange._id, type: "REGISTRATION" },
          { session },
        );
      }

      // Hash
      const [hashedPassword, hashedCode] = await Promise.all([
        bcrypt.hash(password, 10),
        bcrypt.hash(code, 10),
      ]);

      // Create new user
      const [newUser] = await User.create(
        [
          {
            username,
            email,
            password: hashedPassword,
            expiredAt: new Date(),
          },
        ],
        { session },
      );
      user = newUser; // User
      // Create new pending change
      await PendingChange.create(
        [
          {
            userId: newUser._id,
            code: hashedCode,
            type: "REGISTRATION",
            payload: null,
            createdAt: new Date(),
          },
        ],
        { session },
      );
    });

    // Send code on email
    sendCode(user.email, code).catch((err) =>
      logger.error(
        `SEND CODE\n  File: ${fileURLToPath(import.meta.url)}\n  Email: ${req.body?.email}\n  Message: ${err.message}`,
      ),
    );

    // Create registration token and push in cookie
    const registrationToken = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_REGISTRATION,
      { expiresIn: "5m" },
    );

    res.cookie("registrationToken", registrationToken, {
      httpOnly: true,
      secure: false,
      maxAge: 5 * 60 * 1000,
    });

    res.status(201).json({
      message: "Код підтвердження надіслано на вашу електронну пошту.",
    });
  } catch (error) {
    // Log the error
    logger.error(
      `REGISTRATION\n  File: ${fileURLToPath(import.meta.url)}\n  Email: ${req.body?.email}\n  Message: ${error.message}`,
    );
    if (error.code === 11000)
      return next(
        createError(400, "Користувач з таким email вже зареєстрований."),
      );
    next(error);
  } finally {
    await session.endSession();
  }
};
