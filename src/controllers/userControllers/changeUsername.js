import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { fileURLToPath } from "url";
import User from "../../models/User.js";
import logger from "#services/logger/logger.js";
import { createError } from "../../middleware/errorMiddleware.js";
import { sendMessage } from "../../services/email/service.js";

export const changeUsername = async (req, res, next) => {
  try {
    const { newUsername, password } = req.body;
    const userId = req.user.id;
    const user = req.foundUser;

    // Find user by ID
    if (user.username === newUsername) {
      return next(createError(400, "Нове ім'я збігається зі старим."));
    }

    // Check password
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return next(createError(400, "Невірний пароль."));
    }

    // Update username
    user.username = newUsername;
    await user.save();

    // call the email sending function to send the login notification to the user's email
    sendMessage(user.email, "Ваше ім'я користувача успішно змінено.").catch(
      (err) =>
        logger.error(
          `SEND PROTECTION MESSAGE\n  File: ${fileURLToPath(import.meta.url)}\n  Email: ${req.foundUser?.email}\n  Message: ${err.message}`,
        ),
    );

    res.status(200).json({ message: "Ім'я користувача успішно змінено." });
  } catch (error) {
    // Log the error
    logger.error(
      `CHANGE USERNAME\n  File: ${fileURLToPath(import.meta.url)}\n  Email: ${req.foundUser?.email}\n  Message: ${error.message}`,
    );
    next(error);
  }
};
