import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../models/User.js";
import { sendMessage } from "../../services/email/service.js";

export const changeUsername = async (req, res, next) => {
  try {
    const { newUsername, password } = req.body;
    const userId = req.user.id;

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("Помилка.");
      error.status = 400;

      return next(error);
    }
    if (user.username === newUsername) {
      const error = new Error("Нове ім'я збігається зі старим.");
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

    // Update username
    user.username = newUsername;
    await user.save();

    // call the email sending function to send the login notification to the user's email
    sendMessage(user.email, "Ваше ім'я користувача успішно змінено.").catch(
      (err) => console.error("Email send error:", err),
    );

    res.status(200).json({ message: "Ім'я користувача успішно змінено." });
  } catch (error) {
    next(error);
  }
};
