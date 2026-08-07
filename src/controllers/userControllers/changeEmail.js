import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../models/User.js";
import PendingChange from "../../models/PendingChange.js";
import RefreshToken from "../../models/Refresh.js";
import { sendMessage, sendCode } from "../../services/email/service.js";

export const changeEmail = async (req, res, next) => {
  try {
    const { newEmail, password } = req.body;
    const userId = req.user.id;

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("Помилка.");
      error.status = 400;

      return next(error);
    }

    // Check password
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      const error = new Error("Невірний пароль.");
      error.status = 400;

      return next(error);
    }

    // Check pending change
    await PendingChange.deleteMany({
      userId: user._id,
      type: "EMAIL_CHANGE",
    });

    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Create a new pending change for email change
    const newPendingChange = await PendingChange.create({
      userId: user._id,
      type: "EMAIL_CHANGE",
      payload: newEmail,
      code: await bcrypt.hash(code, 10),
    });

    // call the email sending function to send the login notification to the user's email
    sendCode(newEmail, code).catch((err) =>
      console.error("Email send error:", err),
    );

    res
      .status(204)
      .json({ message: "Код для зміни електронної пошти надіслано." });
  } catch (error) {
    next(error);
  }
};

export const verifyChangeEmail = async (req, res, next) => {
  try {
    const { code } = req.body;
    const { refreshToken } = req.cookies;
    const userId = req.user.id;

    // Find pending change and user
    const pendingChange = await PendingChange.findOne({
      userId: userId,
      type: "EMAIL_CHANGE",
    });
    if (!pendingChange) {
      const error = new Error("Срок дії коду минув.");
      error.status = 400;

      return next(error);
    }

    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("Помилка.");
      error.status = 400;

      return next(error);
    }

    // Delete all refresh tokens for the db and create a new one
    await RefreshToken.deleteMany({
      userId: user._id,
      refreshToken: { $ne: refreshToken },
    });

    // Update email and delete pending change
    await PendingChange.deleteOne({ _id: pendingChange._id });
    user.email = pendingChange.payload;
    await user.save();

    // call the email sending function to send the login notification to the user's email
    sendMessage(
      user.email,
      "Ваша електронна пошта успішно змінена на " + pendingChange.payload + ".",
    ).catch((err) => console.error("Email send error:", err));

    res.status(200).json({ message: "Електронну пошту успішно змінено." });
  } catch (error) {
    next(error);
  }
};
