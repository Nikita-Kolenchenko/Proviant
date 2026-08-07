import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../models/User.js";
import PendingChange from "../../models/PendingChange.js";
import RefreshToken from "../../models/Refresh.js";
import { sendMessage, sendCode } from "../../services/email/service.js";

export const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const { refreshToken } = req.cookies;
    const userId = req.user.id;

    if (!refreshToken) {
      const error = new Error("Помилка.");
      error.status = 400;

      return next(error);
    }

    if (oldPassword === newPassword) {
      const error = new Error("Новий пароль не може збігатися зі старим.");
      error.status = 400;

      return next(error);
    }

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("Помилка.");
      error.status = 400;

      return next(error);
    }

    // Check password
    const checkPassword = await bcrypt.compare(oldPassword, user.password);
    if (!checkPassword) {
      const error = new Error("Невірний пароль.");
      error.status = 400;

      return next(error);
    }

    // Delete all refresh tokens for the db and create a new one
    await RefreshToken.deleteMany({
      userId: user._id,
      refreshToken: { $ne: refreshToken },
    });

    // Update password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // call the email sending function to send the login notification to the user's email
    sendMessage(user.email, "Ваш пароль успішно змінено.").catch((err) =>
      console.error("Email send error:", err),
    );

    res.status(200).json({ message: "Пароль успішно змінено." });
  } catch (error) {
    next(error);
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
      httpOnly: true, // XSS
      secure: false, // СТАВЬ FALSE ДЛЯ ЛОКАЛКИ! Если true, кука работает ТОЛЬКО по https
      //sameSite: "lax", // Для локальной разработки между разными портами
      maxAge: 10 * 60 * 1000,
    });

    // Сall the email sending function to send the login notification to the user's email
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
  try {
    const { code } = req.body;
    const userId = req.user.id;

    // Find user by EMAIL
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("Помилка.");
      error.status = 400;
      return next(error);
    }
    const pendingChange = await PendingChange.findOne({
      userId,
      type: "PASSWORD_RESET",
    });
    if (!pendingChange) {
      const error = new Error("Час дії коду минув.");
      error.status = 400;
      return next(error);
    }

    // Check code
    if (!(await bcrypt.compare(code, pendingChange.code))) {
      const error = new Error("Невірний код підтвердження.");
      error.status = 400;
      return next(error);
    }

    // Delete all refresh tokens for the db and create a new one
    await RefreshToken.deleteMany({
      userId: user._id,
    });

    // Delete changeForgotPasswordToken and pending change
    res.clearCookie("changeForgotPasswordToken", {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });
    await PendingChange.deleteOne({ _id: pendingChange._id });

    // Update password
    user.password = pendingChange.payload;
    await user.save();

    // call the email sending function to send the login notification to the user's email
    sendMessage(user.email, "Ваш пароль успішно змінено.").catch((err) =>
      console.error("Email send error:", err),
    );

    res.status(200).json({
      message: "Пароль успішно змінено.",
    });
  } catch (error) {
    next(error);
  }
};
