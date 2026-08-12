import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../../models/User.js";
import RefreshToken from "../../models/Refresh.js";
import PendingChange from "../../models/PendingChange.js";
import { createError } from "../../middleware/errorMiddleware.js";
import { sendMessage, sendCode } from "../../services/email/service.js";

export const changePassword = async (req, res, next) => {
  // Start session
  const session = mongoose.startSession();

  try {
    const { oldPassword, newPassword } = req.body;
    const user = req.foundUser;

    // Compare old and new password
    if (oldPassword === newPassword) {
      return next(
        createError(400, "Новий пароль не може збігатися зі старим."),
      );
    }

    // Check password
    if (!(await bcrypt.compare(oldPassword, user.password))) {
      return next(createError(400, "Невірний пароль."));
    }

    await await session.withTransaction(async () => {
      // Delete all refresh tokens from db except for the password
      await RefreshToken.deleteMany(
        {
          userId: user._id,
          refreshToken: { $ne: refreshToken },
        },
        { session },
      );

      // Update password
      await User.findByIdAndUpdate(
        userId,
        {
          password: await bcrypt.hash(newPassword, 10),
        },
        { session },
      );
    });

    // Send security message
    sendMessage(user.email, "Ваш пароль успішно змінено.").catch((err) =>
      console.error("Email send error:", err),
    );

    res.status(200).json({ message: "Пароль успішно змінено." });
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
};

export const changeForgotPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;

    // Find user by EMAIL
    const user = await User.findOne({ email }).select("-password");
    if (!user) {
      return res.status(200).json({
        message:
          "Якщо ця пошта зареєстрована, ми надіслали код для скидання пароля.",
      });
    }

    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Create a new pending change for email change
    const newPendingChange = await PendingChange.create({
      userId: user._id,
      type: "PASSWORD_RESET",
      payload: await bcrypt.hash(newPassword, 10),
      code: await bcrypt.hash(code, 10),
    });

    // Create JWT token and set cookie
    const ChangeForgotPasswordToken = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_CHANGE_FORGOT_PASSWORD,
      { expiresIn: "5m" },
    );
    res.cookie("changeForgotPasswordToken", ChangeForgotPasswordToken, {
      httpOnly: true,
      secure: false,
      maxAge: 5 * 60 * 1000,
    });

    // Send code to email
    sendCode(user.email, code).catch((err) =>
      console.error("Email send error:", err),
    );

    res.status(200).json({
      message:
        "Якщо ця пошта зареєстрована, ми надіслали код для скидання пароля.",
    });
  } catch (error) {
    next(error);
  }
};

export const changeVerificationNewPassword = async (req, res, next) => {
  // Start session
  const session = await mongoose.startSession();

  try {
    const { code } = req.body;
    const user = req.foundUser;
    const pendingChange = req.foundPendingChange;

    // Check code
    if (!(await bcrypt.compare(code, pendingChange.code))) {
      return next(createError(400, "Невірний код підтвердження."));
    }

    // Delete changeForgotPasswordToken
    res.clearCookie("changeForgotPasswordToken", {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    await session.withTransaction(async () => {
      // Delete pending change
      await PendingChange.deleteOne({ _id: pendingChange._id });

      // Delete all refresh tokens for the db and create a new one
      await RefreshToken.deleteMany({
        userId: user._id,
      });

      // Update password
      await User.findByIdAndUpdate(user._id, {
        password: pendingChange.payload,
      });
    });

    // Send message
    sendMessage(user.email, "Ваш пароль успішно змінено.").catch((err) =>
      console.error("Email send error:", err),
    );

    res.status(200).json({
      message: "Пароль успішно змінено.",
    });
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
};
